import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchMe, getMe } from '../api';
import type { AuthUser } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/** Gates SPA routes that require a live session cookie. */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null | undefined>(
    () => getMe() ?? undefined
  );

  useEffect(() => {
    let cancelled = false;
    if (getMe()) {
      setUser(getMe());
      return;
    }
    fetchMe().then((me) => {
      if (!cancelled) setUser(me);
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (user === undefined) {
    return (
      <div className="app-ui min-h-screen flex items-center justify-center text-syncra-muted text-sm">
        Checking session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
