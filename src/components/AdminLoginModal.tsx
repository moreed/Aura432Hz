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
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  AUTHORIZED_ADMIN_EMAIL,
  DEFAULT_RECOVERY_CODES,
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
  const [curatorEmail, setCuratorEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Lock body scroll and set initial state when opened
  useEffect(() => {
    if (isOpen) {
      setCuratorEmail(AUTHORIZED_ADMIN_EMAIL);
      setPassword('');
      setTwoFactorCode('');
      setError(null);

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFillBackupCode = () => {
    setTwoFactorCode(DEFAULT_RECOVERY_CODES[0]); // AUR-432-888
    setError(null);
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

    if (!twoFactorCode.trim()) {
      setError('Please enter your 6-digit Authenticator code or an Emergency Recovery Code.');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyAdminLogin(
        emailTrimmed,
        password,
        twoFactorCode
      );

      if (!result.success || !result.session) {
        setError(result.error || 'Admin verification failed.');
        setLoading(false);
        return;
      }

      // Create verified admin profile
      const adminProfile: UserProfile = {
        uid: auth.currentUser?.uid || 'admin_sanctuary_master',
        email: emailTrimmed.toLowerCase(),
        displayName: 'Sanctuary Lead',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin-sanctuary',
        role: 'admin',
        status: 'active',
        totalVisits: 1,
        totalDurationSeconds: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      onSuccess(adminProfile);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl sm:rounded-3xl w-full max-w-md p-4 sm:p-6 landscape:p-4 shadow-2xl space-y-4 sm:space-y-5 relative overflow-y-auto overscroll-contain text-slate-100 max-h-[92dvh] landscape:max-h-[94dvh] my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FlatLogo size={44} showText={false} />
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-1.5">
                <span>Sanctuary Portal Login</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
                  2FA Protected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Restricted Sanctuary Curator &amp; Administrator Access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 inline-flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Curator Identity Email field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="curator_email_input" className="text-xs font-medium text-slate-300">
                Curator Identity
              </label>
              <button
                type="button"
                onClick={() => setCuratorEmail(AUTHORIZED_ADMIN_EMAIL)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline cursor-pointer"
              >
                Auto-fill Authorized Admin
              </button>
            </div>
            <div className="relative">
              <input
                id="curator_email_input"
                type="email"
                required
                value={curatorEmail}
                onChange={(e) => setCuratorEmail(e.target.value)}
                placeholder="moreed.raouf@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-400 transition-colors font-mono cursor-text"
              />
            </div>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication (2FA) Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="curator_2fa_input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Authenticator / 2FA Code</span>
              </label>
              <button
                type="button"
                onClick={handleFillBackupCode}
                className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer font-medium"
                title="Fill emergency recovery code"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Use Recovery Code</span>
              </button>
            </div>

            <div>
              <input
                id="curator_2fa_input"
                type="text"
                required
                maxLength={16}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="6-digit TOTP or AUR-432-888"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono tracking-widest focus:outline-none focus:border-indigo-400 transition-colors text-center uppercase"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Rotating 6-digit code or emergency backup code</span>
              <span className="font-mono text-indigo-400">e.g. AUR-432-888</span>
            </div>
          </div>

          {/* Submit Action */}
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
            <span>{loading ? 'Verifying 2FA Security...' : 'Unlock Sanctuary Console'}</span>
          </button>
        </form>

        <div className="text-[10px] text-slate-400 text-center leading-relaxed">
          High-Security Protocol &bull; Restricted to Authorized Curators &bull; Multi-Layer Hashing &amp; 2FA
        </div>
      </div>
    </div>
  );
};
