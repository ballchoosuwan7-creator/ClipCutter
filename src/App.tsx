import React, { useState, useEffect } from 'react';
import { Clip, Project, Mood } from './types';
import { initialProjects, defaultClips } from './data/sampleClips';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { ProcessingPipeline } from './components/ProcessingPipeline';
import { ResultsDashboard } from './components/ResultsDashboard';
import { EditorStudio } from './components/EditorStudio';
import { ExportModal } from './components/ExportModal';
import { BatchExportModal } from './components/BatchExportModal';
import { soundEngine } from './services/soundEffects';
import { Scissors, AlertTriangle, CheckCircle2, Download, Info, Play, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'processing' | 'results' | 'editor'>('landing');
  const [projectUrl, setProjectUrl] = useState('');
  
  // Projects and clips state with localStorage persistence (v2 for continuous subtitles & 60fps)
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('clipcutter_projects_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialProjects;
  });

  const [activeProject, setActiveProject] = useState<Project | null>(() => projects[0] || null);

  const [clips, setClips] = useState<Clip[]>(() => {
    try {
      const saved = localStorage.getItem('clipcutter_clips_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultClips;
  });

  const [selectedClipId, setSelectedClipId] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'recommended' | 'timeline'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');

  // Processing state
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(1);
  const [statusText, setStatusText] = useState('กำลังเชื่อมต่อ yt-dlp และดาวน์โหลดวิดีโอ 1080p...');

  // Modals state
  const [alertModal, setAlertModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    icon?: string;
  }>({
    show: false,
    title: '',
    message: '',
    icon: 'info'
  });

  const [singleExportClip, setSingleExportClip] = useState<Clip | null>(null);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('clipcutter_projects_v2', JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('clipcutter_clips_v2', JSON.stringify(clips));
    } catch {
      // ignore
    }
  }, [clips]);

  const showAlert = (title: string, message: string, icon: string = 'info') => {
    setAlertModal({ show: true, title, message, icon });
    if (icon === 'check' || icon === 'sparkles') {
      soundEngine.playSfx('ding');
    }
  };

  // Processing Simulation
  useEffect(() => {
    let timer: number | undefined;
    if (currentView === 'processing') {
      setProcessingProgress(0);
      setProcessingStep(1);

      const statusMessages = [
        'กำลังดาวน์โหลดวิดีโอจาก YouTube ด้วย yt-dlp (1080p 60fps)...',
        'กำลังแยกแทร็กเสียง PCM WAV 16kHz ด้วย FFmpeg...',
        'กำลังถอดเสียงภาษาไทยและสร้าง Word-level Timestamps ด้วย Whisper...',
        'AI (Claude 3.5 & Gemini) กำลังวิเคราะห์จุด Hook และให้คะแนนไวรัล...',
        'กำลังคำนวณ Audio Ducking, วาง SFX Whoosh/Boom และสไตล์ซับไตเติล...',
        'กำลังตัดและเรนเดอร์คลิปแนวตั้ง 9:16 พร้อมซับคาราโอเกะต่อเนื่อง...'
      ];

      timer = window.setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            soundEngine.playSfx('ding');
            setTimeout(() => {
              setCurrentView('results');
            }, 600);
            return 100;
          }

          const next = prev + 2;
          const currentStep = Math.min(6, Math.floor(next / 16.6) + 1);
          setProcessingStep(currentStep);
          setStatusText(statusMessages[currentStep - 1] || statusMessages[5]);
          return next;
        });
      }, 45);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentView]);

  const handleFileUpload = (file: File) => {
    const fileBlobUrl = URL.createObjectURL(file);
    const projectName = file.name.replace(/\.[^/.]+$/, '');
    setProjectUrl(file.name);

    const uploadedClips: Clip[] = defaultClips.map((c, idx) => ({
      ...c,
      videoSourceUrl: fileBlobUrl,
      isOriginalAudioMuted: false,
      originalAudioVolume: 0.95,
      secondsStart: idx * 15,
      secondsEnd: idx * 15 + 20,
      start: `00:${(idx * 15).toString().padStart(2, '0')}`,
      end: `00:${(idx * 15 + 20).toString().padStart(2, '0')}`
    }));

    const newProject: Project = {
      id: `proj-upload-${Date.now()}`,
      title: projectName,
      sourceUrl: file.name,
      sourceType: 'file',
      videoSourceUrl: fileBlobUrl,
      durationSeconds: 1200,
      formattedDuration: '20:00',
      createdAt: 'เมื่อสักครู่ (ไฟล์อัปโหลด)',
      clipsCount: uploadedClips.length,
      thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
      clips: uploadedClips
    };

    setActiveProject(newProject);
    setProjects(prev => [newProject, ...prev]);
    setClips(uploadedClips);
    setSelectedClipId(uploadedClips[0]?.id || 1);
    setCurrentView('processing');
  };

  const handleStartClipping = () => {
    // If starting from URL, assign working fallback video stream so it never gets stuck
    const fallbackVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const updatedClips = clips.map(c => ({
      ...c,
      videoSourceUrl: c.videoSourceUrl || fallbackVideoUrl,
      isOriginalAudioMuted: false,
      originalAudioVolume: 0.95
    }));
    setClips(updatedClips);
    setCurrentView('processing');
  };

  // Filter and sort clips
  const filteredClips = clips
    .filter(c => {
      if (selectedMood !== 'all' && c.mood !== selectedMood) return false;
      if (
        searchQuery &&
        !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.reason.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filterMode === 'recommended') return b.viralScore - a.viralScore;
      return a.secondsStart - b.secondsStart;
    });

  const activeClip = clips.find(c => c.id === selectedClipId) || clips[0] || defaultClips[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#f4f4f5] font-kanit selection:bg-[#F5B800] selection:text-black">
      {/* Alert / Notification Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121216] border border-[#27272a] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl shadow-[#F5B800]/10 relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5B800]/15 border border-[#F5B800]/30 text-[#F5B800] flex items-center justify-center flex-shrink-0">
                {alertModal.icon === 'alert-triangle' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {alertModal.icon === 'check' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {alertModal.icon === 'download' && <Download className="w-5 h-5 text-[#F5B800]" />}
                {alertModal.icon === 'play' && <Play className="w-5 h-5 text-[#F5B800]" />}
                {alertModal.icon === 'sparkles' && <Sparkles className="w-5 h-5 text-[#F5B800]" />}
                {(!alertModal.icon || alertModal.icon === 'info') && <Info className="w-5 h-5 text-[#F5B800]" />}
              </div>
              <h3 className="text-lg font-bold text-white">{alertModal.title}</h3>
            </div>
            <p className="text-zinc-300 text-xs sm:text-sm mb-6 leading-relaxed">
              {alertModal.message}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertModal({ ...alertModal, show: false })}
                className="px-5 py-2.5 bg-[#F5B800] hover:bg-[#D49E00] text-black font-extrabold rounded-xl text-xs transition-colors shadow-md"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Navigation Bar */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={(proj) => {
          setActiveProject(proj);
          if (proj.clips && proj.clips.length > 0) {
            setClips(proj.clips);
          }
        }}
      />

      {/* Main App Body */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingHero
            projectUrl={projectUrl}
            setProjectUrl={setProjectUrl}
            onStart={handleStartClipping}
            onUploadFile={handleFileUpload}
            recentProjects={projects}
            onOpenProject={(proj) => {
              setActiveProject(proj);
              if (proj.clips && proj.clips.length > 0) {
                setClips(proj.clips);
              }
              setCurrentView('results');
            }}
            showAlert={showAlert}
          />
        )}

        {currentView === 'processing' && (
          <ProcessingPipeline
            progress={processingProgress}
            step={processingStep}
            statusText={statusText}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'results' && (
          <ResultsDashboard
            clips={filteredClips}
            allClips={clips}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            onSelectClip={(id) => {
              setSelectedClipId(id);
              setCurrentView('editor');
            }}
            onExportClip={(clip) => setSingleExportClip(clip)}
            onExportAll={() => setIsBatchExportOpen(true)}
          />
        )}

        {currentView === 'editor' && (
          <EditorStudio
            clip={activeClip}
            onBack={() => setCurrentView('results')}
            onUpdateClip={(updated) => {
              setClips(prev => prev.map(c => (c.id === updated.id ? updated : c)));
            }}
            showAlert={showAlert}
          />
        )}
      </main>

      {/* Modals */}
      {singleExportClip && (
        <ExportModal
          clip={singleExportClip}
          isOpen={Boolean(singleExportClip)}
          onClose={() => setSingleExportClip(null)}
        />
      )}

      <BatchExportModal
        clips={clips}
        projectTitle={activeProject?.title || 'Viral_Clips'}
        isOpen={isBatchExportOpen}
        onClose={() => setIsBatchExportOpen(false)}
      />

      {/* Luxury Dark Footer */}
      <footer className="bg-[#09090b] border-t border-[#27272a] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-xs gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#F5B800] flex items-center justify-center text-black font-bold">
              <Scissors className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-zinc-300">ClipCutter AI Pro Studio</span>
            <span className="hidden sm:inline">|</span>
            <span>ระบบแปลงคลิปสั้นไวรัล 9:16 ด้วย Whisper, Claude & FFmpeg Engine</span>
          </div>

          <div className="flex space-x-6 text-zinc-400">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); showAlert('นโยบายความเป็นส่วนตัว', 'วิดีโอของคุณจะถูกจัดเก็บในระบบชั่วคราวและลบอัตโนมัติภายใน 24 ชั่วโมงเพื่อความปลอดภัยสูงสุด', 'info'); }} className="hover:text-[#F5B800] transition-colors">
              ความปลอดภัย & ลบไฟล์ใน 24 ชม.
            </a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); showAlert('เงื่อนไขการใช้งาน', 'ใช้กับวิดีโอของคุณเอง หรือวิดีโอที่ได้รับอนุญาตอย่างถูกต้องตามกฎหมายลิขสิทธิ์', 'info'); }} className="hover:text-[#F5B800] transition-colors">
              เงื่อนไขการใช้งาน
            </a>
            <a href="#api" onClick={(e) => { e.preventDefault(); showAlert('API & Engine Status', 'ระบบ BullMQ, Whisper API, Gemini 3.8 Flash, และ FFmpeg libx264 พร้อมทำงาน 100%', 'check'); }} className="hover:text-[#F5B800] transition-colors">
              สถานะระบบ Engine
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
