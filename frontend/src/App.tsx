import { Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ApplicationDetails from './pages/forms/ApplicationDetails';
import ApplicationDetailsV2 from './pages/ApplicationDetailsV2';
import ApplicationDetailsLegacy from './pages/ApplicationDetailsLegacy';
import ExamOneResultsPage from './pages/forms/ExamOneResultsPage';
import LabOrderPopup from './pages/forms/LabOrderPopup';
import ExamOneOrder from './screens/ExamOneOrder';
import ExamOne from './pages/ExamOne';
import SearchPage from './pages/search/SearchPage';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import CreateCasePage from './pages/create-case/CreateCasePage';
import AdminPage from './pages/admin/AdminPage';
import UnderwritingPage from './pages/underwriting/UnderwritingPage';
import AuditPage from './pages/audit/AuditPage';
import PoliciesPage from './pages/policies/PoliciesPage';
import ClaimsPage from './pages/claims/ClaimsPage';
import { flags } from './lib/flags';

export default function App(){
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Main App Routes with Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="chatbot" element={<ChatbotPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="create-case" element={<CreateCasePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="underwriting" element={<UnderwritingPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="claims" element={<ClaimsPage />} />
            
            {/* Case Routes */}
            <Route path="cases/:caseId" element={flags.appdetV2 ? <ApplicationDetailsV2 /> : <ApplicationDetailsLegacy />} />
            <Route path="application/:caseId" element={flags.appdetV2 ? <ApplicationDetailsV2 /> : <ApplicationDetailsLegacy />} />
            <Route path="cases/:caseId/examone" element={<ExamOneResultsPage />} />
            {/* Legacy route support */}
            <Route path="case/:caseId" element={flags.appdetV2 ? <ApplicationDetailsV2 /> : <ApplicationDetailsLegacy />} />
          </Route>
          
          {/* Standalone popup routes (no layout) */}
          <Route path="/lab-order" element={<LabOrderPopup />} />
          <Route path="/examone/order" element={<ExamOneOrder />} />
          <Route path="/examone" element={<ExamOne />} />
          <Route path="/examone/result" element={<ExamOne />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
