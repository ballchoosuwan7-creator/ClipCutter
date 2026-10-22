import React, { useState, useEffect, useRef } from 'react';
import { Clip, SubtitleStyle, VisualFxColorGrade, VisualFxIntensity, SfxMarker, OverlayItem, ContentInsightSegment } from '../types';
import { CanvasVideoPlayer } from './CanvasVideoPlayer';
import { MultiTrackTimeline } from './MultiTrackTimeline';
import { ExportModal } from './ExportModal';
import { GeminiService } from '../services/geminiService';
import { soundEngine } from '../services/soundEffects';
import { 
  ArrowLeft, Play, Pause, Save, Download, Sparkles, RefreshCw, 
  Subtitles, Music, Volume2, Sliders, Type, Palette, Layers, 
  Trash2, Plus, Upload, Check, Copy, Flame, Eye, Film,
  Target, Scan, UserCheck, Maximize2, Crop, Lock, Unlock, Zap,
  Clock, Scissors, Tag, FastForward, Activity
} from 'lucide-react';

interface EditorStudioProps {
  clip: Clip;
  onBack: () => void;
  onUpdateClip: (updated: Clip) => void;
  showAlert: (title: string, message: string, icon?: string) => void;
}

export const EditorStudio: React.FC<EditorStudioProps> = ({
  clip,
  onBack,
  onUpdateClip,
  showAlert
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'pacing' | 'subtitles' | 'visual_fx' | 'audio_sfx' | 'overlays' | 'caption'>('pacing');

  // Working copy state
  const [currentClip, setCurrentClip] = useState<Clip>({ ...clip });
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [captionPlatform, setCaptionPlatform] = useState<'TikTok' | 'Reels' | 'Shorts'>('TikTok');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFastPreviewing, setIsFastPreviewing] = useState(false);

  // Sticker tool
  const [newEmoji, setNewEmoji] = useState('🔥');
  const [overlayDuration, setOverlayDuration] = useState(3);
  const [overlayX, setOverlayX] = useState(50);
  const [overlayY, setOverlayY] = useState(25);

  const duration = Math.max(1, currentClip.secondsEnd - currentClip.secondsStart);

  // Fallback content insights if none defined on the clip
  const defaultInsights: ContentInsightSegment[] = [
    {
      id: 'ins-default-1',
      text: currentClip.transcriptWords.slice(0, 4).map(w => w.word).join(' ') || 'บทนำและประเด็น Hook',
      startTime: 0.0,
      endTime: Math.min(6.0, duration * 0.3),
      importanceScore: 88,
      isCoreHighlight: false,
      keywords: ['#เปิดประเด็น', '#Hook', '#จุดสนใจ'],
      category: 'hook'
    },
    {
      id: 'ins-default-2',
      text: currentClip.transcriptWords.slice(4, 9).map(w => w.word).join(' ') || 'สาระสำคัญและผลลัพธ์ที่แท้จริง',
      startTime: Math.min(6.1, duration * 0.31),
      endTime: Math.min(14.0, duration * 0.75),
      importanceScore: 98,
      isCoreHighlight: true,
      keywords: ['#สาระสำคัญ', '#ใจความหลัก', '#ผลลัพธ์จริง'],
      category: 'core_insight'
    },
    {
      id: 'ins-default-3',
      text: currentClip.transcriptWords.slice(9).map(w => w.word).join(' ') || 'บทสรุปและแนวทางปฏิบัติจริง',
      startTime: Math.min(14.1, duration * 0.76),
      endTime: duration,
      importanceScore: 94,
      isCoreHighlight: true,
      keywords: ['#สรุปคุณค่า', '#ลงมือทำ'],
      category: 'conclusion'
    }
  ];

  const contentInsights = currentClip.contentInsights && currentClip.contentInsights.length > 0
    ? currentClip.contentInsights
    : defaultInsights;

  const coreInsightDuration = contentInsights
    .filter(i => i.isCoreHighlight)
    .reduce((sum, item) => sum + Math.max(0, item.endTime - item.startTime), 0);
  const coreInsightRatio = Math.round((coreInsightDuration / Math.max(1, duration)) * 100);

  // Adjust duration by expanding or contracting key segments
  const handleAdjustDuration = (deltaSeconds: number, reason: string) => {
    const currentDur = Math.max(1, currentClip.secondsEnd - currentClip.secondsStart);
    const newDur = Math.max(8, Math.min(180, Number((currentDur + deltaSeconds).toFixed(1))));
    if (newDur === currentDur) return;

    const newSecondsEnd = Number((currentClip.secondsStart + newDur).toFixed(1));
    const scaleRatio = newDur / currentDur;

    // Rescale transcript words proportionally so subtitles stay continuous & synced
    const updatedWords = currentClip.transcriptWords.map(w => ({
      ...w,
      start: Number((w.start * scaleRatio).toFixed(2)),
      end: Number((w.end * scaleRatio).toFixed(2))
    }));

    // Rescale SFX markers
    const updatedSfx = currentClip.sfxMarkers.map(m => ({
      ...m,
      time: Number((m.time * scaleRatio).toFixed(2))
    }));

    // Rescale speakers timestamps
    const updatedSpeakers = (currentClip.speakers || []).map(s => ({
      ...s,
      startTime: Number((s.startTime * scaleRatio).toFixed(2)),
      endTime: Number((s.endTime * scaleRatio).toFixed(2))
    }));

    // Rescale content insights
    const updatedInsights = contentInsights.map(ins => ({
      ...ins,
      startTime: Number((ins.startTime * scaleRatio).toFixed(2)),
      endTime: Number((ins.endTime * scaleRatio).toFixed(2))
    }));

    const updated: Clip = {
      ...currentClip,
      secondsEnd: newSecondsEnd,
      end: `${Math.floor(newSecondsEnd / 60).toString().padStart(2, '0')}:${Math.floor(newSecondsEnd % 60).toString().padStart(2, '0')}`,
      transcriptWords: updatedWords,
      sfxMarkers: updatedSfx,
      speakers: updatedSpeakers,
      contentInsights: updatedInsights
    };

    setCurrentClip(updated);
    onUpdateClip(updated);
    soundEngine.playSfx('pop');
    showAlert(
      deltaSeconds > 0 ? `ขยายเวลา +${deltaSeconds}s` : `ตัดกระชับ ${deltaSeconds}s`,
      `${reason} (ความยาวรวมใหม่: ${newDur} วินาที)`,
      deltaSeconds > 0 ? 'sparkles' : 'scissors'
    );
  };

  const handleApplyPacingPreset = (preset: 'punchy' | 'balanced' | 'in_depth') => {
    const targetDuration = preset === 'punchy' ? 15 : (preset === 'balanced' ? 30 : 50);
    const currentDur = Math.max(1, currentClip.secondsEnd - currentClip.secondsStart);
    const delta = targetDuration - currentDur;
    handleAdjustDuration(
      delta,
      preset === 'punchy'
        ? 'ปรับจังหวะแบบกระชับเร่งด่วน (Punchy Viral 15s) ตัดช่วงฟุ่มเฟือย'
        : preset === 'balanced'
        ? 'ปรับจังหวะแบบไฮไลต์มาตรฐาน (Balanced 30s) ให้เวลาซึมซับสาระสำคัญ'
        : 'ปรับจังหวะแบบเจาะลึกเนื้อหา (In-Depth 50s) ขยายช่วงอธิบายและตัวอย่าง'
    );
  };

  const handleToggleCoreHighlight = (insightId: string | number) => {
    const updatedInsights = contentInsights.map(ins =>
      ins.id === insightId ? { ...ins, isCoreHighlight: !ins.isCoreHighlight } : ins
    );
    updateClipField('contentInsights', updatedInsights);
    soundEngine.playSfx('ding');
  };

  // Playback timer loop (Fluid 60fps driven by video element when available)
  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
      soundEngine.startBgmLoop(currentClip.mood);
      if (!currentClip.videoSourceUrl) {
        interval = window.setInterval(() => {
          setCurrentTime(prev => {
            if (isFastPreviewing && prev >= 10) {
              setIsPlaying(false);
              setIsFastPreviewing(false);
              return 0;
            }
            if (prev >= duration) {
              setIsPlaying(false);
              return 0;
            }
            return Number((prev + 0.1).toFixed(1));
          });
        }, 100);
      }
    } else {
      soundEngine.stopBgmLoop();
    }
    return () => {
      if (interval) clearInterval(interval);
      soundEngine.stopBgmLoop();
    };
  }, [isPlaying, duration, isFastPreviewing, currentClip.mood, currentClip.videoSourceUrl]);

  // Sync to parent on change
  const updateClipField = <K extends keyof Clip>(field: K, value: Clip[K]) => {
    const updated = { ...currentClip, [field]: value };
    setCurrentClip(updated);
    onUpdateClip(updated);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, time)));
  };

  const handleAddSfx = (type: SfxMarker['type']) => {
    const newMarker: SfxMarker = {
      id: `sfx-${Date.now()}`,
      time: currentTime,
      type,
      label: `${type.toUpperCase()} Effect`
    };
    soundEngine.playSfx(type);
    const updatedMarkers = [...currentClip.sfxMarkers, newMarker].sort((a, b) => a.time - b.time);
    updateClipField('sfxMarkers', updatedMarkers);
  };

  const handleRemoveSfx = (id: string | number) => {
    const updated = currentClip.sfxMarkers.filter(m => m.id !== id);
    updateClipField('sfxMarkers', updated);
  };

  const handleAddEmojiOverlay = () => {
    const newOverlay: OverlayItem = {
      id: `ov-${Date.now()}`,
      type: 'emoji',
      content: newEmoji,
      x: overlayX,
      y: overlayY,
      startTime: currentTime,
      duration: overlayDuration
    };
    const updated = [...currentClip.overlays, newOverlay];
    updateClipField('overlays', updated);
    soundEngine.playSfx('pop');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newOverlay: OverlayItem = {
            id: `ov-img-${Date.now()}`,
            type: 'image',
            content: reader.result,
            x: 50,
            y: 50,
            startTime: currentTime,
            duration: 4
          };
          updateClipField('overlays', [...currentClip.overlays, newOverlay]);
          soundEngine.playSfx('ding');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveOverlay = (id: string | number) => {
    updateClipField('overlays', currentClip.overlays.filter(o => o.id !== id));
  };

  const handleGenerateAiCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const newCaption = await GeminiService.generateViralCaption(currentClip, captionPlatform);
      updateClipField('caption', newCaption);
      showAlert('AI สร้างแคปชั่นสำเร็จ', `สร้างแคปชั่นและแฮชแท็กใหม่สำหรับ ${captionPlatform} เรียบร้อยแล้ว!`, 'sparkles');
    } catch {
      showAlert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ Gemini ได้ในขณะนี้', 'alert-triangle');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleFastPreview = () => {
    setCurrentTime(0);
    setIsFastPreviewing(true);
    setIsPlaying(true);
    showAlert('พรีวิวเร็ว 10 วินาที', 'กำลังเล่นตัวอย่าง 10 วินาทีแรกพร้อมซับไตเติล ดนตรี และเอฟเฟกต์ SFX แบบสมบูรณ์', 'play');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col">
      {/* Top Studio Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#27272a]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] rounded-xl text-zinc-300 transition-colors"
            title="กลับสู่แดชบอร์ด"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Clip Studio Pro (คลิป #{currentClip.id})</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5B800]/15 border border-[#F5B800]/30 text-[#F5B800] text-xs font-bold flex items-center space-x-1">
                <Flame className="w-3 h-3 fill-[#F5B800]" />
                <span>{currentClip.viralScore}/100</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-1">{currentClip.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleFastPreview}
            className="px-4 py-2.5 bg-[#121216] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border border-[#27272a]"
          >
            <Play className="w-3.5 h-3.5 text-[#F5B800] fill-[#F5B800]" />
            <span>พรีวิวแบบเร็ว (10s)</span>
          </button>

          <button
            onClick={() => {
              onUpdateClip(currentClip);
              showAlert('บันทึกสำเร็จ', 'อัปเดตการตั้งค่าซับไตเติล เอฟเฟกต์ และไทม์ไลน์เรียบร้อยแล้ว', 'check');
            }}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-zinc-300" />
            <span>บันทึกการแก้ไข</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-bold rounded-xl text-xs shadow-lg shadow-[#F5B800]/20 flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>เรนเดอร์ & ส่งออก</span>
          </button>
        </div>
      </div>

      {/* Main Studio Content: Preview & Multi-track vs Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column (Canvas Preview & Multi-track Timeline) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* 9:16 Canvas Viewport */}
          <div className="bg-[#09090b] rounded-3xl border-2 border-[#27272a] p-4 flex flex-col items-center justify-center relative shadow-2xl">
            <CanvasVideoPlayer
              clip={currentClip}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeUpdate={(t) => {
                if (t >= duration) {
                  setIsPlaying(false);
                  setCurrentTime(0);
                } else {
                  setCurrentTime(t);
                }
              }}
              width={340}
              height={600}
              videoSourceUrl={currentClip.videoSourceUrl}
              onToggleAudioMute={() => {
                updateClipField('isOriginalAudioMuted', !currentClip.isOriginalAudioMuted);
              }}
              onToggleFramingMode={(explicitMode) => {
                const currentMode = currentClip.visualFx?.framingMode || (currentClip.visualFx?.activeSpeakerTracking ? 'speaker_track' : 'fit');
                const nextMode = explicitMode || (currentMode === 'speaker_track' ? 'fit' : (currentMode === 'fit' ? 'fill' : 'speaker_track'));
                updateClipField('visualFx', {
                  ...currentClip.visualFx,
                  framingMode: nextMode,
                  activeSpeakerTracking: nextMode === 'speaker_track'
                });
              }}
              onToggleTrackingBox={() => {
                const curVal = currentClip.visualFx?.showTrackingBox ?? true;
                updateClipField('visualFx', {
                  ...currentClip.visualFx,
                  showTrackingBox: !curVal
                });
              }}
              onToggleFramerate={() => {
                const curFps = currentClip.visualFx?.targetFramerate ?? 60;
                const nextFps = curFps === 60 ? 30 : 60;
                updateClipField('visualFx', {
                  ...currentClip.visualFx,
                  targetFramerate: nextFps
                });
                showAlert(
                  `ปรับเฟรมเรตเป็น ${nextFps} FPS`,
                  nextFps === 60 ? 'โหมด 60 FPS ทำงานเพื่อความลื่นไหลระดับภาพยนตร์' : 'โหมด 30 FPS ทำงานเพื่อประหยัดพลังงาน',
                  'zap'
                );
              }}
              onToggleClarity={() => {
                const curClarity = currentClip.visualFx?.clarityFilter ?? true;
                updateClipField('visualFx', {
                  ...currentClip.visualFx,
                  clarityFilter: !curClarity
                });
                showAlert(
                  !curClarity ? 'เปิดตัวกรองความคมชัด HD' : 'ปิดตัวกรองความคมชัด HD',
                  !curClarity ? 'เพิ่มความคมชัดระดับโปร 1080p พร้อม Unsharp Mask' : 'แสดงผลความคมชัดต้นฉบับปกติ',
                  'sparkles'
                );
              }}
              onToggleStableLock={() => {
                const curLock = currentClip.visualFx?.stableFaceLock ?? true;
                updateClipField('visualFx', {
                  ...currentClip.visualFx,
                  stableFaceLock: !curLock
                });
                showAlert(
                  !curLock ? 'เปิดระบบล็อกตำแหน่งใบหน้าให้นิ่ง' : 'ปิดระบบล็อกตำแหน่งใบหน้านิ่ง',
                  !curLock ? 'กล้องจะล็อกตำแหน่งนิ่งกึ่งกลาง ไม่เลื่อนตามการขยับตัวเล็กๆ' : 'กล้องจะแพนตามตำแหน่งแบบ Real-time',
                  'target'
                );
              }}
            />

            {/* Play/Pause center overlay button */}
            <div className="absolute inset-x-0 bottom-8 flex justify-center items-center pointer-events-none">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-tr from-[#F5B800] to-[#FFF3C4] text-black flex items-center justify-center shadow-2xl shadow-[#F5B800]/40 hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
              </button>
            </div>

            {/* Time Indicator pill */}
            <div className="absolute top-6 left-6 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 text-[11px] font-mono text-zinc-300">
              00:{Math.floor(currentTime).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)} / 00:{Math.floor(duration).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Multi-track Timeline with SFX markers & Trimming */}
          <MultiTrackTimeline
            clip={currentClip}
            currentTime={currentTime}
            onSeek={handleSeek}
            onAddSfx={handleAddSfx}
            onRemoveSfx={handleRemoveSfx}
            trimStart={currentClip.secondsStart}
            trimEnd={currentClip.secondsEnd}
            onTrimChange={(start, end) => {
              const updated = {
                ...currentClip,
                secondsStart: start,
                secondsEnd: end,
                start: `${Math.floor(start / 60).toString().padStart(2, '0')}:${(start % 60).toString().padStart(2, '0')}`,
                end: `${Math.floor(end / 60).toString().padStart(2, '0')}:${(end % 60).toString().padStart(2, '0')}`
              };
              setCurrentClip(updated);
              onUpdateClip(updated);
            }}
          />
        </div>

        {/* Right Column: Customization Tabs (Subtitles, FX, Audio, Overlays, Captions) */}
        <div className="lg:col-span-5 bg-[#121216] border border-[#27272a] rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            {/* Tabs Navigation */}
            <div className="flex items-center space-x-1.5 p-1 bg-[#09090b] rounded-2xl border border-[#27272a] mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pacing')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'pacing'
                    ? 'bg-[#F5B800] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>ปรับเวลา & สาระสำคัญ</span>
              </button>

              <button
                onClick={() => setActiveTab('subtitles')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'subtitles'
                    ? 'bg-[#F5B800] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Subtitles className="w-3.5 h-3.5" />
                <span>ซับไตเติล</span>
              </button>

              <button
                onClick={() => setActiveTab('visual_fx')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'visual_fx'
                    ? 'bg-[#F5B800] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>ตัดสลับ & FX</span>
              </button>

              <button
                onClick={() => setActiveTab('audio_sfx')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'audio_sfx'
                    ? 'bg-[#F5B800] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>เสียง / SFX</span>
              </button>

              <button
                onClick={() => setActiveTab('overlays')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'overlays'
                    ? 'bg-[#F5B800] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>สติ๊กเกอร์</span>
              </button>

              <button
                onClick={() => setActiveTab('caption')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                  activeTab === 'caption'
                    ? 'bg-[#F5B800] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>แคปชั่น AI</span>
              </button>
            </div>

            {/* TAB 0: CONTENT-AWARE DURATION & PACING (ระบบปรับระยะเวลาคลิปตามสาระสำคัญ) */}
            {activeTab === 'pacing' && (
              <div className="space-y-5">
                {/* Header Feature Overview Card */}
                <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-2xl space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-xl bg-[#F5B800]/15 text-[#F5B800]">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>ระบบปรับระยะเวลาตามสาระสำคัญ (Content-Aware Pacing)</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#F5B800] text-black">
                            AI SPEECH
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          วิเคราะห์บทพูดและคีย์เวิร์ดเพื่อขยายหรือย่นย่อจังหวะเวลาของเนื้อหาสำคัญ
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core Insight Duration & Ratio Progress Meter */}
                  <div className="p-3.5 bg-[#121216] border border-[#27272a] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">สัดส่วนสาระสำคัญในคลิปนี้:</span>
                      <span className="text-[#F5B800] font-mono font-bold">
                        {coreInsightRatio}% ({coreInsightDuration.toFixed(1)}s / {duration.toFixed(1)}s)
                      </span>
                    </div>

                    {/* Visual Segment Bar */}
                    <div className="w-full bg-[#09090b] h-3 rounded-full overflow-hidden flex border border-[#27272a]">
                      <div
                        className="bg-gradient-to-r from-[#F5B800] to-[#E5A800] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, coreInsightRatio)}%` }}
                        title={`สาระสำคัญ ${coreInsightRatio}%`}
                      />
                      <div
                        className="bg-zinc-700 h-full flex-1"
                        title="ช่วงเกริ่นนำ / บริบทเสริม"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono pt-0.5">
                      <span className="text-[#F5B800]">● สาระสำคัญ {coreInsightRatio}%</span>
                      <span>● บริบทเสริม {100 - coreInsightRatio}%</span>
                    </div>
                  </div>

                  {/* 3 Quick Content-Aware Pacing Presets */}
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                      <span>จังหวะเวลาสำเร็จรูปตามสาระสำคัญ (Pacing Presets):</span>
                      <span className="text-[10px] text-zinc-500">คลิกเดียวเพื่อปรับความยาว</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyPacingPreset('punchy')}
                        className="p-2.5 rounded-xl text-left border bg-[#121216] border-[#27272a] hover:border-[#F5B800]/50 hover:bg-[#F5B800]/10 transition-all group"
                      >
                        <div className="font-bold text-white text-xs mb-0.5 flex items-center justify-between">
                          <span>⚡️ กระชับเร่งด่วน</span>
                          <span className="text-[9px] text-[#F5B800] font-mono">15s</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                          ตัดช่วงเชื่อม ย่นย่อให้เหลือเฉพาะประเด็นเด็ด เหมาะกับ TikTok
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPacingPreset('balanced')}
                        className="p-2.5 rounded-xl text-left border bg-[#121216] border-[#F5B800]/40 text-[#FFF3C4] shadow-sm hover:bg-[#F5B800]/20 transition-all group"
                      >
                        <div className="font-bold text-white text-xs mb-0.5 flex items-center justify-between">
                          <span>🎯 มาตรฐานสมดุล</span>
                          <span className="text-[9px] text-[#F5B800] font-mono">30s</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                          จังหวะพอเหมาะ ให้ผู้ฟังซึมซับสาระสำคัญได้ครบถ้วน
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPacingPreset('in_depth')}
                        className="p-2.5 rounded-xl text-left border bg-[#121216] border-[#27272a] hover:border-[#F5B800]/50 hover:bg-[#F5B800]/10 transition-all group"
                      >
                        <div className="font-bold text-white text-xs mb-0.5 flex items-center justify-between">
                          <span>📚 เจาะลึกเนื้อหา</span>
                          <span className="text-[9px] text-[#F5B800] font-mono">50s+</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                          ขยายช่วงอธิบายและตัวอย่าง ให้เข้าใจลึกซึ้ง เหมาะกับ Shorts/Reels
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Global Duration Fast Adjusters */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-2">
                      ปรับเพิ่ม / ลดระยะเวลาของคลิปโดยรวม (Quick Duration Adjusters):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustDuration(3, 'ขยายช่วงสาระสำคัญเพิ่มขึ้น')}
                        className="p-2 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] hover:border-[#F5B800]/50 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-1 transition-all"
                      >
                        <span className="text-[#F5B800] font-bold">+3s</span>
                        <span>ขยายไฮไลต์</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdjustDuration(5, 'ขยายเวลาให้ครอบคลุมการอธิบาย')}
                        className="p-2 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] hover:border-[#F5B800]/50 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-1 transition-all"
                      >
                        <span className="text-[#F5B800] font-bold">+5s</span>
                        <span>ขยายช่วงพูด</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdjustDuration(-2, 'ตัดกระชับช่วงที่เยิ่นเย้อ')}
                        className="p-2 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] hover:border-red-400/50 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-1 transition-all"
                      >
                        <span className="text-red-400 font-bold">-2s</span>
                        <span>ตัดกระชับ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdjustDuration(-5, 'ย่นย่อจังหวะให้ฉับไวระดับไวรัล')}
                        className="p-2 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] hover:border-red-400/50 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-1 transition-all"
                      >
                        <span className="text-red-400 font-bold">-5s</span>
                        <span>ย่อให้ฉับไว</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Speech & Keyword Content Insights List */}
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-300 mb-2.5">
                    <span className="font-semibold flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#F5B800]" />
                      <span>บทวิเคราะห์สาระสำคัญ & คีย์เวิร์ดรายช่วง ({contentInsights.length} ช่วง):</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">คลิกเพื่อขยายเวลาหรือพรีวิว</span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {contentInsights.map((segment) => {
                      const isCurrentlyActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
                      return (
                        <div
                          key={segment.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isCurrentlyActive
                              ? 'bg-[#F5B800]/15 border-[#F5B800] shadow-md'
                              : segment.isCoreHighlight
                              ? 'bg-[#09090b] border-amber-500/30 hover:border-amber-500/60'
                              : 'bg-[#09090b] border-[#27272a] hover:border-zinc-600'
                          }`}
                        >
                          {/* Segment Header */}
                          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                segment.category === 'core_insight'
                                  ? 'bg-[#F5B800] text-black'
                                  : segment.category === 'hook'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {segment.category === 'core_insight' && '🌟 สาระสำคัญหลัก'}
                                {segment.category === 'hook' && '⚡️ จุด Hook เปิดประเด็น'}
                                {segment.category === 'conclusion' && '💡 บทสรุปคุณค่า'}
                                {segment.category === 'context' && '📖 บริบทขยายความ'}
                                {segment.category === 'punchline' && '💥 จุดหมัดฮุก'}
                              </span>

                              <span className="text-[10px] text-zinc-400 font-mono">
                                00:{Math.floor(segment.startTime).toString().padStart(2, '0')} - 00:{Math.floor(segment.endTime).toString().padStart(2, '0')} ({(segment.endTime - segment.startTime).toFixed(1)}s)
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-amber-400 font-mono">
                                🔥 {segment.importanceScore}/100
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleCoreHighlight(segment.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                                  segment.isCoreHighlight
                                    ? 'bg-[#F5B800]/20 border-[#F5B800] text-[#FFF3C4]'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                                }`}
                                title="สลับสถานะสาระสำคัญหลัก"
                              >
                                {segment.isCoreHighlight ? '★ สาระสำคัญ' : '☆ บริบท'}
                              </button>
                            </div>
                          </div>

                          {/* Speech Text */}
                          <p className="text-xs text-white leading-relaxed mb-2">
                            "{segment.text}"
                          </p>

                          {/* Detected Keywords */}
                          {segment.keywords && segment.keywords.length > 0 && (
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-2.5">
                              <span className="text-[10px] text-zinc-500">คีย์เวิร์ด:</span>
                              {segment.keywords.map((kw, kwIdx) => (
                                <span
                                  key={kwIdx}
                                  className="px-1.5 py-0.2 rounded bg-zinc-800/80 border border-zinc-700 text-[10px] text-[#FFF3C4]"
                                >
                                  {kw.startsWith('#') ? kw : `#${kw}`}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons for this Segment */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#27272a] text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentTime(segment.startTime);
                                setIsPlaying(true);
                                soundEngine.playSfx('whoosh');
                              }}
                              className="text-[11px] text-[#F5B800] hover:underline flex items-center space-x-1"
                            >
                              <Play className="w-3 h-3 fill-[#F5B800]" />
                              <span>เล่นพรีวิวช่วงนี้</span>
                            </button>

                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleAdjustDuration(3, `ขยายเวลาช่วง "${segment.text.substring(0, 15)}..."`)}
                                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-[#F5B800] hover:text-black text-[10px] font-bold text-zinc-300 transition-all flex items-center space-x-0.5"
                                title="ขยายเวลาของช่วงนี้อีก 3 วินาที เพื่อให้ผู้ชมซึมซับสาระสำคัญ"
                              >
                                <span>➕ ขยาย +3s</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustDuration(-2, `ตัดกระชับช่วง "${segment.text.substring(0, 15)}..."`)}
                                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-red-500 hover:text-white text-[10px] font-bold text-zinc-300 transition-all flex items-center space-x-0.5"
                                title="ย่นย่อช่วงนี้ลง 2 วินาทีให้กระชับ"
                              >
                                <span>➖ กระชับ -2s</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: SUBTITLE ENGINE */}
            {activeTab === 'subtitles' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    เลือกสไตล์ซับไตเติล (ต่อเนื่องตลอดคลิป)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {([
                      'Karaoke Pop',
                      'Bold Impact',
                      'Minimal',
                      'Emphasis Highlight',
                      'Dynamic Hook Title'
                    ] as SubtitleStyle[]).map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateClipField('subtitleStyle', style)}
                        className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                          currentClip.subtitleStyle === style
                            ? 'bg-[#F5B800]/15 border-[#F5B800] text-white shadow-sm'
                            : 'bg-[#09090b] border-[#27272a] text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <div className="font-bold text-white text-xs">{style}</div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {style === 'Karaoke Pop' && 'เด้งไฮไลต์สีทองตามคำ'}
                          {style === 'Bold Impact' && 'ขอบดำหนา ตัวอักษรใหญ่'}
                          {style === 'Minimal' && 'คลีน มินิมอล สุภาพ'}
                          {style === 'Emphasis Highlight' && 'เน้นคำสำคัญอัตโนมัติ'}
                          {style === 'Dynamic Hook Title' && 'แบนเนอร์ Hook บนจอ'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font and Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">ฟอนต์ภาษาไทย</label>
                    <select
                      value={currentClip.font}
                      onChange={(e) => updateClipField('font', e.target.value as 'Kanit' | 'Prompt' | 'Sarabun')}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white text-xs"
                    >
                      <option value="Kanit">Kanit (โมเดิร์น ยอดนิยม)</option>
                      <option value="Prompt">Prompt (คมชัด อ่านง่าย)</option>
                      <option value="Sarabun">Sarabun (ทางการ สุภาพ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      ขนาดตัวอักษร: {currentClip.fontSize || 22}px (ขนาดปลอดภัย Safe Zone 9:16)
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="28"
                      value={currentClip.fontSize || 22}
                      onChange={(e) => updateClipField('fontSize', parseInt(e.target.value))}
                      className="w-full accent-[#F5B800]"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                      <span>16px (กะทัดรัด)</span>
                      <span>22px (แนะนำ)</span>
                      <span>28px (เต็มพอดี)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">สีไฮไลต์คำพูด</label>
                    <div className="flex space-x-2">
                      {['#F5B800', '#FFF3C4', '#38BDF8', '#4ADE80', '#F43F5E', '#FFFFFF'].map(c => (
                        <button
                          key={c}
                          onClick={() => updateClipField('highlightColor', c)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            currentClip.highlightColor === c ? 'scale-125 border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">ตำแหน่งซับไตเติล</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['top', 'middle', 'bottom'] as const).map(pos => (
                        <button
                          key={pos}
                          onClick={() => updateClipField('position', pos)}
                          className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize border ${
                            currentClip.position === pos
                              ? 'bg-[#F5B800] text-black border-[#F5B800]'
                              : 'bg-[#09090b] border-[#27272a] text-zinc-400'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Words per line */}
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                    <span>จำนวนคำต่อบรรทัด: {currentClip.wordsPerLine || 3} คำ</span>
                    <span className="text-zinc-500">จำกัดเพื่อป้องกันการล้นขอบจอ</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="4"
                    value={currentClip.wordsPerLine || 3}
                    onChange={(e) => updateClipField('wordsPerLine', parseInt(e.target.value))}
                    className="w-full accent-[#F5B800]"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                    <span>2 คำ (สั้นกระชับ)</span>
                    <span>3 คำ (แนะนำ)</span>
                    <span>4 คำ (พอดีจอ)</span>
                  </div>
                </div>

                {/* Editable Transcript Words */}
                <div>
                  <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
                    <span>ข้อความถอดเสียง (คลิกเพื่อสลับคำเน้นสี / แก้ไข):</span>
                    <span className="text-[10px] text-[#F5B800]">สีทอง = เน้นคำสำคัญ</span>
                  </div>
                  <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                    {currentClip.transcriptWords.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const updatedWords = [...currentClip.transcriptWords];
                          updatedWords[idx] = { ...word, isEmphasis: !word.isEmphasis };
                          updateClipField('transcriptWords', updatedWords);
                          soundEngine.playSfx('pop');
                        }}
                        className={`px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                          word.isEmphasis
                            ? 'bg-[#F5B800]/25 border-[#F5B800] text-[#FFF3C4]'
                            : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {word.word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL FX */}
            {activeTab === 'visual_fx' && (
              <div className="space-y-5">
                {/* AUTO-CUT TO ACTIVE SPEAKER (NO ZOOM / NO JITTER) */}
                <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-2xl space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-[#F5B800]/15 text-[#F5B800]">
                        <Target className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>Auto-Cut to Active Speaker (ตัดสลับผู้พูดอัตโนมัติ)</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F5B800] text-black">
                            DIRECT CUT
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          ใครพูดตัดภาพไปที่คนนั้นทันที นิ่งสนิท 100% ไม่มีการซูมหรือแพนขยับไปมา
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const isTracking = (currentClip.visualFx?.framingMode === 'speaker_track') || Boolean(currentClip.visualFx?.activeSpeakerTracking);
                        const nextMode = isTracking ? 'fit' : 'speaker_track';
                        updateClipField('visualFx', {
                          ...currentClip.visualFx,
                          framingMode: nextMode,
                          activeSpeakerTracking: !isTracking
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        (currentClip.visualFx?.framingMode === 'speaker_track') || Boolean(currentClip.visualFx?.activeSpeakerTracking)
                          ? 'bg-[#F5B800] text-black border-[#F5B800] shadow-md'
                          : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {(currentClip.visualFx?.framingMode === 'speaker_track') || Boolean(currentClip.visualFx?.activeSpeakerTracking)
                        ? 'เปิดใช้งานอยู่ (Direct Cut)'
                        : 'ปิด (Off)'}
                    </button>
                  </div>

                  {/* 3 Framing Modes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-2">
                      โหมดการจัดกรอบภาพ (Framing Mode)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => updateClipField('visualFx', {
                          ...currentClip.visualFx,
                          framingMode: 'speaker_track',
                          activeSpeakerTracking: true
                        })}
                        className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                          (currentClip.visualFx?.framingMode === 'speaker_track') || (!currentClip.visualFx?.framingMode && currentClip.visualFx?.activeSpeakerTracking)
                            ? 'bg-[#F5B800]/20 border-[#F5B800] text-[#FFF3C4] shadow-md'
                            : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-white text-xs mb-0.5 flex items-center space-x-1">
                          <Target className="w-3.5 h-3.5 text-[#F5B800]" />
                          <span>🎬 Auto Direct Cut</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          ตัดสลับไปยังคนพูดทันที นิ่งสนิท 100% ไม่ซูม/ไม่แพน
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateClipField('visualFx', {
                          ...currentClip.visualFx,
                          framingMode: 'fit',
                          activeSpeakerTracking: false
                        })}
                        className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                          currentClip.visualFx?.framingMode === 'fit'
                            ? 'bg-[#F5B800]/20 border-[#F5B800] text-[#FFF3C4] shadow-md'
                            : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-white text-xs mb-0.5 flex items-center space-x-1">
                          <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Fit to Screen</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          เห็นครบ 100% ทั้งคนพูดและฉากหลัง พร้อมพื้นหลังเบลอ
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateClipField('visualFx', {
                          ...currentClip.visualFx,
                          framingMode: 'fill',
                          activeSpeakerTracking: false
                        })}
                        className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                          currentClip.visualFx?.framingMode === 'fill'
                            ? 'bg-[#F5B800]/20 border-[#F5B800] text-[#FFF3C4] shadow-md'
                            : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-white text-xs mb-0.5 flex items-center space-x-1">
                          <Crop className="w-3.5 h-3.5 text-blue-400" />
                          <span>9:16 Full Crop</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          ตัดเต็มจอ 9:16 กึ่งกลาง นิ่งสนิทไม่มีการเคลื่อนกล้อง
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Direct Cut Stationary Status Notice */}
                  <div className="p-3 bg-[#121216] border border-[#27272a] rounded-xl flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>สถานะมุมกล้อง: ล็อกภาพนิ่งสนิท 100% (Direct Cut Active)</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        ยกเลิกการซูมและแพนกล้องขยับไปมาแล้ว ภาพจะตัดตรงไปยังตำแหน่งผู้พูดและนิ่งสนิทตลอดช่วงพูด
                      </div>
                    </div>
                  </div>

                  {/* Multi-speaker List & Quick Direct Cut Previews */}
                  {currentClip.speakers && currentClip.speakers.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                        <span>ผู้พูดที่ตรวจพบในคลิปนี้ ({currentClip.speakers.length} คน):</span>
                        <span className="text-[10px] text-zinc-500">คลิกเพื่อทดสอบตัดภาพสลับไปยังคนนั้น</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {currentClip.speakers.map((spk, idx) => {
                          const isCurrentlySpeaking = currentTime >= spk.startTime && currentTime <= spk.endTime;
                          const isHost = spk.role === 'host';
                          return (
                            <div
                              key={spk.id || idx}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                                isCurrentlySpeaking
                                  ? isHost
                                    ? 'bg-[#F5B800]/15 border-[#F5B800] text-white shadow-sm'
                                    : 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-sm'
                                  : 'bg-[#121216] border-[#27272a] text-zinc-400'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <span className="text-sm">
                                  {isHost ? '🎙️' : '👤'}
                                </span>
                                <div className="truncate">
                                  <div className="font-bold text-white text-[11px] truncate flex items-center space-x-1.5">
                                    <span>{spk.speakerName}</span>
                                    {isCurrentlySpeaking && (
                                      <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#F5B800] text-black">
                                        SPEAKING
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[9px] text-zinc-500 font-mono">
                                    {spk.startTime}s - {spk.endTime}s • DIRECT CUT
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentTime(spk.startTime);
                                  setIsPlaying(true);
                                  soundEngine.playSfx('whoosh');
                                  showAlert(
                                    `ตัดภาพสลับไปยัง: ${spk.speakerName}`,
                                    `กล้องตัดสลับ (Direct Cut) ไปหาผู้พูดทันทีโดยไม่มีการซูมหรือสั่นไหว`,
                                    'target'
                                  );
                                }}
                                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-[#F5B800] hover:text-black border border-zinc-700 text-[10px] font-bold transition-all whitespace-nowrap ml-2"
                              >
                                ตัดภาพช่วงนี้
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Face Detection Box Toggle */}
                  <div
                    onClick={() => {
                      const curVal = currentClip.visualFx?.showTrackingBox ?? true;
                      updateClipField('visualFx', {
                        ...currentClip.visualFx,
                        showTrackingBox: !curVal
                      });
                    }}
                    className="flex items-center justify-between p-3 bg-[#121216] border border-[#27272a] rounded-xl cursor-pointer hover:border-[#F5B800]/40 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Scan className="w-4 h-4 text-[#F5B800]" />
                      <div>
                        <div className="text-xs font-bold text-white">แสดงกรอบตรวจจับใบหน้า AI (Face HUD Reticle)</div>
                        <div className="text-[10px] text-zinc-400">แสดงกรอบระบุผู้พูดที่กำลัง Active และสถานะ Direct Cut นิ่งสนิท</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentClip.visualFx?.showTrackingBox ?? true}
                      readOnly
                      className="w-4 h-4 accent-[#F5B800] rounded"
                    />
                  </div>
                </div>

                {/* Constant Framerate 60 FPS / 30 FPS Setting */}
                <div className="p-3.5 bg-[#09090b] border border-[#27272a] rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-[#F5B800]/15 text-[#F5B800]">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>มาตรฐานเฟรมเรตวิดีโอ (Video Fluidity & FPS)</span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-[#F5B800]/20 text-[#FFF3C4] border border-[#F5B800]/30 font-mono">
                            {(currentClip.visualFx?.targetFramerate ?? 60)} FPS CONSTANT
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          คงเฟรมเรตคงที่เพื่อความลื่นไหลต่อเนื่อง ไร้อาการสะดุด
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateClipField('visualFx', {
                        ...currentClip.visualFx,
                        targetFramerate: 60
                      })}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        (currentClip.visualFx?.targetFramerate ?? 60) === 60
                          ? 'bg-[#F5B800]/20 border-[#F5B800] text-white shadow-sm'
                          : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>⚡ 60 FPS (แนะนำ)</span>
                        <span className="text-[9px] text-[#F5B800] font-mono">Ultra Smooth</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        ลื่นไหลสูงสุดแบบ 60 fps สำหรับ Short-form และ Reels
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateClipField('visualFx', {
                        ...currentClip.visualFx,
                        targetFramerate: 30
                      })}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        currentClip.visualFx?.targetFramerate === 30
                          ? 'bg-[#F5B800]/20 border-[#F5B800] text-white shadow-sm'
                          : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>⚡ 30 FPS</span>
                        <span className="text-[9px] text-zinc-500 font-mono">Standard</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        มาตรฐานวิดีโอทั่วไป ประหยัดพลังงาน
                      </div>
                    </button>
                  </div>
                </div>



                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    เอฟเฟกต์ภาพไดนามิก (Visual Effects)
                  </label>
                  <div className="space-y-2.5">
                    {[
                      {
                        key: 'autoReframe',
                        title: 'Auto 9:16 Reframe & Face Tracking',
                        desc: 'ล็อกใบหน้าผู้พูดให้อยู่กึ่งกลางจอแนวตั้งอัตโนมัติ'
                      },
                      {
                        key: 'zoomPunch',
                        title: 'Zoom Punch-in (ซูมกระตุก 108%)',
                        desc: 'ซูมเร็วชั่วขณะเมื่อถึงคำสำคัญหรือจุดหักมุม'
                      },
                      {
                        key: 'slowZoom',
                        title: 'Slow Continuous Zoom (100% -> 108%)',
                        desc: 'ค่อยๆ ซูมเข้าอย่างช้าๆ เพิ่มความน่าติดตาม'
                      },
                      {
                        key: 'flashShake',
                        title: 'Flash & Camera Shake (สั่นกระตุก + แสงวาบ)',
                        desc: 'เพิ่มความตื่นเต้นในจังหวะเผยความลับหรือจุดพีค'
                      }
                    ].map(fx => (
                      <div
                        key={fx.key}
                        onClick={() => {
                          const updatedFx = {
                            ...currentClip.visualFx,
                            [fx.key]: !currentClip.visualFx[fx.key as keyof typeof currentClip.visualFx]
                          };
                          updateClipField('visualFx', updatedFx);
                        }}
                        className="flex items-center justify-between p-3 bg-[#09090b] border border-[#27272a] rounded-xl cursor-pointer hover:border-[#F5B800]/40 transition-all"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{fx.title}</div>
                          <div className="text-[11px] text-zinc-500">{fx.desc}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(currentClip.visualFx[fx.key as keyof typeof currentClip.visualFx])}
                          readOnly
                          className="w-4 h-4 accent-[#F5B800] rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Grading Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">การเกรดสีภาพ (Mood Color Grading)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'natural', label: 'Natural (ต้นฉบับ)' },
                      { id: 'cinematic', label: 'Cinematic (คอนทราสต์สูง)' },
                      { id: 'warm', label: 'Warm Cozy (โทนอุ่น)' },
                      { id: 'cyberpunk', label: 'Cyberpunk (นีออน)' },
                      { id: 'bw', label: 'Dramatic B&W (ขาวดำ)' }
                    ].map(cg => (
                      <button
                        key={cg.id}
                        onClick={() => {
                          updateClipField('visualFx', { ...currentClip.visualFx, colorGrade: cg.id as VisualFxColorGrade });
                        }}
                        className={`p-2 rounded-xl text-left border text-xs font-medium transition-all ${
                          currentClip.visualFx?.colorGrade === cg.id
                            ? 'bg-[#F5B800]/20 border-[#F5B800] text-white'
                            : 'bg-[#09090b] border-[#27272a] text-zinc-400'
                        }`}
                      >
                        {cg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FX Intensity */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">ระดับความเข้มข้นเอฟเฟกต์ (Intensity)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'medium', 'full'] as VisualFxIntensity[]).map(level => (
                      <button
                        key={level}
                        onClick={() => {
                          updateClipField('visualFx', { ...currentClip.visualFx, intensity: level });
                        }}
                        className={`py-2 rounded-xl text-xs font-semibold capitalize border ${
                          currentClip.visualFx?.intensity === level
                            ? 'bg-[#F5B800] text-black border-[#F5B800]'
                            : 'bg-[#09090b] border-[#27272a] text-zinc-400'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO, BGM & SFX */}
            {activeTab === 'audio_sfx' && (
              <div className="space-y-5">
                {/* Original Audio Track Setting */}
                <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>แทร็กเสียงต้นฉบับ (Original Audio Track)</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        บังคับดึงและเล่นเสียงพูดต้นฉบับควบคู่กับวิดีโอเสมอ
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateClipField('isOriginalAudioMuted', !currentClip.isOriginalAudioMuted)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        currentClip.isOriginalAudioMuted
                          ? 'bg-red-500/15 border-red-500/30 text-red-300'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {currentClip.isOriginalAudioMuted ? 'ปิดเสียง (Muted)' : 'เปิดเสียง (Unmuted)'}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>ความดังเสียงต้นฉบับ: {Math.round((currentClip.originalAudioVolume ?? 0.95) * 100)}%</span>
                      <span className="text-zinc-500">แนะนำ 90-100%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round((currentClip.originalAudioVolume ?? 0.95) * 100)}
                      onChange={(e) => updateClipField('originalAudioVolume', parseInt(e.target.value) / 100)}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">เพลงประกอบ BGM (ลิขสิทธิ์ฟรี)</label>
                  <select
                    value={currentClip.bgm}
                    onChange={(e) => updateClipField('bgm', e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-white text-xs mb-3"
                  >
                    <option>Lo-Fi Chill Beats (เหมาะกับพอดแคสต์/พูดคุย)</option>
                    <option>Upbeat Energetic (กระฉับกระเฉง สนุกสนาน)</option>
                    <option>Emotional Piano (ซึ้ง กินใจ ดราม่า)</option>
                    <option>Inspiring Ambient (สร้างแรงบันดาลใจ)</option>
                    <option>Cyberpunk Bass (ลุ้นระทึก ทันสมัย)</option>
                    <option>Dramatic Tension (ตึงเครียด ชวนติดตาม)</option>
                  </select>
                </div>

                {/* Audio Ducking Controls */}
                <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center space-x-1.5">
                      <Music className="w-4 h-4 text-blue-400" />
                      <span>Audio Ducking อัตโนมัติ</span>
                    </span>
                    <span className="text-[#F5B800] font-mono font-bold">ลดเหลือ {currentClip.duckingLevel}%</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    ลดความดังเพลง BGM อัตโนมัติเหลือ 12-18% เมื่อมีเสียงพูด และค่อยๆ เพิ่มขึ้นเมื่อเว้นช่วงพูด
                  </p>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    value={currentClip.duckingLevel}
                    onChange={(e) => updateClipField('duckingLevel', parseInt(e.target.value))}
                    className="w-full accent-[#F5B800]"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>10% (เงียบมาก)</span>
                    <span>15% (มาตรฐาน)</span>
                    <span>35% (เพลงเด่น)</span>
                  </div>
                </div>

                {/* SFX Engine Toggle & Sound Board */}
                <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Smart SFX Synchronization</div>
                      <div className="text-[11px] text-zinc-500">ฝังเสียงเอฟเฟกต์ตามคำพูด (±50ms)</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentClip.sfxEnabled}
                      onChange={(e) => updateClipField('sfxEnabled', e.target.checked)}
                      className="w-4 h-4 accent-[#F5B800] rounded"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#27272a]">
                    <span className="text-[11px] text-zinc-400 block mb-2">ทดสอบฟังเสียงเอฟเฟกต์:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['whoosh', 'pop', 'impact', 'rimshot', 'ding'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => soundEngine.playSfx(type)}
                          className="py-1.5 px-2 bg-zinc-800 hover:bg-[#F5B800] hover:text-black rounded-lg text-xs font-semibold capitalize text-zinc-300 transition-colors"
                        >
                          🔊 {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: OVERLAYS & STICKERS */}
            {activeTab === 'overlays' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">เพิ่มอีโมจิ / โลโก้ / สติ๊กเกอร์ Pop-up</label>
                  <div className="flex space-x-2 mb-3">
                    <select
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      className="bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white text-sm"
                    >
                      <option value="🔥">🔥 ไฟลุก (Viral)</option>
                      <option value="💡">💡 ไอเดีย (Idea)</option>
                      <option value="🤯">🤯 ตกใจ (Shock)</option>
                      <option value="🚀">🚀 พุ่งทะยาน (Growth)</option>
                      <option value="💰">💰 เงิน/กำไร (Money)</option>
                      <option value="👏">👏 ปรบมือ (Clap)</option>
                      <option value="📈">📈 กราฟพุ่ง (Trend)</option>
                      <option value="😂">😂 ขำฮา (Laugh)</option>
                    </select>

                    <button
                      onClick={handleAddEmojiOverlay}
                      className="flex-1 py-2 bg-[#F5B800] hover:bg-[#D49E00] text-black font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>วางอีโมจิที่วินาทีนี้</span>
                    </button>
                  </div>

                  {/* Upload custom sticker/logo */}
                  <label className="cursor-pointer py-2 px-3 bg-[#09090b] hover:bg-zinc-800 border border-dashed border-[#27272a] hover:border-[#F5B800]/50 rounded-xl text-xs text-zinc-300 flex items-center justify-center space-x-2 transition-all">
                    <Upload className="w-4 h-4 text-[#F5B800]" />
                    <span>หรืออัปโหลดสติ๊กเกอร์ / โลโก้ (PNG, SVG)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                {/* Overlays list */}
                <div>
                  <span className="text-xs font-semibold text-zinc-400 block mb-2">
                    รายการสติ๊กเกอร์บนคลิปนี้ ({currentClip.overlays.length}):
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentClip.overlays.map(ov => (
                      <div
                        key={ov.id}
                        className="flex items-center justify-between p-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{ov.type === 'image' ? '🖼' : ov.content}</span>
                          <div>
                            <div className="text-white font-medium">
                              {ov.type === 'image' ? 'รูปภาพสติ๊กเกอร์' : ov.content}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              แสดงตอน: 00:{Math.floor(ov.startTime).toString().padStart(2, '0')} (นาน {ov.duration}s)
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveOverlay(ov.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AI CAPTION GENERATOR */}
            {activeTab === 'caption' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">แคปชั่นและแฮชแท็กโซเชียล</label>
                  <div className="flex items-center space-x-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
                    {(['TikTok', 'Reels', 'Shorts'] as const).map(platform => (
                      <button
                        key={platform}
                        onClick={() => setCaptionPlatform(platform)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          captionPlatform === platform
                            ? 'bg-[#F5B800] text-black shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={6}
                    value={currentClip.caption}
                    onChange={(e) => updateClipField('caption', e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-2xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-[#F5B800]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleGenerateAiCaption}
                    disabled={isGeneratingCaption}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    {isGeneratingCaption ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F5B800]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#F5B800]" />
                    )}
                    <span>{isGeneratingCaption ? 'AI กำลังเขียนแคปชั่นใหม่...' : 'ให้ AI เขียนแคปชั่นใหม่'}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentClip.caption);
                      showAlert('คัดลอกสำเร็จ', 'คัดลอกแคปชั่นและแฮชแท็กไวรัลลงคลิปบอร์ดแล้ว พร้อมนำไปโพสต์ได้เลย!', 'check');
                    }}
                    className="px-4 py-2.5 bg-[#F5B800] hover:bg-[#D49E00] text-black rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอก</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Complete and Return Button */}
          <div className="pt-6 border-t border-[#27272a] mt-6">
            <button
              onClick={onBack}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4 text-[#F5B800]" />
              <span>เสร็จสิ้นและกลับสู่แดชบอร์ด</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        clip={currentClip}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
