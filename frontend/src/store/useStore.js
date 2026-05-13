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
      analytics: null
    });
  },

  setBankingData: (data) => set((state) => ({ 
    accounts: data.accounts || [], 
    activeAccount: data.activeAccount || data.accounts?.[0] || null,
    balance: data.balance || 0,
    recentTransactions: data.transactions || [],
    cards: data.cards || [],
    beneficiaries: data.beneficiaries || [],
    bills: data.bills || [],
    fixedDeposits: data.fixedDeposits || [],
    recurringDeposits: data.recurringDeposits || [],
    loans: data.loans || [],
    notifications: data.notifications || [],
    budgets: data.budgets || [],
    qrPayments: data.qrPayments || [],
    analytics: data.analytics || null,
    // Only update user if the API returned one, never wipe what setAuth stored
    user: data.user || state.user
  })),

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
