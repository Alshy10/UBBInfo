import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import LoginPage from './components/LoginPage';
import AppShell from './components/AppShell';
import HomeRouter from './components/HomeRouter';
import Identity from './pages/student/Identity';
import Grades from './pages/student/Grades';
import Orar from './pages/student/Orar';
import Evaluare from './pages/student/Evaluare';
import InscriereExamen from './pages/student/InscriereExamen';
import Catalog from './pages/professor/Catalog';
import Examene from './pages/professor/Examene';
import PlataTaxe from './pages/mockups/PlataTaxe';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  // Loading screen prevents the login page from flashing on refresh
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<HomeRouter />} />
        <Route path="identitate" element={<Identity />} />
        <Route path="note" element={<Grades />} />
        <Route path="orar" element={<Orar />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="examene" element={<Examene />} />
        <Route path="evaluare" element={<Evaluare />} />
        <Route path="examen" element={<InscriereExamen />} />
        <Route path="taxe" element={<PlataTaxe />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
