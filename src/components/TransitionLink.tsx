import type { CSSProperties, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { navigateWithTransition } from "../lib/motion";

interface TransitionLinkProps {
  to: string;
  state?: unknown; // datos que viajan con la navegación
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

// Un <Link> normal que, al hacer clic, navega con View Transition
function TransitionLink({
  to,
  state,
  className,
  style,
  children,
}: TransitionLinkProps) {
  const navigate = useNavigate();

  return (
    <Link
      to={to}
      state={state}
      className={className}
      style={style}
      onClick={(event) => {
        // Ctrl+clic, clic con la rueda, etc. (abrir en otra pestaña): normal
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigateWithTransition(() => {
          void navigate(to, { state });
        });
      }}
    >
      {children}
    </Link>
  );
}

export default TransitionLink;
