import JSZip from 'jszip';
import { Clip } from '../types';

export class ExportService {
  /**
   * Generates a standard SRT format subtitle string
   */
  public static generateSRT(clip: Clip): string {
    const srtLines: string[] = [];
    const words = clip.transcriptWords;

    if (!words || words.length === 0) {
      // Fallback chunking
      const duration = clip.secondsEnd - clip.secondsStart;
      const chunks = [
        { start: 0, end: Math.min(3, duration), text: clip.title },
        { start: Math.min(3, duration), end: duration, text: clip.reason }
      ];
      chunks.forEach((chunk, idx) => {
        srtLines.push(`${idx + 1}`);
        srtLines.push(`${this.formatSrtTime(chunk.start)} --> ${this.formatSrtTime(chunk.end)}`);
        srtLines.push(chunk.text);
        srtLines.push('');
      });
      return srtLines.join('\n');
    }

    // Group words into safe 2-3 word chunks to prevent screen overflow
    const chunkSize = Math.max(2, Math.min(3, clip.wordsPerLine || 3));
    for (let i = 0; i < words.length; i += chunkSize) {
      const slice = words.slice(i, i + chunkSize);
      const startTime = slice[0].start;
      const endTime = slice[slice.length - 1].end;
      const text = slice.map(w => w.word).join(' ');

      srtLines.push(`${Math.floor(i / chunkSize) + 1}`);
      srtLines.push(`${this.formatSrtTime(startTime)} --> ${this.formatSrtTime(endTime)}`);
      srtLines.push(text);
      srtLines.push('');
    }

    return srtLines.join('\n');
  }

  /**
   * Generates Advanced SubStation Alpha (.ass) subtitle file with custom styles
   */
  public static generateASS(clip: Clip): string {
    return `[Script Info]
Title: ${clip.title}
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${clip.font},56,&H00FFFFFF,&H0000B8F5,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,3,2,60,60,300,1
Style: KaraokeHighlight,${clip.font},60,&H0000B8F5,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,106,106,0,0,1,5,3,2,60,60,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:03.00,KaraokeHighlight,,0,0,0,,{\\b1\\c&H00F5B800&}${clip.title}{\\r}
`;
  }

  /**
   * Generates ready-to-run FFmpeg bash command for high-end server processing
   */
  public static generateFFmpegCommand(clip: Clip): string {
    const fps = clip.visualFx?.targetFramerate || 60;
    const hasClarity = clip.visualFx?.clarityFilter ?? true;
    const unsharpFilter = hasClarity ? ',unsharp=5:5:0.8:5:5:0.0' : '';

    return `#!/bin/bash
# ClipCutter AI Pro Studio - FFmpeg High Quality 9:16 Ultra-Sharp Render Command
# Clip: ${clip.title} (${clip.start} - ${clip.end})
# Settings: Constant ${fps} FPS | Unsharp Clarity Filter | Lanczos 1080x1920

ffmpeg -y -ss ${clip.secondsStart} -to ${clip.secondsEnd} \\
  -i "source_video.mp4" \\
  -i "bgm_${clip.mood}.mp3" \\
  -filter_complex "[0:v]crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos${unsharpFilter},ass=subtitles.ass[v]; \\
  [1:a]volume=0.15[bgm]; \\
  [0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[a]" \\
  -map "[v]" -map "[a]" \\
  -c:v libx264 -preset slow -crf 18 -r ${fps} -pix_fmt yuv420p \\
  -c:a aac -b:a 192k -movflags +faststart \\
  "output_clip_${clip.id}_1080p_${fps}fps.mp4"

echo "Render complete for Clip ${clip.id} (${fps} FPS Ultra-Sharp)!"
`;
  }

  /**
   * Bundles all assets into a ZIP file and triggers instant browser download
   */
  public static async downloadClipZip(clip: Clip): Promise<void> {
    const zip = new JSZip();

    // 1. SRT Subtitles
    zip.file(`subtitles_${clip.id}.srt`, this.generateSRT(clip));

    // 2. ASS Subtitles
    zip.file(`subtitles_${clip.id}.ass`, this.generateASS(clip));

    // 3. Caption & Hashtags
    zip.file(`captions_and_hashtags_${clip.id}.txt`, clip.caption);

    // 4. Metadata JSON
    zip.file(`clip_${clip.id}_metadata.json`, JSON.stringify(clip, null, 2));

    // 5. FFmpeg Production Command
    zip.file(`render_command.sh`, this.generateFFmpegCommand(clip));

    // Generate zip blob
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClipCutter_Clip_${clip.id}_${clip.title.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_').slice(0, 30)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Bundles all clips in the project into one master ZIP
   */
  public static async downloadAllClipsZip(clips: Clip[], projectTitle: string): Promise<void> {
    const zip = new JSZip();
    const folder = zip.folder("clips");

    clips.forEach((clip, index) => {
      const clipFolder = folder?.folder(`Clip_${index + 1}_Score_${clip.viralScore}`);
      if (clipFolder) {
        clipFolder.file(`subtitles.srt`, this.generateSRT(clip));
        clipFolder.file(`subtitles.ass`, this.generateASS(clip));
        clipFolder.file(`caption.txt`, clip.caption);
        clipFolder.file(`info.json`, JSON.stringify(clip, null, 2));
        clipFolder.file(`render.sh`, this.generateFFmpegCommand(clip));
      }
    });

    zip.file("README_IMPORT_TO_TIKTOK.txt", 
`ClipCutter AI Pro Studio - Export Package
Project: ${projectTitle}
Total Clips: ${clips.length}
Format: 1080x1920 (9:16 Vertical)
Aspect Ratio: Mobile First

แนะนำขั้นตอนการนำไปใช้งาน:
1. แต่ละโฟลเดอร์บรรจุแคปชั่น แฮชแท็ก และไฟล์ซับไตเติลพร้อมใช้
2. ใช้ไฟล์ render.sh สำหรับการเรนเดอร์ผ่าน FFmpeg คุณภาพสูงสุด
3. สามารถคัดลอกข้อความใน caption.txt ไปแปะใน TikTok, Instagram Reels, และ YouTube Shorts ได้ทันที`
    );

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClipCutter_Pro_${projectTitle.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_').slice(0, 25)}_all_${clips.length}_clips.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static formatSrtTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
  }
}
