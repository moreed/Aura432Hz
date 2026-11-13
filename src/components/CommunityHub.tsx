import React, { useState } from 'react';
import { Heart, Star, Users, MessageSquareHeart } from 'lucide-react';
import { GratitudeSection } from './GratitudeSection';
import { TestimonialsSection } from './TestimonialsSection';

interface CommunityHubProps {
  isAdmin?: boolean;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ isAdmin = false }) => {
  const [activeSubTab, setActiveSubTab] = useState<'gratitude' | 'testimonials'>('gratitude');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Community Hub Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Sanctuary Community</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                • Mindful Meditation Circle
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reflect in your personal gratitude journal or read verified ambient listening experiences from fellow meditators.
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('gratitude')}
            className={`px-4 py-2 min-h-[36px] rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'gratitude'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0" />
            <span>Gratitude Journal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('testimonials')}
            className={`px-4 py-2 min-h-[36px] rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'testimonials'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>Listener Experiences</span>
          </button>
        </div>
      </div>

      {/* Render the Active Sub Tab */}
      {activeSubTab === 'gratitude' ? <GratitudeSection isAdmin={isAdmin} /> : <TestimonialsSection isAdmin={isAdmin} />}
    </div>
  );
};
