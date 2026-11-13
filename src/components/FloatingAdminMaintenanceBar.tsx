import React, { useState } from 'react';
import {
  ShieldAlert,
  Eye,
  Sliders,
  PowerOff,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  useSiteContent,
  toggleUnderConstruction,
} from '../services/siteContent';

interface FloatingAdminMaintenanceBarProps {
  adminEmail?: string;
  onOpenPreview: () => void;
  onNavigateToSettings: () => void;
  onToggleForceVisitorMode?: () => void;
  onStatusChanged?: (enabled: boolean) => void;
}

export const FloatingAdminMaintenanceBar: React.FC<FloatingAdminMaintenanceBarProps> = ({
  adminEmail = 'moreed.raouf@gmail.com',
  onOpenPreview,
  onNavigateToSettings,
  onToggleForceVisitorMode,
  onStatusChanged,
}) => {
  const content = useSiteContent();
  const config = content.underConstruction;
  const [isToggling, setIsToggling] = useState(false);

  if (!config.enabled) {
    return null;
  }

  const handleTurnOff = async () => {
    if (window.confirm('Restore public access to the Sanctuary? Visitors will immediately see the live website.')) {
      setIsToggling(true);
      try {
        await toggleUnderConstruction(false, adminEmail);
        if (onStatusChanged) onStatusChanged(false);
      } catch (e) {
        console.error('Failed to toggle off under construction mode', e);
      } finally {
        setIsToggling(false);
      }
    }
  };

  return (
    <div className="sticky top-0 z-[100] w-full bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 border-b-2 border-amber-500/80 shadow-2xl backdrop-blur-xl px-4 py-2.5 transition-all">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Active Status Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Under Construction Mode Active</span>
          </div>
          <span className="hidden md:inline-block text-slate-400 text-[11px]">
            (Public visitors see the breathwork &amp; lotus teaser · Admin bypass active)
          </span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Visitor Simulation */}
          {onToggleForceVisitorMode && (
            <button
              type="button"
              onClick={onToggleForceVisitorMode}
              className="min-h-[30px] px-2.5 py-1 rounded-lg border border-transparent bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
              title="Test the Under Construction page live as a visitor in your browser"
            >
              <Eye className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>Experience as Visitor</span>
            </button>
          )}

          {/* Preview Visitor View Modal */}
          <button
            type="button"
            onClick={onOpenPreview}
            className="min-h-[30px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-[11px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
            title="Preview the exact Under Construction page in a modal"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>Preview Modal</span>
          </button>

          {/* Edit in Admin Panel */}
          <button
            type="button"
            onClick={onNavigateToSettings}
            className="min-h-[30px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-[11px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Edit quotes, messages, launch date, and options in the Admin Panel"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              <span className="hidden sm:inline">Edit in </span>Settings
            </span>
          </button>

          {/* Instant 1-Click Turn Off */}
          <button
            type="button"
            onClick={handleTurnOff}
            disabled={isToggling}
            className="min-h-[30px] px-3 py-1 rounded-lg border border-transparent bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm disabled:opacity-50"
            title="Turn off Under Construction Mode and immediately restore public website"
          >
            <PowerOff className="w-3.5 h-3.5 shrink-0" />
            <span>{isToggling ? 'Restoring...' : 'Turn Off Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
