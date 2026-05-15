const supabase = require('../config/supabase');
const generateReferenceNumber = () => `FIN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
const normalizePin = (pin) => String(pin ?? '').replace(/\D/g, '');
const getStoredUpiPin = (user) => user?.upi_pin || '';

const verifyUpiPin = (inputPin, storedPin) => {
  const normalizedPin = normalizePin(inputPin);

  if (!normalizedPin || !storedPin) {
    return false;
  }

  return normalizedPin === String(storedPin);
};

const syncAccountBalance = async (functionName, params) => {
  try {
    const { error } = await supabase.rpc(functionName, params);
    if (error) {
      console.log('Account update failed', error.message || error);
    }
  } catch (error) {
    console.log('Account update failed', error.message || error);
  }
};

const processUpiTransfer = async (req, res, next, { paymentType, defaultNote }) => {
  try {
    const { receiverUpi, amount, pin, note = '' } = req.body;
    const senderId = req.user.id;

    console.log('UPI Transfer Request:', { receiverUpi, amount, senderId, paymentType });

    const normalizedPin = normalizePin(pin);
    const normalizedReceiverUpi = String(receiverUpi || '').trim().toLowerCase();

    if (!normalizedReceiverUpi || !amount || !normalizedPin) {
      console.log('Missing fields:', { receiverUpi, amount, pin: !!pin });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transferAmount = Number(amount);

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer details' });
    }

    // 1. Get Sender details (PIN and Balance)
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('*')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const storedPin = getStoredUpiPin(sender);

    if (!storedPin) {
      return res.status(400).json({ error: 'UPI PIN not set' });
    }

    // 2. Verify PIN
    // IMPORTANT: Return 400 instead of 401 for incorrect PIN to prevent frontend interceptor logout
    console.log('Verifying PIN for user:', req.user.email);
    console.log('Database PIN exists:', !!storedPin);

    const isMatch = verifyUpiPin(normalizedPin, storedPin);
    console.log('PIN Match Result:', isMatch);

    if (!isMatch) {
      console.log('PIN Mismatch Details:', {
        input_type: typeof pin
      });
      return res.status(400).json({ error: 'Incorrect UPI PIN' });
    }

    // 3. Verify balance
    const senderBalance = Number(sender.balance || 0);
    if (senderBalance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 4. Find receiver via upi_id
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id, upi_id, full_name, balance')
      .ilike('upi_id', normalizedReceiverUpi)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ error: 'Receiver UPI ID not found' });
    }

    if (receiver.id === senderId) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    const referenceNumber = generateReferenceNumber();

    // 5. Update balances (Deduct sender, Add receiver)
    // Update both 'users' and 'accounts' table for consistency
    const { error: senderUpdateError } = await supabase
      .from('users')
      .update({ balance: senderBalance - transferAmount })
      .eq('id', senderId);

    if (senderUpdateError) throw senderUpdateError;

    // Update account balance for sender if exists
    await syncAccountBalance('decrement_account_balance', { 
      u_id: senderId, 
      amount: transferAmount 
    });

    const receiverBalance = Number(receiver.balance || 0);
    const { error: receiverUpdateError } = await supabase
      .from('users')
      .update({ balance: receiverBalance + transferAmount })
      .eq('id', receiver.id);

    if (receiverUpdateError) throw receiverUpdateError;

    // Update account balance for receiver if exists
    await syncAccountBalance('increment_account_balance', { 
      u_id: receiver.id, 
      amount: transferAmount 
    });

    // 6. Insert transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert([{
        transaction_id: referenceNumber,
        sender_id: senderId,
        receiver_id: receiver.id,
        sender_upi: sender.upi_id,
        receiver_upi: receiver.upi_id,
        amount: transferAmount,
        payment_type: paymentType,
        type: 'UPI',
        status: 'completed',
        note: note || defaultNote
      }])
      .select()
      .single();

    if (txError) throw txError;

    // 7. Create notifications
    await supabase.from('notifications').insert([
      {
        user_id: senderId,
        title: 'Payment Successful',
        message: `₹${transferAmount} sent to ${receiver.full_name} (${receiver.upi_id})`,
        notification_type: 'transaction',
        is_read: false
      },
      {
        user_id: receiver.id,
        title: 'Money Received',
        message: `₹${transferAmount} received from ${sender.full_name} (${sender.upi_id})`,
        notification_type: 'transaction',
        is_read: false
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Transfer successful',
      transaction,
      reference: referenceNumber
    });

  } catch (error) {
    next(error);
  }
};

exports.upiTransfer = async (req, res, next) => {
  return processUpiTransfer(req, res, next, {
    paymentType: 'UPI_TRANSFER',
    defaultNote: 'UPI Payment'
  });
};

exports.scanPay = async (req, res, next) => {
  return processUpiTransfer(req, res, next, {
    paymentType: 'QR_PAYMENT',
    defaultNote: 'QR Payment'
  });
};

exports.setupPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    const normalizedPin = normalizePin(pin);

    if (normalizedPin.length < 4) {
      return res.status(400).json({ error: 'PIN must be at least 4 digits' });
    }

    const { error } = await supabase
      .from('users')
      .update({ upi_pin: normalizedPin })
      .eq('id', req.user.id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'UPI PIN set successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getQrDetails = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('upi_id, full_name')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    const upi_id = user.upi_id;

    res.status(200).json({
      upi_id,
      full_name: user.full_name,
      qr_string: `upi://pay?pa=${upi_id}&pn=${encodeURIComponent(user.full_name)}&cu=INR`
    });
  } catch (error) {
    next(error);
  }
};
