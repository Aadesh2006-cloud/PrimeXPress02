import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2, ArrowRight, LogOut } from 'lucide-react';
import { supabase, SUPABASE_PROJECT_ID } from '../supabaseClient.js';
import { useAuth } from '../contexts/AuthContext';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginWithEmail, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated or auth completes, allow direct navigation or notification
  useEffect(() => {
    let isMounted = true;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SUPABASE_OAUTH_SUCCESS') {
        navigate('/');
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      isMounted = false;
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);

  const validateCredentials = (): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateCredentials()) {
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithEmail(email.trim(), password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;

      if (isIframe) {
        // In AI Studio iframe environment, Google login denies rendering inside an iframe.
        // Request the OAuth URL with skipBrowserRedirect and launch popup window.
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (oauthError) {
          setError(oauthError.message);
          return;
        }

        if (data?.url) {
          const authWindow = window.open(
            data.url,
            'supabase_google_auth',
            'width=520,height=650,menubar=no,toolbar=no,status=no'
          );
          if (!authWindow) {
            // Popup was blocked by browser, attempt direct navigation
            window.location.href = data.url;
          }
        }
      } else {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (oauthError) {
          setError(oauthError.message);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google sign in. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F8F8]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#BFEDEE]/50 text-[#00A8AD] mb-1">
            <LogIn className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#00A8AD]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prime X-Press Account</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
            Sign In to Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your credentials to access your booking records and services.
          </p>
        </div>

        {/* Currently signed in notification if already authenticated */}
        {user && (
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-left space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Currently Signed In
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
            <p className="text-sm font-extrabold text-[#063F4D] truncate">
              {user.displayName || 'Consumer'} ({user.email})
            </p>
            <p className="text-xs text-slate-600">
              You are already logged in. Your profile is active in the top navigation bar.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2 px-3 rounded-xl bg-[#00A8AD] text-white font-bold text-xs hover:bg-[#063F4D] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Return to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Continue with Google Button */}
        <div>
          <button
            id="signin-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#063F4D] font-bold text-sm shadow-xs hover:shadow transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5"
          >
            {googleLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#00A8AD] border-t-transparent rounded-full animate-spin"></span>
                <span>Connecting to Google...</span>
              </span>
            ) : (
              <>
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-[#4285F4]">
                  G
                </span>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200"></div>
          <span className="bg-white px-3 text-xs text-slate-400 uppercase font-bold tracking-wider absolute">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSignIn} className="space-y-4" noValidate>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A8AD] focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#063F4D]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A8AD] focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="signin-submit-btn"
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Signing in...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </span>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div
              id="signin-error-message"
              className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}
        </form>

        {/* Footer / Switch to Sign Up */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              id="signin-to-signup-link"
              className="font-bold text-[#00A8AD] hover:text-[#063F4D] hover:underline"
            >
              Sign Up here
            </Link>
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
            >
              <span>← Return to Home</span>
            </Link>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Connected: <strong className="font-mono text-slate-800">{SUPABASE_PROJECT_ID}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#00A8AD] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Supabase Auth Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
