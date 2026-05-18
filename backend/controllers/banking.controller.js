const supabase = require('../config/supabase');

const normalizeTransaction = (tx, currentUserId) => {
  const isSender = tx.sender_id === currentUserId;
  const amount = Number(tx.amount || 0);

  return {
    ...tx,
    description: tx.note || (isSender ? `Paid to ${tx.receiver_upi}` : `Received from ${tx.sender_upi}`),
    type: isSender ? 'expense' : 'income',
    display_amount: isSender ? -amount : amount,
    status: tx.status || 'completed',
    payment_method: tx.payment_type || 'UPI',
    category: tx.note || (isSender ? 'Transfer' : 'Income'),
    created_at: tx.created_at
  };
};

const summarizeAnalytics = ({ transactions }) => {
  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense');
  const incomeTransactions = transactions.filter((tx) => tx.type === 'income');
  const monthlySpend = expenseTransactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);
  const monthlyIncome = incomeTransactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);

  return {
    monthlySpend,
    monthlyIncome,
    savings: monthlyIncome - monthlySpend,
    budgetTotal: 0,
    budgetUtilization: 0
  };
};

exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch latest user data (balance, etc.)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const [
      { data: accounts },
      { data: rawTransactions },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', userId),
      supabase.from('transactions')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    const transactions = (rawTransactions || []).map(tx => normalizeTransaction(tx, userId));

    res.status(200).json({
      user,
      balance: Number(user.balance || 0),
      transactions,
      notifications: notifications || [],
      accounts: accounts || [],
      analytics: summarizeAnalytics({ transactions })
    });

  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data: rawTransactions, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.status(200).json((rawTransactions || []).map(tx => normalizeTransaction(tx, userId)));
  } catch (error) {
    next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data: rawTransactions } = await supabase
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    const transactions = (rawTransactions || []).map(tx => normalizeTransaction(tx, userId));
    res.status(200).json({
      transactions,
      analytics: summarizeAnalytics({ transactions })
    });
  } catch (error) {
    next(error);
  }
};

exports.getBills = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', req.user.id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    next(error);
  }
};

exports.getBeneficiaries = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('beneficiary_name', { ascending: true });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    next(error);
  }
};

exports.addBeneficiary = async (req, res, next) => {
  try {
    const { beneficiary_name, upi_id, account_number, ifsc_code, nickname } = req.body;
    const { data, error } = await supabase
      .from('beneficiaries')
      .insert([{
        user_id: req.user.id,
        beneficiary_name,
        upi_id,
        account_number,
        ifsc_code,
        nickname
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const { category, monthly_limit } = req.body;
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: req.user.id,
        category,
        monthly_limit,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }, { onConflict: 'user_id, category, month, year' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.initiateTransfer = async (req, res, next) => {
  try {
    // This is a generic transfer, could be internal or external
    // For now, let's treat it as a mock successful transaction or proxy to payment service
    res.status(200).json({ message: 'Transfer initiated successfully' });
  } catch (error) {
    next(error);
  }
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

exports.deposit = async (req, res, next) => {
  try {
    const { amount, note = 'Added Funds' } = req.body;
    const userId = req.user.id;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const depositAmount = Number(amount);

    // Get current user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = Number(user.balance || 0);
    const newBalance = currentBalance + depositAmount;

    // Update user balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    // Sync account balance
    await syncAccountBalance('increment_account_balance', { 
      u_id: userId, 
      amount: depositAmount 
    });

    const referenceNumber = `FINDEP${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert([{
        transaction_id: referenceNumber,
        sender_id: null,
        receiver_id: userId,
        sender_upi: 'deposit@finova',
        receiver_upi: user.upi_id,
        amount: depositAmount,
        payment_type: 'DEPOSIT',
        type: 'UPI',
        status: 'completed',
        note: note
      }])
      .select()
      .single();

    if (txError) throw txError;

    // Create notification
    await supabase.from('notifications').insert([{
      user_id: userId,
      title: 'Funds Added',
      message: `₹${depositAmount} has been credited to your account.`,
      notification_type: 'transaction',
      is_read: false
    }]);

    res.status(200).json({
      success: true,
      message: 'Deposit successful',
      balance: newBalance,
      transaction,
      reference: referenceNumber
    });
  } catch (error) {
    next(error);
  }
};


