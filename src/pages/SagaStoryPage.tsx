import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toAppError, type AppError } from "../api/errors";
import { getSagaStory } from "../api/sagas";
import ErrorState from "../components/ErrorState";
import SagaMap from "../components/SagaMap";
import TransitionLink from "../components/TransitionLink";
import { formatMetric } from "../lib/catalog";
import { prefersReducedMotion } from "../lib/motion";
import type { SagaStory, SagaSummary } from "../types/api";

// key={id}: si cambias de saga, todo el estado empieza de cero
function SagaStoryPage() {
  const { id = "" } = useParams();
  return <SagaStoryView key={id} sagaId={id} />;
}

function SagaStoryView({ sagaId }: { sagaId: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // El resumen que mandó /sagas al navegar: muestra el título sin esperar
  const preview = (location.state as { saga?: SagaSummary } | null)?.saga;

  const [story, setStory] = useState<SagaStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // La etapa que pedía la URL al abrir la página (se usa una sola vez)
  const initialStage = useRef(searchParams.get("stage"));

  useEffect(() => {
    const controller = new AbortController();
    getSagaStory(sagaId, controller.signal)
      .then(setStory)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(toAppError(err, "No se pudo cargar la saga."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [sagaId, reloadKey]);

  // 1) La etapa activa vive en la URL (?stage=slug). Si falta o no existe → la primera
  const stages = story?.stages ?? [];
  const found = stages.findIndex((s) => s.slug === searchParams.get("stage"));
  const activeIndex = Math.max(found, 0);
  const active = stages[activeIndex];

  // Escribe la etapa en la URL. replace: el scroll no llena el historial
  const showStage = useCallback(
    (slug: string) => {
      if (new URLSearchParams(window.location.search).get("stage") === slug) {
        return;
      }
      void navigate(
        { search: `?stage=${encodeURIComponent(slug)}` },
        { replace: true },
      );
    },
    [navigate],
  );

  // 2) Abrir la URL con ?stage=... lleva directo a esa etapa.
  //    Espera a que se quite el loading: si no, el esqueleto de carga que
  //    desaparece después movería la página
  useEffect(() => {
    if (!story || loading || !initialStage.current) return;
    document
      .getElementById(`stage-${initialStage.current}`)
      ?.scrollIntoView({ block: "start" });
  }, [story, loading]);

  // 3) Etapa activa por scroll: la que cruza la franja del centro de la pantalla
  useEffect(() => {
    if (!story) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = entry.target.getAttribute("data-slug");
          if (entry.isIntersecting && slug) showStage(slug);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }, // franja del 10% al centro
    );
    document
      .querySelectorAll("[data-slug]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [story, showStage]);

  // Botones anterior/siguiente: llevan a la etapa y le ponen el foco
  function goToStage(index: number) {
    const stage = stages[index];
    if (!stage) return;
    const card = document.getElementById(`stage-${stage.slug}`);
    card?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    card?.focus({ preventScroll: true });
    showStage(stage.slug);
  }

  // 4) Colores de la etapa activa (o de la saga mientras carga)
  const palette = active?.palette ?? story?.saga.palette ?? preview?.palette;
  const title = story?.saga.title ?? preview?.title ?? "Saga";
  const subtitle = story?.saga.subtitle ?? preview?.subtitle;
  const progress = stages.length > 0 ? (activeIndex + 1) / stages.length : 0;

  return (
    <article
      className="saga-story -mx-4 space-y-8 px-4 py-6 transition-colors duration-700 motion-reduce:transition-none md:mx-0 md:rounded-3xl md:px-8"
      style={
        palette
          ? { backgroundColor: palette.background, color: palette.text }
          : undefined
      }
    >
      <header className="space-y-2">
        <TransitionLink to="/sagas" className="text-sm underline opacity-80">
          ← Volver a las sagas
        </TransitionLink>
        <h1
          className="w-fit text-3xl font-bold"
          style={{ viewTransitionName: `saga-title-${sagaId}` }}
        >
          {title}
        </h1>
        {subtitle && <p className="opacity-80">{subtitle}</p>}
        {story && <p className="max-w-2xl opacity-80">{story.saga.intro}</p>}
      </header>

      {loading && (
        <div aria-busy="true" className="space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-black/20" />
          <div className="h-32 animate-pulse rounded-2xl bg-black/20" />
        </div>
      )}

      {error &&
        (error.status === 404 ? (
          <p role="alert">Esta saga no existe en tu workspace.</p>
        ) : (
          <ErrorState
            message={error.message}
            onRetry={() => {
              setLoading(true);
              setError(null);
              setReloadKey((key) => key + 1);
            }}
          />
        ))}

      {story && active && palette && (
        <div className="md:flex md:flex-row-reverse md:items-start md:gap-8">
          {/* Panel fijo: arriba en celular, a la derecha en escritorio */}
          <aside
            className="sticky top-0 z-10 -mx-4 space-y-3 px-4 py-3 transition-colors duration-700 motion-reduce:transition-none md:top-6 md:mx-0 md:w-1/2 md:px-0"
            style={{ backgroundColor: palette.background }}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <p>
                <strong>
                  Etapa {activeIndex + 1} de {stages.length}
                </strong>{" "}
                · {active.island.name}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => goToStage(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  aria-label="Etapa anterior"
                  className="rounded-md px-2 py-0.5 disabled:opacity-30"
                  style={{ backgroundColor: palette.surface }}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => goToStage(activeIndex + 1)}
                  disabled={activeIndex === stages.length - 1}
                  aria-label="Etapa siguiente"
                  className="rounded-md px-2 py-0.5 disabled:opacity-30"
                  style={{ backgroundColor: palette.surface }}
                >
                  →
                </button>
              </div>
            </div>

            {/* Progreso: con soporte lo mueve el CSS con el scroll; sin soporte,
                la variable --progress que calculamos aquí */}
            <div
              role="progressbar"
              aria-label="Progreso del recorrido"
              aria-valuemin={1}
              aria-valuemax={stages.length}
              aria-valuenow={activeIndex + 1}
              className="h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: palette.surface }}
            >
              <div
                className="saga-progress h-full origin-left rounded-full"
                style={
                  {
                    backgroundColor: palette.primary,
                    "--progress": progress,
                  } as CSSProperties
                }
              />
            </div>

            <SagaMap
              width={story.map.width}
              height={story.map.height}
              stages={stages}
              activeIndex={activeIndex}
              palette={palette}
            />

            {/* Métricas: SIEMPRE las de la etapa activa */}
            <dl className="grid grid-cols-2 gap-2 text-xs md:text-sm">
              {active.metrics.map((metric) => (
                <div
                  key={metric.key}
                  className="rounded-lg px-3 py-2"
                  style={{ backgroundColor: palette.surface }}
                >
                  <dt className="opacity-70">{metric.label}</dt>
                  <dd className="font-bold" style={{ color: palette.primary }}>
                    {formatMetric(metric)}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Para lectores de pantalla: anuncia la etapa nueva */}
            <p className="sr-only" aria-live="polite">
              Etapa {activeIndex + 1} de {stages.length}: {active.title}.
            </p>
          </aside>

          <ol className="saga-stages pb-[45vh] md:w-1/2">
            {stages.map((stage, index) => (
              <li
                key={stage.id}
                data-slug={stage.slug}
                className="flex min-h-[85vh] items-center py-4"
              >
                {/* tabIndex=0: se llega con Tab; al enfocarla pasa a ser la activa.
                    scroll-mt: al saltar aquí, el panel fijo no tapa el texto */}
                <article
                  id={`stage-${stage.slug}`}
                  tabIndex={0}
                  aria-labelledby={`stage-title-${stage.id}`}
                  onFocus={() => showStage(stage.slug)}
                  className={`saga-stage-card w-full scroll-mt-[50vh] space-y-3 rounded-2xl p-6 transition-opacity focus-visible:outline-4 focus-visible:outline-offset-4 md:scroll-mt-[25vh] ${index === activeIndex ? "" : "opacity-60"}`}
                  style={{
                    backgroundColor: stage.palette.surface,
                    color: stage.palette.text,
                  }}
                >
                  <p
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: stage.palette.primary }}
                  >
                    Etapa {stage.order} · {stage.island.name}
                  </p>
                  <h2 id={`stage-title-${stage.id}`} className="text-2xl font-bold">
                    {stage.title}
                  </h2>
                  {stage.narrative.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

export default SagaStoryPage;
