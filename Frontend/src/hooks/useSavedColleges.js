import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";

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
  const { user, isAuthenticated } = useAuth();
  const [saved, setSaved] = useState([]);
  const [savedIdMap, setSavedIdMap] = useState({});
  const [loading, setLoading] = useState(false);

  const storageKey = user ? `${baseKey}:${user.id}` : `${baseKey}:guest`;

  // Fetch from backend if authenticated, otherwise load local storage
  const syncSavedColleges = useCallback(async () => {
    if (!isAuthenticated) {
      const local = readKey(storageKey);
      setSaved(local);
      setSavedIdMap({});
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/api/saved");
      const list = res.data.data || [];

      const ids = list.map((item) => item.id);
      const map = {};
      list.forEach((item) => {
        map[item.id] = item.savedId;
      });

      setSaved(ids);
      setSavedIdMap(map);
      localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch (err) {
      console.error("Failed to sync saved colleges:", err);
      // Fallback to local storage if API fails
      const local = readKey(storageKey);
      setSaved(local);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    syncSavedColleges();

    const onStorage = () => {
      if (!isAuthenticated) {
        setSaved(readKey(storageKey));
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("saved-colleges-change", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("saved-colleges-change", onStorage);
    };
  }, [syncSavedColleges, isAuthenticated, storageKey]);

  const toggle = useCallback(
    async (id) => {
      if (isAuthenticated) {
        const alreadySaved = saved.includes(id);
        if (alreadySaved) {
          const savedId = savedIdMap[id];
          if (savedId) {
            try {
              await api.delete(`/api/saved/${savedId}`);
              const next = saved.filter((s) => s !== id);
              setSaved(next);
              const nextMap = { ...savedIdMap };
              delete nextMap[id];
              setSavedIdMap(nextMap);
              localStorage.setItem(storageKey, JSON.stringify(next));
              window.dispatchEvent(new Event("saved-colleges-change"));
            } catch (err) {
              console.error("Failed to delete saved college:", err);
            }
          }
        } else {
          try {
            const res = await api.post("/api/saved", { collegeId: id });
            const savedItem = res.data.data;
            const newSavedId = savedItem.savedId || savedItem.id;

            const next = [...saved, id];
            setSaved(next);
            setSavedIdMap((prev) => ({ ...prev, [id]: newSavedId }));
            localStorage.setItem(storageKey, JSON.stringify(next));
            window.dispatchEvent(new Event("saved-colleges-change"));
          } catch (err) {
            console.error("Failed to save college:", err);
          }
        }
      } else {
        const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
        localStorage.setItem(storageKey, JSON.stringify(next));
        setSaved(next);
        window.dispatchEvent(new Event("saved-colleges-change"));
      }
    },
    [saved, savedIdMap, isAuthenticated, storageKey],
  );

  const isSaved = useCallback((id) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved, loading };
}
