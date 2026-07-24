'use client';

import * as React from 'react';
import Keycloak from 'keycloak-js';
import { Spinner } from '@system/design-ui';
import { keycloak } from '@/shared/api/keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  keycloak: Keycloak | null;
  login: () => void;
  logout: () => void;
  register: () => void;
  token: string | undefined;
}

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  isInitialized: false,
  keycloak: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  token: undefined,
});

export const useAuth = () => React.useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  const initRef = React.useRef(false);

  React.useEffect(() => {
    if (initRef.current || !keycloak) return;
    initRef.current = true;

    keycloak.init({
      onLoad: 'login-required',
      silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
      pkceMethod: 'S256',
      checkLoginIframe: false,
      enableLogging: false,
    })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error('Keycloak initialization failed', error);
        setIsInitialized(true);
      });

    keycloak.onTokenExpired = () => {
      const kc = keycloak;
      if (kc) {
        kc.updateToken(30).catch(() => {
          console.error('Failed to refresh token, forcing logout');
          kc.logout();
        });
      }
    };
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login().catch(console.error);
    } else {
      console.error("Keycloak instance not found or not initialized");
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined });
    }
  };

  const register = () => {
    if (keycloak) {
      keycloak.register().catch(console.error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        keycloak,
        login,
        logout,
        register,
        token: keycloak?.token,
      }}
    >
      {!isInitialized && typeof window !== 'undefined' ? (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Spinner className="spinner-accent h-12 w-12" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
