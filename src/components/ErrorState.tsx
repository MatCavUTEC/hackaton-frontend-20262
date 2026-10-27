interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-xl border border-rose-900 bg-rose-950/50 p-5"
    >
      <p className="text-rose-300">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-rose-600 px-3 py-1 text-sm font-medium hover:bg-rose-500"
      >
        Reintentar
      </button>
    </div>
  );
}

export default ErrorState;
