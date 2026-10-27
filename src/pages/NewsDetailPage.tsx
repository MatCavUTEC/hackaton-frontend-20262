import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { toAppError, type AppError } from "../api/errors";
import { getNews, updateNewsStatus } from "../api/news";
import ErrorState from "../components/ErrorState";
import {
  formatDateTime,
  NEWS_STATUS_BADGE,
  NEWS_STATUS_LABEL,
  NEWS_TYPE_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
} from "../lib/catalog";
import type { NewsOutletContext } from "../lib/newsFilters";
import type { ApiErrorBody, NewsDetail, VerifiedStatus } from "../types/api";

// Ruta hija /news/:id. key={id}: si cambia el id, el estado empieza de cero
function NewsDetailPage() {
  const { id = "" } = useParams();
  return <NewsDetailView key={id} id={id} />;
}

function NewsDetailView({ id }: { id: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  // Función del feed (NewsPage) para avisarle que la noticia cambió
  const { onNewsUpdated } = useOutletContext<NewsOutletContext>();

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Estado de la verificación (PATCH)
  const [saving, setSaving] = useState<VerifiedStatus | null>(null);
  const [saveError, setSaveError] = useState<{
    status: VerifiedStatus;
    message: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getNews(id, controller.signal)
      .then(setNews)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(toAppError(err, "No se pudo cargar la noticia."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  // Mientras el detalle está abierto, el feed de atrás no se desplaza
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const close = useCallback(() => {
    navigate({ pathname: "/news", search: location.search }, { replace: true });
  }, [navigate, location.search]);

  // Escape cierra el detalle, esté donde esté el foco
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  // Sin actualización optimista: el estado cambia SOLO si el servidor responde bien
  async function verify(status: VerifiedStatus) {
    setSaving(status); // deshabilita los botones mientras está en vuelo
    setSaveError(null);
    setConfirmation(null);
    try {
      const updated = await updateNewsStatus(id, status);
      setNews(updated);
      onNewsUpdated(updated); // el feed lo verá al volver
      setConfirmation(
        `Listo: la noticia quedó como "${NEWS_STATUS_LABEL[updated.status]}".`,
      );
    } catch (err) {
      const appError = toAppError(err, "No se pudo verificar la noticia.");
      // 409: ya estaba verificada con el otro estado; el servidor manda la actual
      const current = axios.isAxiosError<ApiErrorBody>(err)
        ? err.response?.data?.current
        : undefined;
      if (current) {
        setNews(current);
        onNewsUpdated(current);
        setSaveError({ status, message: appError.message });
      } else {
        setSaveError({
          status,
          message: `${appError.message} La noticia no cambió.`,
        });
      }
    } finally {
      setSaving(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="max-h-full w-full max-w-xl space-y-5 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="font-bold tracking-[0.3em] text-amber-400">NEWS COO</p>
          <button
            type="button"
            onClick={close}
            autoFocus
            className="rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-800"
          >
            ✕ Volver al feed
          </button>
        </div>

        {loading && (
          <div aria-busy="true" className="space-y-3">
            <div className="h-7 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="h-24 animate-pulse rounded bg-slate-800" />
          </div>
        )}

        {error &&
          (error.status === 404 ? (
            <p role="alert" className="text-slate-300">
              Esta noticia no existe en tu workspace.
            </p>
          ) : (
            <ErrorState message={error.message} onRetry={handleRetry} />
          ))}

        {news && !loading && (
          <>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-800 px-2 py-0.5">
                  {NEWS_TYPE_LABEL[news.type]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${PRIORITY_BADGE[news.priority]}`}
                >
                  Prioridad {PRIORITY_LABEL[news.priority]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${NEWS_STATUS_BADGE[news.status]}`}
                >
                  {NEWS_STATUS_LABEL[news.status]}
                </span>
              </div>
              <h2 id="news-title" className="text-2xl font-bold">
                {news.title}
              </h2>
              <p className="text-xs text-slate-500">
                {news.island} · {news.source} ·{" "}
                {formatDateTime(news.publishedAt)}
              </p>
            </div>

            {news.body.map((paragraph) => (
              <p key={paragraph} className="text-slate-300">
                {paragraph}
              </p>
            ))}

            {news.relatedWanted && (
              <p className="text-sm text-slate-400">
                Cartel relacionado: {news.relatedWanted.name}
              </p>
            )}

            <div className="space-y-3 border-t border-slate-800 pt-4">
              {news.status === "RUMOR" ? (
                <>
                  <p className="text-sm text-slate-400">
                    Este rumor todavía no está verificado.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void verify("CONFIRMED")}
                      disabled={saving !== null}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === "CONFIRMED" ? "Guardando..." : "Confirmar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void verify("DEBUNKED")}
                      disabled={saving !== null}
                      className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === "DEBUNKED" ? "Guardando..." : "Desmentir"}
                    </button>
                  </div>
                </>
              ) : (
                news.verifiedAt && (
                  <p className="text-sm text-slate-400">
                    Verificada el {formatDateTime(news.verifiedAt)}.
                  </p>
                )
              )}

              {confirmation && (
                <p
                  role="status"
                  className="rounded-lg bg-emerald-950 px-3 py-2 text-sm text-emerald-300"
                >
                  {confirmation}
                </p>
              )}

              {saveError && (
                <div
                  role="alert"
                  className="flex flex-wrap items-center gap-3 rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300"
                >
                  <span>{saveError.message}</span>
                  {news.status === "RUMOR" && (
                    <button
                      type="button"
                      onClick={() => void verify(saveError.status)}
                      disabled={saving !== null}
                      className="rounded-md bg-rose-600 px-2 py-1 font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                    >
                      Reintentar
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NewsDetailPage;
