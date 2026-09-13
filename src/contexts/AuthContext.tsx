import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient.js';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export const MASTER_ADMIN_EMAIL = 'primexpress33@gmail.com';
export const MASTER_ADMIN_PASS = '';
export const STORAGE_KEY_ADMIN_CREATED = 'pxc_admin_account_created';

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isAdminAccountCreated: boolean;
  createAdminAccount: (
    email: string,
    pass: string,
    name?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    name?: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAdminPanelOpen: boolean;
  openAdminPanel: () => void;
  closeAdminPanel: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isPortalModalOpen: boolean;
  openPortalModal: () => void;
  closePortalModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);

  useEffect(() => {
    // If running in an OAuth popup window, notify opener and close
    if (
      typeof window !== 'undefined' &&
      window.opener &&
      (window.location.hash.includes('access_token') || window.location.search.includes('code='))
    ) {
      try {
        window.opener.postMessage({ type: 'SUPABASE_OAUTH_SUCCESS' }, '*');
        setTimeout(() => window.close(), 200);
      } catch {
        // ignore
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SUPABASE_OAUTH_SUCCESS') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setCurrentUser({
              uid: session.user.id,
              email: session.user.email || null,
              displayName:
                session.user.user_metadata?.full_name ||
                session.user.email?.split('@')[0] ||
                'User',
            });
          }
        });
      }
    };
    window.addEventListener('message', handleMessage);

    // Check initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          uid: session.user.id,
          email: session.user.email || null,
          displayName:
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'User',
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          uid: session.user.id,
          email: session.user.email || null,
          displayName:
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'User',
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const openAdminPanel = () => setIsAdminPanelOpen(true);
  const closeAdminPanel = () => setIsAdminPanelOpen(false);

  const openPortalModal = () => setIsPortalModalOpen(true);
  const closePortalModal = () => setIsPortalModalOpen(false);

  const openAuthModal = () => {
    setIsPortalModalOpen(true);
  };
  const closeAuthModal = () => {};

  const loginWithGoogle = async (): Promise<void> => {
    return Promise.resolve();
  };

  const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    await supabase.auth.signInWithPassword({ email, password: pass });
  };

  const registerWithEmail = async (email: string, pass: string): Promise<void> => {
    await supabase.auth.signUp({ email, password: pass });
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const loginAdmin = async (): Promise<{ success: boolean }> => {
    return { success: true };
  };

  const createAdminAccount = async (): Promise<{ success: boolean }> => {
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        userProfile: null,
        isAdmin: true, // Dispatch dashboard is accessible for operations
        loading,
        isAdminAccountCreated: true,
        createAdminAccount,
        loginAdmin,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        isAdminPanelOpen,
        openAdminPanel,
        closeAdminPanel,
        isAuthModalOpen: false,
        authModalMode: 'login',
        openAuthModal,
        closeAuthModal,
        isPortalModalOpen,
        openPortalModal,
        closePortalModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
