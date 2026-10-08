//El componente que protege rutas, revisa si hay un usuario logueado y si tiene el rol requerido. Si no hay usuario logueado, redirige a /login. Si hay usuario logueado pero no tiene el rol requerido, muestra un mensaje de error. Si hay usuario logueado y tiene el rol requerido, renderiza los hijos del componente.

import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  //Laerificacion de si el token guardado sigue siendo valido es asincrona (pasa en el useEffect del AuthProvider).
  //Si se redirigiera a /login de inmediato mientras loading todavia es true, un usuario con sesion permanente válida vería un parpadeo del login cada vez que recarga la pagina, antes de confirmar si esta logeado
  if (loading) {
    return <p>Cargando...</p>;
  }


  if (!user) {
    //Componente de React Router para redirigir. replace reemplaza la entrada actual del historial del navegador en vez de apilar una nueva,
    //asi, si el usuario le da "atras" despues de ser redirigido, no vuelve a rebotar a la pagina protegida
    return <Navigate to="/login" replace />;
  }


  //Opcional, te deja reusar el mismo componente para "solo necesitas estar logueado" (<ProtectedRoute>) y "necesitas estar logueado y ser admin" (<ProtectedRoute requiredRole="admin">),
  //Es el mismo patron conceptual que el authorize(...roles) de la version de backend, que revisa si el usuario tiene alguno de los roles requeridos para acceder a la ruta
  if (requiredRole && user.role !== requiredRole) {
    return <p>No tienes permisos para ver esta página.</p>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;