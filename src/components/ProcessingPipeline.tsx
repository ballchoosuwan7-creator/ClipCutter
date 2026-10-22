import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Terminal, Clock, X, Cpu, CheckCircle2 } from 'lucide-react';

interface ProcessingPipelineProps {
  progress: number;
  step: number;
  statusText: string;
  onCancel: () => void;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  progress,
  step,
  statusText,
  onCancel
}) => {
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Starting BullMQ job worker 8a1f-video-proc',
    '[STEP 1] Initializing yt-dlp --format "bestvideo[height<=1080]+bestaudio/best"...',
    '[OK] Stream downloaded: 1080p 60fps (Container: MP4)'
  ]);

  const steps = [
    { num: 1, title: 'Download (yt-dlp)', desc: 'ดึงวิดีโอ 1080p คุณภาพสูงสุดและตรวจสอบความยาว' },
    { num: 2, title: 'Extract Audio (FFmpeg)', desc: 'แยกแทร็กเสียง 16kHz WAV เพื่อเข้าสู่โมเดลถอดคำ' },
    { num: 3, title: 'Transcribe (Whisper Word-Level)', desc: 'ถอดเสียงภาษาไทยและกำหนด Timestamp รายคำแม่นยำ' },
    { num: 4, title: 'AI Viral Analysis (Claude / Gemini)', desc: 'วิเคราะห์หาจุด Hook, คะแนนความไวรัล และอารมณ์คลิป' },
    { num: 5, title: 'Audio Ducking & Subtitle Styling', desc: 'มิกซ์เสียง BGM, ใส่ SFX จังหวะฮิต และวางซับไตเติล' },
    { num: 6, title: 'Render & Export 9:16 (FFmpeg)', desc: 'ตัดต่อสัดส่วน 9:16 แนวตั้งพร้อมเบิร์น Hardsub คมชัด' }
  ];

  // Dynamic terminal logs based on current step
  useEffect(() => {
    const stepLogs: Record<number, string[]> = {
      1: [
        '[yt-dlp] Downloading stream: 100% of 412.50MiB at 48.2MiB/s ETA 00:00',
        '[yt-dlp] Destination: /storage/temp/source_video.mp4'
      ],
      2: [
        '[FFmpeg] ffmpeg -i source_video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav',
        '[FFmpeg] Audio extraction completed in 1.42s'
      ],
      3: [
        '[Whisper] Loading model: large-v3 with Thai vocabulary segmentation (Intl.Segmenter)',
        '[Whisper] Detected language: Thai (Probability: 0.998)',
        '[Whisper] Generated 1,420 word-level tokens with precise ±20ms boundaries'
      ],
      4: [
        '[LLM Engine] Prompting Gemini 3.8 Flash for Viral Moment Classification...',
        '[LLM Engine] Extracted 8 viral highlights (Score range: 85 - 96)',
        '[LLM Engine] Identified 14 punchlines & high retention hook points'
      ],
      5: [
        '[AudioEngine] Matching BGM "Lo-Fi Chill Beats" with Audio Ducking (-15% on voice)',
        '[AudioEngine] Synchronized 24 SFX markers (Whoosh, Impact, Pop, Rimshot)',
        '[SubtitleEngine] Compiling Karaoke Pop ASS subtitle script...'
      ],
      6: [
        '[FFmpeg] Rendering 1080x1920 9:16 vertical stream with libx264 crf=18...',
        '[FFmpeg] Encoding frame 1200/1800 (62 fps)',
        '[SUCCESS] Job finished! Auto-cleaning storage in 24 hours.'
      ]
    };

    if (stepLogs[step]) {
      setLogs(prev => [...prev.slice(-6), ...stepLogs[step]]);
    }
  }, [step]);

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-[#121216] border border-[#27272a] rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center shadow-2xl relative shadow-[#F5B800]/5">
        {/* Animated Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-[#F5B800]/20 to-[#FFF3C4]/20 border border-[#F5B800]/40 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#F5B800] animate-pulse shadow-lg shadow-[#F5B800]/10">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          ระบบ AI กำลังประมวลผลวิดีโอ
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">{statusText}</p>

        {/* Progress Bar with Gold Glow */}
        <div className="w-full bg-[#09090b] rounded-full h-3.5 mb-3 overflow-hidden border border-[#27272a] p-0.5">
          <div
            className="bg-gradient-to-r from-[#F5B800] via-[#FFF3C4] to-[#D49E00] h-full transition-all duration-300 rounded-full shadow-md shadow-[#F5B800]/40"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-zinc-400 font-mono mb-8 px-1">
          <span className="text-[#F5B800] font-bold">{progress}% เสร็จสิ้น</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>ประมาณเวลาที่เหลือ: {Math.max(2, Math.round((100 - progress) * 0.4))} วินาที</span>
          </span>
        </div>

        {/* 6 Sequential Steps Visualizer */}
        <div className="space-y-3 text-left mb-8 bg-[#09090b] p-5 rounded-2xl border border-[#27272a]">
          {steps.map(s => {
            const isCompleted = s.num < step;
            const isCurrent = s.num === step;

            return (
              <div key={s.num} className="flex items-start space-x-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-[#F5B800] text-black shadow-sm'
                      : isCurrent
                      ? 'bg-[#F5B800]/20 border border-[#F5B800] text-[#F5B800] animate-pulse'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>

                <div className="flex-1">
                  <div className={`font-semibold ${isCompleted || isCurrent ? 'text-white' : 'text-zinc-500'}`}>
                    {s.title}
                  </div>
                  <div className="text-[11px] text-zinc-500">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulated CLI Terminal output */}
        <div className="bg-black/90 border border-[#27272a] rounded-2xl p-4 text-left font-mono text-[11px] text-zinc-400 mb-8 max-h-36 overflow-y-auto space-y-1">
          <div className="flex items-center space-x-2 text-zinc-500 pb-1 border-b border-zinc-800 text-[10px]">
            <Terminal className="w-3 h-3 text-[#F5B800]" />
            <span>SSE Background Processing Stream (BullMQ Worker)</span>
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="truncate">
              <span className="text-[#F5B800] mr-1.5">&gt;</span>
              <span className={log.includes('[SUCCESS]') || log.includes('[OK]') ? 'text-emerald-400 font-bold' : ''}>
                {log}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
        >
          ยกเลิกการทำงาน
        </button>
      </div>
    </div>
  );
};
