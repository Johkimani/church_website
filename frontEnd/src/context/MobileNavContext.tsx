import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type MutableRefObject,
} from "react";

export interface MobileNavEntry {
  id: string;
  label: string;
  render: (close: () => void) => ReactNode;
}

interface MobileNavContextValue {
  entry: MobileNavEntry | null;
  setEntry: (entry: MobileNavEntry | null) => void;
}

const MobileNavContext = createContext<MobileNavContextValue>({
  entry: null,
  setEntry: () => {},
});

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<MobileNavEntry | null>(null);
  return (
    <MobileNavContext.Provider value={{ entry, setEntry }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  return useContext(MobileNavContext);
}

// Registers a context-aware mobile nav entry for the current page. The entry is
// removed automatically on unmount or when id/label change to null.
// `renderRef` must hold the latest render function (the page reassigns
// `.current` every render so the drawer always sees fresh data without the
// registration effect re-running).
export function useMobileNavEntry(
  id: string | null | undefined,
  label: string | null | undefined,
  renderRef: MutableRefObject<(close: () => void) => ReactNode>
) {
  const { setEntry } = useMobileNav();

  useEffect(() => {
    if (!id || !label) return;
    setEntry({
      id,
      label,
      render: (close) => renderRef.current(close),
    });
    return () => setEntry((prev) => (prev?.id === id ? null : prev));
  }, [setEntry, id, label, renderRef]);
}

// Convenience hook for pages that build their render function inline and want a
// ready-made ref. Returns the ref that the page should assign `.current` on.
export function useLatestRenderRef(initial?: (close: () => void) => ReactNode) {
  return useRef<(close: () => void) => ReactNode>(initial ?? (() => null));
}