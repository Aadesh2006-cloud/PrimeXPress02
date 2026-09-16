import type { SupabaseClient, User } from '@supabase/supabase-js';

export type AuthResult = { success: boolean; error?: string; requiresEmailConfirmation?: boolean };
export const MIN_PASSWORD_LENGTH = 12;
export function isVerifiedUser(user: User | null): user is User {
  return Boolean(user?.id && user.email && user.email_confirmed_at && !user.is_anonymous);
}
export async function verifiedUser(client: SupabaseClient): Promise<User | null> {
  const { data, error } = await client.auth.getUser();
  return !error && isVerifiedUser(data.user) ? data.user : null;
}
export async function requireUser(client: SupabaseClient): Promise<User> {
  const user = await verifiedUser(client);
  if (!user) throw new Error('Please sign in with a verified account to continue.');
  return user;
}
export async function requireAdmin(client: SupabaseClient): Promise<User> {
  const user = await requireUser(client);
  const { data, error } = await client.rpc('is_admin');
  if (error || data !== true) throw new Error('This account is not authorized for the administrator portal.');
  return user;
}
export async function signIn(client: SupabaseClient, email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.session || !isVerifiedUser(data.user)) {
      if (data.session) await client.auth.signOut({ scope: 'local' });
      return { success: false, error: 'Unable to sign in. Check your email and password and confirm your email address.' };
    }
    return { success: true };
  } catch { return { success: false, error: 'Unable to sign in. Please try again.' }; }
}
export async function register(client: SupabaseClient, email: string, password: string, name: string, phone = ''): Promise<AuthResult> {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 128) {
    return { success: false, error: 'Use a password between 12 and 128 characters.' };
  }
  try {
    const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password,
      options: { emailRedirectTo: `${window.location.origin}/signin`, data: { full_name: name.trim(), phone: phone.trim() } },
    });
    if (error) return { success: false, error: 'Unable to create an account. Please try again or sign in if you already have one.' };
    if (data.session && !isVerifiedUser(data.user)) await client.auth.signOut({ scope: 'local' });
    return { success: true, requiresEmailConfirmation: !data.session || !isVerifiedUser(data.user) };
  } catch { return { success: false, error: 'Unable to create an account. Please try again.' }; }
}
export async function signInAdmin(client: SupabaseClient, email: string, password: string): Promise<AuthResult> {
  const result = await signIn(client, email, password);
  if (!result.success) return result;
  try { await requireAdmin(client); return { success: true }; }
  catch {
    await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
    return { success: false, error: 'This account is not authorized for the administrator portal.' };
  }
}
