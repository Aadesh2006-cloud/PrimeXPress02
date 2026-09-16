import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { supabase, adminSupabase } from '../supabaseClient.js';
import { register, requireAdmin, signIn, signInAdmin, verifiedUser, type AuthResult } from '../services/authService';
import { clearPrivateData } from '../services/privateData';

export interface AuthUser { uid: string; email: string | null; displayName: string | null; photoURL?: string | null }
export const resolveConsumerName = (user: User): string =>
  String(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Customer');
const profile = (u: User): AuthUser => ({ uid: u.id, email: u.email || null, displayName: resolveConsumerName(u) });

interface AuthContextType {
  user: AuthUser | null; userProfile: null; adminUser: AuthUser | null;
  isAdmin: boolean; isAdminLoggedIn: boolean; loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<AuthResult>;
  registerWithEmail: (email: string, password: string, name?: string, phone?: string) => Promise<AuthResult>;
  loginAdmin: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<void>; logout: () => Promise<void>; logoutAdmin: () => Promise<void>;
  updateConsumerName: (name: string) => Promise<void>;
  isAdminPanelOpen: boolean; openAdminPanel: () => void; closeAdminPanel: () => void;
  isPortalModalOpen: boolean; openPortalModal: () => void; closePortalModal: () => void;
  isAuthModalOpen: boolean; authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void; closeAuthModal: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false);
  const [isPortalModalOpen, setPortalModalOpen] = useState(false);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    clearPrivateData();
    let active = true;
    let customerGeneration = 0;
    let adminGeneration = 0;
    const syncCustomer = async () => {
      const generation = ++customerGeneration;
      let found: User | null = null;
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) found = await verifiedUser(supabase);
      } catch { /* Fail closed, including offline restoration. */ }
      if (!active || generation !== customerGeneration) return;
      if (userId.current !== (found?.id ?? null)) {
        clearPrivateData();
        try { sessionStorage.removeItem('pxc_guest_capabilities_v2'); } catch {}
      }
      userId.current = found?.id ?? null;
      setUser(found ? profile(found) : null);
      setLoading(false);
      window.dispatchEvent(new CustomEvent('pxc-consumer-auth-changed'));
      if (found && window.name === 'supabase_google_auth' && window.opener) window.close();
    };
    const syncAdmin = async () => {
      const generation = ++adminGeneration;
      let found: User | null = null;
      try {
        const { data } = await adminSupabase.auth.getSession();
        if (data.session) found = await requireAdmin(adminSupabase);
      } catch { /* A failed/missing role lookup never grants access. */ }
      if (active && generation === adminGeneration) setAdminUser(found ? profile(found) : null);
    };
    // Defer SDK calls outside onAuthStateChange's storage lock.
    const customer = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        ++customerGeneration; userId.current = null; setUser(null); clearPrivateData();
      } else setTimeout(() => { if (active) void syncCustomer(); }, 0);
    });
    const admin = adminSupabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { ++adminGeneration; setAdminUser(null); clearPrivateData(); }
      else setTimeout(() => { if (active) void syncAdmin(); }, 0);
    });
    void syncCustomer(); void syncAdmin();
    const onFocus = () => { void syncCustomer(); void syncAdmin(); };
    window.addEventListener('focus', onFocus);
    return () => { active = false; customer.data.subscription.unsubscribe(); admin.data.subscription.unsubscribe(); window.removeEventListener('focus', onFocus); };
  }, []);

  const logoutClient = async (client: SupabaseClient, admin = false) => {
    if (admin) setAdminUser(null); else { setUser(null); userId.current = null; }
    clearPrivateData();
    try { sessionStorage.removeItem('pxc_guest_capabilities_v2'); } catch {}
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch {
      // The SDK may retain storage when its logout endpoint is offline.
      (admin ? sessionStorage : localStorage).removeItem(admin ? 'pxc_admin_session_v2' : 'pxc_customer_session_v2');
      window.location.replace('/signin');
    }
  };
  const loginWithGoogle = async () => {
    const embedded = window.self !== window.top;
    const popup = embedded ? window.open('about:blank', 'supabase_google_auth', 'width=520,height=650,menubar=no,toolbar=no,status=no') : null;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/signin`, skipBrowserRedirect: embedded } });
      if (error) throw error;
      if (embedded && data.url) {
        if (popup) popup.location.href = data.url;
        else window.location.assign(data.url);
      }
    } catch (error) { popup?.close(); throw error; }
  };
  const loginAdmin = async (email: string, password: string) => {
    setAdminUser(null);
    const result = await signInAdmin(adminSupabase, email, password);
    if (result.success) {
      try { setAdminUser(profile(await requireAdmin(adminSupabase))); }
      catch {
        await logoutClient(adminSupabase, true);
        return { success: false, error: 'Unable to verify administrator access.' };
      }
    }
    return result;
  };

  return <AuthContext.Provider value={{
    user, userProfile: null, adminUser, isAdmin: Boolean(adminUser), isAdminLoggedIn: Boolean(adminUser), loading,
    loginWithEmail: (email, password) => signIn(supabase, email, password),
    registerWithEmail: (email, password, name = '', phone) => register(supabase, email, password, name, phone),
    loginAdmin, loginWithGoogle,
    logout: () => logoutClient(supabase), logoutAdmin: () => logoutClient(adminSupabase, true),
    updateConsumerName: async (name) => {
      if (!user || !name.trim()) return;
      const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      if (error) throw error;
      setUser({ ...user, displayName: name.trim() });
    },
    isAdminPanelOpen, openAdminPanel: () => setAdminPanelOpen(true), closeAdminPanel: () => setAdminPanelOpen(false),
    isPortalModalOpen, openPortalModal: () => setPortalModalOpen(true), closePortalModal: () => setPortalModalOpen(false),
    isAuthModalOpen: false, authModalMode: 'login', openAuthModal: () => setPortalModalOpen(true), closeAuthModal: () => setPortalModalOpen(false),
  }}><React.Fragment key={`${user?.uid || 'guest'}:${adminUser?.uid || 'no-admin'}`}>{children}</React.Fragment></AuthContext.Provider>;
};
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within an AuthProvider');
  return value;
};
