import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../pages/student/Dashboard';
import ProfessorDashboard from '../pages/professor/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';

// The active role's home_page field determines which dashboard renders.
const DASHBOARDS = {
  'page-acasa': StudentDashboard,
  'page-acasa-profesor': ProfessorDashboard,
  'page-acasa-administrator': AdminDashboard,
};

export default function HomeRouter() {
  const { activeRole } = useAuth();
  const Component = DASHBOARDS[activeRole?.home_page] || StudentDashboard;
  return <Component />;
}
