import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import {
  AUTHORIZED_ADMIN_EMAIL,
  AdminAuthStatusResponse,
  AdminSetupResult,
  fetchAdminAuthStatus,
  setupAdminAccount,
  verifyAdminLogin,
} from '../services/adminAuth';
import { UserProfile, auth } from '../services/firebase';
import { FlatLogo } from './FlatLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminProfile: UserProfile) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [authStatus, setAuthStatus] = useState<AdminAuthStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [curatorEmail, setCuratorEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2FAOnSetup, setEnable2FAOnSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // One-time setup completion view (shows freshly generated recovery codes & TOTP secret once)
  const [setupCompleteData, setSetupCompleteData] = useState<{
    profile: UserProfile;
    result: AdminSetupResult;
  } | null>(null);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setCuratorEmail(AUTHORIZED_ADMIN_EMAIL);
    setPassword('');
    setConfirmPassword('');
    setEnable2FAOnSetup(false);
    setTwoFactorCode('');
    setError(null);
    setSetupCompleteData(null);
    setCopiedBackup(false);
    setStatusLoading(true);

    fetchAdminAuthStatus()
      .then((status) => {
        if (!cancelled) {
          setAuthStatus(status);
          if (status.adminEmail) setCuratorEmail(status.adminEmail);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Unable to verify server authentication status.');
        }
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelled = true;
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const buildAdminProfile = (email: string): UserProfile => ({
    uid: auth.currentUser?.uid || 'admin_sanctuary_master',
    email: email.toLowerCase(),
    displayName: 'Sanctuary Lead',
    photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin-sanctuary',
    role: 'admin',
    status: 'active',
    totalVisits: 1,
    totalDurationSeconds: 0,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  });

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = curatorEmail.trim();
    if (!emailTrimmed) {
      setError('Please enter your curator email.');
      return;
    }
    if (password.trim().length < 8) {
      setError('Choose a master password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await setupAdminAccount(emailTrimmed, password, enable2FAOnSetup);
      if (!result.success || !result.session) {
        setError(result.error || 'Could not complete admin setup.');
        return;
      }

      const profile = buildAdminProfile(result.session.email);
      setSetupCompleteData({ profile, result });
    } catch (err: any) {
      setError(err?.message || 'Setup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = curatorEmail.trim();
    if (!emailTrimmed) {
      setError('Please enter your curator email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your master password.');
      return;
    }
    if (authStatus?.require2FA && !twoFactorCode.trim()) {
      setError('Please enter your 6-digit Authenticator code or an unused recovery code.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyAdminLogin(emailTrimmed, password, twoFactorCode);
      if (!result.success || !result.session) {
        setError(result.error || 'Administrator verification failed.');
        return;
      }

      const adminProfile = buildAdminProfile(result.session.email);
      onSuccess(adminProfile);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRecoveryBundle = () => {
    if (!setupCompleteData?.result) return;
    const { totpSecret, recoveryCodes } = setupCompleteData.result;
    const bundle = [
      'Aura 432Hz Sanctuary — Admin Recovery Backup',
      totpSecret ? `2FA Secret (Base32): ${totpSecret}` : '',
      recoveryCodes?.length ? `One-Time Recovery Codes:\n${recoveryCodes.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    navigator.clipboard.writeText(bundle);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  const handleFinishSetup = () => {
    if (!setupCompleteData) return;
    onSuccess(setupCompleteData.profile);
    onClose();
  };

  const isSetupMode = authStatus?.mode === 'setup' && !authStatus.configured;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading && !setupCompleteData) onClose();
      }}
    >
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl sm:rounded-3xl w-full max-w-md p-4 sm:p-6 landscape:p-4 shadow-2xl space-y-4 sm:space-y-5 relative overflow-y-auto overscroll-contain text-slate-100 max-h-[92dvh] landscape:max-h-[94dvh] my-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FlatLogo size={44} showText={false} />
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-1.5">
                <span>
                  {setupCompleteData
                    ? 'Save Recovery Credentials'
                    : isSetupMode
                    ? 'Set Up Admin Access'
                    : 'Sanctuary Portal Login'}
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
                  {isSetupMode ? 'First-Run Setup' : 'Server Verified'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {setupCompleteData
                  ? 'Store these credentials offline before continuing'
                  : isSetupMode
                  ? 'Create a server-hashed master password for this sanctuary'
                  : 'Restricted Sanctuary Curator & Administrator Access'}
              </p>
            </div>
          </div>
          {!setupCompleteData && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 inline-flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {statusLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
            <span>Checking server security state...</span>
          </div>
        ) : setupCompleteData ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Master password hashed and stored on the server. Save your unique 2FA secret and one-time recovery codes now — recovery codes are not shown again.
              </span>
            </div>

            {setupCompleteData.result.totpSecret && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-300 block">
                  Authenticator Secret (Base32)
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 break-all">
                  {setupCompleteData.result.totpSecret}
                </div>
              </div>
            )}

            {setupCompleteData.result.recoveryCodes && setupCompleteData.result.recoveryCodes.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-300">
                    One-Time Emergency Recovery Codes
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRecoveryBundle}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 cursor-pointer"
                  >
                    {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBackup ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {setupCompleteData.result.recoveryCodes.map((code) => (
                    <div
                      key={code}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300 text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleFinishSetup}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Continue to Sanctuary Console</span>
            </button>
          </div>
        ) : isSetupMode ? (
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 leading-relaxed">
              No administrator password has been claimed on this server yet. Set your master password once below to lock down admin controls.
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setup_email_input" className="text-xs font-medium text-slate-300">
                Curator Identity
              </label>
              <input
                id="setup_email_input"
                type="email"
                required
                value={curatorEmail}
                onChange={(e) => setCuratorEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-400 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setup_password_input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Create Master Password</span>
              </label>
              <div className="relative">
                <input
                  id="setup_password_input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-400 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setup_confirm_password" className="text-xs font-medium text-slate-300">
                Confirm Master Password
              </label>
              <input
                id="setup_confirm_password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter master password"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enable2FAOnSetup}
                onChange={(e) => setEnable2FAOnSetup(e.target.checked)}
                className="mt-0.5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-300 leading-relaxed">
                Require 2FA Authenticator code on future sign-ins (you can also enable or disable this anytime in the Security tab).
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{loading ? 'Securing Admin Vault...' : 'Claim & Lock Admin Access'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Curator Identity Email field */}
            <div className="space-y-1.5">
              <label htmlFor="curator_email_input" className="text-xs font-medium text-slate-300">
                Curator Identity
              </label>
              <input
                id="curator_email_input"
                type="email"
                required
                value={curatorEmail}
                onChange={(e) => setCuratorEmail(e.target.value)}
                placeholder="Enter authorized curator email"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-400 transition-colors font-mono cursor-text"
              />
            </div>

            {/* Master Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="curator_password_input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Master Password</span>
              </label>
              <div className="relative">
                <input
                  id="curator_password_input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-400 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication (2FA) Input (only shown when enabled on server) */}
            {authStatus?.require2FA && (
              <div className="space-y-1.5">
                <label htmlFor="curator_2fa_input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Authenticator / Recovery Code</span>
                </label>
                <input
                  id="curator_2fa_input"
                  type="text"
                  required
                  maxLength={20}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="6-digit TOTP or backup code"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono tracking-widest focus:outline-none focus:border-indigo-400 transition-colors text-center uppercase"
                />
                <p className="text-[10px] text-slate-400">
                  Enter the rotating 6-digit code from your authenticator app or an unused one-time recovery code.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{loading ? 'Verifying Credentials...' : 'Unlock Sanctuary Console'}</span>
            </button>
          </form>
        )}

        <div className="text-[10px] text-slate-400 text-center leading-relaxed">
          Server-Verified Access &bull; In-Memory Session Token &bull; Salted Scrypt Protection
        </div>
      </div>
    </div>
  );
};
