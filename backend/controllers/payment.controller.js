const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const generateReferenceNumber = () => `FIN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

exports.upiTransfer = async (req, res, next) => {
  try {
    const { receiverUpi, amount, pin } = req.body;
    const senderId = req.user.id;
    const transferAmount = Number(amount);

    if (!receiverUpi || !transferAmount || transferAmount <= 0 || !pin) {
      return res.status(400).json({ error: 'Invalid transfer details' });
    }

    // 1. Get Sender details (PIN and Balance)
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, upi_pin, balance, full_name, upi_id')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (!sender.upi_pin) {
      return res.status(400).json({ error: 'UPI PIN not set' });
    }

    // 2. Verify PIN
    const isPinMatch = await bcrypt.compare(pin, sender.upi_pin);
    if (!isPinMatch) {
      return res.status(403).json({ error: 'Incorrect UPI PIN' });
    }

    // 3. Verify balance
    const senderBalance = Number(sender.balance || 0);
    if (senderBalance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 4. Find receiver via upi_id (Search both users and accounts table for robustness)
    let receiverId = null;
    let receiverData = null;

    // First try users table
    const { data: userReceiver, error: userError } = await supabase
      .from('users')
      .select('id, upi_id, full_name, balance')
      .ilike('upi_id', receiverUpi)
      .maybeSingle();

    if (userReceiver) {
      receiverData = userReceiver;
      receiverId = userReceiver.id;
    } else {
      // Try accounts table
      const { data: accReceiver, error: accError } = await supabase
        .from('accounts')
        .select('user_id, upi_id, balance')
        .ilike('upi_id', receiverUpi)
        .maybeSingle();

      if (accReceiver) {
        // Fetch full user data for the account owner
        const { data: userFromAcc, error: userFromAccError } = await supabase
          .from('users')
          .select('id, upi_id, full_name, balance')
          .eq('id', accReceiver.user_id)
          .single();
        
        if (userFromAcc) {
          receiverData = userFromAcc;
          receiverId = userFromAcc.id;
        }
      }
    }

    if (!receiverData) {
      console.error(`Receiver search failed for: ${receiverUpi}`);
      return res.status(404).json({ error: 'Receiver UPI ID not found' });
    }

    const receiver = receiverData;

    if (receiver.id === senderId) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    // 5. Update balances (Deduct sender, Add receiver)
    // Update both users table (global) and accounts table (primary account)
    
    // Deduct Sender
    const { error: deductUserError } = await supabase
      .from('users')
      .update({ balance: senderBalance - transferAmount })
      .eq('id', senderId);
    
    if (deductUserError) throw deductUserError;

    const { error: deductAccountError } = await supabase
      .from('accounts')
      .update({ balance: senderBalance - transferAmount })
      .eq('user_id', senderId)
      .eq('status', 'active'); // Update active accounts

    // Add Receiver
    const receiverBalance = Number(receiver.balance || 0);
    const { error: addUserError } = await supabase
      .from('users')
      .update({ balance: receiverBalance + transferAmount })
      .eq('id', receiver.id);

    if (addUserError) throw addUserError;

    const { error: addAccountError } = await supabase
      .from('accounts')
      .update({ balance: receiverBalance + transferAmount })
      .eq('user_id', receiver.id)
      .eq('status', 'active');

    // 6. Insert transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert([{
        sender_id: senderId,
        receiver_id: receiver.id,
        sender_upi: sender.upi_id,
        receiver_upi: receiver.upi_id,
        amount: transferAmount,
        type: 'UPI',
        status: 'completed'
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
        is_read: false
      },
      {
        user_id: receiver.id,
        title: 'Money Received',
        message: `₹${transferAmount} received from ${sender.full_name} (${sender.upi_id})`,
        is_read: false
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Transfer successful',
      transaction
    });

  } catch (error) {
    next(error);
  }
};

exports.scanPay = async (req, res, next) => {
  // UPI Scan & Pay uses the same logic as upiTransfer but might have different metadata
  return exports.upiTransfer(req, res, next);
};

exports.setupPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4) {
      return res.status(400).json({ error: 'PIN must be at least 4 digits' });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    const { error } = await supabase
      .from('users')
      .update({ upi_pin: pinHash })
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

