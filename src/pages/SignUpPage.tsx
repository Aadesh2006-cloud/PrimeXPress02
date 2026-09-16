import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, User, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SUPABASE_PROJECT_ID } from '../supabaseClient.js';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerWithEmail, loginWithGoogle, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validateCredentials = (): boolean => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setError('Please enter your full name.');
      return false;
    }
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
      setError('Please create a password.');
      return false;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateCredentials()) {
      return;
    }

    setLoading(true);

    try {
      const trimmedName = fullName.trim();
      const result = await registerWithEmail(email.trim(), password, trimmedName);
      if (result.success && result.requiresEmailConfirmation) {
        setPassword('');
        setError('Check your inbox to confirm your email address, then sign in.');
      } else if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Failed to create account. Please check your details.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null); setGoogleLoading(true);
    try { await loginWithGoogle(); }
    catch { setError('Unable to start Google sign in. Please try again.'); }
    finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F8F8]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#BFEDEE]/50 text-[#00A8AD] mb-1">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#00A8AD]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
            Sign Up for Prime X-Press
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create your account to book and manage residential or commercial cleanings.
          </p>
        </div>

        {/* Continue with Google Button */}
        <div className="pt-2">
          <button
            id="signup-google-btn"
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

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4" noValidate>
          <div className="space-y-3.5">
            {/* Consumer Name Field */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-1.5"
              >
                Consumer Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="signup-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  spellCheck={false}
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A8AD] focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
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
                  htmlFor="signup-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#063F4D]"
                >
                  Password
                </label>
                <span className={`text-[11px] font-medium transition-colors ${password.length >= 12 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {password.length >= 12 ? '✓ 12+ characters' : 'Min. 12 characters'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="At least 12 characters"
                  minLength={12}
                  maxLength={128}
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
            id="signup-submit-btn"
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating account...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </span>
            )}
          </button>

          {/* Simple Error Handling: Small error message under the form */}
          {error && (
            <div
              id="signup-error-message"
              className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}
        </form>

        {/* Footer / Switch to Sign In */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/signin"
              id="signup-to-signin-link"
              className="font-bold text-[#00A8AD] hover:text-[#063F4D] hover:underline"
            >
              Sign In here
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

export default SignUpPage;
