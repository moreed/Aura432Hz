import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Headphones,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Volume2,
  Radio,
  Bot,
  Zap,
} from 'lucide-react';
import {
  sendContactMessage,
  ContactMessage,
  sendChatMessage,
  subscribeToChatMessages,
  ChatMessage,
  UserProfile,
} from '../services/firebase';
import { MixPreset, BUILT_IN_MIX_PRESETS } from '../services/storage';

interface ContactSectionProps {
  currentUser: UserProfile | null;
  onApplyPreset?: (preset: MixPreset) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ currentUser, onApplyPreset }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'message'>('chat');

  // Send Message State
  const [name, setName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('sound_therapy');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatText, setNewChatText] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isConciergeTyping, setIsConciergeTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Active channel ID for the session
  const [channelId] = useState<string>(() => {
    return currentUser?.uid || `guest_session_${Date.now().toString(36)}`;
  });

  // FAQs state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Subscribe to live chat messages
  useEffect(() => {
    const initialWelcome: ChatMessage = {
      id: 'welcome_1',
      channelId,
      senderId: 'concierge_aura',
      senderName: 'Aura Sanctuary Concierge',
      senderRole: 'concierge',
      text: 'Namaste! Welcome to Aura 432Hz Sanctuary. I am your sound therapy guide. Tell me how you are feeling right now—or ask for a tailored frequency recommendation for sleep, anxiety, or deep focus.',
      timestamp: new Date().toISOString(),
      suggestedPresetId: 'zen_sanctuary',
    };

    setChatMessages([initialWelcome]);

    const unsubscribe = subscribeToChatMessages(channelId, (remoteMessages) => {
      if (remoteMessages && remoteMessages.length > 0) {
        setChatMessages((prev) => {
          // Merge unique messages
          const existingIds = new Set(prev.map((m) => m.id));
          const toAdd = remoteMessages.filter((m) => m.id && !existingIds.has(m.id));
          return [...prev, ...toAdd];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [channelId]);

  // Ref for chat container
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // Scroll only the internal chat container when messages update, avoiding window scrolling
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatMessages, isConciergeTyping]);

  const handleSendMessageForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await sendContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      category,
      message: message.trim(),
      userId: currentUser?.uid,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmissionSuccess(result.id || `TICKET-${Math.floor(100000 + Math.random() * 900000)}`);
      setSubject('');
      setMessage('');
    } else {
      setErrorMessage(result.error || 'Unable to send message. Please try again or use live chat.');
    }
  };

  const handleSendChatMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || newChatText).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      channelId,
      senderId: currentUser?.uid || 'guest',
      senderName: currentUser?.displayName || name.trim() || 'Mindful Visitor',
      senderRole: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setNewChatText('');
    setIsSendingChat(true);

    // Save to Firestore
    await sendChatMessage({
      channelId,
      senderId: userMsg.senderId,
      senderName: userMsg.senderName,
      senderRole: 'user',
      text: userMsg.text,
    });

    setIsSendingChat(false);

    // Trigger intelligent automated sound therapy concierge response
    generateConciergeResponse(textToSend);
  };

  const generateConciergeResponse = (userQuery: string) => {
    setIsConciergeTyping(true);

    const queryLower = userQuery.toLowerCase();
    let replyText = 'Thank you for sharing. For overall nervous system harmonization, our 432Hz Zen Sanctuary with Tibetan singing bowls stimulates deep parasympathetic rest.';
    let presetId = 'zen_sanctuary';

    if (queryLower.includes('sleep') || queryLower.includes('insomnia') || queryLower.includes('tired') || queryLower.includes('night')) {
      replyText = 'For deep sleep and nocturnal rejuvenation, I strongly recommend our 3.5Hz Delta Wave protocol. It calms high-frequency cortical chatter and pairs seamlessly with warm night crickets.';
      presetId = 'midnight_slumber';
    } else if (queryLower.includes('anxiety') || queryLower.includes('stress') || queryLower.includes('panic') || queryLower.includes('heart') || queryLower.includes('overwhelm')) {
      replyText = 'To unwind emotional tension, our 528Hz Harmonic Soundscape or 639Hz Heart Harmony tone combined with slow 4-7-8 breathing will gently support nervous system relaxation and mindful calm.';
      presetId = 'solfeggio_528_dna';
    } else if (queryLower.includes('pain') || queryLower.includes('headache') || queryLower.includes('back') || queryLower.includes('body') || queryLower.includes('joint')) {
      replyText = 'For somatic relaxation and evening grounding, 174Hz provides a warm, low harmonic foundation. Listen at low, comfortable volumes for a restful and peaceful ambient environment.';
      presetId = 'sleep_174_somatic';
    } else if (queryLower.includes('focus') || queryLower.includes('work') || queryLower.includes('study') || queryLower.includes('adhd') || queryLower.includes('read')) {
      replyText = 'For calm flow and cognitive stamina, 432Hz Mountain Brook Focus pairs 8.5Hz low-alpha entrainment with trickling water and velvet brown noise to mask distracting ambient room noise.';
      presetId = 'river_flow_focus';
    } else if (queryLower.includes('meditation') || queryLower.includes('theta') || queryLower.includes('temple') || queryLower.includes('zen')) {
      replyText = 'For transcendental still meditation, our 6Hz Theta Sacred Monastery blend utilizes authentic Indian Tanpura overtones and deep Tibetan singing bowls.';
      presetId = 'himalayan_monastery';
    }

    setTimeout(async () => {
      const conciergeReply: ChatMessage = {
        id: `bot_${Date.now()}`,
        channelId,
        senderId: 'concierge_aura',
        senderName: 'Aura Sanctuary Concierge',
        senderRole: 'concierge',
        text: replyText,
        timestamp: new Date().toISOString(),
        suggestedPresetId: presetId,
      };

      setChatMessages((prev) => [...prev, conciergeReply]);
      setIsConciergeTyping(false);

      await sendChatMessage({
        channelId,
        senderId: 'concierge_aura',
        senderName: 'Aura Sanctuary Concierge',
        senderRole: 'concierge',
        text: replyText,
        suggestedPresetId: presetId,
      });
    }, 1200);
  };

  const handlePlayRecommendedPreset = (presetId: string) => {
    const preset = BUILT_IN_MIX_PRESETS.find((p) => p.id === presetId);
    if (preset && onApplyPreset) {
      onApplyPreset(preset);
    }
  };

  const faqs = [
    {
      q: 'Do I need headphones to experience 432Hz & brainwave entrainment?',
      a: 'Stereo headphones are strongly recommended for binaural beat entrainment (since each ear receives a slightly offset frequency). However, our engine also includes built-in isochronic amplitude pulsation that works effectively over room speakers!',
    },
    {
      q: 'What is Volume Normalization (EBU R128) and should I keep it on?',
      a: 'Volume Normalization automatically scales the master bus headroom as you add or remove nature sounds. It ensures smooth transitions between presets without sudden loud spikes or digital clipping. We recommend keeping it enabled.',
    },
    {
      q: 'Can I export soundscapes for offline flights or bedtime without Wi-Fi?',
      a: 'Yes! Click the "Offline Audio Export" button in the navigation header to download high-fidelity 432Hz ambient WAV files directly to your device storage for 100% offline playback.',
    },
    {
      q: 'Are these frequencies safe for children or during pregnancy?',
      a: 'Natural 432Hz acoustic harmonics and gentle nature sounds (rain, streams, ocean) are universally calming for all ages. However, deep Delta and Theta brainwave pulses should be listened to at moderate, gentle volumes.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Sanctuary Support & Concierge</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Connect with Our Sound Sanctuary
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Need guidance choosing a frequency, troubleshooting playback, or requesting a soundscape? Message our team or ask our live concierge.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`min-h-[38px] px-4 py-2 rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 border-transparent text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-750'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Live Sanctuary Concierge (Instant Chat)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`min-h-[38px] px-4 py-2 rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'message'
                ? 'bg-sky-500 border-transparent text-slate-950 shadow-lg shadow-sky-500/20'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-750'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Send Direct Message</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'message' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-7 shadow-xl">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-sky-400" />
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              We usually respond to sound therapy inquiries and support tickets within 24 hours.
            </p>

            {submissionSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Message Transmitted Peacefully</h4>
                <p className="text-xs text-emerald-300/90 max-w-md mx-auto leading-relaxed">
                  Your inquiry has been received and logged under reference ID{' '}
                  <code className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200">
                    {submissionSuccess}
                  </code>
                  . A sound therapy specialist will review your note shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmissionSuccess(null)}
                  className="mt-3 min-h-[36px] px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-semibold rounded-xl hover:bg-emerald-400 transition-colors shadow-md inline-flex items-center justify-center cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessageForm} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Thorne"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. maria@mindful.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                    >
                      <option value="sound_therapy">Sound Therapy Consultation</option>
                      <option value="general">General Sanctuary Inquiry</option>
                      <option value="technical_support">Technical Support / Audio Issue</option>
                      <option value="preset_request">New Nature Sound / Preset Request</option>
                      <option value="commercial">Licensing & Retreat Partnerships</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Brief topic of your inquiry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about your experience, frequency questions, or how we can assist your mindfulness practice..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Encrypted & protected by Aura Privacy Protocol</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[38px] px-6 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/20 inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Transmitting...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick FAQ Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Frequently Answered Questions
              </h3>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full p-3 text-left flex items-center justify-between text-xs font-medium text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <span className="pr-2">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-3 pt-0 text-[11px] text-slate-400 border-t border-slate-850 leading-relaxed bg-slate-900/60">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 space-y-2.5 text-xs text-slate-300">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Sanctuary Sound Philosophy
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Aura 432Hz Sanctuary is developed by acoustic sound designers and mindfulness enthusiasts. All our frequencies are generated mathematically through pure Web Audio API oscillators, completely free of commercial compression artifacts.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* LIVE CHAT SANCTUARY CONCIERGE */
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Aura Sanctuary Concierge
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    Live Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant guidance for frequencies, presets, sleep & breathwork protocols
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Channel: {channelId.slice(0, 14)}...</span>
            </div>
          </div>

          {/* Quick Guidance Chips (Wrapped cleanly, zero horizontal scrolling cut-off) */}
          <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Quick Ask:
            </span>
            {[
              'I need to sleep deeply tonight',
              'Relieve anxiety and panic fast',
              'Focus and studying protocol',
              'Alleviate headache and tension',
              'Deep subconscious meditation',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSendChatMessage(undefined, chip)}
                className="min-h-[28px] text-[11px] px-2.5 py-1 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 whitespace-nowrap inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
            {chatMessages.map((msg, idx) => {
              const isUser = msg.senderRole === 'user';
              const suggestedPreset = msg.suggestedPresetId
                ? BUILT_IN_MIX_PRESETS.find((p) => p.id === msg.suggestedPresetId)
                : null;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-amber-300" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[70%] space-y-2`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-sm shadow-md'
                          : 'bg-slate-850 border border-slate-750 text-slate-200 rounded-tl-sm shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 opacity-70 text-[10px]">
                        <span>{msg.senderName}</span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Preset Recommendation Card inside chat message */}
                    {suggestedPreset && !isUser && (
                      <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 flex items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-2 min-w-0">
                          <Headphones className="w-4 h-4 text-sky-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-100 truncate">
                              {suggestedPreset.name} ({suggestedPreset.baseFreq}Hz)
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {suggestedPreset.description}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlayRecommendedPreset(suggestedPreset.id)}
                          className="min-h-[32px] px-3 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold rounded-xl transition-colors shrink-0 inline-flex items-center justify-center gap-1 whitespace-nowrap shadow-sm cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Play Now</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isConciergeTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-10">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-mono text-indigo-300 ml-1">
                  Concierge analyzing biofield frequency...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => handleSendChatMessage(e)}
            className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask the sound therapy concierge a question or request a soundscape..."
              value={newChatText}
              onChange={(e) => setNewChatText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!newChatText.trim() || isSendingChat}
              className="min-h-[38px] px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
