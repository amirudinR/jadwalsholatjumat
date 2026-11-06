import { useCallback, useEffect, useState } from 'react';
import { authErrorMessage, loginAnon, loginGoogle, logout, watchUser, type User } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => watchUser((u) => {
    setUser(u);
    setReady(true);
  }), []);

  const run = useCallback(async (fn: () => Promise<unknown>): Promise<string | null> => {
    setBusy(true);
    try {
      await fn();
      return null;
    } catch (err) {
      return authErrorMessage(err);
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    user,
    ready,
    busy,
    isAnon: user?.isAnonymous ?? false,
    loginGoogle: useCallback(() => run(loginGoogle), [run]),
    loginAnon: useCallback(() => run(loginAnon), [run]),
    logout: useCallback(() => run(logout), [run]),
  };
}
