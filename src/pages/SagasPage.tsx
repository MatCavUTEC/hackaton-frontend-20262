import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/errors";
import { getSagas } from "../api/sagas";
import ErrorState from "../components/ErrorState";
import TransitionLink from "../components/TransitionLink";
import type { SagaSummary } from "../types/api";

function SagasPage() {
  const [sagas, setSagas] = useState<SagaSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getSagas(controller.signal)
      .then(setSagas)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err, "No se pudieron cargar las sagas."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Sagas del Grand Line</h1>

      {loading && (
        <div aria-busy="true" className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 animate-pulse rounded-2xl bg-slate-800" />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={handleRetry} />}

      {sagas && sagas.length === 0 && (
        <p className="text-slate-400">Todavía no hay sagas disponibles.</p>
      )}

      {sagas && sagas.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {sagas.map((saga) => (
            <li key={saga.id}>
              {/* state: la historia muestra el título al instante, sin esperar
                  la request, y la View Transition puede animarlo */}
              <TransitionLink
                to={`/sagas/${saga.id}`}
                state={{ saga }}
                className="block h-full space-y-2 rounded-2xl border-2 p-5 hover:brightness-110"
                style={{
                  backgroundColor: saga.palette.background,
                  borderColor: saga.palette.surface,
                  color: saga.palette.text,
                }}
              >
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: saga.palette.primary }}
                >
                  Saga {saga.order}
                </p>
                <h2
                  className="w-fit text-xl font-bold"
                  style={{ viewTransitionName: `saga-title-${saga.id}` }}
                >
                  {saga.title}
                </h2>
                <p className="text-sm opacity-80">{saga.subtitle}</p>
                <p className="text-sm opacity-70">{saga.synopsis}</p>
                <p className="text-xs" style={{ color: saga.palette.accent }}>
                  {saga.stageCount} etapas ·{" "}
                  {saga.totalDistanceNm.toLocaleString("es-PE")} mn ·{" "}
                  {saga.firstIsland} → {saga.lastIsland}
                </p>
              </TransitionLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SagasPage;
