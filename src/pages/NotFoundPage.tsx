import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center text-slate-100">
      <p className="text-6xl font-bold text-amber-400">404</p>
      <h1 className="text-2xl font-bold">Esta isla no está en el mapa</h1>
      <p className="text-slate-400">La página que buscas no existe.</p>
      <Link to="/" className="text-amber-400 underline">
        Volver al inicio
      </Link>
    </main>
  );
}

export default NotFoundPage;
