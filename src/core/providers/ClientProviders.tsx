'use client';

import * as React from 'react';
import { ThemeProvider, Toaster, SonnerToaster } from '@system/design-ui';
import AuthProvider from "@/core/providers/AuthProvider";
import QueryProvider from "@/core/providers/QueryProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <Toaster />
      <SonnerToaster />
      <AuthProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
