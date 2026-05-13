import api from '../utils/api';

export const cardService = {
  getCards: async () => {
    const response = await api.get('/banking/cards');
    return response.data;
  },

  updateCardStatus: async (cardId, status) => {
    const response = await api.patch(`/banking/cards/${cardId}/status`, { status });
    return response.data;
  },

  updateCardLimit: async (cardId, limit) => {
    const response = await api.patch(`/banking/cards/${cardId}/limit`, { limit });
    return response.data;
  },

  changePin: async (cardId, oldPin, newPin) => {
    const response = await api.post(`/banking/cards/${cardId}/pin`, { oldPin, newPin });
    return response.data;
  }
};

export default cardService;
