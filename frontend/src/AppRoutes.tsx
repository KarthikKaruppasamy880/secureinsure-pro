import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/DashboardPage';
import ApplicationDetails from './screens/ApplicationDetails/ApplicationDetails';
import ExamOneResults from './screens/ExamOne/ResultsScreen';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* accept both /cases/:id and legacy /case/:id */}
      <Route path="/cases/:caseId" element={<ApplicationDetails />} />
      <Route path="/case/:caseId" element={<ApplicationDetails />} />
      <Route path="/cases/:caseId/examone" element={<ExamOneResults />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}
