import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PoliciesPage from './pages/policies/PoliciesPage';
import ClaimsPage from './pages/claims/ClaimsPage';
import AdminPage from './pages/admin/AdminPage';
import ProfilePage from './pages/profile/ProfilePage';
import SearchPage from './pages/search/SearchPage';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import ApplicationDetails from './pages/forms/ApplicationDetails';

// New Phase 6 Components
import UnderwritingDashboard from './components/Underwriting/UnderwritingDashboard';
import AuditDashboard from './components/AdminPanel/AuditDashboard';

// Phase 7: Error Handling Components
import ErrorBoundary from './components/ui/ErrorBoundary';

// Styles
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <SocketProvider>
                <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="policies" element={<PoliciesPage />} />
                    <Route path="claims" element={<ClaimsPage />} />
                    
                    {/* Admin Routes - Restricted to ADMIN role */}
                    <Route path="admin" element={
                      <ProtectedRoute requiredRoles={['ADMIN']}>
                        <AdminPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Underwriting Routes - Restricted to UNDERWRITER and ADMIN roles */}
                    <Route path="underwriting" element={
                      <ProtectedRoute 
                        requiredRoles={['UNDERWRITER', 'ADMIN']}
                        requiredFeatures={['PremiumCalculator', 'RiskAssessment']}
                      >
                        <UnderwritingDashboard />
                      </ProtectedRoute>
                    } />
                    
                    {/* Audit Routes - Restricted to ADMIN role */}
                    <Route path="audit" element={
                      <ProtectedRoute 
                        requiredRoles={['ADMIN']}
                        requiredPermissions={['VIEW_AUDIT_LOGS']}
                      >
                        <AuditDashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="chatbot" element={<ChatbotPage />} />
                    <Route path="application/:id" element={<ApplicationDetails />} />
                    <Route path="application" element={<ApplicationDetails />} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                
                {/* Global toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4ade80',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
}

export default App;
