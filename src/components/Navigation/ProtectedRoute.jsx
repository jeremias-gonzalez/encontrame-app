import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

/**
 * Protege las rutas del panel: si no hay sesión iniciada,
 * redirige al login y guarda en ?next= la página a la que se quería entrar.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/iniciar-sesion?next=${next}`} replace />;
  }

  return children;
}
