import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toAppError, type AppError } from "../api/errors";
import { getWanted } from "../api/wanted";
import ErrorState from "../components/ErrorState";
import {
  formatBerries,
  formatDate,
  formatDateTime,
  FRUIT_LABEL,
  ROLE_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
} from "../lib/catalog";
import type { WantedDetail } from "../types/api";

// Ruta hija /wanted/:id. key={id}: si cambia el id, el estado empieza de cero
function WantedDetailPage() {
  const { id = "" } = useParams();
  return <WantedPoster key={id} id={id} />;
}

function WantedPoster({ id }: { id: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [poster, setPoster] = useState<WantedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Volver al listado con los mismos filtros (siguen en location.search)
  const close = useCallback(() => {
    navigate({ pathname: "/wanted", search: location.search }, { replace: true });
  }, [navigate, location.search]);

  // Escape cierra el detalle, esté donde esté el foco
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    const controller = new AbortController();
    getWanted(id, controller.signal)
      .then(setPoster)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(toAppError(err, "No se pudo cargar el cartel."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  // Mientras el detalle está abierto, la página de atrás no se desplaza
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wanted-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="max-h-full w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border border-amber-900 bg-slate-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="font-bold tracking-[0.3em] text-amber-400">SE BUSCA</p>
          {/* autoFocus: al abrir, el foco entra al detalle (funciona en botones, no en links) */}
          <button
            type="button"
            onClick={close}
            autoFocus
            className="rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-800"
          >
            ✕ Volver al listado
          </button>
        </div>

        {loading && (
          <div aria-busy="true" className="space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-800" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-slate-800" />
            <div className="h-32 animate-pulse rounded bg-slate-800" />
          </div>
        )}

        {error &&
          (error.status === 404 ? (
            <p role="alert" className="text-slate-300">
              Este cartel no existe en tu workspace.
            </p>
          ) : (
            <ErrorState message={error.message} onRetry={handleRetry} />
          ))}

        {poster && !loading && (
          <>
            <div className="text-center">
              <h2 id="wanted-title" className="text-3xl font-bold">
                {poster.name}
              </h2>
              <p className="text-slate-400">"{poster.epithet}"</p>
              <p className="mt-3 text-3xl font-bold text-amber-400">
                {formatBerries(poster.bounty)}
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[poster.status]}`}
              >
                {STATUS_LABEL[poster.status]}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Tripulación</dt>
                <dd>{poster.crew.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Puesto</dt>
                <dd>{ROLE_LABEL[poster.role]}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Fruta del diablo</dt>
                <dd>
                  {poster.devilFruit
                    ? `${poster.devilFruit.name} (${FRUIT_LABEL[poster.devilFruit.type]})`
                    : FRUIT_LABEL.NONE}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Amenaza</dt>
                <dd>{poster.threatLevel}/5</dd>
              </div>
              <div>
                <dt className="text-slate-500">Edad</dt>
                <dd>{poster.age} años</dd>
              </div>
              <div>
                <dt className="text-slate-500">Altura</dt>
                <dd>{poster.heightCm} cm</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">Visto por última vez</dt>
                <dd>
                  {poster.lastSeen.island} ·{" "}
                  {formatDateTime(poster.lastSeen.seenAt)}
                </dd>
              </div>
            </dl>

            <p className="text-sm text-slate-300">{poster.bio}</p>

            <div>
              <h3 className="mb-2 text-sm font-semibold">
                Historial de recompensas
              </h3>
              <ol className="space-y-1 text-sm">
                {poster.bountyHistory.map((entry) => (
                  <li
                    key={entry.issuedAt}
                    className="flex justify-between gap-3"
                  >
                    <span className="text-slate-400">
                      {formatDate(entry.issuedAt)}
                    </span>
                    <span>{formatBerries(entry.amount)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WantedDetailPage;
