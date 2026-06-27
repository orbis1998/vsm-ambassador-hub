// Client-side state for the social layer (reactions, saved posts, follows, settings).
import { useCallback, useEffect, useState } from "react";
import type { ReactionKey } from "./social-data";

const KEY = "vsm.social.v1";

interface State {
  reactions: Record<string, ReactionKey | null>; // postId -> chosen reaction
  saved: string[]; // post ids
  follows: string[]; // ambassador ids
  readNotifIds: string[];
  settings: {
    theme: "dark";
    language: "fr" | "en";
    emailNotifs: boolean;
    pushNotifs: boolean;
    weeklyDigest: boolean;
    privateProfile: boolean;
  };
}

const empty: State = {
  reactions: {},
  saved: [],
  follows: [],
  readNotifIds: [],
  settings: {
    theme: "dark",
    language: "fr",
    emailNotifs: true,
    pushNotifs: true,
    weeklyDigest: true,
    privateProfile: false,
  },
};

function read(): State {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as State), settings: { ...empty.settings, ...(JSON.parse(raw).settings ?? {}) } };
  } catch { return empty; }
}
function write(s: State) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("vsm:social"));
}

export function useSocialStore() {
  const [state, setState] = useState<State>(empty);
  useEffect(() => {
    setState(read());
    const h = () => setState(read());
    window.addEventListener("vsm:social", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("vsm:social", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const setReaction = useCallback((postId: string, k: ReactionKey | null) => {
    const s = read();
    write({ ...s, reactions: { ...s.reactions, [postId]: k } });
  }, []);
  const toggleSaved = useCallback((postId: string) => {
    const s = read();
    const saved = s.saved.includes(postId) ? s.saved.filter((x) => x !== postId) : [postId, ...s.saved];
    write({ ...s, saved });
  }, []);
  const toggleFollow = useCallback((id: string) => {
    const s = read();
    const follows = s.follows.includes(id) ? s.follows.filter((x) => x !== id) : [id, ...s.follows];
    write({ ...s, follows });
  }, []);
  const markNotifRead = useCallback((id: string) => {
    const s = read();
    if (s.readNotifIds.includes(id)) return;
    write({ ...s, readNotifIds: [id, ...s.readNotifIds] });
  }, []);
  const markAllNotifRead = useCallback((ids: string[]) => {
    const s = read();
    write({ ...s, readNotifIds: Array.from(new Set([...ids, ...s.readNotifIds])) });
  }, []);
  const updateSettings = useCallback((p: Partial<State["settings"]>) => {
    const s = read();
    write({ ...s, settings: { ...s.settings, ...p } });
  }, []);

  return { state, setReaction, toggleSaved, toggleFollow, markNotifRead, markAllNotifRead, updateSettings };
}
