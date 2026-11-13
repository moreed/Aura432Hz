import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Calendar,
  Users,
  Download,
  Eye,
  RefreshCw,
  Plus,
  Headphones,
  ShoppingBag,
  BookOpen,
  Check,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react';
import {
  MonthlyNewsletter,
  WelcomeEmailRecord,
  NewsletterSubscriber,
  fetchMonthlyNewsletters,
  fetchWelcomeEmails,
  fetchNewsletterSubscribers,
  saveMonthlyNewsletter,
  broadcastMonthlyNewsletter,
  sendWelcomeEmail,
  subscribeToNewsletter,
} from '../services/emailService';
import { UserProfile } from '../services/firebase';

interface NewsletterAdminSectionProps {
  currentUser: UserProfile | null;
}

export const NewsletterAdminSection: React.FC<NewsletterAdminSectionProps> = ({
  currentUser,
}) => {
  const [activeSection, setActiveSection] = useState<'newsletters' | 'welcome_emails' | 'subscribers'>('newsletters');
  const [newsletters, setNewsletters] = useState<MonthlyNewsletter[]>([]);
  const [welcomeEmails, setWelcomeEmails] = useState<WelcomeEmailRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Preview modals
  const [previewingNewsletter, setPreviewingNewsletter] = useState<MonthlyNewsletter | null>(null);
  const [previewingWelcomeEmail, setPreviewingWelcomeEmail] = useState<WelcomeEmailRecord | null>(null);

  // Test email modal
  const [testEmailAddress, setTestEmailAddress] = useState(currentUser?.email || '');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nlList, weList, subList] = await Promise.all([
        fetchMonthlyNewsletters(),
        fetchWelcomeEmails(),
        fetchNewsletterSubscribers(),
      ]);
      setNewsletters(nlList);
      setWelcomeEmails(weList);
      setSubscribers(subList);
    } catch (e) {
      console.warn('Error loading email data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBroadcastNewsletter = async (newsletterId: string) => {
    const res = await broadcastMonthlyNewsletter(newsletterId);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      loadData();
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSendTestWelcomeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim()) return;
    setIsSendingTest(true);
    try {
      const mockUser: UserProfile = {
        uid: `test_${Date.now()}`,
        email: testEmailAddress.trim(),
        displayName: testEmailAddress.split('@')[0],
        photoURL: '',
        role: 'user',
        status: 'active',
        totalVisits: 1,
        totalDurationSeconds: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      const record = await sendWelcomeEmail(mockUser);
      setPreviewingWelcomeEmail(record);
      setStatusMessage({
        text: `Test Welcome Email generated and sent to ${testEmailAddress}!`,
        type: 'success',
      });
      loadData();
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to send test email', type: 'error' });
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleExportSubscribersCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Name', 'Status', 'SubscribedAt', 'Source'];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.name || ''}"`,
      s.status,
      s.subscribedAt,
      s.source,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aura432_newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & KPI Row */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Mail className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-100">
              Sanctuary Welcome Emails &amp; Monthly Newsletters System
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Automated onboarding emails trigger automatically for all newly registered users. Curate, preview, and broadcast the monthly bulletin packed with new updates, presets, products, and articles.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="min-h-[36px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Welcome Emails Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{welcomeEmails.length}</div>
          <p className="text-[11px] text-emerald-400">100% automated for new sign-ups</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Bulletin Editions</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{newsletters.length}</div>
          <p className="text-[11px] text-sky-400">Updates, Presets, Products &amp; Articles</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Newsletter Subscribers</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{subscribers.length}</div>
          <p className="text-[11px] text-purple-400">Active email broadcast audience</p>
        </div>
      </div>

      {/* Sub-Tabs: Newsletters | Welcome Emails | Subscribers (Wrapping Flex - No Horizontal Scroll) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection('newsletters')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'newsletters'
              ? 'bg-sky-500/20 text-sky-200 border-sky-400/50 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Monthly Newsletters ({newsletters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('welcome_emails')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'welcome_emails'
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Delivered Welcome Emails ({welcomeEmails.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('subscribers')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'subscribers'
              ? 'bg-purple-500/20 text-purple-200 border-purple-400/50 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Subscribers Directory ({subscribers.length})</span>
        </button>
      </div>

      {/* SECTION 1: MONTHLY NEWSLETTERS */}
      {activeSection === 'newsletters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sanctuary Monthly Bulletin Editions
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-packaged with latest presets, products &amp; studies
            </span>
          </div>

          <div className="space-y-3">
            {newsletters.map((nl) => (
              <div
                key={nl.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{nl.editionTitle}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                          nl.status === 'sent'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {nl.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{nl.subject}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewingNewsletter(nl)}
                      className="min-h-[34px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastNewsletter(nl.id)}
                      className="min-h-[34px] px-3.5 py-1.5 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast to {subscribers.length} Members</span>
                    </button>
                  </div>
                </div>

                {/* Content Breakdown Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>{nl.newUpdates.length} Platform Updates</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{nl.featuredPresets.length} Curated Presets</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{nl.featuredProducts.length} Shop Tools</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{nl.featuredArticles.length} Wisdom Studies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: WELCOME EMAILS */}
      {activeSection === 'welcome_emails' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Automated Welcome Emails Log
              </h4>
              <p className="text-[11px] text-slate-400">
                Dispatches immediately on registration with personal greeting, listening tips, and unlocked privileges.
              </p>
            </div>

            {/* Test Send Form */}
            <form onSubmit={handleSendTestWelcomeEmail} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Test email address..."
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 w-48"
              />
              <button
                type="submit"
                disabled={isSendingTest || !testEmailAddress.trim()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
              </button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Dispatched At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {welcomeEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-medium text-slate-100">
                      <div>{email.recipientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{email.recipientEmail}</div>
                    </td>
                    <td className="p-3 text-slate-300 truncate max-w-xs">{email.subject}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {email.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(email.sentAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewingWelcomeEmail(email)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: SUBSCRIBERS DIRECTORY */}
      {activeSection === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Newsletter Subscribers Directory
              </h4>
              <p className="text-[11px] text-slate-400">
                Active audience receiving the monthly updates, presets, and articles.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportSubscribersCSV}
              className="min-h-[34px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Email</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-mono text-slate-100">{sub.email}</td>
                    <td className="p-3 text-slate-300">{sub.name || '—'}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          sub.status === 'subscribed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 capitalize">{sub.source}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Newsletter Modal */}
      {previewingNewsletter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl sm:rounded-3xl p-4 sm:p-6 landscape:p-4 shadow-2xl max-h-[92dvh] landscape:max-h-[94dvh] overflow-y-auto overscroll-contain space-y-3.5 sm:space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 font-mono">
                  {previewingNewsletter.editionMonth} {previewingNewsletter.year} Bulletin Preview
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  {previewingNewsletter.headline}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingNewsletter(null)}
                className="w-8 h-8 inline-flex items-center justify-center text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 cursor-pointer"
                aria-label="Close newsletter preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 italic p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              &quot;{previewingNewsletter.introMessage}&quot;
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-300 uppercase">Updates Included:</span>
              <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                {previewingNewsletter.newUpdates.map((u, i) => (
                  <li key={i}>
                    <strong>{u.title}:</strong> {u.description}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-300 uppercase">Featured Presets:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {previewingNewsletter.featuredPresets.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="font-semibold text-slate-100">{p.name} ({p.freq}Hz)</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewingNewsletter(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Welcome Email Modal */}
      {previewingWelcomeEmail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
        >
          <div className="w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl sm:rounded-3xl p-4 sm:p-6 landscape:p-4 shadow-2xl max-h-[92dvh] landscape:max-h-[94dvh] overflow-y-auto overscroll-contain space-y-3.5 sm:space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">
                  Welcome Email Template Preview
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  {previewingWelcomeEmail.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingWelcomeEmail(null)}
                className="w-8 h-8 inline-flex items-center justify-center text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 cursor-pointer"
                aria-label="Close welcome email preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
              {previewingWelcomeEmail.textContent}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewingWelcomeEmail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
