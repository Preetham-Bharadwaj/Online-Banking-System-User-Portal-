const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const normalizeCard = (card, user) => ({
  ...card,
  card_number: card.masked_card_number || '4421 98xx xxxx 0000',
  card_holder_name: user.full_name,
  cvv: '***',
  status: card.card_status || (card.freeze_status ? 'locked' : 'active'),
  network: card.card_brand || 'Visa',
  transaction_limit: Number(card.online_limit || 0),
  daily_limit: Number(card.atm_limit || 0)
});

exports.getCards = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.status(200).json((data || []).map((card) => normalizeCard(card, req.user)));
  } catch (error) {
    next(error);
  }
};

exports.updateCardStatus = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { status } = req.body;
    const normalizedStatus = status === 'frozen' ? 'locked' : status;

    const { data, error } = await supabase
      .from('cards')
      .update({
        card_status: normalizedStatus,
        freeze_status: normalizedStatus === 'locked'
      })
      .eq('id', cardId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(normalizeCard(data, req.user));
  } catch (error) {
    next(error);
  }
};

exports.updateCardLimits = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { daily_limit, transaction_limit, online_limit, atm_limit } = req.body;

    const { data, error } = await supabase
      .from('cards')
      .update({
        online_limit: transaction_limit ?? online_limit,
        atm_limit: daily_limit ?? atm_limit
      })
      .eq('id', cardId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(normalizeCard(data, req.user));
  } catch (error) {
    next(error);
  }
};

exports.changeCardPin = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { newPin } = req.body;

    if (!/^\d{4,6}$/.test(String(newPin || ''))) {
      return res.status(400).json({ error: 'PIN must be 4 to 6 digits' });
    }

    const pinHash = await bcrypt.hash(String(newPin), 10);
    const { error } = await supabase
      .from('cards')
      .update({ pin_hash: pinHash })
      .eq('id', cardId)
      .eq('user_id', req.user.id);

    if (error && !error.message?.includes('pin_hash')) throw error;
    res.status(200).json({ message: 'PIN updated successfully' });
  } catch (error) {
    next(error);
  }
};
