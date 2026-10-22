export type Mood = 'serious' | 'funny' | 'exciting' | 'emotional' | 'inspiring';

export type SubtitleStyle = 
  | 'Karaoke Pop' 
  | 'Bold Impact' 
  | 'Minimal' 
  | 'Emphasis Highlight' 
  | 'Dynamic Hook Title';

export type VisualFxColorGrade = 'natural' | 'cinematic' | 'warm' | 'cyberpunk' | 'bw';
export type VisualFxIntensity = 'light' | 'medium' | 'full';

export interface KeyMoment {
  time: number;
  type: 'emphasis' | 'punchline' | 'reveal' | 'hook';
  text: string;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  isEmphasis?: boolean;
}

export interface OverlayItem {
  id: string | number;
  type: 'emoji' | 'text' | 'image';
  content: string; // emoji character, text content, or image data URL
  x: number; // 0-100%
  y: number; // 0-100%
  startTime: number; // seconds relative to clip start
  duration: number; // seconds
  scale?: number;
}

export interface SfxMarker {
  id: string | number;
  time: number; // seconds relative to clip start
  type: 'whoosh' | 'pop' | 'impact' | 'rimshot' | 'ding';
  label: string;
}

export interface ContentInsightSegment {
  id: string | number;
  text: string;
  startTime: number;
  endTime: number;
  importanceScore: number; // 0 - 100
  isCoreHighlight: boolean;
  keywords: string[];
  category: 'hook' | 'core_insight' | 'punchline' | 'context' | 'conclusion';
  pacingAdjustment?: number; // seconds added or reduced
}

export interface SpeakerDetection {
  id: string | number;
  speakerName: string;
  role: 'host' | 'guest' | 'speaker';
  faceBox: {
    x: number; // Normalized center X (0 to 1)
    y: number; // Normalized center Y (0 to 1)
    width: number;
    height: number;
  };
  startTime: number;
  endTime: number;
  shotType?: 'close-up' | 'medium' | 'wide';
}

export interface VisualFxConfig {
  autoReframe: boolean;
  framingMode?: 'fit' | 'fill' | 'speaker_track' | 'auto_cut'; // 'speaker_track' / 'auto_cut' = Direct Hard Cut to Active Speaker (Stationary / No Zoom)
  activeSpeakerTracking?: boolean;
  autoDirectCut?: boolean; // Instant hard cut on speaker change
  showTrackingBox?: boolean;
  trackingSmoothing?: 'cinematic' | 'balanced' | 'quick';
  stableFaceLock?: boolean; // 100% Rock-solid stationary frame
  deadZoneRadius?: number;
  targetFramerate?: 30 | 60; // Constant frame rate
  clarityFilter?: boolean;
  sharpeningLevel?: number;
  resolutionQuality?: 'standard' | 'hd' | 'ultra_hd';
  zoomPunch: boolean;
  slowZoom: boolean;
  flashShake: boolean;
  colorGrade: VisualFxColorGrade;
  intensity: VisualFxIntensity;
}

export interface Clip {
  id: number;
  start: string; // e.g. "03:15"
  end: string; // e.g. "04:22"
  secondsStart: number;
  secondsEnd: number;
  title: string;
  viralScore: number; // 0 - 100
  reason: string;
  mood: Mood;
  subtitleStyle: SubtitleStyle;
  bgm: string;
  bgmVolume: number; // 0 - 100
  duckingLevel: number; // e.g. 15 (%)
  sfxEnabled: boolean;
  sfxMarkers: SfxMarker[];
  visualFx: VisualFxConfig;
  caption: string;
  tags: string[];
  keyMoments: KeyMoment[];
  transcriptWords: TranscriptWord[];
  overlays: OverlayItem[];
  font: 'Kanit' | 'Prompt' | 'Sarabun';
  fontSize: number;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  position: 'top' | 'middle' | 'bottom';
  wordsPerLine: number;
  thumbnailUrl?: string;
  aspectRatio: '9:16' | '1:1';
  videoSourceUrl?: string;
  originalAudioVolume?: number; // 0 to 1
  isOriginalAudioMuted?: boolean;
  speakers?: SpeakerDetection[];
  contentInsights?: ContentInsightSegment[];
  pacingPreset?: 'punchy' | 'balanced' | 'in_depth';
}

export interface Project {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: 'youtube' | 'file';
  videoSourceUrl?: string;
  durationSeconds: number;
  formattedDuration: string;
  createdAt: string;
  clipsCount: number;
  clips: Clip[];
  thumbnail: string;
}
