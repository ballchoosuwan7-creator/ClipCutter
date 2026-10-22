import { GoogleGenAI } from '@google/genai';
import { Clip } from '../types';

export class GeminiService {
  private static getClient(): GoogleGenAI | null {
    // Check vite env var or browser global
    const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY || 
                   (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);
    
    // Always attempt with empty config if no explicit key, SDK handles injected env vars
    try {
      return new GoogleGenAI(apiKey ? { apiKey } : {});
    } catch {
      return null;
    }
  }

  public static async generateViralCaption(clip: Clip, platform: 'TikTok' | 'Reels' | 'Shorts' = 'TikTok'): Promise<string> {
    try {
      const ai = this.getClient();
      if (!ai) throw new Error('No AI client initialized');

      const prompt = `คุณคือผู้เชี่ยวชาญด้าน Social Media & Video Marketing ภาษาไทย
กรุณาเขียนแคปชั่นและแฮชแท็กไวรัลสำหรับโพสต์ลง ${platform} จากคลิปวิดีโอหัวข้อ: "${clip.title}"
ประเด็นในคลิป: "${clip.reason}"
อารมณ์ของคลิป (Mood): ${clip.mood}
คำเด่นในคลิป: ${clip.keyMoments.map(k => k.text).join(', ')}

ข้อกำหนด:
- มี Hook บรรทัดแรกที่ดึงดูดสายตาคนทันทีใน 2 วินาที
- ภาษาเป็นธรรมชาติ สไตล์อินฟลูเอนเซอร์ไทยที่ดูเป็นมืออาชีพ
- มี Call-to-action ชวนคนคอมเมนต์หรือกดแชร์
- แฮชแท็ก 5-8 อันที่ตรงกลุ่มเป้าหมาย`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch {
      // Intelligent Thai fallback generator tailored to the clip's mood
    }

    // Dynamic tailored fallback
    const moodEmojis: Record<string, string> = {
      serious: '💡',
      funny: '😂',
      exciting: '🚀',
      emotional: '🥺',
      inspiring: '✨'
    };
    const emoji = moodEmojis[clip.mood] || '🔥';

    if (platform === 'TikTok') {
      return `${emoji} ${clip.title}!\n\n${clip.reason}\nใครเคยเจอแบบนี้บ้าง คอมเมนต์บอกหน่อยครับ 👇\n\n#ความรู้รอบตัว #พัฒนาตัวเอง #เรื่องนี้ดี #ไวรัลTikTok #ClipCutterAI #${clip.mood}`;
    } else if (platform === 'Reels') {
      return `${emoji} จุดเปลี่ยนสำคัญ: "${clip.title}"\n.\nหลายคนมองข้ามเรื่องนี้ไป แต่พอรู้แล้วทุกอย่างเปลี่ยนไปทันที!\n.\n📌 เซฟคลิปนี้ไว้ดูย้อนหลัง และแชร์ให้เพื่อนที่กำลังเจอปัญหานี้\n.\n#สาระความรู้ #แง่คิดดีๆ #ReelsThailand #แรงบันดาลใจ`;
    } else {
      return `${clip.title} ⚡️ สรุปใน 60 วินาที!\n\n${clip.reason}\n\n👉 ติดตามช่องเพื่อไม่พลาดคลิปสรุปสาระแบบนี้ทุกวัน\n#Shorts #ความรู้ #สรุป #Viral`;
    }
  }

  public static async analyzeViralMoments(transcriptText: string): Promise<Partial<Clip>[]> {
    try {
      const ai = this.getClient();
      if (!ai) throw new Error('No AI client');

      const prompt = `วิเคราะห์บทสนทนานี้และค้นหา 3 ช่วงที่ไวรัลที่สุด (Viral Hooks) ในรูปแบบ JSON Array:
[
  {
    "title": "หัวข้อ Hook ภาษาไทย ไม่เกิน 50 ตัวอักษร",
    "viralScore": 92,
    "reason": "เหตุผลที่ทำให้ช่วงนี้ไวรัล",
    "mood": "serious | funny | exciting | emotional | inspiring"
  }
]
ข้อความ:
${transcriptText.slice(0, 3000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch {
      // Handled by default clip sets
    }
    return [];
  }
}
