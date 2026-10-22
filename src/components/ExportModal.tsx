import React, { useState } from 'react';
import { Clip } from '../types';
import { ExportService } from '../services/exportService';
import { Download, Film, Check, Settings, X, Copy, Share2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  clip: Clip;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ clip, isOpen, onClose }) => {
  const [resolution, setResolution] = useState<'9:16' | '1:1'>('9:16');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);

  if (!isOpen) return null;

  const handleExportZip = async () => {
    setIsExporting(true);
    setProgress(15);
    setStatusMessage('กำลังสร้างไฟล์ซับไตเติล .SRT และสไตล์ .ASS...');

    await new Promise(r => setTimeout(r, 400));
    setProgress(45);
    setStatusMessage('กำลังบันทึกสคริปต์เรนเดอร์ FFmpeg 1080x1920 H.264...');

    await new Promise(r => setTimeout(r, 400));
    setProgress(80);
    setStatusMessage('กำลังบีบอัดไฟล์ ZIP พร้อมแคปชั่นและแฮชแท็ก...');

    await new Promise(r => setTimeout(r, 400));
    await ExportService.downloadClipZip(clip);
    setProgress(100);
    setStatusMessage('ส่งออกและดาวน์โหลดสำเร็จแล้ว!');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setIsExporting(false);
    }, 1200);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(clip.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#121216] border border-[#27272a] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-[#F5B800]/10 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F5B800]/15 border border-[#F5B800]/30 text-[#F5B800] flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">ส่งออกคลิปสั้น #{clip.id}</h3>
            <p className="text-xs text-zinc-400 font-mono">
              ความยาว: {clip.start} - {clip.end} | ไวรัล: {clip.viralScore}/100
            </p>
          </div>
        </div>

        {/* Export Settings */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">อัตราส่วนและขนาดวิดีโอ (Aspect Ratio)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResolution('9:16')}
                className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                  resolution === '9:16'
                    ? 'bg-[#F5B800]/10 border-[#F5B800] text-white'
                    : 'bg-[#09090b] border-[#27272a] text-zinc-400'
                }`}
              >
                <div className="w-6 h-9 border border-current rounded flex items-center justify-center text-[9px] font-bold">
                  9:16
                </div>
                <div>
                  <div className="text-xs font-bold text-white">1080 x 1920 (TikTok / Reels)</div>
                  <div className="text-[11px] text-zinc-400">แนวตั้งเต็มจอ คมชัดสูง</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResolution('1:1')}
                className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                  resolution === '1:1'
                    ? 'bg-[#F5B800]/10 border-[#F5B800] text-white'
                    : 'bg-[#09090b] border-[#27272a] text-zinc-400'
                }`}
              >
                <div className="w-7 h-7 border border-current rounded flex items-center justify-center text-[9px] font-bold">
                  1:1
                </div>
                <div>
                  <div className="text-xs font-bold text-white">1080 x 1080 (Square)</div>
                  <div className="text-[11px] text-zinc-400">จัตุรัสสำหรับ Feed ทั่วไป</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Video Codec:</span>
              <span>H.264 High Profile (crf=18)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Framerate:</span>
              <span className="text-[#F5B800] font-semibold">{clip.visualFx?.targetFramerate || 60} FPS Constant</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Sharpness / Clarity:</span>
              <span className="text-purple-400">2X Retina Buffer (Lanczos + Unsharp)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Face Tracking Lock:</span>
              <span className="text-amber-400">{clip.visualFx?.stableFaceLock ? 'Dead Zone Center Lock (ภาพนิ่ง)' : 'Active Tracking'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Audio Codec:</span>
              <span>AAC 192kbps (Ducking Enabled)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtitles:</span>
              <span className="text-[#F5B800] font-semibold">{clip.subtitleStyle} (Hardsub + SRT)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">FastStart:</span>
              <span className="text-emerald-400">เปิดใช้งาน (พร้อมสตรีมทันที)</span>
            </div>
          </div>

          {/* Social Caption Preview Box */}
          <div className="p-3.5 bg-[#09090b] rounded-xl border border-[#27272a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B800]" />
                <span>แคปชั่น & แฮชแท็กพร้อมโพสต์</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-[#F5B800] rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCaption ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed whitespace-pre-line font-sans">
              {clip.caption}
            </p>
          </div>
        </div>

        {/* Progress or Actions */}
        {isExporting ? (
          <div className="space-y-3 py-2">
            <div className="w-full bg-[#09090b] rounded-full h-3 overflow-hidden border border-[#27272a]">
              <div
                className="bg-gradient-to-r from-[#F5B800] to-[#FFF3C4] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleExportZip}
              className="flex-1 py-3 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-bold rounded-xl text-xs shadow-lg shadow-[#F5B800]/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดแพ็กเกจ (ZIP)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
