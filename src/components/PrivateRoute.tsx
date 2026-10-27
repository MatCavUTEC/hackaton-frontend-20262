import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function CheckingSession() {
  return (
    <main
      role="status"
      className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300"
    >
      Verificando sesión...
    </main>
  );
}

function PrivateRoute() {
  const { status } = useAuth();
  const location = useLocation();

  // Mientras se verifica el token NO se muestra el login
  if (status === "checking") return <CheckingSession />;

  if (status === "unauthenticated") {
    // Guardamos a dónde quería ir (con sus ?filtros) para volver después del login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default PrivateRoute;
