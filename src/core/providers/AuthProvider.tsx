'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { Spinner } from '@platform-system/design-ui';
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

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitialized: false,
  keycloak: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  token: undefined,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || !keycloak) return;
    initRef.current = true;

    keycloak.init({
      onLoad: 'login-required',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
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
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const register = () => {
    if (keycloak) {
      keycloak.register().catch(console.error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="spinner-accent h-12 w-12" />
      </div>
    );
  }

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
      {children}
    </AuthContext.Provider>
  );
}

