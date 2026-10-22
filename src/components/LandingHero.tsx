import React, { useState } from 'react';
import { Project } from '../types';
import { 
  Scissors, Sparkles, Link as LinkIcon, Upload, Clock, 
  Flame, Zap, AlertTriangle, ShieldCheck, CheckCircle2, Play 
} from 'lucide-react';

interface LandingHeroProps {
  projectUrl: string;
  setProjectUrl: (url: string) => void;
  onStart: () => void;
  onUploadFile: (file: File) => void;
  recentProjects: Project[];
  onOpenProject: (proj: Project) => void;
  showAlert: (title: string, message: string, icon?: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  projectUrl,
  setProjectUrl,
  onStart,
  onUploadFile,
  recentProjects,
  onOpenProject,
  showAlert
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const presets = [
    {
      title: 'The Secret Sauce: ถอดรหัสเศรษฐกิจ & ธุรกิจ 2026',
      url: 'https://www.youtube.com/watch?v=the_secret_sauce_2026',
      duration: '52:10',
      tag: 'พอดแคสต์ธุรกิจ'
    },
    {
      title: 'Mission To The Moon: จิตวิทยาการทำงานและการก้าวข้าม Burnout',
      url: 'https://www.youtube.com/watch?v=mission_to_moon_burnout',
      duration: '40:50',
      tag: 'จิตวิทยา'
    },
    {
      title: 'ลงทุนแมน: ปฏิวัติ AI ในตลาดแรงงานและโอกาสของคนรุ่นใหม่',
      url: 'https://www.youtube.com/watch?v=longtunman_ai_revolution',
      duration: '31:30',
      tag: 'เทคโนโลยี'
    }
  ];

  const validateAndStart = () => {
    if (!projectUrl.trim()) {
      showAlert('กรุณาระบุวิดีโอ', 'กรุณาวางลิงก์ YouTube หรืออัปโหลดไฟล์วิดีโอก่อนเริ่มตัดต่อครับ', 'alert-triangle');
      return;
    }

    // Check for livestream
    if (projectUrl.toLowerCase().includes('/live') || projectUrl.toLowerCase().includes('live=')) {
      showAlert('ไม่รองรับ Live Stream', 'ระบบรองรับเฉพาะวิดีโอที่บันทึกแล้วความยาวไม่เกิน 3 ชั่วโมง (ไม่รองรับการถ่ายทอดสดแบบ Real-time ครับ)', 'alert-triangle');
      return;
    }

    onStart();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024 * 1024) {
        showAlert('ไฟล์ใหญ่เกินกำหนด', 'รองรับขนาดไฟล์สูงสุดไม่เกิน 2GB ครับ', 'alert-triangle');
        return;
      }
      setProjectUrl(file.name);
      onUploadFile(file);
    }
  };

  return (
    <div className="relative overflow-hidden pt-12 pb-24 flex-1">
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-[#F5B800]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F5B800]/10 border border-[#F5B800]/30 text-[#F5B800] text-xs font-semibold mb-6 shadow-sm shadow-[#F5B800]/5">
          <Zap className="w-3.5 h-3.5" />
          <span>ขับเคลื่อนด้วย Whisper Word-level, Claude / Gemini 3.8 & FFmpeg Engine</span>
        </div>

        {/* Catchy Thai Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          วิดีโอยาว 1 คลิป <br className="hidden sm:inline" />
          ได้ <span className="bg-gradient-to-r from-[#FFF3C4] via-[#F5B800] to-[#D49E00] bg-clip-text text-transparent">คลิปสั้น 15-30 คลิป</span> พร้อมโพสต์อัตโนมัติ
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
          ระบบ AI อัจฉริยะวิเคราะห์ค้นหาจุด Hook และ Viral Moments ถอดเสียงภาษาไทยแม่นยำ 
          ใส่ซับคาราโอเกะต่อเนื่องตลอดคลิป พร้อมเพลง BGM, Audio Ducking, SFX และสติ๊กเกอร์ไดนามิกครบวงจร
        </p>

        {/* Input & Upload Box */}
        <div className="bg-[#121216] border border-[#27272a] p-4 sm:p-6 rounded-3xl shadow-2xl max-w-3xl mx-auto mb-6 shadow-[#F5B800]/5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <LinkIcon className="w-5 h-5 text-[#F5B800]" />
              </div>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validateAndStart()}
                placeholder="วางลิงก์ YouTube เช่น https://www.youtube.com/watch?v=..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#09090b] border border-[#27272a] rounded-2xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#F5B800] transition-colors"
              />
            </div>

            <button
              onClick={validateAndStart}
              className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-extrabold rounded-2xl shadow-lg shadow-[#F5B800]/25 hover:shadow-[#F5B800]/40 transition-all whitespace-nowrap active:scale-95"
            >
              <Scissors className="w-5 h-5 stroke-[2.5]" />
              <span>ตัดคลิปเลย</span>
            </button>
          </div>

          {/* Drag & Drop File Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`mt-4 p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${
              isDragging
                ? 'border-[#F5B800] bg-[#F5B800]/10'
                : 'border-[#27272a] bg-[#09090b]/60 hover:border-zinc-600'
            }`}
          >
            <label className="cursor-pointer flex items-center space-x-2 text-zinc-300 hover:text-white">
              <div className="w-8 h-8 rounded-xl bg-[#F5B800]/15 text-[#F5B800] flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-[#F5B800] hover:underline">
                  ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด
                </span>
                <p className="text-[11px] text-zinc-500">รองรับ MP4, MOV, MKV (สูงสุด 2GB)</p>
              </div>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProjectUrl(file.name);
                    onUploadFile(file);
                  }
                }}
              />
            </label>

            <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ความยาวสูงสุด 3 ชั่วโมง (คัดกรอง Live Stream)</span>
            </div>
          </div>
        </div>

        {/* Demo Preset Buttons */}
        <div className="max-w-3xl mx-auto text-left mb-14">
          <span className="text-xs text-zinc-400 font-semibold mb-2 block">
            ⚡️ หรือทดลองใช้งานทันทีด้วยวิดีโอตัวอย่างยอดนิยม:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProjectUrl(preset.url);
                  onStart();
                }}
                className="p-3 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] hover:border-[#F5B800]/40 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-[#F5B800] font-medium">{preset.tag}</span>
                  <span className="font-mono">{preset.duration}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-300 group-hover:text-white line-clamp-1">
                  {preset.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Projects Gallery */}
        <div className="text-left mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#F5B800]" />
              <span>โปรเจกต์ล่าสุดของคุณ (Recent Projects)</span>
            </h2>
            <span className="text-xs text-zinc-500">บันทึกอัตโนมัติบนระบบ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenProject(p)}
                className="group bg-[#121216] border border-[#27272a] rounded-3xl overflow-hidden cursor-pointer hover:border-[#F5B800]/50 transition-all shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#09090b]">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-[#09090b]/80 backdrop-blur-md rounded-xl text-xs font-bold text-[#F5B800] border border-[#F5B800]/30 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 fill-[#F5B800]" />
                      <span>{p.clipsCount} คลิปสั้น</span>
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{p.formattedDuration}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#F5B800] transition-colors mb-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{p.createdAt}</span>
                    <span className="text-[#F5B800] font-medium flex items-center space-x-1">
                      <span>เปิดโปรเจกต์</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
