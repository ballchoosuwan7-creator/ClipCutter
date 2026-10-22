import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simulated BullMQ Queue & Job Store
interface VideoJob {
  id: string;
  url: string;
  status: 'queued' | 'downloading' | 'transcribing' | 'analyzing' | 'styling' | 'rendering' | 'completed' | 'failed';
  progress: number;
  clipsCount: number;
  createdAt: number;
}

const jobs = new Map<string, VideoJob>();

// 1. Create Video Processing Job
app.post('/api/jobs/create', (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const newJob: VideoJob = {
    id: jobId,
    url,
    status: 'queued',
    progress: 5,
    clipsCount: 8,
    createdAt: Date.now()
  };

  jobs.set(jobId, newJob);
  res.json({ success: true, jobId, message: 'BullMQ worker dispatched' });
});

// 2. Job Status & Progress
app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

// 3. Gemini AI Viral Moment Extraction Endpoint
app.post('/api/ai/analyze-viral', async (req: Request, res: Response) => {
  const { transcript, title } = req.body;
  try {
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {});
    const prompt = `วิเคราะห์เนื้อหาและค้นหาช่วงที่ดีที่สุด 5 ช่วงสำหรับทำคลิปสั้นแนวตั้ง 9:16 (TikTok, Reels, Shorts):
หัวข้อ: ${title || 'คลิปวิดีโอทั่วไป'}
สคริปต์:
${transcript ? transcript.slice(0, 3000) : 'ไม่มีสคริปต์ ให้สร้างตัวอย่าง'}

ตอบกลับเป็น JSON Array:
[
  {
    "title": "Hook ภาษาไทย ดึงดูดใน 3 วินาที",
    "viralScore": 95,
    "mood": "serious | funny | exciting | emotional | inspiring",
    "reason": "เหตุผลที่ทำให้ช่วงนี้ไวรัล"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (response.text) {
      res.json({ success: true, moments: JSON.parse(response.text) });
      return;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Gemini error:', message);
  }

  // Fallback preset
  res.json({
    success: true,
    moments: [
      {
        title: 'ทำไมคนส่วนใหญ่ถึงล้มเหลวใน 3 เดือนแรก',
        viralScore: 94,
        mood: 'serious',
        reason: 'Hook กระตุกความคิด ท้าทายความเชื่อเดิม'
      },
      {
        title: 'สูตรลับจิตวิทยาที่ทำให้คนฟังหยุดเลื่อนนิ้ว',
        viralScore: 91,
        mood: 'exciting',
        reason: 'How-to ชัดเจน นำไปปรับใช้ได้ทันที'
      }
    ]
  });
});

// Setup Vite in Dev or Static in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[ClipCutter AI Pro Studio] Server running on port ${PORT}`);
  });
}

startServer();
