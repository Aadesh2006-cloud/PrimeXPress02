import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient.js';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export const MASTER_ADMIN_EMAIL = 'PrimeXPress33@gmail.com';
export const MASTER_ADMIN_PASS = '@PrimeXPress#2006';
export const STORAGE_KEY_ADMIN_CREATED = 'pxc_admin_account_created';
export const STORAGE_KEY_ADMIN_LOGGED_IN = 'pxc_admin_auth_logged_in';

export const resolveConsumerName = (user: any): string => {
  if (!user) return 'Customer';
  const meta = user.user_metadata || {};
  if (meta.full_name && typeof meta.full_name === 'string' && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  if (meta.name && typeof meta.name === 'string' && meta.name.trim()) {
    return meta.name.trim();
  }
  if (meta.first_name && typeof meta.first_name === 'string' && meta.first_name.trim()) {
    return `${meta.first_name} ${meta.last_name || ''}`.trim();
  }

  // Check localStorage for a custom saved consumer name
  try {
    const savedName = localStorage.getItem(`pxc_consumer_name_${user.id}`);
    if (savedName && savedName.trim()) {
      return savedName.trim();
    }
  } catch {}

  // Fallback to formatted email prefix
  if (user.email) {
    const prefix = user.email.split('@')[0].replace(/[._-]/g, ' ');
    return prefix
      .split(' ')
      .filter(Boolean)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return 'Customer';
};

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isAdminLoggedIn: boolean;
  loading: boolean;
  isAdminAccountCreated: boolean;
  updateConsumerName: (name: string) => Promise<void>;
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
  logoutAdmin: () => void;
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ADMIN_LOGGED_IN) === 'true';
    } catch {
      return false;
    }
  });

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
              displayName: resolveConsumerName(session.user),
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
          displayName: resolveConsumerName(session.user),
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
          displayName: resolveConsumerName(session.user),
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

  const updateConsumerName = async (newName: string): Promise<void> => {
    if (!currentUser) return;
    const trimmed = newName.trim();
    if (!trimmed) return;

    try {
      localStorage.setItem(`pxc_consumer_name_${currentUser.uid}`, trimmed);
      await supabase.auth.updateUser({
        data: { full_name: trimmed, name: trimmed },
      });
      setCurrentUser((prev) => (prev ? { ...prev, displayName: trimmed } : null));
    } catch (err) {
      console.error('Failed to update consumer name:', err);
      // Still update locally for user feedback
      setCurrentUser((prev) => (prev ? { ...prev, displayName: trimmed } : null));
    }
  };

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

  const registerWithEmail = async (email: string, pass: string, name?: string): Promise<void> => {
    await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name || '',
          name: name || '',
        },
      },
    });
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const loginAdmin = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const expectedEmail = MASTER_ADMIN_EMAIL.toLowerCase();

    if (trimmedEmail === expectedEmail && pass === MASTER_ADMIN_PASS) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_LOGGED_IN, 'true');
      } catch {}
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Invalid Administrator ID or Password. Access restricted to authorized dispatch staff.',
      };
    }
  };

  const logoutAdmin = (): void => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_LOGGED_IN);
    } catch {}
  };

  const createAdminAccount = async (): Promise<{ success: boolean }> => {
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        userProfile: null,
        isAdmin: isAdminLoggedIn,
        isAdminLoggedIn,
        loading,
        isAdminAccountCreated: true,
        updateConsumerName,
        createAdminAccount,
        loginAdmin,
        logoutAdmin,
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
