import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary, getLogPose } from "../api/dashboard";
import { getErrorMessage } from "../api/errors";
import ErrorState from "../components/ErrorState";
import StatCard from "../components/StatCard";
import { formatBerries, formatDateTime, STATUS_LABEL } from "../lib/catalog";
import type { DashboardSummary, LogPose } from "../types/api";

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [logPose, setLogPose] = useState<LogPose | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // cambiarlo = volver a pedir

  useEffect(() => {
    const controller = new AbortController();
    // Las dos requests salen a la vez y esperamos a que lleguen ambas
    Promise.all([
      getDashboardSummary(controller.signal),
      getLogPose(controller.signal),
    ])
      .then(([summaryData, logPoseData]) => {
        setSummary(summaryData);
        setLogPose(logPoseData);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err, "No se pudo cargar el dashboard."));
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

  // 1) Loading
  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-24 animate-pulse rounded-xl bg-slate-800" />
        ))}
      </div>
    );
  }

  // 2) Error con reintento
  if (error || !summary || !logPose) {
    return (
      <ErrorState
        message={error ?? "No se pudo cargar el dashboard."}
        onRetry={handleRetry}
      />
    );
  }

  const unlocked = logPose.status === "UNLOCKED";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{summary.team.name}</h1>
        <p className="text-sm text-slate-400">
          {summary.team.code} · Actualizado {formatDateTime(summary.generatedAt)}
        </p>
      </div>

      {/* Estado del Log Pose (se desbloquea al aprobar el CP3) */}
      <div
        className={`rounded-xl border p-5 ${unlocked ? "border-emerald-800 bg-emerald-950/40" : "border-amber-800 bg-amber-950/40"}`}
      >
        <p className="font-semibold">
          Log Pose: {unlocked ? "Desbloqueado ✓" : "Bloqueado 🔒"}
        </p>
        <p className="text-sm text-slate-300">{logPose.message}</p>
        {logPose.unlockedAt && (
          <p className="text-xs text-slate-400">
            Desde {formatDateTime(logPose.unlockedAt)}
          </p>
        )}
      </div>

      {/* 3) Estado vacío: el workspace no tiene carteles */}
      {summary.wanted.total === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          Tu workspace todavía no tiene carteles de "Se Busca".
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Carteles" value={summary.wanted.total} />
            <StatCard
              label="Recompensa total"
              value={formatBerries(summary.wanted.totalBounty)}
            />
            <StatCard
              label="Recompensa promedio"
              value={formatBerries(summary.wanted.averageBounty)}
            />
            <StatCard label="Tripulaciones" value={summary.crews.total} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-3 font-semibold">Carteles por estado</h2>
              <ul className="space-y-1 text-sm">
                <li>
                  {STATUS_LABEL.AT_LARGE}: {summary.wanted.byStatus.AT_LARGE}
                </li>
                <li>
                  {STATUS_LABEL.CAPTURED}: {summary.wanted.byStatus.CAPTURED}
                </li>
                <li>
                  {STATUS_LABEL.MISSING}: {summary.wanted.byStatus.MISSING}
                </li>
              </ul>
              {summary.crews.mostWanted && (
                <p className="mt-4 text-sm text-slate-400">
                  Tripulación más buscada:{" "}
                  <span className="text-slate-100">
                    {summary.crews.mostWanted.name}
                  </span>{" "}
                  ({formatBerries(summary.crews.mostWanted.totalBounty)})
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-3 font-semibold">Mayores recompensas</h2>
              <ol className="space-y-2 text-sm">
                {summary.topBounties.map((wanted) => (
                  <li key={wanted.id} className="flex justify-between gap-3">
                    <Link
                      to={`/wanted/${wanted.id}`}
                      className="text-amber-400 hover:underline"
                    >
                      {wanted.name}
                    </Link>
                    <span className="text-slate-300">
                      {formatBerries(wanted.bounty)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;
