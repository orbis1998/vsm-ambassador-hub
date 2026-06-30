import { useEffect, type RefObject } from "react";

/** Ferme un panneau/menu au clic/touch en dehors ou avec Échap. */
export function useDismissOnOutsidePress(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) onDismiss();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onDismiss, ref]);
}
