import React, { useState } from 'react';
import { Clip, Mood } from '../types';
import { 
  BarChart2, Search, Sliders, Download, Play, Pause, 
  Edit3, Flame, CheckCircle2, Volume2, VolumeX, Sparkles, Filter 
} from 'lucide-react';
import { soundEngine } from '../services/soundEffects';

interface ResultsDashboardProps {
  clips: Clip[];
  allClips: Clip[];
  filterMode: 'recommended' | 'timeline';
  setFilterMode: (mode: 'recommended' | 'timeline') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMood: Mood | 'all';
  setSelectedMood: (mood: Mood | 'all') => void;
  onSelectClip: (clipId: number) => void;
  onExportClip: (clip: Clip) => void;
  onExportAll: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  clips,
  allClips,
  filterMode,
  setFilterMode,
  searchQuery,
  setSearchQuery,
  selectedMood,
  setSelectedMood,
  onSelectClip,
  onExportClip,
  onExportAll
}) => {
  const [hoveredClipId, setHoveredClipId] = useState<number | null>(null);
  const [previewAudioId, setPreviewAudioId] = useState<number | null>(null);

  const toggleCardAudio = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    if (previewAudioId === clip.id) {
      soundEngine.stopBgmLoop();
      setPreviewAudioId(null);
    } else {
      soundEngine.stopBgmLoop();
      soundEngine.startBgmLoop(clip.mood);
      soundEngine.playSfx('whoosh');
      setPreviewAudioId(clip.id);
    }
  };

  const moodBadges: Record<Mood, { label: string; color: string }> = {
    serious: { label: 'สาระจริงจัง', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    funny: { label: 'มุกตลก / ฮา', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    exciting: { label: 'ตื่นเต้น / ลุ้น', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    emotional: { label: 'ซึ้ง / ดราม่า', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    inspiring: { label: 'แรงบันดาลใจ', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-[#F5B800] text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>AI ประมวลผลและตัดต่อเสร็จสมบูรณ์</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            แดชบอร์ดจัดการคลิปสั้น ({clips.length} คลิป พร้อมโพสต์)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            ระบบจัดอันดับช่วงไวรัลที่ดีที่สุด พร้อมซับไตเติลคาราโอเกะต่อเนื่อง เพลงประกอบ BGM และ SFX ครบถ้วน
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExportAll}
            className="px-4 py-2.5 bg-[#121216] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border border-[#27272a]"
          >
            <Download className="w-4 h-4 text-[#F5B800]" />
            <span>ส่งออกทั้งหมด (ZIP)</span>
          </button>

          <button
            onClick={() => onSelectClip(clips[0]?.id || 1)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-[#F5B800]/20 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>เปิดโปรแกรมแก้ไข (Editor Studio)</span>
          </button>
        </div>
      </div>

      {/* Interactive Horizontal Timeline Mapping */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300 flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-[#F5B800]" />
            <span>ไทม์ไลน์ช่วงเด็ดไวรัลในวิดีโอต้นฉบับ (00:00 - 52:10)</span>
          </span>
          <span className="text-[11px] text-zinc-500">คลิกที่การ์ดเพื่อข้ามไปปรับแต่ง</span>
        </div>

        <div className="relative h-14 bg-[#09090b] rounded-xl border border-[#27272a] p-1.5 flex items-center overflow-x-auto">
          {/* Subtle horizontal track line */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-zinc-800 mx-3" />

          <div className="flex items-center space-x-2.5 w-full px-2 relative z-10">
            {allClips.map((c, idx) => {
              const isGold = c.viralScore >= 90;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectClip(c.id)}
                  title={`${c.title} (${c.start} - ${c.end})`}
                  className={`cursor-pointer flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-2 ${
                    isGold
                      ? 'bg-gradient-to-r from-[#F5B800]/20 to-[#D49E00]/20 border-[#F5B800] text-[#FFF3C4] hover:bg-[#F5B800] hover:text-black shadow-md'
                      : 'bg-zinc-800/90 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/50 text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{c.viralScore} คะแนน</span>
                  <span className="text-[10px] font-mono text-zinc-400">({c.start})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
        {/* Sort & Mood Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-[#121216] p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setFilterMode('recommended')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'recommended'
                  ? 'bg-[#F5B800] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⭐ AI แนะนำ (คะแนนไวรัล)
            </button>
            <button
              onClick={() => setFilterMode('timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'timeline'
                  ? 'bg-[#F5B800] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⏱ ตามลำดับเวลา
            </button>
          </div>

          {/* Mood filter pills */}
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {(['all', 'serious', 'funny', 'exciting', 'emotional', 'inspiring'] as const).map(mood => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all whitespace-nowrap ${
                  selectedMood === mood
                    ? 'bg-[#F5B800]/20 border-[#F5B800] text-[#FFF3C4]'
                    : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white'
                }`}
              >
                {mood === 'all' ? 'ทุกหมวดหมู่' : moodBadges[mood]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข้อความหรือประเด็นในคลิป..."
            className="w-full pl-9 pr-4 py-2 bg-[#121216] border border-[#27272a] rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#F5B800] transition-colors"
          />
        </div>
      </div>

      {/* 9:16 Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clips.map(clip => {
          const isHovered = hoveredClipId === clip.id;
          const isAudioPlaying = previewAudioId === clip.id;
          const badge = moodBadges[clip.mood];

          return (
            <div
              key={clip.id}
              onMouseEnter={() => setHoveredClipId(clip.id)}
              onMouseLeave={() => setHoveredClipId(null)}
              className="bg-[#121216] border border-[#27272a] rounded-3xl overflow-hidden hover:border-[#F5B800]/60 transition-all flex flex-col group shadow-xl hover:shadow-2xl hover:shadow-[#F5B800]/10"
            >
              {/* 9:16 Aspect Video Container */}
              <div className="relative aspect-[9/16] bg-[#09090b] overflow-hidden flex items-center justify-center">
                {isHovered && clip.videoSourceUrl ? (
                  <video
                    src={clip.videoSourceUrl}
                    autoPlay
                    loop
                    muted={!isAudioPlaying}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={clip.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'}
                    alt={clip.title}
                    className={`w-full h-full object-cover opacity-60 transition-transform duration-700 ${
                      isHovered ? 'scale-105 opacity-80' : ''
                    }`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/95 via-[#09090b]/20 to-[#09090b]/60 pointer-events-none" />

                {/* Overlays preview on card */}
                {clip.overlays.map(ov => (
                  <div
                    key={ov.id}
                    style={{ left: `${ov.x}%`, top: `${ov.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl drop-shadow-lg pointer-events-none transition-transform duration-300"
                  >
                    {ov.content}
                  </div>
                ))}

                {/* Top badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-[#09090b]/80 backdrop-blur-md rounded-xl text-xs font-bold text-[#F5B800] border border-[#F5B800]/30 flex items-center space-x-1 shadow-md">
                    <Flame className="w-3.5 h-3.5 fill-[#F5B800]" />
                    <span>{clip.viralScore}/100 ไวรัล</span>
                  </span>

                  <span className="px-2.5 py-1 bg-[#09090b]/80 backdrop-blur-md rounded-xl text-xs font-mono font-medium text-zinc-300 border border-[#27272a]">
                    {clip.start} - {clip.end}
                  </span>
                </div>

                {/* Continuous Subtitle Simulation on Card */}
                <div className="absolute inset-x-4 bottom-14 text-center">
                  <div className="inline-block bg-[#09090b]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#F5B800]/40 text-white font-bold text-xs shadow-lg">
                    <span className="text-[#F5B800]">⚡️ {clip.keyMoments[0]?.text || 'ประเด็นหลัก'}</span> กำลังพูดถึง...
                  </div>
                </div>

                {/* Center Hover Action */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={() => onSelectClip(clip.id)}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F5B800] to-[#FFF3C4] text-black flex items-center justify-center shadow-2xl shadow-[#F5B800]/30 hover:scale-110 active:scale-95 transition-transform"
                    title="เปิดแก้ไขใน Studio"
                  >
                    <Play className="w-6 h-6 fill-black ml-1" />
                  </button>
                </div>

                {/* Audio Preview toggle on bottom left */}
                <button
                  onClick={(e) => toggleCardAudio(e, clip)}
                  className="absolute bottom-3 left-3 p-2 rounded-xl bg-black/70 hover:bg-[#F5B800] text-zinc-300 hover:text-black border border-white/10 transition-colors z-20"
                  title="ฟังเพลง BGM และ SFX ตัวอย่าง"
                >
                  {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                {/* Bottom Style Badge */}
                <div className="absolute bottom-3.5 right-3.5 flex items-center space-x-1.5 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-lg border font-medium ${badge?.color}`}>
                    {badge?.label}
                  </span>
                </div>
              </div>

              {/* Card Meta Description */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm mb-2 group-hover:text-[#F5B800] transition-colors line-clamp-2 leading-snug">
                    {clip.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                    {clip.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#27272a] flex items-center space-x-2">
                  <button
                    onClick={() => onSelectClip(clip.id)}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#F5B800]" />
                    <span>แต่งซับ / เอฟเฟกต์</span>
                  </button>

                  <button
                    onClick={() => onExportClip(clip)}
                    className="px-3.5 py-2 bg-[#F5B800] hover:bg-[#D49E00] text-black rounded-xl text-xs font-bold flex items-center justify-center shadow-md transition-all"
                    title="ส่งออกคลิปนี้"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
