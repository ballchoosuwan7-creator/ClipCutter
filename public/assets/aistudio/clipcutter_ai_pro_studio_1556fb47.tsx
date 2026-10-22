import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, Sparkles, FolderOpen, Link, Upload, Clock, Flame, 
  BarChart2, Search, Play, Pause, Edit3, Save, Download, 
  Sliders, Layers, Video, Subtitles, Music, Settings, Check, 
  Info, AlertTriangle, Image as ImageIcon, Smile, Trash2, Plus, 
  ArrowLeft, CheckCircle2, Zap, Volume2, VolumeX, RefreshCw 
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'processing' | 'results' | 'editor'
  const [projectUrl, setProjectUrl] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(1);
  const [statusText, setStatusText] = useState('กำลังเตรียมเชื่อมต่อระบบ yt-dlp และดาวน์โหลดวิดีโอ...');
  
  const [filterMode, setFilterMode] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClipId, setSelectedClipId] = useState(1);

  const [modal, setModal] = useState({ show: false, title: '', message: '', icon: 'info' });

  // Initial rich clips database in Thai
  const [clips, setClips] = useState([
    {
      id: 1,
      start: '03:15',
      end: '04:22',
      secondsStart: 195,
      secondsEnd: 262,
      title: 'ทำไมการโทษระบบการเรียนถึงไม่ช่วยอะไรเลย',
      viralScore: 94,
      reason: 'Hook เปิดประเด็นแรง ท้าทายมุมมองคนฟังใน 3 วินาทีแรก',
      mood: 'serious',
      subtitleStyle: 'Karaoke Pop',
      bgm: 'Lo-Fi Chill Beats',
      sfxEnabled: true,
      caption: 'เมื่อคุณเข้าใจความจริงข้อนี้ ชีวิตการทำงานจะเปลี่ยนไปทันที! 💡 #พอดแคสต์ #พัฒนาตัวเอง #ClipCutterAI',
      keyMoments: [
        { time: 198.5, type: 'emphasis', text: 'ระบบการเรียน' },
        { time: 215.0, type: 'punchline', text: 'ไม่ช่วยอะไรเลย' }
      ],
      overlays: [
        { id: 101, type: 'emoji', content: '🔥', x: 50, y: 20, startTime: 0, duration: 4 },
        { id: 102, type: 'text', content: '💡 ความจริงที่ต้องรู้', x: 25, y: 72, startTime: 1, duration: 5 }
      ]
    },
    {
      id: 2,
      start: '12:40',
      end: '13:55',
      secondsStart: 760,
      secondsEnd: 835,
      title: 'วิธีจับโกหกคนใน 5 วินาที จากประสบการณ์จริง!',
      viralScore: 91,
      reason: 'มีเทคนิคที่นำไปใช้ได้จริงทันที ผู้คนชื่นชอบคอนเทนต์ How-to',
      mood: 'exciting',
      subtitleStyle: 'Bold Impact',
      bgm: 'Upbeat Energetic',
      sfxEnabled: true,
      caption: 'เทคนิคจิตวิทยาที่ไม่มีใครเคยบอกคุณ! ลองเอาไปใช้ดูครับ 🤫 #จิตวิทยา #สาระน่ารู้',
      keyMoments: [
        { time: 765.2, type: 'reveal', text: 'จับโกหก' },
        { time: 802.1, type: 'emphasis', text: '5 วินาที' }
      ],
      overlays: [
        { id: 201, type: 'emoji', content: '🤫', x: 80, y: 15, startTime: 0, duration: 6 }
      ]
    },
    {
      id: 3,
      start: '22:10',
      end: '23:05',
      secondsStart: 1330,
      secondsEnd: 1385,
      title: 'เรื่องเล่าเกือบเจ๊ง 10 ล้าน ในปีแรกของการทำธุรกิจ',
      viralScore: 88,
      reason: 'เรื่องเล่าความล้มเหลวสร้างอารมณ์ร่วมและการแชร์สูงมาก',
      mood: 'emotional',
      subtitleStyle: 'Classic',
      bgm: 'Emotional Piano',
      sfxEnabled: true,
      caption: 'บทเรียนราคาแพงที่เกือบทำให้ผมล้มละลาย 📉 #ธุรกิจ #สตาร์ทอัพ',
      keyMoments: [
        { time: 1340.0, type: 'punchline', text: 'เจ๊ง 10 ล้าน' }
      ],
      overlays: [
        { id: 301, type: 'emoji', content: '📉', x: 50, y: 25, startTime: 0, duration: 5 }
      ]
    },
    {
      id: 4,
      start: '35:00',
      end: '36:12',
      secondsStart: 2100,
      secondsEnd: 2172,
      title: 'เคล็ดลับนอนวันละ 4 ชั่วโมงแล้วยังสดชื่น?!',
      viralScore: 85,
      reason: 'แก้ Pain Point ของคนนอนดึกและวัยทำงาน',
      mood: 'inspiring',
      subtitleStyle: 'Emphasis Highlight',
      bgm: 'Inspiring Ambient',
      sfxEnabled: true,
      caption: 'ตื่นมาสดชื่นแม้มนุษย์ทองคำจะนอนน้อย ลองวิธีนี้ดูครับ ⚡️ #สุขภาพ #Biohacking',
      keyMoments: [
        { time: 2115.4, type: 'emphasis', text: 'นอน 4 ชั่วโมง' }
      ],
      overlays: [
        { id: 401, type: 'emoji', content: '⚡️', x: 75, y: 20, startTime: 0, duration: 4 }
      ]
    }
  ]);

  const recentProjects = [
    { title: 'พอดแคสต์เจาะลึกเศรษฐกิจไทย 2026', clips: 18, date: 'เมื่อวาน', thumb: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80' },
    { title: 'สัมภาษณ์พิเศษ CEO Startup ยูนิคอร์น', clips: 22, date: '3 วันก่อน', thumb: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80' },
    { title: 'สรุปหนังสือจิตวิทยาพัฒนาตัวเอง 5 เล่ม', clips: 15, date: '5 วันก่อน', thumb: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80' }
  ];

  const showAlert = (title, message, icon = 'info') => {
    setModal({ show: true, title, message, icon });
  };

  // Processing Animation Simulator
  useEffect(() => {
    let timer;
    if (currentView === 'processing') {
      setProcessingProgress(0);
      const statusTexts = [
        "กำลังดาวน์โหลดวิดีโอจาก YouTube ด้วย yt-dlp...",
        "กำลังถอดเสียงภาษาไทยและสร้าง Word-level Timestamp ด้วย Whisper...",
        "AI กำลังวิเคราะห์ฉากเด็ด จัดหมวดหมู่ Mood และให้คะแนนไวรัล...",
        "กำลังเลือกเพลงประกอบ BGM และฝังเสียง SFX ตามจังหวะ...",
        "กำลังเรนเดอร์คลิปแนวตั้ง 9:16 พร้อมซับไตเติลคาราโอเกะแบบต่อเนื่อง..."
      ];

      timer = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setCurrentView('results'), 500);
            return 100;
          }
          const next = prev + 2;
          const step = Math.min(Math.floor(next / 20) + 1, 5);
          setProcessingStep(step);
          setStatusText(statusTexts[step - 1] || statusTexts[4]);
          return next;
        });
      }, 45);
    }
    return () => clearInterval(timer);
  }, [currentView]);

  const handleStartClipping = () => {
    if (!projectUrl.trim()) {
      showAlert('คำเตือน', 'กรุณากรอกลิงก์ YouTube หรืออัปโหลดไฟล์วิดีโอก่อนเริ่มตัดต่อครับ', 'alert-triangle');
      return;
    }
    setCurrentView('processing');
  };

  const filteredClips = clips.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.reason.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (filterMode === 'recommended') return b.viralScore - a.viralScore;
    return a.secondsStart - b.secondsStart;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#F5B800] selection:text-black">
      {/* Modal Notification Box */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-[#F5B800]/10 relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5B800]/20 text-[#F5B800] flex items-center justify-center">
                {modal.icon === 'alert-triangle' && <AlertTriangle className="w-6 h-6" />}
                {modal.icon === 'download' && <Download className="w-6 h-6" />}
                {modal.icon === 'info' && <Info className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-bold text-white">{modal.title}</h3>
            </div>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">{modal.message}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setModal({ ...modal, show: false })}
                className="px-5 py-2.5 bg-[#F5B800] hover:bg-[#D49E00] text-black font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#09090b]/80 border-b border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5B800] to-[#A67B00] flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-[#F5B800]/20">
              <Scissors className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-[#FFF3C4] to-[#F5B800] bg-clip-text text-transparent">ClipCutter AI</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-[#F5B800]/10 text-[#F5B800] border border-[#F5B800]/30 rounded-full">Pro Studio</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-zinc-400">
            <button onClick={() => setCurrentView('landing')} className="hover:text-[#F5B800] transition-colors">หน้าแรก</button>
            <button onClick={() => setCurrentView('results')} className="hover:text-[#F5B800] transition-colors">โปรเจกต์ของฉัน</button>
          </nav>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCurrentView('results')} 
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] rounded-xl transition-all"
            >
              <FolderOpen className="w-4 h-4 text-[#F5B800]" />
              <span>โปรเจกต์ของฉัน</span>
            </button>
            <button 
              onClick={() => setCurrentView('landing')} 
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-bold text-black bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] rounded-xl shadow-lg shadow-[#F5B800]/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างคลิปสั้น</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingView 
            projectUrl={projectUrl} 
            setProjectUrl={setProjectUrl} 
            onStart={handleStartClipping} 
            recentProjects={recentProjects} 
            onOpenResults={() => setCurrentView('results')} 
          />
        )}

        {currentView === 'processing' && (
          <ProcessingView 
            progress={processingProgress} 
            step={processingStep} 
            statusText={statusText} 
            onCancel={() => setCurrentView('landing')} 
          />
        )}

        {currentView === 'results' && (
          <ResultsView 
            clips={filteredClips}
            allClips={clips}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectClip={(id) => { setSelectedClipId(id); setCurrentView('editor'); }}
            onExportAll={() => showAlert('ส่งออกสำเร็จ (ZIP)', 'รวมไฟล์วิดีโอ 9:16 ความละเอียด 1080p พร้อมซับไตเติลและแคปชั่นเป็นไฟล์ ZIP เรียบร้อยแล้ว!', 'download')}
          />
        )}

        {currentView === 'editor' && (
          <EditorView 
            clip={clips.find(c => c.id === selectedClipId) || clips[0]} 
            onBack={() => setCurrentView('results')}
            onUpdateClip={(updated) => {
              setClips(clips.map(c => c.id === updated.id ? updated : c));
            }}
            showAlert={showAlert}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#09090b] border-t border-[#27272a] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-[#F5B800] flex items-center justify-center text-black font-bold">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-zinc-300">ClipCutter AI Pro Studio</span>
            <span>© 2026 All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-[#F5B800] transition-colors">เงื่อนไขการใช้งาน</a>
            <a href="#" className="hover:text-[#F5B800] transition-colors">ความเป็นส่วนตัว</a>
            <a href="#" className="hover:text-[#F5B800] transition-colors">ช่วยเหลือ / ติดต่อเรา</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- 1. Landing View ---
function LandingView({ projectUrl, setProjectUrl, onStart, recentProjects, onOpenResults }) {
  return (
    <div className="relative overflow-hidden pt-12 pb-24 flex-1">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#F5B800]/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F5B800]/10 border border-[#F5B800]/20 text-[#F5B800] text-xs font-semibold mb-6 animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          <span>ขับเคลื่อนด้วย Whisper, Claude 3.5 & FFmpeg Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          วิดีโอยาว 1 คลิป <br className="hidden sm:inline"/>
          ได้ <span className="bg-gradient-to-r from-[#FFF3C4] via-[#F5B800] to-[#A67B00] bg-clip-text text-transparent">คลิปสั้น 10-25 คลิป</span> พร้อมโพสต์
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 font-light">
          ระบบ AI อัจฉริยะวิเคราะห์ช่วงเด็ด ถอดเสียงภาษาไทยแม่นยำ ใส่ซับคาราโอเกะต่อเนื่องตลอดคลิป พร้อมดนตรี SFX และสติ๊กเกอร์อัตโนมัติ
        </p>

        {/* Input Box */}
        <div className="bg-[#121216] border border-[#27272a] p-4 sm:p-6 rounded-2xl shadow-2xl max-w-3xl mx-auto mb-6 shadow-[#F5B800]/5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Link className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={projectUrl} 
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="วางลิงก์ YouTube เช่น https://www.youtube.com/watch?v=..." 
                className="w-full pl-12 pr-4 py-3.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#F5B800] transition-colors"
              />
            </div>
            <button 
              onClick={onStart}
              className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-bold rounded-xl shadow-lg shadow-[#F5B800]/20 transition-all whitespace-nowrap"
            >
              <Scissors className="w-5 h-5" />
              <span>ตัดคลิปเลย</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 px-1">
            <label className="cursor-pointer text-[#F5B800] hover:underline flex items-center space-x-1 font-medium">
              <Upload className="w-3.5 h-3.5" />
              <span>หรืออัปโหลดไฟล์วิดีโอ (MP4, MOV, MKV)</span>
              <input type="file" className="hidden" onChange={(e) => { if(e.target.files[0]) { setProjectUrl(e.target.files[0].name); onStart(); }}} />
            </label>
            <span className="text-zinc-500 hidden sm:inline">รองรับความยาวสูงสุด 3 ชั่วโมง</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-16">
          🔒 ใช้กับวิดีโอของคุณเอง หรือวิดีโอที่ได้รับอนุญาตจากเจ้าของลิขสิทธิ์เท่านั้น
        </p>

        {/* Recent Projects Gallery */}
        <div className="text-left mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#F5B800]" />
              <span>โปรเจกต์ล่าสุดของคุณ</span>
            </h2>
            <button onClick={onOpenResults} className="text-xs text-[#F5B800] hover:underline font-medium">ดูทั้งหมด</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((p, idx) => (
              <div key={idx} onClick={onOpenResults} className="group bg-[#121216] border border-[#27272a] rounded-2xl overflow-hidden cursor-pointer hover:border-[#F5B800]/50 transition-all">
                <div className="relative aspect-[9/16] max-h-48 overflow-hidden bg-[#09090b]">
                  <img src={p.thumb} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-[#09090b]/70 backdrop-blur-md rounded-lg text-xs font-semibold text-[#F5B800] border border-[#F5B800]/30">
                      {p.clips} คลิปสั้น
                    </span>
                    <span className="text-xs text-zinc-400">{p.date}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-[#F5B800] transition-colors">{p.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 2. Processing View ---
function ProcessingView({ progress, step, statusText, onCancel }) {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-8 max-w-xl w-full text-center shadow-2xl relative shadow-[#F5B800]/5">
        <div className="w-16 h-16 bg-[#F5B800]/10 border border-[#F5B800]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#F5B800] animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">AI กำลังประมวลผลวิดีโอ</h2>
        <p className="text-zinc-400 text-sm mb-8">{statusText}</p>

        <div className="w-full bg-[#09090b] rounded-full h-3 mb-4 overflow-hidden border border-[#27272a]">
          <div className="bg-gradient-to-r from-[#F5B800] to-[#FFF3C4] h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-zinc-500 mb-8 font-mono">
          <span>{progress}%</span>
          <span>เวลาโดยประมาณ 45 วินาที</span>
        </div>

        <div className="space-y-3 text-left mb-8">
          {[
            'ดาวน์โหลดวิดีโอ (yt-dlp)',
            'ถอดเสียงพร้อม Word-level Timestamp (Whisper AI)',
            'วิเคราะห์ช่วงเด็ด & ให้คะแนนไวรัล (Claude / Gemini AI)',
            'ออกแบบสไตล์เสียง BGM, SFX & เอฟเฟกต์ภาพ',
            'ตัดและเรนเดอร์คลิป 9:16 พร้อมซับคาราโอเกะต่อเนื่อง'
          ].map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <div key={idx} className="flex items-center space-x-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-[#F5B800] text-black' : isCurrent ? 'bg-[#F5B800]/20 border border-[#F5B800] text-[#F5B800] animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span className={isCompleted || isCurrent ? 'text-white font-medium' : 'text-zinc-400'}>{label}</span>
              </div>
            );
          })}
        </div>

        <button onClick={onCancel} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors">
          ยกเลิกการทำงาน
        </button>
      </div>
    </div>
  );
}

// --- 3. Results View ---
function ResultsView({ clips, allClips, filterMode, setFilterMode, searchQuery, setSearchQuery, onSelectClip, onExportAll }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-[#F5B800] text-sm font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>ตัดต่อสำเร็จเรียบร้อยแล้ว</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">แดชบอร์ดจัดการคลิปสั้น ({clips.length} คลิป)</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onExportAll} className="px-4 py-2.5 bg-[#121216] hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all border border-[#27272a]">
            <Download className="w-4 h-4 text-[#F5B800]" />
            <span>ส่งออกทั้งหมด (ZIP)</span>
          </button>
          <button onClick={() => onSelectClip(clips[0]?.id || 1)} className="px-5 py-2.5 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-[#F5B800]/20 transition-all">
            <Sliders className="w-4 h-4" />
            <span>เปิดโปรแกรมแก้ไข (Editor)</span>
          </button>
        </div>
      </div>

      {/* Timeline Highlights Bar */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300 flex items-center space-x-1.5">
            <BarChart2 className="w-4 h-4 text-[#F5B800]" />
            <span>ไทม์ไลน์ช่วงเด็ดไวรัลในวิดีโอต้นฉบับ (00:00 - 52:10)</span>
          </span>
          <span>คลิกกล่องเพื่อข้ามไปที่การ์ดคลิป</span>
        </div>
        <div className="relative h-12 bg-[#09090b] rounded-xl border border-[#27272a] p-1 flex items-center overflow-x-auto">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-zinc-800 mx-2"></div>
          <div className="flex items-center space-x-3 w-full px-2 relative z-10">
            {allClips.map((clip, idx) => {
              const isGold = clip.viralScore >= 90;
              return (
                <div 
                  key={clip.id} 
                  onClick={() => onSelectClip(clip.id)}
                  className={`cursor-pointer flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${isGold ? 'bg-[#F5B800]/20 border-[#F5B800] text-[#FFF3C4] hover:bg-[#F5B800] hover:text-black shadow-md' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[10px]">{idx + 1}</span>
                  <span>{clip.viralScore} คะแนน</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button onClick={() => setFilterMode('recommended')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filterMode === 'recommended' ? 'bg-[#F5B800] text-black shadow-md shadow-[#F5B800]/20' : 'bg-[#121216] border border-[#27272a] text-zinc-400 hover:text-white'}`}>
            ⭐ AI แนะนำ (คะแนนสูงสุด)
          </button>
          <button onClick={() => setFilterMode('timeline')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filterMode === 'timeline' ? 'bg-[#F5B800] text-black shadow-md shadow-[#F5B800]/20' : 'bg-[#121216] border border-[#27272a] text-zinc-400 hover:text-white'}`}>
            ⏱ ตามลำดับในวิดีโอ
          </button>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาคำในคลิป..." 
            className="w-full pl-9 pr-4 py-2 bg-[#121216] border border-[#27272a] rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#F5B800]"
          />
        </div>
      </div>

      {/* Clips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {clips.map(clip => (
          <div key={clip.id} className="bg-[#121216] border border-[#27272a] rounded-2xl overflow-hidden hover:border-[#F5B800]/50 transition-all flex flex-col group shadow-xl">
            <div className="relative aspect-[9/16] bg-[#09090b] overflow-hidden flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80" alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#09090b]/20 to-[#09090b]/40"></div>

              {/* Overlays preview on card */}
              {clip.overlays?.map(ov => (
                <div key={ov.id} style={{ left: `${ov.x}%`, top: `${ov.y}%` }} className="absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-lg pointer-events-none">
                  {ov.content}
                </div>
              ))}

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-[#09090b]/70 backdrop-blur-md rounded-lg text-xs font-bold text-[#F5B800] border border-[#F5B800]/30 flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 fill-[#F5B800]" />
                  <span>{clip.viralScore}/100 ไวรัล</span>
                </span>
                <span className="px-2.5 py-1 bg-[#09090b]/70 backdrop-blur-md rounded-lg text-xs font-medium text-zinc-300 border border-[#27272a]">
                  {clip.start} - {clip.end}
                </span>
              </div>

              {/* Continuous Subtitle Simulation on Card */}
              <div className="absolute inset-x-4 bottom-16 text-center">
                <div className="inline-block bg-[#09090b]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#F5B800]/40 text-white font-bold text-xs shadow-lg">
                  <span className="text-[#F5B800]">{clip.keyMoments[0]?.text || 'ซับไตเติล'}</span> กำลังพูดถึง...
                </div>
              </div>

              <button onClick={() => onSelectClip(clip.id)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <div className="w-14 h-14 rounded-full bg-[#F5B800] text-black flex items-center justify-center shadow-2xl shadow-[#F5B800]/30 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 fill-black ml-0.5" />
                </div>
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 font-medium capitalize border border-zinc-700">
                  Mood: {clip.mood}
                </span>
                <span className="text-[#F5B800] font-semibold">{clip.subtitleStyle}</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-sm mb-2 group-hover:text-[#F5B800] transition-colors line-clamp-2">{clip.title}</h3>
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2 leading-relaxed">{clip.reason}</p>
              </div>
              <div className="flex items-center space-x-2 pt-3 border-t border-[#27272a]">
                <button onClick={() => onSelectClip(clip.id)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors">
                  <Edit3 className="w-3.5 h-3.5 text-[#F5B800]" />
                  <span>แก้ไข / แต่งซับ</span>
                </button>
                <button onClick={() => alert(`ดาวน์โหลดคลิป: ${clip.title}`)} className="px-3 py-2 bg-[#F5B800] hover:bg-[#D49E00] text-black rounded-xl text-xs font-bold flex items-center justify-center transition-colors shadow-md">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 4. Advanced Full Editor Modal / View ---
function EditorView({ clip, onBack, onUpdateClip, showAlert }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitleStyle, setSubtitleStyle] = useState(clip.subtitleStyle);
  const [caption, setCaption] = useState(clip.caption);
  const [overlays, setOverlays] = useState(clip.overlays || []);
  const [newEmoji, setNewEmoji] = useState('🔥');
  const [trimStart, setTrimStart] = useState(clip.secondsStart);
  const [trimEnd, setTrimEnd] = useState(clip.secondsEnd);
  const [bgm, setBgm] = useState(clip.bgm);
  const [sfxEnabled, setSfxEnabled] = useState(clip.sfxEnabled);

  const canvasRef = useRef(null);
  const clipDuration = trimEnd - trimStart;

  // Playback timer loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= clipDuration) {
            setIsPlaying(false);
            return 0;
          }
          return +(prev + 0.1).toFixed(1);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, clipDuration]);

  // Live Canvas 9:16 Renderer with continuous animated subtitles & stickers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 360;
    canvas.height = 640;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 640);
    grad.addColorStop(0, '#18181b');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 360, 640);

    // Simulated speaker frame in vertical 9:16
    ctx.fillStyle = '#27272a';
    ctx.fillRect(40, 100, 280, 340);
    ctx.fillStyle = '#71717a';
    ctx.font = '15px Kanit';
    ctx.textAlign = 'center';
    ctx.fillText('9:16 Vertical Video Stream', 180, 275);

    // Top Hook Title Banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect(20, 20, 320, 48, 12);
    ctx.fill();
    ctx.fillStyle = '#F5B800';
    ctx.font = 'bold 12px Kanit';
    ctx.textAlign = 'center';
    ctx.fillText(clip.title.substring(0, 40) + '...', 180, 50);

    // Render Emojis and Stickers
    overlays.forEach(ov => {
      if (currentTime >= ov.startTime && currentTime <= (ov.startTime + ov.duration)) {
        const xPos = (ov.x / 100) * 360;
        const yPos = (ov.y / 100) * 640;
        ctx.save();
        if (ov.type === 'emoji') {
          ctx.font = '38px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(ov.content, xPos, yPos);
        } else {
          ctx.fillStyle = 'rgba(245, 184, 0, 0.9)';
          ctx.roundRect(xPos - 50, yPos - 15, 100, 30, 8);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px Kanit';
          ctx.textAlign = 'center';
          ctx.fillText(ov.content, xPos, yPos + 4);
        }
        ctx.restore();
      }
    });

    // Continuous Subtitle Engine (Updates as currentTime progresses)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.roundRect(30, 510, 300, 72, 14);
    ctx.fill();

    ctx.textAlign = 'center';
    if (subtitleStyle === 'Karaoke Pop') {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Kanit';
      ctx.fillText(currentTime % 2 < 1 ? 'เมื่อคุณเข้าใจความจริงข้อนี้' : 'ความจริงที่จะเปลี่ยนชีวิตคุณ!', 180, 540);
      ctx.fillStyle = '#F5B800';
      ctx.font = 'bold 16px Kanit';
      ctx.fillText('⚡️ ชีวิตทำงานจะเปลี่ยนไปทันที', 180, 565);
    } else if (subtitleStyle === 'Bold Impact') {
      ctx.fillStyle = '#F5B800';
      ctx.font = '900 18px Kanit';
      ctx.fillText('🚨 ห้ามพลาดเด็ดขาด!', 180, 552);
    } else if (subtitleStyle === 'Minimal') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '13px Kanit';
      ctx.fillText(clip.keyMoments[0]?.text || 'ประเด็นสำคัญในวิดีโอนี้', 180, 552);
    } else {
      ctx.fillStyle = '#FFF3C4';
      ctx.font = 'bold 15px Kanit';
      ctx.fillText('✨ ' + (clip.keyMoments[1]?.text || 'จุดเปลี่ยนสำคัญของเรื่อง'), 180, 552);
    }

  }, [currentTime, subtitleStyle, clip, overlays]);

  const handleAddOverlay = () => {
    const newOv = {
      id: Date.now(),
      type: 'emoji',
      content: newEmoji,
      x: 50,
      y: 35,
      startTime: currentTime,
      duration: 3
    };
    const updatedOverlays = [...overlays, newOv];
    setOverlays(updatedOverlays);
    onUpdateClip({ ...clip, subtitleStyle, caption, overlays: updatedOverlays, bgm, sfxEnabled, secondsStart: trimStart, secondsEnd: trimEnd });
  };

  const handleRemoveOverlay = (id) => {
    const updatedOverlays = overlays.filter(o => o.id !== id);
    setOverlays(updatedOverlays);
    onUpdateClip({ ...clip, subtitleStyle, caption, overlays: updatedOverlays, bgm, sfxEnabled, secondsStart: trimStart, secondsEnd: trimEnd });
  };

  const handleSave = () => {
    onUpdateClip({ ...clip, subtitleStyle, caption, overlays, bgm, sfxEnabled, secondsStart: trimStart, secondsEnd: trimEnd });
    showAlert('บันทึกและเรนเดอร์สำเร็จ', 'ระบบได้ทำการเบิร์นซับไตเติลคาราโอเกะต่อเนื่อง, อัปเดตสติ๊กเกอร์ และเรนเดอร์ไฟล์ MP4 ความละเอียดสูงเรียบร้อยแล้ว!', 'check');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#27272a]">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] rounded-xl text-zinc-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>โปรแกรมแก้ไขคลิป #${clip.id} (Pro Studio)</span>
              <span className="px-2 py-0.5 rounded bg-[#F5B800]/20 text-[#F5B800] text-xs border border-[#F5B800]/30">{clip.viralScore} คะแนนไวรัล</span>
            </h1>
            <p className="text-xs text-zinc-400 line-clamp-1">{clip.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => showAlert('พรีวิวเร็วสำเร็จ', 'เล่นวิดีโอตัวอย่างความละเอียด 480p พร้อมซับคาราโอเกะและ SFX สมบูรณ์แบบ', 'play')} className="px-4 py-2 bg-[#121216] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-[#27272a]">
            <Play className="w-4 h-4 text-[#F5B800]" />
            <span>พรีวิวแบบเร็ว</span>
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-[#F5B800]/20 transition-all">
            <Save className="w-4 h-4" />
            <span>เรนเดอร์และบันทึก</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Left & Center: Live Canvas Video Preview & Timeline Trimmer */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="relative bg-[#09090b] rounded-3xl border-4 border-[#27272a] overflow-hidden shadow-2xl flex flex-col items-center justify-center p-4">
            <canvas ref={canvasRef} className="rounded-2xl shadow-xl max-h-[460px] aspect-[9/16]"></canvas>

            <div className="absolute inset-x-0 bottom-8 flex justify-center items-center pointer-events-none">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="pointer-events-auto w-14 h-14 rounded-full bg-[#F5B800] text-black flex items-center justify-center shadow-2xl shadow-[#F5B800]/40 hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
              </button>
            </div>

            <div className="w-full max-w-sm mt-4 flex items-center justify-between text-xs font-mono text-zinc-300 px-2 bg-[#121216] py-2 rounded-xl border border-[#27272a]">
              <span>00:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
              <input 
                type="range" 
                min="0" 
                max={clipDuration} 
                step="0.1"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="flex-1 mx-3 accent-[#F5B800] cursor-pointer" 
              />
              <span>00:{clipDuration}</span>
            </div>
          </div>

          {/* Timeline & Trimmer Controls */}
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#F5B800]" />
              <span>ปรับแต่งช่วงเวลา (Timeline Trimming) & รายการสติ๊กเกอร์</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">วินาทีเริ่มต้น</label>
                <input 
                  type="number" 
                  value={trimStart} 
                  onChange={(e) => setTrimStart(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white text-xs" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">วินาทีสิ้นสุด</label>
                <input 
                  type="number" 
                  value={trimEnd} 
                  onChange={(e) => setTrimEnd(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white text-xs" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400">สติ๊กเกอร์ / อีโมจิที่วางบนคลิป ({overlays.length}):</span>
              <div className="flex flex-wrap gap-2">
                {overlays.map(ov => (
                  <div key={ov.id} className="flex items-center space-x-2 bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded-xl text-xs">
                    <span>{ov.content}</span>
                    <span className="text-zinc-500">(วิที่ {ov.startTime})</span>
                    <button onClick={() => handleRemoveOverlay(ov.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Subtitle Engine, Emojis, Audio & AI Caption */}
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="font-bold text-white text-base flex items-center space-x-2 border-b border-[#27272a] pb-3">
              <Settings className="w-5 h-5 text-[#F5B800]" />
              <span>ปรับแต่งซับ สติ๊กเกอร์ และเสียง</span>
            </h3>

            {/* Emoji / Sticker Tool */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">เพิ่มอีโมจิ / สติ๊กเกอร์ Pop-up ตามเวลา</label>
              <div className="flex space-x-2">
                <select value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-white text-sm">
                  <option value="🔥">🔥 ไฟลุก</option>
                  <option value="💡">💡 ไอเดีย</option>
                  <option value="🤯">🤯 ตื่นเต้น</option>
                  <option value="🚀">🚀 พุ่งทะยาน</option>
                  <option value="💰">💰 กำไร</option>
                  <option value="❤️">❤️ หัวใจ</option>
                </select>
                <button onClick={handleAddOverlay} className="flex-1 py-2 bg-[#F5B800] hover:bg-[#D49E00] text-black font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md">
                  <Plus className="w-4 h-4" />
                  <span>วางสติ๊กเกอร์</span>
                </button>
              </div>
            </div>

            {/* Subtitle Style Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">เลือกสไตล์ซับไตเติล (ต่อเนื่องตลอดคลิป)</label>
              <select 
                value={subtitleStyle} 
                onChange={(e) => setSubtitleStyle(e.target.value)} 
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#F5B800]"
              >
                <option value="Karaoke Pop">1. Karaoke Pop (ซับต่อเนื่อง ไฮไลต์ทอง & เด้ง)</option>
                <option value="Classic">2. Classic (พื้นหลังดำโปร่งใส)</option>
                <option value="Bold Impact">3. Bold Impact (ตัวหนา ใหญ่สะใจ)</option>
                <option value="Minimal">4. Minimal (ตัวบางขาว สะอาดตา)</option>
              </select>
            </div>

            {/* BGM & Audio Controls */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">เพลงประกอบ BGM & Audio Ducking</label>
              <select value={bgm} onChange={(e) => setBgm(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-white text-xs mb-2">
                <option>Lo-Fi Chill Beats</option>
                <option>Upbeat Energetic</option>
                <option>Emotional Piano</option>
                <option>Inspiring Ambient</option>
              </select>
              <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
                <span>เปิดเสียงเอฟเฟกต์ (SFX Whoosh/Pop)</span>
                <input type="checkbox" checked={sfxEnabled} onChange={(e) => setSfxEnabled(e.target.checked)} className="accent-[#F5B800] w-4 h-4 rounded" />
              </div>
            </div>

            {/* AI Caption Generator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-400">แคปชั่นโพสต์โซเชียล (AI Generated)</label>
                <button onClick={() => showAlert('AI สร้างแคปชั่นสำเร็จ', 'AI สร้างแคปชั่นใหม่พร้อมแฮชแท็กไวรัลสำหรับ TikTok/Reels ให้แล้ว!', 'sparkles')} className="text-xs text-[#F5B800] hover:underline flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>ให้ AI เขียนใหม่</span>
                </button>
              </div>
              <textarea 
                rows="3" 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#F5B800] leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-[#27272a] mt-6">
            <button onClick={onBack} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-[#F5B800]" />
              <span>เสร็จสิ้นและกลับสู่แดชบอร์ด</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}