import { Clip, Project } from '../types';

export const SAMPLE_VIDEOS = {
  talk1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  talk2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  interview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
};

export const defaultClips: Clip[] = [
  {
    id: 1,
    start: '00:00',
    end: '00:20',
    secondsStart: 0,
    secondsEnd: 20,
    title: 'ทำไมการโทษระบบการเรียนถึงไม่ช่วยอะไรเลยในการทำงานจริง!',
    viralScore: 96,
    reason: 'เปิดประเด็นท้าทายความเชื่อใน 3 วินาทีแรก (Strong Counter-Intuitive Hook)',
    mood: 'serious',
    subtitleStyle: 'Karaoke Pop',
    bgm: 'Lo-Fi Chill Beats',
    bgmVolume: 25,
    duckingLevel: 15,
    sfxEnabled: true,
    font: 'Kanit',
    fontSize: 18,
    textColor: '#FFFFFF',
    highlightColor: '#F5B800',
    strokeColor: '#000000',
    position: 'bottom',
    wordsPerLine: 3,
    aspectRatio: '9:16',
    videoSourceUrl: SAMPLE_VIDEOS.talk1,
    originalAudioVolume: 0.95,
    isOriginalAudioMuted: false,
    caption: 'เมื่อคุณเข้าใจความจริงข้อนี้ในชีวิตการทำงาน ทุกอย่างจะเปลี่ยนไปทันที! 💡 ลองฟังมุมมองนี้ดูครับ #พอดแคสต์ #พัฒนาตัวเอง #วัยทำงาน #TheSecretSauce #ความรู้ #ClipCutterAI',
    tags: ['#พัฒนาตัวเอง', '#การทำงาน', '#จิตวิทยา', '#แรงบันดาลใจ'],
    keyMoments: [
      { time: 2, type: 'hook', text: 'การโทษระบบ' },
      { time: 8, type: 'emphasis', text: 'ไม่ช่วยอะไรเลย' },
      { time: 14, type: 'reveal', text: 'ทักษะที่แท้จริง' }
    ],
    sfxMarkers: [
      { id: 'sfx-1', time: 1.5, type: 'whoosh', label: 'Whoosh เปิดประเด็น' },
      { id: 'sfx-2', time: 8.0, type: 'impact', label: 'Boom กระแทกใจ' },
      { id: 'sfx-3', time: 14.0, type: 'ding', label: 'Ding เผยเคล็ดลับ' }
    ],
    visualFx: {
      autoReframe: true,
      framingMode: 'speaker_track',
      activeSpeakerTracking: true,
      showTrackingBox: true,
      trackingSmoothing: 'cinematic',
      stableFaceLock: true,
      deadZoneRadius: 0.05,
      targetFramerate: 60,
      clarityFilter: true,
      sharpeningLevel: 45,
      resolutionQuality: 'ultra_hd',
      zoomPunch: false,
      slowZoom: false,
      flashShake: false,
      colorGrade: 'cinematic',
      intensity: 'light'
    },
    speakers: [
      {
        id: 'spk-1-1',
        speakerName: 'ผู้ดำเนินรายการ (Host)',
        role: 'host',
        faceBox: { x: 0.32, y: 0.36, width: 0.18, height: 0.24 },
        startTime: 0.0,
        endTime: 7.8,
        shotType: 'medium'
      },
      {
        id: 'spk-1-2',
        speakerName: 'ผู้เชี่ยวชาญ (Guest Expert)',
        role: 'guest',
        faceBox: { x: 0.68, y: 0.38, width: 0.18, height: 0.24 },
        startTime: 7.9,
        endTime: 15.0,
        shotType: 'close-up'
      },
      {
        id: 'spk-1-3',
        speakerName: 'ผู้ดำเนินรายการ (Host)',
        role: 'host',
        faceBox: { x: 0.32, y: 0.36, width: 0.18, height: 0.24 },
        startTime: 15.1,
        endTime: 20.0,
        shotType: 'medium'
      }
    ],
    // Continuous subtitles from 0.0s through full 20.0s
    transcriptWords: [
      { word: 'เมื่อเรา', start: 0.0, end: 1.2 },
      { word: 'โทษระบบการเรียน', start: 1.3, end: 2.8, isEmphasis: true },
      { word: 'เรากำลังยอมแพ้', start: 2.9, end: 4.4 },
      { word: 'ต่ออนาคตตัวเอง', start: 4.5, end: 6.0 },
      { word: 'ในโลกความจริง', start: 6.1, end: 7.8 },
      { word: 'ไม่มีใครสนใจเกรด', start: 7.9, end: 9.6, isEmphasis: true },
      { word: 'สิ่งที่ทุกคนมองหา', start: 9.7, end: 11.4 },
      { word: 'คือผลงานจริง', start: 11.5, end: 13.2, isEmphasis: true },
      { word: 'ที่คุณลงมือทำ', start: 13.3, end: 15.0 },
      { word: 'และสร้างคุณค่าได้', start: 15.1, end: 17.2, isEmphasis: true },
      { word: 'อย่างแท้จริงครับ!', start: 17.3, end: 20.0, isEmphasis: true }
    ],
    contentInsights: [
      {
        id: 'ins-1-1',
        text: 'เมื่อเราโทษระบบการเรียน เรากำลังยอมแพ้ต่ออนาคตตัวเอง',
        startTime: 0.0,
        endTime: 6.0,
        importanceScore: 86,
        isCoreHighlight: false,
        keywords: ['โทษระบบ', 'ยอมแพ้', 'อนาคต'],
        category: 'hook'
      },
      {
        id: 'ins-1-2',
        text: 'ในโลกความจริง ไม่มีใครสนใจเกรด สิ่งที่ทุกคนมองหาคือผลงานจริง',
        startTime: 6.1,
        endTime: 13.2,
        importanceScore: 98,
        isCoreHighlight: true,
        keywords: ['โลกความจริง', 'ไม่สนใจเกรด', 'ผลงานจริง'],
        category: 'core_insight'
      },
      {
        id: 'ins-1-3',
        text: 'ที่คุณลงมือทำ และสร้างคุณค่าได้อย่างแท้จริงครับ!',
        startTime: 13.3,
        endTime: 20.0,
        importanceScore: 94,
        isCoreHighlight: true,
        keywords: ['ลงมือทำ', 'สร้างคุณค่า', 'แท้จริง'],
        category: 'conclusion'
      }
    ],
    overlays: [
      { id: 'ov-1', type: 'emoji', content: '🔥', x: 80, y: 18, startTime: 1, duration: 4 },
      { id: 'ov-2', type: 'text', content: '💡 ความจริงข้อที่ 1', x: 50, y: 70, startTime: 2, duration: 5 }
    ]
  },
  {
    id: 2,
    start: '00:00',
    end: '00:20',
    secondsStart: 0,
    secondsEnd: 20,
    title: 'วิธีจับโกหกคนใน 5 วินาที จากประสบการณ์สอบสวนจริง!',
    viralScore: 94,
    reason: 'How-to เชิงจิตวิทยาที่คนแชร์ต่อเยอะมาก อัตรา Watch-through สูง',
    mood: 'exciting',
    subtitleStyle: 'Bold Impact',
    bgm: 'Cyberpunk Bass',
    bgmVolume: 25,
    duckingLevel: 18,
    sfxEnabled: true,
    font: 'Kanit',
    fontSize: 20,
    textColor: '#FFFFFF',
    highlightColor: '#F5B800',
    strokeColor: '#000000',
    position: 'bottom',
    wordsPerLine: 3,
    aspectRatio: '9:16',
    videoSourceUrl: SAMPLE_VIDEOS.talk2,
    originalAudioVolume: 0.95,
    isOriginalAudioMuted: false,
    caption: 'เทคนิคสังเกตภาษากายที่คนส่วนใหญ่ไม่เคยรู้! รู้วิธีนี้แล้วจะดูคนออกทะลุปรุโปร่ง 🤫 #จิตวิทยา #จับโกหก #สาระน่ารู้ #ภาษากาย',
    tags: ['#จิตวิทยา', '#จับโกหก', '#ฮาวทู', '#ทริคดีๆ'],
    keyMoments: [
      { time: 1.5, type: 'hook', text: '5 วินาที' },
      { time: 10, type: 'reveal', text: 'ทิศทางสายตา' }
    ],
    sfxMarkers: [
      { id: 'sfx-21', time: 1.0, type: 'whoosh', label: 'Whoosh จั่วหัว' },
      { id: 'sfx-22', time: 10.0, type: 'impact', label: 'Impact จังหวะเฉลย' }
    ],
    visualFx: {
      autoReframe: true,
      framingMode: 'speaker_track',
      activeSpeakerTracking: true,
      showTrackingBox: true,
      trackingSmoothing: 'cinematic',
      stableFaceLock: true,
      deadZoneRadius: 0.05,
      targetFramerate: 60,
      clarityFilter: true,
      sharpeningLevel: 45,
      resolutionQuality: 'ultra_hd',
      zoomPunch: false,
      slowZoom: false,
      flashShake: false,
      colorGrade: 'cyberpunk',
      intensity: 'light'
    },
    speakers: [
      {
        id: 'spk-2-1',
        speakerName: 'นักจิตวิทยา (Psychologist)',
        role: 'host',
        faceBox: { x: 0.35, y: 0.36, width: 0.19, height: 0.25 },
        startTime: 0.0,
        endTime: 9.4,
        shotType: 'close-up'
      },
      {
        id: 'spk-2-2',
        speakerName: 'ผู้สอบสวน (Investigator)',
        role: 'guest',
        faceBox: { x: 0.65, y: 0.38, width: 0.19, height: 0.25 },
        startTime: 9.5,
        endTime: 20.0,
        shotType: 'medium'
      }
    ],
    // Continuous subtitles from 0.0s through full 20.0s
    transcriptWords: [
      { word: 'ลองสังเกตสายตา', start: 0.0, end: 1.8, isEmphasis: true },
      { word: 'ในเสี้ยววินาทีแรก', start: 1.9, end: 3.5 },
      { word: 'เวลาที่คนเรา', start: 3.6, end: 5.2 },
      { word: 'กำลังแต่งเรื่องขึ้นมา', start: 5.3, end: 7.2, isEmphasis: true },
      { word: 'สายตามักเหลือบขึ้นขวา', start: 7.3, end: 9.4, isEmphasis: true },
      { word: 'เพราะสมองส่วนคิดภาพ', start: 9.5, end: 11.6 },
      { word: 'กำลังถูกสั่งให้ทำงาน', start: 11.7, end: 14.0 },
      { word: 'แต่ถ้าเป็นความทรงจำจริง', start: 14.1, end: 16.8, isEmphasis: true },
      { word: 'ตาจะมองไปทางซ้ายครับ', start: 16.9, end: 20.0, isEmphasis: true }
    ],
    contentInsights: [
      {
        id: 'ins-2-1',
        text: 'ลองสังเกตสายตาในเสี้ยววินาทีแรกเวลาที่คนเรากำลังแต่งเรื่องขึ้นมา',
        startTime: 0.0,
        endTime: 7.2,
        importanceScore: 89,
        isCoreHighlight: false,
        keywords: ['สังเกตสายตา', 'เสี้ยววินาที', 'แต่งเรื่อง'],
        category: 'hook'
      },
      {
        id: 'ins-2-2',
        text: 'สายตามักเหลือบขึ้นขวา เพราะสมองส่วนคิดภาพกำลังถูกสั่งให้ทำงาน',
        startTime: 7.3,
        endTime: 14.0,
        importanceScore: 99,
        isCoreHighlight: true,
        keywords: ['เหลือบขึ้นขวา', 'สมองคิดภาพ', 'แต่งเรื่อง'],
        category: 'core_insight'
      },
      {
        id: 'ins-2-3',
        text: 'แต่ถ้าเป็นความทรงจำจริง ตาจะมองไปทางซ้ายครับ',
        startTime: 14.1,
        endTime: 20.0,
        importanceScore: 95,
        isCoreHighlight: true,
        keywords: ['ความทรงจำจริง', 'มองทางซ้าย', 'จับโกหก'],
        category: 'conclusion'
      }
    ],
    overlays: [
      { id: 'ov-21', type: 'emoji', content: '🤫', x: 75, y: 22, startTime: 0.5, duration: 5 }
    ]
  },
  {
    id: 3,
    start: '00:00',
    end: '00:20',
    secondsStart: 0,
    secondsEnd: 20,
    title: 'บทเรียนเกือบเจ๊ง 10 ล้าน ในปีแรกของการเปิดบริษัท',
    viralScore: 91,
    reason: 'เรื่องเล่าความล้มเหลวสร้าง Empathy และอารมณ์ร่วมสูงมาก',
    mood: 'emotional',
    subtitleStyle: 'Minimal',
    bgm: 'Emotional Piano',
    bgmVolume: 30,
    duckingLevel: 12,
    sfxEnabled: true,
    font: 'Prompt',
    fontSize: 18,
    textColor: '#FFFFFF',
    highlightColor: '#FFF3C4',
    strokeColor: '#000000',
    position: 'bottom',
    wordsPerLine: 3,
    aspectRatio: '9:16',
    videoSourceUrl: SAMPLE_VIDEOS.talk1,
    originalAudioVolume: 0.95,
    isOriginalAudioMuted: false,
    caption: 'วันนั้นผมนั่งมองยอดเงินในบัญชีเหลือไม่ถึงพันบาท... บทเรียนที่แพงที่สุดในชีวิต 📉 #ธุรกิจ #ข้อคิด #สู้ชีวิต #สตาร์ทอัพ',
    tags: ['#ธุรกิจ', '#ความล้มเหลว', '#บทเรียน', '#กำลังใจ'],
    keyMoments: [
      { time: 3, type: 'punchline', text: 'ติดลบ 10 ล้าน' }
    ],
    sfxMarkers: [
      { id: 'sfx-31', time: 2.8, type: 'impact', label: 'Deep Impact' }
    ],
    visualFx: {
      autoReframe: true,
      framingMode: 'speaker_track',
      activeSpeakerTracking: true,
      showTrackingBox: true,
      trackingSmoothing: 'cinematic',
      stableFaceLock: true,
      deadZoneRadius: 0.05,
      targetFramerate: 60,
      clarityFilter: true,
      sharpeningLevel: 45,
      resolutionQuality: 'ultra_hd',
      zoomPunch: false,
      slowZoom: false,
      flashShake: false,
      colorGrade: 'warm',
      intensity: 'light'
    },
    speakers: [
      {
        id: 'spk-3-1',
        speakerName: 'CEO ผู้ก่อตั้ง (Founder)',
        role: 'speaker',
        faceBox: { x: 0.40, y: 0.36, width: 0.20, height: 0.26 },
        startTime: 0.0,
        endTime: 20.0,
        shotType: 'close-up'
      }
    ],
    // Continuous subtitles from 0.0s through full 20.0s
    transcriptWords: [
      { word: 'ความผิดพลาดครั้งใหญ่', start: 0.0, end: 2.0 },
      { word: 'คือการคิดว่ายอดขาย', start: 2.1, end: 4.2 },
      { word: 'จะเท่ากับกำไรเสมอ', start: 4.3, end: 6.4, isEmphasis: true },
      { word: 'เราลืมคำนวณเงินสด', start: 6.5, end: 8.6, isEmphasis: true },
      { word: 'จนวันที่ต้องจ่ายเงินเดือน', start: 8.7, end: 11.2 },
      { word: 'เงินในบัญชีเหลือศูนย์', start: 11.3, end: 13.8, isEmphasis: true },
      { word: 'นั่นคือจุดเปลี่ยน', start: 13.9, end: 16.2 },
      { word: 'ที่สอนให้ผมรู้ว่า', start: 16.3, end: 18.0 },
      { word: 'เงินสดคือกำแพงชีวิต', start: 18.1, end: 20.0, isEmphasis: true }
    ],
    overlays: [
      { id: 'ov-31', type: 'emoji', content: '📉', x: 50, y: 25, startTime: 1, duration: 6 }
    ]
  },
  {
    id: 4,
    start: '00:00',
    end: '00:20',
    secondsStart: 0,
    secondsEnd: 20,
    title: 'เทคนิคลับนอน 4 ชั่วโมง แต่ตื่นมาสดชื่นเหมือนนอน 8 ชม.?!',
    viralScore: 89,
    reason: 'เจาะกลุ่มคนนอนดึก Gen Z / วัยทำงาน แชร์เก็บไว้ดูซ้ำสูง',
    mood: 'inspiring',
    subtitleStyle: 'Emphasis Highlight',
    bgm: 'Inspiring Ambient',
    bgmVolume: 25,
    duckingLevel: 15,
    sfxEnabled: true,
    font: 'Kanit',
    fontSize: 18,
    textColor: '#FFFFFF',
    highlightColor: '#F5B800',
    strokeColor: '#000000',
    position: 'bottom',
    wordsPerLine: 3,
    aspectRatio: '9:16',
    videoSourceUrl: SAMPLE_VIDEOS.talk2,
    originalAudioVolume: 0.95,
    isOriginalAudioMuted: false,
    caption: 'เคล็ดลับ Sleep Cycle ที่สายทำงานหนักต้องรู้! ⚡️ ลองใช้สูตร 90 นาทีนี้ดูครับ #สุขภาพ #นอนหลับ #ประสิทธิภาพ #Biohacking',
    tags: ['#นอนดึก', '#สุขภาพ', '#เคล็ดลับ', '#Productivity'],
    keyMoments: [
      { time: 2, type: 'hook', text: 'รอบการนอน 90 นาที' }
    ],
    sfxMarkers: [
      { id: 'sfx-41', time: 1.2, type: 'whoosh', label: 'Whoosh' },
      { id: 'sfx-42', time: 6.0, type: 'pop', label: 'Pop Word' }
    ],
    visualFx: {
      autoReframe: true,
      framingMode: 'speaker_track',
      activeSpeakerTracking: true,
      showTrackingBox: true,
      trackingSmoothing: 'cinematic',
      zoomPunch: false,
      slowZoom: false,
      flashShake: false,
      colorGrade: 'natural',
      intensity: 'light'
    },
    speakers: [
      {
        id: 'spk-4-1',
        speakerName: 'แพทย์ผู้เชี่ยวชาญ (Sleep Specialist)',
        role: 'speaker',
        faceBox: { x: 0.48, y: 0.36, width: 0.18, height: 0.24 },
        startTime: 0.0,
        endTime: 20.0,
        shotType: 'close-up'
      }
    ],
    // Continuous subtitles from 0.0s through full 20.0s
    transcriptWords: [
      { word: 'หัวใจสำคัญของการนอน', start: 0.0, end: 2.2 },
      { word: 'ไม่ได้อยู่ที่ชั่วโมง', start: 2.3, end: 4.5, isEmphasis: true },
      { word: 'แต่อยู่ที่รอบการหลับลึก', start: 4.6, end: 7.2, isEmphasis: true },
      { word: 'สมองของเราทำงาน', start: 7.3, end: 9.4 },
      { word: 'เป็นรอบละ 90 นาที', start: 9.5, end: 12.0, isEmphasis: true },
      { word: 'ถ้าคุณตื่นตอนครบ 3 ชม.', start: 12.1, end: 14.8 },
      { word: 'หรือ 4 ชม. ครึ่งพอดี', start: 14.9, end: 17.4, isEmphasis: true },
      { word: 'จะสดชื่นกว่านอน 7 ชม.!', start: 17.5, end: 20.0, isEmphasis: true }
    ],
    overlays: [
      { id: 'ov-41', type: 'emoji', content: '⚡️', x: 80, y: 15, startTime: 0.5, duration: 4 }
    ]
  },
  {
    id: 5,
    start: '00:00',
    end: '00:18',
    secondsStart: 0,
    secondsEnd: 18,
    title: 'จังหวะฮาแตก! เมื่อโปรแกรมเมอร์พยายามอธิบายโค้ดให้ฝ่ายบัญชีฟัง',
    viralScore: 88,
    reason: 'มุกตลกสายงาน Relatable Content ทำให้เกิดการแท็กเพื่อนในคอมเมนต์',
    mood: 'funny',
    subtitleStyle: 'Bold Impact',
    bgm: 'Upbeat Energetic',
    bgmVolume: 30,
    duckingLevel: 15,
    sfxEnabled: true,
    font: 'Prompt',
    fontSize: 20,
    textColor: '#FFFFFF',
    highlightColor: '#F5B800',
    strokeColor: '#000000',
    position: 'bottom',
    wordsPerLine: 3,
    aspectRatio: '9:16',
    videoSourceUrl: SAMPLE_VIDEOS.interview,
    originalAudioVolume: 0.95,
    isOriginalAudioMuted: false,
    caption: 'แท็กเพื่อนโปรแกรมเมอร์กับเพื่อนบัญชีด่วน 😂 เมื่อสองโลกมาเจอกัน ความฮาจึงบังเกิด #โปรแกรมเมอร์ #ฮาๆ #ชีวิตทำงาน #มีม',
    tags: ['#ฮาๆ', '#โปรแกรมเมอร์', '#มุกตลก', '#มีม'],
    keyMoments: [
      { time: 4, type: 'punchline', text: 'มันเวิร์กในเครื่องผมนะ!' }
    ],
    sfxMarkers: [
      { id: 'sfx-51', time: 3.8, type: 'rimshot', label: 'Rimshot จังหวะตบมุก' }
    ],
    visualFx: {
      autoReframe: true,
      framingMode: 'speaker_track',
      activeSpeakerTracking: true,
      showTrackingBox: true,
      trackingSmoothing: 'cinematic',
      zoomPunch: false,
      slowZoom: false,
      flashShake: false,
      colorGrade: 'natural',
      intensity: 'light'
    },
    speakers: [
      {
        id: 'spk-5-1',
        speakerName: 'โปรแกรมเมอร์ (Dev)',
        role: 'host',
        faceBox: { x: 0.35, y: 0.38, width: 0.18, height: 0.24 },
        startTime: 0.0,
        endTime: 9.8,
        shotType: 'medium'
      },
      {
        id: 'spk-5-2',
        speakerName: 'ฝ่ายบัญชี (Accountant)',
        role: 'guest',
        faceBox: { x: 0.65, y: 0.38, width: 0.18, height: 0.24 },
        startTime: 9.9,
        endTime: 18.0,
        shotType: 'close-up'
      }
    ],
    // Continuous subtitles from 0.0s through full 18.0s
    transcriptWords: [
      { word: 'เมื่อวานฝ่ายบัญชีเดินมาถาม', start: 0.0, end: 2.4 },
      { word: 'ทำไมระบบคิดเงินล่ม', start: 2.5, end: 4.8, isEmphasis: true },
      { word: 'ผมเลยเปิดโน้ตบุ๊กโชว์', start: 4.9, end: 7.2 },
      { word: 'แล้วพูดคำคลาสสิกว่า', start: 7.3, end: 9.8 },
      { word: 'มันเวิร์กในเครื่องผมนะ!', start: 9.9, end: 12.6, isEmphasis: true },
      { word: 'พี่บัญชีเลยบอกว่า', start: 12.7, end: 15.0 },
      { word: 'งั้นย้ายเครื่องน้องไปให้ลูกค้าใช้เลย!', start: 15.1, end: 18.0, isEmphasis: true }
    ],
    overlays: [
      { id: 'ov-51', type: 'emoji', content: '😂', x: 50, y: 30, startTime: 3.5, duration: 4 }
    ]
  },
  {
    id: 6,
    start: '00:00',
    end: '00:20',
    secondsStart: 0,
    secondsEnd: 20,
    title: '3 นิสัยของคนที่จะรวยในยุค AI ที่โรงเรียนไม่เคยสอนคุณ',
    viralScore: 95,
    reason: 'กระแส AI กำลังมาแรง และเป็นความรู้เชิงเปรียบเทียบชวนอยากรู้',
    mood: 'serious',
    subtitleStyle: 'Dynamic Hook Title',
    bgm: 'Lo-Fi Chill Beats',
    bgmVolume: 25,
    duckingLevel: 15,
    sfxEnabled: true,
    font: 'Kanit',
    fontSize: 18,
    textColor: '#FFFFFF',
    highlightColor: '#F5B800',
    strokeColor: '#000000',
    position: 'bottom',
    wordsPerLine: 3,
    aspectRatio: '9:16',
    videoSourceUrl: SAMPLE_VIDEOS.talk1,
    originalAudioVolume: 0.95,
    isOriginalAudioMuted: false,
    caption: 'คนที่ใช้ AI เป็น จะมาแทนที่คนที่ไม่ยอมเรียนรู้ 💡 3 ทักษะนี้เริ่มฝึกได้เลยวันนี้ #AI #อนาคต #การเงิน #สร้างตัว #สาระดีๆ',
    tags: ['#AI', '#การเงิน', '#สร้างตัว', '#พัฒนาตัวเอง'],
    keyMoments: [
      { time: 1.5, type: 'hook', text: '3 นิสัยสำคัญ' }
    ],
    sfxMarkers: [
      { id: 'sfx-61', time: 1.2, type: 'whoosh', label: 'Whoosh' },
      { id: 'sfx-62', time: 8.0, type: 'ding', label: 'Ding' }
    ],
    visualFx: {
      autoReframe: true,
      framingMode: 'speaker_track',
      activeSpeakerTracking: true,
      showTrackingBox: true,
      trackingSmoothing: 'cinematic',
      zoomPunch: false,
      slowZoom: false,
      flashShake: false,
      colorGrade: 'cinematic',
      intensity: 'light'
    },
    speakers: [
      {
        id: 'spk-6-1',
        speakerName: 'ผู้บรรยาย (Keynote Speaker)',
        role: 'speaker',
        faceBox: { x: 0.42, y: 0.36, width: 0.18, height: 0.24 },
        startTime: 0.0,
        endTime: 20.0,
        shotType: 'close-up'
      }
    ],
    // Continuous subtitles from 0.0s through full 20.0s
    transcriptWords: [
      { word: 'ในยุคที่ AI เก่งขึ้นทุกวัน', start: 0.0, end: 2.4 },
      { word: 'ทักษะข้อแรกที่สำคัญที่สุด', start: 2.5, end: 5.0, isEmphasis: true },
      { word: 'คือทักษะการตั้งคำถาม', start: 5.1, end: 7.6, isEmphasis: true },
      { word: 'ไม่ใช่การจำคำตอบอีกต่อไป', start: 7.7, end: 10.4 },
      { word: 'เพราะคำตอบหาได้ใน 1 วินาที', start: 10.5, end: 13.2 },
      { word: 'แต่คำถามที่ดีจะนำไปสู่', start: 13.3, end: 16.0 },
      { word: 'โอกาสทางธุรกิจใหม่ๆ', start: 16.1, end: 18.2, isEmphasis: true },
      { word: 'ที่ไม่มีใครเคยนึกถึงครับ', start: 18.3, end: 20.0, isEmphasis: true }
    ],
    overlays: [
      { id: 'ov-61', type: 'emoji', content: '💡', x: 70, y: 20, startTime: 1, duration: 5 }
    ]
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'The Secret Sauce: ถอดรหัสเศรษฐกิจ & การสร้างธุรกิจ 2026',
    sourceUrl: 'https://www.youtube.com/watch?v=the_secret_sauce_2026',
    sourceType: 'youtube',
    videoSourceUrl: SAMPLE_VIDEOS.talk1,
    durationSeconds: 3120,
    formattedDuration: '52:00',
    createdAt: 'วันนี้ 14:30',
    clipsCount: 6,
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
    clips: defaultClips
  },
  {
    id: 'proj-2',
    title: 'Mission To The Moon: จิตวิทยาการทำงานและการก้าวข้าม Burnout',
    sourceUrl: 'https://www.youtube.com/watch?v=mission_to_moon_burnout',
    sourceType: 'youtube',
    videoSourceUrl: SAMPLE_VIDEOS.talk2,
    durationSeconds: 2450,
    formattedDuration: '40:50',
    createdAt: 'เมื่อวาน',
    clipsCount: 4,
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    clips: defaultClips.slice(1, 5)
  },
  {
    id: 'proj-3',
    title: 'ลงทุนแมน: เจาะลึกกระแส AI และอนาคตของตลาดแรงงาน',
    sourceUrl: 'https://www.youtube.com/watch?v=longtunman_ai_revolution',
    sourceType: 'youtube',
    videoSourceUrl: SAMPLE_VIDEOS.interview,
    durationSeconds: 1890,
    formattedDuration: '31:30',
    createdAt: '3 วันก่อน',
    clipsCount: 3,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    clips: defaultClips.slice(0, 3)
  }
];
