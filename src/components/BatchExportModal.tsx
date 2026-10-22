import React, { useState } from 'react';
import { Clip } from '../types';
import { ExportService } from '../services/exportService';
import { Download, FolderArchive, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BatchExportModalProps {
  clips: Clip[];
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  clips,
  projectTitle,
  isOpen,
  onClose
}) => {
  const [isBundling, setIsBundling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleStartBatchZip = async () => {
    setIsBundling(true);
    setProgress(20);
    setStatus('กำลังเตรียมซับไตเติล SRT / ASS ของทุกคลิป...');

    await new Promise(r => setTimeout(r, 450));
    setProgress(55);
    setStatus('กำลังรวมแคปชั่น แฮชแท็กโซเชียล และสคริปต์เรนเดอร์...');

    await new Promise(r => setTimeout(r, 500));
    setProgress(85);
    setStatus('กำลังบีบอัดแพ็กเกจ Master ZIP...');

    await new Promise(r => setTimeout(r, 400));
    await ExportService.downloadAllClipsZip(clips, projectTitle);

    setProgress(100);
    setStatus('สร้างไฟล์ ZIP สำเร็จ และเริ่มดาวน์โหลดแล้ว!');

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });

    setTimeout(() => {
      setIsBundling(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#121216] border border-[#27272a] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F5B800]/15 border border-[#F5B800]/30 text-[#F5B800] flex items-center justify-center">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">ส่งออกทุกคลิปพร้อมกัน (Batch ZIP)</h3>
            <p className="text-xs text-zinc-400">
              รวมคลิปสั้นทั้งหมด {clips.length} คลิป ในโปรเจกต์นี้
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#09090b] rounded-2xl border border-[#27272a] mb-6 space-y-2 text-xs text-zinc-300">
          <div className="font-semibold text-white mb-1">สิ่งที่รวมอยู่ในแพ็กเกจ:</div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B800]" />
            <span>โฟลเดอร์แยกคลิป 1-{clips.length} ตามระดับคะแนนไวรัล</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B800]" />
            <span>ไฟล์ซับไตเติล Word-level (.SRT และ .ASS) พร้อมสไตล์ 5 แบบ</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B800]" />
            <span>แคปชั่นและแฮชแท็กสำหรับ TikTok, Instagram Reels, YouTube Shorts</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B800]" />
            <span>คำสั่งรัน FFmpeg 1080x1920 พร้อมมิกซ์เสียงและดักกิ้งอัตโนมัติ</span>
          </div>
        </div>

        {isBundling ? (
          <div className="space-y-3 py-3">
            <div className="w-full bg-[#09090b] rounded-full h-3 overflow-hidden border border-[#27272a]">
              <div
                className="bg-gradient-to-r from-[#F5B800] to-[#FFF3C4] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleStartBatchZip}
              className="flex-1 py-3 bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] text-black font-bold rounded-xl text-xs shadow-lg shadow-[#F5B800]/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด Master ZIP</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
