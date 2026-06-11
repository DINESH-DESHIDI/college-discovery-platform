import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const baseKey = "cd:saved-colleges";

const readKey = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function useSavedColleges() {
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);

  const storageKey = user ? `${baseKey}:${user.id}` : `${baseKey}:guest`;

  useEffect(() => {
    setSaved(readKey(storageKey));
    const onStorage = () => setSaved(readKey(storageKey));
    window.addEventListener("storage", onStorage);
    window.addEventListener("saved-colleges-change", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("saved-colleges-change", onStorage);
    };
    // re-run when storageKey changes (user login/logout)
  }, [storageKey]);

  const persist = useCallback(
    (next) => {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next);
      window.dispatchEvent(new Event("saved-colleges-change"));
    },
    [storageKey],
  );

  const toggle = useCallback(
    (id) => {
      const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
      persist(next);
    },
    [saved, persist],
  );

  const isSaved = useCallback((id) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved };
}
