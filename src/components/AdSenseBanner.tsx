import React, { useState } from 'react';
import { Eye, EyeOff, Code, Info, ExternalLink } from 'lucide-react';

interface AdSenseBannerProps {
  side: 'left' | 'right';
  adSlot?: string;
  adClient?: string;
  adFormat?: 'auto' | 'vertical' | 'rectangle';
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  side,
  adSlot = '1234567890',
  adClient = 'ca-pub-XXXXXXXXXXXXXXXX',
  adFormat = 'vertical',
}) => {
  const [showPlaceholderCode, setShowPlaceholderCode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className={`hidden xl:flex flex-col shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-44 2xl:w-64'
      }`}
      aria-label={`${side} Google AdSense advertisement space`}
    >
      <div className="sticky top-20 flex flex-col gap-2">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-[10px] text-slate-400">
          <span className="uppercase tracking-wider font-semibold text-slate-400">
            {isCollapsed ? side.toUpperCase().charAt(0) : `AdSense ${side}`}
          </span>
          <div className="flex items-center gap-1">
            {!isCollapsed && (
              <button
                onClick={() => setShowPlaceholderCode(!showPlaceholderCode)}
                className="p-1 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors"
                title="View Google AdSense code snippet"
              >
                <Code className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title={isCollapsed ? `Expand ${side} Ad Slot` : `Collapse ${side} Ad Slot`}
            >
              {isCollapsed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Collapsed State Pill */}
        {isCollapsed ? (
          <div
            onClick={() => setIsCollapsed(false)}
            className="cursor-pointer py-8 px-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-center text-[10px] text-slate-400 hover:text-sky-400 transition-all [writing-mode:vertical-lr] tracking-widest uppercase flex items-center justify-center gap-2"
          >
            Google AdSpace ({side})
          </div>
        ) : (
          /* Expanded Ad Container */
          <div className="bg-slate-900/50 backdrop-blur-md border border-dashed border-slate-700/80 rounded-2xl p-3 flex flex-col items-center justify-between min-h-[600px] text-center shadow-lg relative overflow-hidden group">
            {/* Google AdSense Compliant Label */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800/60 text-[10px] text-slate-400">
              <span className="tracking-widest uppercase font-mono">ADVERTISEMENT</span>
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                Google AdSense <Info className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Google AdSense ins tag */}
            <div className="my-auto w-full flex flex-col items-center justify-center py-6 px-1">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', minHeight: '500px', width: '100%' }}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive="true"
              />

              {/* Visual Placeholder for Publisher Preview */}
              <div className="w-full h-full min-h-[460px] rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center p-3 text-slate-400 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <span className="font-mono text-xs font-bold">Ad</span>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-300">
                    Google AdSense Space
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    160×600 / 300×600 Wide Skyscraper
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 font-mono">
                  Slot: {side.toUpperCase()}
                </div>

                <p className="text-[10px] text-slate-400 leading-normal max-w-[180px]">
                  Configured for Google AdSense automatic or vertical skyscraper ads.
                </p>

                {showPlaceholderCode && (
                  <div className="text-left w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[9px] text-slate-400 break-all whitespace-pre-wrap">
                    <code>
                      {`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}" crossorigin="anonymous"></script>`}
                      <br />
                      {`<ins class="adsbygoogle"`}
                      <br />
                      {` style="display:block"`}
                      <br />
                      {` data-ad-client="${adClient}"`}
                      <br />
                      {` data-ad-slot="${adSlot}"`}
                      <br />
                      {` data-ad-format="auto"`}
                      <br />
                      {` data-full-width-responsive="true"></ins>`}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Publisher Quick Tip */}
            <div className="pt-2 border-t border-slate-800/60 w-full text-[10px] text-slate-400 flex items-center justify-between">
              <span>Status: Ready</span>
              <button
                onClick={() => setShowPlaceholderCode(!showPlaceholderCode)}
                className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
              >
                <span>{showPlaceholderCode ? 'Hide Code' : 'Embed Code'}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
