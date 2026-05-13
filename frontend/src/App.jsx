import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import Cards from './pages/Cards';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Settings from './pages/Settings';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import useStore from './store/useStore';
import { bankingService } from './services/bankingService';
import authService from './services/authService';

import { QRProvider } from './context/QRContext';
import { QRPortal } from './components/QRSystem';
import { supabase } from './utils/supabaseClient';

function App() {
  const { isAuthenticated, setAuth, setBankingData, setPlatformUsers, setLoading, setError, token, user, logout } = useStore();


  useEffect(() => {
    const initApp = async () => {
      if (token && !user) {
        try {
          setLoading(true);
          const data = await authService.getProfile();
          setAuth(data.user, token);
        } catch (err) {
          console.error("Session hydration failed:", err);
          // Only logout on 401 — don't kill the session for network errors
          if (err.response?.status === 401) {
            logout();
          }
        } finally {
          setLoading(false);
        }
      }
    };

    initApp();
  }, [token, user, setAuth, setLoading, logout]);

  useEffect(() => {
    const fetchGlobalData = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const data = await bankingService.getDashboardData();
          setBankingData(data);
          
          // Fetch platform users for discovery
          const allUsers = await authService.getAllUsers();
          setPlatformUsers(allUsers);

        } catch (err) {
          console.error("Failed to fetch initial banking data:", err);
          if (err.response?.status !== 401) {
            setError("Could not load banking data. Please refresh.");
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGlobalData();
  }, [isAuthenticated, setBankingData, setLoading, setError]);

  // Real-time synchronization
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Listen to changes in the users table for balance updates
    const channel = supabase
      .channel('banking_updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users', 
        filter: `id=eq.${user.id}` 
      }, async (payload) => {
        console.log("Balance/User update detected:", payload);
        try {
          const data = await bankingService.getDashboardData();
          setBankingData(data);
        } catch (err) {
          console.error("Realtime sync failed:", err);
        }
      })
      // Also listen to new notifications
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, async () => {
        try {
          const data = await bankingService.getDashboardData();
          setBankingData(data);
        } catch (err) {
          console.error("Realtime notification sync failed:", err);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user, setBankingData]);


  return (
    <Router>
      <QRProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<MainLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="payments" element={<Payments />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="cards" element={<Cards />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <QRPortal />
      </QRProvider>
    </Router>
  );
}

export default App;
