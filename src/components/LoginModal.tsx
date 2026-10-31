import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Zap,
  Lock,
  Check,
  User,
  Mail,
  Clock,
  Download,
  AlertTriangle,
  Copy,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { FlatLogo } from './FlatLogo';
import {
  UserProfile,
  signInWithGoogleOneClick,
  signInAsGuestOneClick,
  signInAsRegisteredMember,
  logOut,
} from '../services/firebase';
import { isAuthorizedAdminEmail, AUTHORIZED_ADMIN_EMAIL } from '../services/adminAuth';
import { AdminLoginModal } from './AdminLoginModal';
import {
  getLocalUserWavQuota,
  fetchUserWavQuota,
  LIFETIME_MAX_MINUTES,
  LIFETIME_MAX_TRACKS,
  GUEST_MAX_MINUTES,
  GUEST_MAX_TRACKS,
  isGuestUser,
  UserWavQuota,
} from '../services/quotaService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onOpenAdmin?: () => void;
  onOpenWelcomeLetter?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onOpenAdmin,
  onOpenWelcomeLetter,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [userQuota, setUserQuota] = useState<UserWavQuota | null>(null);

  // Active sub-tab in Login Modal
  const [activeTab, setActiveTab] = useState<'options' | 'email'>('options');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');

  // Lock body scroll while modal is active to prevent background bleed and scroll trapping
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Sync quota for logged in user or guest
  useEffect(() => {
    if (currentUser?.uid && !isGuestUser(currentUser)) {
      setUserQuota(getLocalUserWavQuota(currentUser.uid));
      fetchUserWavQuota(currentUser.uid).then((q) => setUserQuota(q));
    } else {
      setUserQuota(getLocalUserWavQuota('guest'));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const handleCopyDomain = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setUnauthorizedDomain(null);
    try {
      const user = await signInWithGoogleOneClick();
      onUserChange(user);
      onClose();
      if (user.totalVisits <= 1 && onOpenWelcomeLetter) {
        onOpenWelcomeLetter();
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      if (
        err?.code === 'auth/unauthorized-domain' ||
        (err?.message && err.message.includes('unauthorized-domain'))
      ) {
        setUnauthorizedDomain(err?.hostname || currentHostname);
        setError(
          `Domain authorization required: "${err?.hostname || currentHostname}" is not yet listed in Firebase Console's Authorized Domains.`
        );
      } else if (
        err?.code === 'auth/popup-blocked' ||
        (err?.message && err.message.includes('popup-blocked'))
      ) {
        setError(
          'Google Sign-In popup was blocked by your browser settings. You can allow popups, or use our instant email login below.'
        );
        setActiveTab('email');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled (popup was closed).');
      } else {
        setError(err?.message || 'Google Sign-In failed. Please try email login or guest mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisteredLogin = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInAsRegisteredMember(customEmail, customName);
      onUserChange(user);
      onClose();
      if (user.totalVisits <= 1 && onOpenWelcomeLetter) {
        onOpenWelcomeLetter();
      }
    } catch (err: any) {
      console.error('Registered login error:', err);
      setError(err?.message || 'Failed to establish registered member session.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInAsGuestOneClick('user');
      onUserChange(user);
      onClose();
      if (user.totalVisits <= 1 && onOpenWelcomeLetter) {
        onOpenWelcomeLetter();
      }
    } catch (err: any) {
      console.error('Guest login error:', err);
      setError(err?.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logOut();
      onUserChange(null);
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-md p-4 sm:p-6 landscape:p-4 shadow-2xl relative overflow-hidden max-h-[92dvh] landscape:max-h-[94dvh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <FlatLogo size={44} showText={false} />
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {currentUser ? 'Sanctuary Member Profile' : 'Sanctuary Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser
                  ? 'Active session & permissions'
                  : 'Free listening requires no login. Create a member account to claim 50m of offline WAV exports.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1 mt-3 space-y-4 pr-1">
          {/* SPECIAL RESOLUTION CARD: FIREBASE UNAUTHORIZED DOMAIN */}
          {unauthorizedDomain && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-2xl text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2 text-amber-300 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>Google Sign-In: Unauthorized Domain</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed text-[11px]">
                Firebase Google Sign-In requires this domain to be whitelisted in the Firebase Console:
              </p>
              <div className="p-2 bg-slate-950/80 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 font-mono text-[11px] text-amber-100">
                <span className="truncate">{unauthorizedDomain}</span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-sans font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="Copy domain to clipboard"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Copied' : 'Copy Domain'}</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-300/80">
                Fix in Firebase Console: <strong>Authentication → Settings → Authorized domains → Add domain</strong>.
              </p>

              {/* Seamless Instant Alternative */}
              <div className="pt-1.5 space-y-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => handleRegisteredLogin()}
                  disabled={loading}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Instant 1-Click Access (Unlock 50m WAV Quota)</span>
                </button>
              </div>
            </div>
          )}

          {error && !unauthorizedDomain && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {currentUser ? (
            /* ALREADY LOGGED IN VIEW */
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3">
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                  alt={currentUser.displayName}
                  className="w-12 h-12 rounded-full border border-sky-400/40 object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-100 text-sm truncate">{currentUser.displayName}</h4>
                  <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                        currentUser.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : isGuestUser(currentUser)
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Sanctuary Lead' : isGuestUser(currentUser) ? 'Guest' : 'Member'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {currentUser.totalVisits} visit{currentUser.totalVisits === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offline WAV Quota Status */}
              {currentUser.role === 'admin' ? (
                <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-purple-200">
                  <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>
                    <strong>Sanctuary Admin:</strong> Unlimited studio offline WAV export quota active.
                  </span>
                </div>
              ) : !isGuestUser(currentUser) && userQuota ? (
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>Lifetime Offline WAV Meter:</span>
                    </span>
                    <span className="font-mono font-bold">
                      <span className={userQuota.remainingMinutes > 15 ? 'text-emerald-400' : 'text-amber-400'}>
                        {userQuota.remainingMinutes.toFixed(1)}
                      </span>
                      <span className="text-slate-400 font-normal"> / {LIFETIME_MAX_MINUTES} mins left</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-300"
                      style={{
                        width: `${Math.max(4, (userQuota.remainingMinutes / LIFETIME_MAX_MINUTES) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>
                      Tracks: <strong className="text-sky-300 font-mono">{userQuota.remainingTracks} of {LIFETIME_MAX_TRACKS} remaining</strong>
                    </span>
                    <span>Max 9.5m / track</span>
                  </div>
                </div>
              ) : isGuestUser(currentUser) ? (
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-aurora-teal" />
                      <span>Guest Session (10m Free Trial):</span>
                    </span>
                    <span className="font-mono font-bold text-aurora-teal">
                      {userQuota ? `${userQuota.remainingMinutes.toFixed(1)} / ${GUEST_MAX_MINUTES}m left` : '10m Trial'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    You have <strong className="text-white">{userQuota ? userQuota.remainingTracks : 2} free offline tracks</strong> available in guest mode. Upgrade to a registered member account anytime for 50 minutes &amp; 5 tracks!
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRegisteredLogin()}
                    className="w-full py-2 px-3 rounded-xl bg-aurora-teal/20 hover:bg-aurora-teal/30 text-aurora-teal text-xs font-semibold border border-aurora-teal/40 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-aurora-teal" />
                    <span>Upgrade to Free Member (Unlock 50m Pool)</span>
                  </button>
                </div>
              ) : null}

              {currentUser.role === 'admin' && onOpenAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Admin Control Panel</span>
                </button>
              )}

              {currentUser.role !== 'admin' && isAuthorizedAdminEmail(currentUser.email) && (
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 font-medium text-xs border border-indigo-800/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Verify Admin 2FA (Moreed)</span>
                </button>
              )}

              {onOpenWelcomeLetter && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWelcomeLetter();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 font-medium text-xs border border-sky-800/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>View Sanctuary Welcome Letter</span>
                </button>
              )}

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* LOGIN & REGISTRATION OPTIONS */
            <div className="space-y-3">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('options')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'options'
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Quick Sign-In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('email')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Email Account
                </button>
              </div>

              {activeTab === 'options' ? (
                <>
                  {/* 1. Google 1-Click Button */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google (1-Click)</span>
                  </button>

                  {/* 2. Instant Registered Member (Free Account with Quota Enabled) */}
                  <div className="border border-slate-800 bg-slate-950/60 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>Instant Sanctuary Member</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-medium">50m WAV Quota</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Instant 1-click member profile. Unlock 50m of offline downloads without needing a password.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleRegisteredLogin()}
                      disabled={loading}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-200 border border-sky-400/40 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Create / Resume 1-Click Member</span>
                    </button>
                  </div>

                  {/* 3. Instant Fast Guest Login */}
                  <button
                    onClick={() => handleGuestLogin()}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 font-medium text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant Guest Listening (10m Free Offline Trial)</span>
                  </button>
                </>
              ) : (
                /* EMAIL LOGIN FORM */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegisteredLogin(memberEmail, memberName);
                  }}
                  className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl animate-in fade-in"
                >
                  <div className="space-y-1">
                    <label htmlFor="member_name_input" className="text-xs font-medium text-slate-300">
                      Your Name
                    </label>
                    <input
                      id="member_name_input"
                      type="text"
                      placeholder="e.g., Sarah Jenkins"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="member_email_input" className="text-xs font-medium text-slate-300">
                      Your Email Address
                    </label>
                    <input
                      id="member_email_input"
                      type="email"
                      required
                      placeholder="e.g., moreed.raouf@gmail.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                    />
                  </div>

                  {memberEmail.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() && (
                    <div className="p-2 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-[11px] text-indigo-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Sanctuary Lead email detected. 2FA verification available.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={loading || !memberEmail.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-450 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogIn className="w-3.5 h-3.5" />
                      )}
                      <span>Sign In with Email (50m Quota)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('options')}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              {/* Sanctuary Owner Portal (Restricted to Moreed with 2FA) */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-indigo-950/50 text-slate-300 hover:text-indigo-200 font-medium text-xs border border-indigo-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sanctuary Admin Console (Moreed)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                Data syncs with Firebase Firestore. Registered members receive 50 minutes of lifetime offline WAV exports.
              </p>
            </div>
          )}
        </div>

        {/* 2FA Protected Admin Login Modal */}
        <AdminLoginModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          onSuccess={(adminProfile) => {
            onUserChange(adminProfile);
            setShowAdminModal(false);
            onClose();
            if (onOpenAdmin) onOpenAdmin();
          }}
        />
      </div>
    </div>
  );
};
