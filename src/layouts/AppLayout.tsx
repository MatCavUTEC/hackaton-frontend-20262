import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "text-amber-400" : "text-slate-400 hover:text-slate-100";
}

// Marco de todas las páginas privadas: header con menú y logout
function AppLayout() {
  const { session, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-bold">Log Pose Console</span>
            <nav aria-label="Principal" className="flex gap-4 text-sm">
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/wanted" className={navLinkClass}>
                Se Busca
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">
              {session?.team.name} · {session?.team.code}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-700 px-3 py-1 hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
