import React from 'react';
import { Clip, SfxMarker } from '../types';
import { Subtitles, Music, Volume2, Sparkles, Scissors, Plus, Trash2, Target, Clock } from 'lucide-react';

interface MultiTrackTimelineProps {
  clip: Clip;
  currentTime: number;
  onSeek: (time: number) => void;
  onAddSfx: (type: SfxMarker['type']) => void;
  onRemoveSfx: (id: string | number) => void;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  clip,
  currentTime,
  onSeek,
  onAddSfx,
  onRemoveSfx,
  trimStart,
  trimEnd,
  onTrimChange
}) => {
  const duration = Math.max(1, trimEnd - trimStart);
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(Number((percent * duration).toFixed(1)));
  };

  return (
    <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-xl select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#27272a]">
        <div className="flex items-center space-x-2">
          <Scissors className="w-4 h-4 text-[#F5B800]" />
          <span className="text-sm font-bold text-white">Multi-track Editor & Audio Ducking Timeline</span>
          <span className="text-xs text-zinc-400 font-mono">({duration.toFixed(1)}s รวม)</span>
        </div>

        {/* Quick SFX add buttons */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span className="text-xs text-zinc-400 mr-1 hidden md:inline">เพิ่ม SFX ที่ตำแหน่งนี้:</span>
          {(['whoosh', 'pop', 'impact', 'rimshot', 'ding'] as const).map(type => (
            <button
              key={type}
              onClick={() => onAddSfx(type)}
              className="px-2 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#F5B800] border border-[#27272a] hover:border-[#F5B800]/40 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Track Workspace */}
      <div className="relative space-y-3 cursor-pointer" onClick={handleTimelineClick}>
        {/* Playhead Scrubber */}
        <div
          className="absolute top-0 bottom-0 z-30 w-0.5 bg-[#F5B800] pointer-events-none transition-all duration-75 shadow-lg shadow-[#F5B800]"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="w-3.5 h-3.5 -ml-1.5 -top-1 bg-[#F5B800] text-black font-bold text-[9px] rounded-full flex items-center justify-center shadow-md">
            ▼
          </div>
        </div>

        {/* Track 1: Subtitles Track */}
        <div className="relative h-9 bg-[#09090b] rounded-xl border border-[#27272a] flex items-center px-3 overflow-hidden">
          <div className="w-20 text-[11px] font-medium text-zinc-400 flex items-center space-x-1.5 z-10 bg-[#09090b]/80 pr-2">
            <Subtitles className="w-3.5 h-3.5 text-[#F5B800]" />
            <span>ซับไตเติล</span>
          </div>
          <div className="flex-1 relative h-full flex items-center">
            {clip.transcriptWords.map((word, idx) => {
              const startPct = (word.start / duration) * 100;
              const widthPct = Math.max(3, ((word.end - word.start) / duration) * 100);
              return (
                <div
                  key={idx}
                  title={`${word.word} (${word.start}s - ${word.end}s)`}
                  className={`absolute h-6 rounded px-1.5 flex items-center justify-center text-[10px] font-medium truncate border ${
                    word.isEmphasis
                      ? 'bg-[#F5B800]/30 border-[#F5B800] text-[#FFF3C4]'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
                  }`}
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                >
                  {word.word}
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: BGM & Audio Ducking Waveform Track */}
        <div className="relative h-9 bg-[#09090b] rounded-xl border border-[#27272a] flex items-center px-3 overflow-hidden">
          <div className="w-20 text-[11px] font-medium text-zinc-400 flex items-center space-x-1.5 z-10 bg-[#09090b]/80 pr-2">
            <Music className="w-3.5 h-3.5 text-blue-400" />
            <span>BGM Duck</span>
          </div>
          <div className="flex-1 relative h-full flex items-center">
            {/* Visual waveform bars with ducking dips where speech is present */}
            <div className="w-full flex items-center justify-between h-4 px-1 opacity-70">
              {Array.from({ length: 48 }).map((_, i) => {
                const timeAtBar = (i / 48) * duration;
                const isSpeechActive = clip.transcriptWords.some(
                  w => timeAtBar >= w.start && timeAtBar <= w.end
                );
                const barHeight = isSpeechActive ? '4px' : `${Math.sin(i * 0.4) * 6 + 10}px`;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isSpeechActive ? 'bg-zinc-600' : 'bg-blue-400/80'
                    }`}
                    style={{ height: barHeight }}
                  />
                );
              })}
            </div>
            <div className="absolute right-2 text-[10px] text-zinc-500 font-mono pointer-events-none">
              Ducking: -{100 - clip.duckingLevel}% ขณะมีเสียงพูด
            </div>
          </div>
        </div>

        {/* Track 3: SFX Track with interactive pins */}
        <div className="relative h-9 bg-[#09090b] rounded-xl border border-[#27272a] flex items-center px-3 overflow-hidden">
          <div className="w-20 text-[11px] font-medium text-zinc-400 flex items-center space-x-1.5 z-10 bg-[#09090b]/80 pr-2">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SFX ({clip.sfxMarkers.length})</span>
          </div>
          <div className="flex-1 relative h-full flex items-center">
            {clip.sfxMarkers.map(marker => {
              const markerPct = (marker.time / duration) * 100;
              return (
                <div
                  key={marker.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(marker.time);
                  }}
                  className="group absolute -translate-x-1/2 flex items-center space-x-1 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-400 text-emerald-300 hover:text-black rounded-md px-1.5 py-0.5 text-[10px] font-bold z-20 transition-all cursor-pointer shadow-sm"
                  style={{ left: `${markerPct}%` }}
                >
                  <span>{marker.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSfx(marker.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-700 ml-0.5"
                    title="ลบ SFX นี้"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 4: Content Insights & Core Highlights Track */}
        {clip.contentInsights && clip.contentInsights.length > 0 && (
          <div className="relative h-9 bg-[#09090b] rounded-xl border border-[#27272a] flex items-center px-3 overflow-hidden">
            <div className="w-20 text-[11px] font-medium text-zinc-400 flex items-center space-x-1.5 z-10 bg-[#09090b]/80 pr-2">
              <Clock className="w-3.5 h-3.5 text-[#F5B800]" />
              <span>สาระสำคัญ</span>
            </div>
            <div className="flex-1 relative h-full flex items-center">
              {clip.contentInsights.map((insight, idx) => {
                const startPct = (insight.startTime / duration) * 100;
                const widthPct = Math.max(5, ((insight.endTime - insight.startTime) / duration) * 100);
                const isActive = currentTime >= insight.startTime && currentTime <= insight.endTime;

                return (
                  <div
                    key={insight.id || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(insight.startTime);
                    }}
                    title={`${insight.text} (${insight.startTime}s - ${insight.endTime}s)`}
                    className={`absolute h-6 rounded px-2 flex items-center justify-between text-[10px] font-bold truncate border transition-all cursor-pointer z-10 ${
                      isActive
                        ? 'bg-[#F5B800] text-black shadow-md ring-1 ring-white'
                        : insight.isCoreHighlight
                        ? 'bg-[#F5B800]/25 border-[#F5B800] text-[#FFF3C4] hover:bg-[#F5B800]/35'
                        : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="truncate">
                      {insight.isCoreHighlight ? '★' : '•'} {insight.keywords?.[0] ? `#${insight.keywords[0].replace('#', '')}` : insight.text.substring(0, 10)}
                    </span>
                    <span className="text-[8px] font-mono ml-1 opacity-80 hidden sm:inline">
                      {insight.importanceScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Track 5: AI Face & Speaker Direct Cut Track */}
        {clip.speakers && clip.speakers.length > 0 && (
          <div className="relative h-9 bg-[#09090b] rounded-xl border border-[#27272a] flex items-center px-3 overflow-hidden">
            <div className="w-20 text-[11px] font-medium text-zinc-400 flex items-center space-x-1.5 z-10 bg-[#09090b]/80 pr-2">
              <Target className="w-3.5 h-3.5 text-[#F5B800]" />
              <span>Direct Cut</span>
            </div>
            <div className="flex-1 relative h-full flex items-center">
              {clip.speakers.map((spk, idx) => {
                const startPct = (spk.startTime / duration) * 100;
                const widthPct = Math.max(4, ((spk.endTime - spk.startTime) / duration) * 100);
                const isActive = currentTime >= spk.startTime && currentTime <= spk.endTime;
                const isHost = spk.role === 'host';

                return (
                  <div
                    key={spk.id || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(spk.startTime);
                    }}
                    title={`คลิกเพื่อพรีวิวตัดสลับ: ${spk.speakerName} (${spk.startTime}s - ${spk.endTime}s)`}
                    className={`absolute h-6 rounded px-2 flex items-center justify-between text-[10px] font-bold truncate border transition-all cursor-pointer z-10 ${
                      isActive
                        ? isHost
                          ? 'bg-[#F5B800]/30 border-[#F5B800] text-[#FFF3C4] ring-1 ring-[#F5B800] shadow-md'
                          : 'bg-[#38BDF8]/30 border-[#38BDF8] text-white ring-1 ring-[#38BDF8] shadow-md'
                        : isHost
                        ? 'bg-[#F5B800]/10 border-[#F5B800]/40 text-[#F5B800] hover:bg-[#F5B800]/20'
                        : 'bg-[#38BDF8]/10 border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8]/20'
                    }`}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="truncate">
                      {isHost ? '🎙️ Host' : '🎙️ Guest'}: {spk.speakerName.split(' ')[0]}
                    </span>
                    <span className="text-[8px] opacity-75 font-mono ml-1 uppercase hidden sm:inline">
                      CUT
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Track 6: Visual FX (Auto Direct Cut / Visual Grading) */}
        <div className="relative h-9 bg-[#09090b] rounded-xl border border-[#27272a] flex items-center px-3 overflow-hidden">
          <div className="w-20 text-[11px] font-medium text-zinc-400 flex items-center space-x-1.5 z-10 bg-[#09090b]/80 pr-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Visual FX</span>
          </div>
          <div className="flex-1 relative h-full flex items-center space-x-2">
            {(clip.visualFx?.framingMode === 'speaker_track' || clip.visualFx?.framingMode === 'auto_cut' || clip.visualFx?.activeSpeakerTracking) && (
              <span className="px-2 py-0.5 rounded bg-[#F5B800]/15 border border-[#F5B800]/40 text-[#FFF3C4] text-[10px] font-bold">
                🎬 Auto Direct Cut (No Zoom / Rock-Solid)
              </span>
            )}
            {clip.visualFx?.autoReframe && clip.visualFx?.framingMode !== 'speaker_track' && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px]">
                Auto 9:16 Reframe
              </span>
            )}
            {clip.visualFx?.slowZoom && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px]">
                Slow Zoom (100%→108%)
              </span>
            )}
            {clip.visualFx?.zoomPunch && (
              <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-300 text-[10px]">
                Punch-in Zooms
              </span>
            )}
            {clip.visualFx?.flashShake && (
              <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px]">
                Flash & Shake
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trimming buffer handles */}
      <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-2">
          <span>เริ่ม: {Math.floor(trimStart / 60)}:{(trimStart % 60).toString().padStart(2, '0')}</span>
          <input
            type="range"
            min={Math.max(0, clip.secondsStart - 30)}
            max={trimEnd - 5}
            value={trimStart}
            onChange={(e) => onTrimChange(parseInt(e.target.value), trimEnd)}
            className="w-24 accent-[#F5B800]"
          />
        </div>

        <div className="text-zinc-500 font-mono text-[11px]">
          ตำแหน่งปัจจุบัน: 00:{Math.floor(currentTime).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="range"
            min={trimStart + 5}
            max={clip.secondsEnd + 30}
            value={trimEnd}
            onChange={(e) => onTrimChange(trimStart, parseInt(e.target.value))}
            className="w-24 accent-[#F5B800]"
          />
          <span>จบ: {Math.floor(trimEnd / 60)}:{(trimEnd % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
};
