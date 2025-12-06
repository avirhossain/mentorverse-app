'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { AdminAuthState, useAdminUser } from './use-admin-user';

export const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adminAuthState = useAdminUser();

  const contextValue = useMemo(() => {
    return adminAuthState;
  }, [adminAuthState]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthState => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
