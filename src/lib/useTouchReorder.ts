import { useRef } from "react";

interface Options {
  /** Called when a drag starts from a handle */
  onStart: (id: string) => void;
  /** Called while the finger hovers a different item */
  onHover: (id: string | null) => void;
  /** Called when the finger is released over an item */
  onDrop: (targetId: string) => void;
  /** Called when the drag is cancelled */
  onCancel: () => void;
  /** data attribute used to mark drop targets (default: data-drag-id) */
  attr?: string;
}

/**
 * Touch (mobile) reordering that mirrors the desktop HTML5 drag behaviour.
 * The returned props must be spread ONLY on the drag handle, so normal
 * scrolling, tapping and text selection stay untouched everywhere else.
 * Drop targets must carry the matching data attribute, e.g. data-drag-id={id}.
 */
export const useTouchReorder = ({ onStart, onHover, onDrop, onCancel, attr = "data-drag-id" }: Options) => {
  const activeId = useRef<string | null>(null);
  const lastOver = useRef<string | null>(null);

  const targetAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const holder = el?.closest(`[${attr}]`) as HTMLElement | null;
    return holder?.getAttribute(attr) || null;
  };

  const handleProps = (id: string) => ({
    // touch-action:none makes the gesture ours: the page won't scroll from the handle
    style: { touchAction: "none" as const },
    onTouchStart: () => {
      activeId.current = id;
      lastOver.current = null;
      onStart(id);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (!activeId.current) return;
      const t = e.touches[0];
      if (!t) return;
      const over = targetAt(t.clientX, t.clientY);
      if (over !== lastOver.current) {
        lastOver.current = over;
        onHover(over && over !== activeId.current ? over : null);
      }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const source = activeId.current;
      activeId.current = null;
      if (!source) return;
      const t = e.changedTouches[0];
      const over = t ? targetAt(t.clientX, t.clientY) : lastOver.current;
      lastOver.current = null;
      if (over && over !== source) onDrop(over);
      else onCancel();
    },
    onTouchCancel: () => {
      activeId.current = null;
      lastOver.current = null;
      onCancel();
    },
  });

  return { handleProps };
};
