import { create } from 'zustand';

const useStore = create((set) => ({
  // Auth State
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Banking Data
  accounts: [],
  activeAccount: null,
  balance: 0,
  recentTransactions: [],
  cards: [],
  notifications: [],
  beneficiaries: [],
  bills: [],
  fixedDeposits: [],
  recurringDeposits: [],
  loans: [],
  budgets: [],
  qrPayments: [],
  analytics: null,
  platformUsers: [],
  
  // Caching Layer
  cache: {
    transactions: null,
    analytics: null,
    beneficiaries: null,
    accounts: null,
    lastUpdate: {}
  },
  
  // UI State
  isLoading: false,
  error: null,

  // Actions
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, error: null });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      accounts: [],
      activeAccount: null,
      balance: 0,
      recentTransactions: [],
      cards: [],
      notifications: [],
      beneficiaries: [],
      bills: [],
      fixedDeposits: [],
      recurringDeposits: [],
      loans: [],
      budgets: [],
      qrPayments: [],
      analytics: null,
      cache: {
        transactions: null,
        analytics: null,
        beneficiaries: null,
        accounts: null,
        lastUpdate: {}
      }
    });
  },

  setBankingData: (data) => set((state) => {
    const newState = { 
      accounts: data.accounts || state.accounts, 
      activeAccount: data.activeAccount || data.accounts?.[0] || state.activeAccount,
      balance: data.balance !== undefined ? data.balance : state.balance,
      recentTransactions: data.transactions || state.recentTransactions,
      cards: data.cards || state.cards,
      beneficiaries: data.beneficiaries || state.beneficiaries,
      bills: data.bills || state.bills,
      fixedDeposits: data.fixedDeposits || state.fixedDeposits,
      recurringDeposits: data.recurringDeposits || state.recurringDeposits,
      loans: data.loans || state.loans,
      notifications: data.notifications || state.notifications,
      budgets: data.budgets || state.budgets,
      qrPayments: data.qrPayments || state.qrPayments,
      analytics: data.analytics || state.analytics,
      user: data.user || state.user
    };

    // Update Cache
    const newCache = { ...state.cache };
    if (data.transactions) newCache.transactions = data.transactions;
    if (data.analytics) newCache.analytics = data.analytics;
    if (data.beneficiaries) newCache.beneficiaries = data.beneficiaries;
    if (data.accounts) newCache.accounts = data.accounts;
    newCache.lastUpdate = { ...state.cache.lastUpdate, generic: Date.now() };

    return { ...newState, cache: newCache };
  }),

  // Cache Management
  invalidateCache: (key) => set((state) => ({
    cache: { ...state.cache, [key]: null }
  })),

  getCachedData: (key) => {
    const state = useStore.getState();
    const ttl = 5 * 60 * 1000; // 5 min TTL
    const lastUpdate = state.cache.lastUpdate[key] || 0;
    if (state.cache[key] && (Date.now() - lastUpdate < ttl)) {
      return state.cache[key];
    }
    return null;
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  setActiveAccount: (account) => set({ activeAccount: account }),

  setBeneficiaries: (beneficiaries) => set({ beneficiaries }),
  setCards: (cards) => set({ cards }),
  setNotifications: (notifications) => set({ notifications }),
  setPlatformUsers: (users) => set({ platformUsers: users })
}));


export default useStore;
export { useStore };
