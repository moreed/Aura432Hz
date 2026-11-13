import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Plus, Trash2, BookmarkCheck, Calendar, Smile, Sun, Feather, Share2, Check } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export interface GratitudeEntry {
  id: string;
  text: string;
  tag: string;
  date: string;
}

const TAGS = ['Peaceful', 'Healed', 'Grounded', 'Restored', 'Connected', 'Serene'];

const STORAGE_KEY = 'aura_432_gratitude_entries';

interface GratitudeSectionProps {
  isAdmin?: boolean;
}

export const GratitudeSection: React.FC<GratitudeSectionProps> = ({ isAdmin = false }) => {
  const [entries, setEntries] = useState<GratitudeEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove all generated sample entries
          const userOnly = parsed.filter((item: GratitudeEntry) => item && !String(item.id).startsWith('sample_'));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
          return userOnly;
        }
      }
    } catch (e) {}
    return [];
  });

  const [inputVal, setInputVal] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Peaceful');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {}
  }, [entries]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newEntry: GratitudeEntry = {
      id: `grat_${Date.now()}`,
      text: inputVal.trim(),
      tag: selectedTag,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setEntries([newEntry, ...entries]);
    setInputVal('');

    // Play a gentle Tibetan bowl chime to seal the gratitude intention
    audioEngine.strikeTibetanBowl();
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    setEntries(entries.filter((item) => item.id !== id));
  };

  const handleCopy = (entry: GratitudeEntry) => {
    navigator.clipboard.writeText(`✨ Gratitude reflection: "${entry.text}" — Aura 432Hz`);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 md:p-8 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              Daily Gratitude &amp; Heart Resonance
            </h3>
            <span className="text-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-medium">
              432Hz Heart Coherence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cultivate somatic gratitude while listening to calming 432Hz soundwaves. Mindful reflection naturally encourages peaceful relaxation.
          </p>
        </div>
      </div>

      {/* Gratitude Form */}
      <form onSubmit={handleAddEntry} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Record Your Gratitude Intention
        </label>

        <textarea
          rows={3}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="I am deeply grateful for..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-400 resize-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Mood / Tag Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">Feeling:</span>
            {TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                  selectedTag === tag
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400 font-semibold'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-indigo-500 hover:from-rose-400 hover:to-indigo-400 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5 self-end sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Reflection</span>
          </button>
        </div>
      </form>

      {/* Saved Gratitude Entries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">
            Gratitude Journal ({entries.length} Reflections)
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Stored safely on your device</span>
            {entries.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                  <span className="text-[10px] text-rose-300">Clear all reflections?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEntries([]);
                      localStorage.removeItem(STORAGE_KEY);
                      setConfirmClear(false);
                    }}
                    className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded hover:bg-rose-500/30 transition-colors"
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all reflections"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )
            )}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
            No reflections yet. Write your first intention above to seal it in your 432Hz session.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entries.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all text-xs"
              >
                <p className="text-slate-200 leading-relaxed italic mb-3">
                  "{item.text}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-medium">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="w-7 h-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer"
                      title="Copy reflection"
                      aria-label="Copy reflection"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer"
                        title="Admin only: Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
