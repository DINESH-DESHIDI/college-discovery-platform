import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const baseKey = "cd:compare";
const MAX = 4;

const readKey = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function useCompare() {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  const storageKey = user ? `${baseKey}:${user.id}` : `${baseKey}:guest`;

  useEffect(() => {
    setIds(readKey(storageKey));
    const on = () => setIds(readKey(storageKey));
    window.addEventListener("compare-change", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("compare-change", on);
      window.removeEventListener("storage", on);
    };
  }, [storageKey]);

  const persist = useCallback(
    (next) => {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setIds(next);
      window.dispatchEvent(new Event("compare-change"));
    },
    [storageKey],
  );

  const toggle = useCallback(
    (id) => {
      if (ids.includes(id)) persist(ids.filter((i) => i !== id));
      else if (ids.length < MAX) persist([...ids, id]);
    },
    [ids, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);
  const inCompare = useCallback((id) => ids.includes(id), [ids]);

  return { ids, toggle, clear, inCompare, max: MAX };
}
