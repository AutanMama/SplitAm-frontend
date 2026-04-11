import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GroupDetails from './pages/GroupDetails';
import CreateGroup from './pages/CreateGroup';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';

// Services
import { syncOfflineData } from './services/offlineSync';
import api from './services/api';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  // Offline Sync Engine Trigger
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineData(api);
    };

    window.addEventListener('online', handleOnline);
    
    if (navigator.onLine) {
      syncOfflineData(api);
    }

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        <Navbar />
        
        <main className="container mx-auto px-4 pt-8 pb-24 md:pt-28 md:pb-12 max-w-6xl flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/create-group" 
              element={
                <PrivateRoute>
                  <CreateGroup />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/group/:groupId" 
              element={
                <PrivateRoute>
                  <GroupDetails />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Offline Status Toast */}
        {!navigator.onLine && (
          <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 bg-orange-600 text-white px-6 py-4 rounded-[2rem] shadow-2xl z-50 animate-bounce border-4 border-white">
            <p className="text-xs font-black flex items-center gap-3 uppercase tracking-widest">
              ⚠️ Offline: Changes will sync later
            </p>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;