import api from '../utils/api';

export const bankingService = {
  getDashboardData: async () => {
    const response = await api.get('/banking/dashboard');
    return response.data;
  },

  initiateTransfer: async (transferData) => {
    const response = await api.post('/banking/transfer', transferData);
    return response.data;
  },

  getBeneficiaries: async () => {
    const response = await api.get('/banking/beneficiaries');
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/banking/transactions/me');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/banking/analytics/me');
    return response.data;
  },

  getBills: async () => {
    const response = await api.get('/banking/bills/me');
    return response.data;
  },

  addBeneficiary: async (beneficiaryData) => {
    const response = await api.post('/banking/beneficiaries', beneficiaryData);
    return response.data;
  },

  getCards: async () => {
    const response = await api.get('/banking/cards');
    return response.data;
  },

  updateCardStatus: async (cardId, status) => {
    const response = await api.patch(`/banking/cards/${cardId}/status`, { status });
    return response.data;
  },

  updateCardLimits: async (cardId, limits) => {
    const response = await api.patch(`/banking/cards/${cardId}/limits`, limits);
    return response.data;
  },

  changeCardPin: async (cardId, newPin) => {
    const response = await api.patch(`/banking/cards/${cardId}/pin`, { newPin });
    return response.data;
  },

  saveBudget: async (category, monthly_limit) => {
    const response = await api.post('/banking/budgets', { category, monthly_limit });
    return response.data;
  },

  upiTransfer: async (paymentData) => {
    const response = await api.post('/payments/upi-transfer', paymentData);
    return response.data;
  },

  scanPay: async (paymentData) => {
    const response = await api.post('/payments/scan-pay', paymentData);
    return response.data;
  },

  setupPin: async (pin) => {
    const response = await api.post('/payments/setup-pin', { pin });
    return response.data;
  },

  getQrDetails: async () => {
    const response = await api.get('/payments/qr-details');
    return response.data;
  },

  // ── DSA Optimization Endpoints ──────────────────────────
  getAutocomplete: async (query) => {
    const response = await api.get(`/optimization/autocomplete?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getSortedTransactions: async () => {
    const response = await api.get('/optimization/sort');
    return response.data;
  },

  getFraudAnalysis: async () => {
    const response = await api.get('/optimization/fraud');
    return response.data;
  },

  getDSAAnalytics: async () => {
    const response = await api.get('/optimization/analytics');
    return response.data;
  }
};
