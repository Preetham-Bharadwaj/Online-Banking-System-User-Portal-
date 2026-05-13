const supabase = require('../config/supabase');

exports.getUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, upi_id, balance, created_at, role')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getAccounts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getMetrics = async (req, res, next) => {
  try {
    const [
      { count: totalUsers },
      { data: transactions },
      { data: accounts }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('amount'),
      supabase.from('accounts').select('balance')
    ]);

    const totalVolume = transactions?.reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0) || 0;
    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;

    res.status(200).json({
      totalUsers,
      totalVolume,
      totalBalance,
      totalTransactions: transactions?.length || 0
    });

  } catch (error) {
    next(error);
  }
};
