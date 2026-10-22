import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Clip, SpeakerDetection } from '../types';
import { soundEngine } from '../services/soundEffects';
import { 
  Volume2, VolumeX, Maximize2, Crop, Target, Scan, 
  UserCheck, Lock, Unlock, Sparkles, Zap 
} from 'lucide-react';

interface CanvasVideoPlayerProps {
  clip: Clip;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate?: (time: number) => void;
  width?: number;
  height?: number;
  videoSourceUrl?: string | null;
  onToggleAudioMute?: () => void;
  onToggleFramingMode?: (mode?: 'fit' | 'fill' | 'speaker_track') => void;
  onToggleTrackingBox?: () => void;
  onToggleFramerate?: () => void;
  onToggleClarity?: () => void;
  onToggleStableLock?: () => void;
}

export const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = ({
  clip,
  currentTime,
  isPlaying,
  onTimeUpdate,
  width = 340,
  height = 600,
  videoSourceUrl,
  onToggleAudioMute,
  onToggleFramingMode,
  onToggleTrackingBox,
  onToggleFramerate,
  onToggleClarity,
  onToggleStableLock
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeUpdateCallRef = useRef<number>(0);
  const lastPlayedSfxRef = useRef<Set<string | number>>(new Set());

  // Camera Direct Cut state refs for rock-solid active speaker framing (Direct Cut, 0 Zoom drift, 0 Jitter)
  const currentPanXRef = useRef<number>(0.5);
  const currentPanYRef = useRef<number>(0.38);
  const currentZoomRef = useRef<number>(1.28);
  const lastActiveSpeakerIdRef = useRef<string | number | null>(null);
  const lastFrameTimestampRef = useRef<number>(0);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const activeVideoUrl = videoSourceUrl || clip.videoSourceUrl;
  const isAudioMuted = Boolean(clip.isOriginalAudioMuted);
  const audioVolume = typeof clip.originalAudioVolume === 'number' ? clip.originalAudioVolume : 0.95;
  const framingMode = clip.visualFx?.framingMode || (clip.visualFx?.activeSpeakerTracking ? 'speaker_track' : 'fit');
  const isDirectCutMode = framingMode === 'speaker_track' || framingMode === 'auto_cut' || Boolean(clip.visualFx?.activeSpeakerTracking);
  const showTrackingBox = clip.visualFx?.showTrackingBox ?? true;
  const stableFaceLock = clip.visualFx?.stableFaceLock ?? true;
  const targetFramerate = clip.visualFx?.targetFramerate ?? 60; // 60 fps or 30 fps constant frame rate
  const clarityFilter = clip.visualFx?.clarityFilter ?? false; // Optional clarity filter
  const sharpeningLevel = clip.visualFx?.sharpeningLevel ?? 30;

  // Reset SFX cache when seeking backwards
  useEffect(() => {
    if (currentTime === 0) {
      lastPlayedSfxRef.current.clear();
    }
  }, [currentTime]);

  // Synchronize play/pause state without thrashing video.currentTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoUrl) return;

    video.muted = isAudioMuted;
    video.volume = audioVolume;

    if (isPlaying) {
      const targetTime = (clip.secondsStart || 0) + currentTime;
      if (Math.abs(video.currentTime - targetTime) > 0.5) {
        video.currentTime = targetTime;
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay fallback: if audio blocked by browser, mute and retry
          if (!video.muted) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying, activeVideoUrl, isAudioMuted, audioVolume, clip.secondsStart]);

  // Handle explicit user seeks while paused
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying || !activeVideoUrl) return;
    const targetTime = (clip.secondsStart || 0) + currentTime;
    if (Math.abs(video.currentTime - targetTime) > 0.15) {
      video.currentTime = targetTime;
    }
  }, [currentTime, isPlaying, activeVideoUrl, clip.secondsStart]);

  // Check SFX synchronization and Audio Ducking
  const checkSfxAndDucking = useCallback((curTime: number) => {
    if (!clip.sfxEnabled) return;
    clip.sfxMarkers.forEach(marker => {
      if (
        Math.abs(curTime - marker.time) < 0.12 &&
        !lastPlayedSfxRef.current.has(marker.id)
      ) {
        soundEngine.playSfx(marker.type);
        lastPlayedSfxRef.current.add(marker.id);
      }
    });

    const isSpeaking = clip.transcriptWords.some(
      w => curTime >= w.start && curTime <= w.end
    );
    soundEngine.setAudioDucking(isSpeaking, clip.duckingLevel);
  }, [clip]);

  // High-performance Framerate & Ultra-Sharp Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // HiDPI 2x Retina backbuffer (e.g. 680x1200) for pin-sharp 1080p source video detail
    const dpr = 2;
    const internalWidth = width * dpr;
    const internalHeight = height * dpr;

    if (canvas.width !== internalWidth || canvas.height !== internalHeight) {
      canvas.width = internalWidth;
      canvas.height = internalHeight;
    }

    const frameIntervalMs = 1000 / targetFramerate;

    const render = (now: DOMHighResTimeStamp = performance.now()) => {
      // 1. Precise Constant Framerate Limiter (30 FPS or 60 FPS)
      if (isPlaying) {
        const elapsed = now - lastFrameTimestampRef.current;
        if (elapsed < frameIntervalMs - 1.5) {
          animFrameRef.current = requestAnimationFrame(render);
          return;
        }
        lastFrameTimestampRef.current = now - (elapsed % frameIntervalMs);
      }

      const video = videoRef.current;
      let effectiveTime = currentTime;

      // When playing with real video, read high-precision time from video element
      if (isPlaying && video && !video.paused && video.readyState >= 2) {
        const rawTime = video.currentTime - (clip.secondsStart || 0);
        effectiveTime = Math.max(0, rawTime);

        // Notify parent throttled (~120ms) to update scrubber without state thrashing
        if (onTimeUpdate && now - lastTimeUpdateCallRef.current > 120) {
          lastTimeUpdateCallRef.current = now;
          onTimeUpdate(Number(effectiveTime.toFixed(1)));
        }

        checkSfxAndDucking(effectiveTime);
      }

      // Safe bounds setup
      const safeMarginX = 20;
      const safeMaxWidth = width - safeMarginX * 2; // Strict 9:16 safe width
      const clipDuration = Math.max(1, (clip.secondsEnd || 20) - (clip.secondsStart || 0));

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // ----------------------------------------------------
      // ACTIVE SPEAKER DETECTION & DIRECT HARD CUT (NO ZOOM / NO JITTER)
      // ----------------------------------------------------
      const speakers: SpeakerDetection[] = clip.speakers || [];
      const activeSpeaker = speakers.find(s => effectiveTime >= s.startTime && effectiveTime <= s.endTime) || speakers[0];

      const currentSpeakerId = activeSpeaker ? activeSpeaker.id : null;
      const FIXED_ZOOM = 1.28; // Constant framing ratio (No zoom drift)

      // DIRECT CUT: Instant hard cut when active speaker changes (0 lerp, 0 glide)
      if (currentSpeakerId !== lastActiveSpeakerIdRef.current) {
        lastActiveSpeakerIdRef.current = currentSpeakerId;

        if (activeSpeaker) {
          // Snap instantly to the speaker center with headroom offset (0.40)
          currentPanXRef.current = activeSpeaker.faceBox.x + activeSpeaker.faceBox.width / 2;
          currentPanYRef.current = activeSpeaker.faceBox.y + activeSpeaker.faceBox.height * 0.40;
          currentZoomRef.current = FIXED_ZOOM;
        } else {
          currentPanXRef.current = 0.5;
          currentPanYRef.current = 0.38;
          currentZoomRef.current = FIXED_ZOOM;
        }
      }
      // Camera stays 100% stationary and rock-solid while current speaker speaks (zero jitter)

      // ----------------------------------------------------
      // VIDEO FRAMING & CLARITY FILTER
      // ----------------------------------------------------
      let hasDrawnVideo = false;
      let appliedSx = 0;
      let appliedSy = 0;
      let appliedSWidth = 1;
      let appliedSHeight = 1;
      let fitPosX = 0;
      let fitPosY = 0;
      let fitRenderW = width;
      let fitRenderH = height;
      let vWidth = width;
      let vHeight = height;

      // Clarity and Sharpening filter calculation
      let clarityFilterCss = 'none';
      if (clarityFilter) {
        const contrastVal = (1.0 + (sharpeningLevel / 100) * 0.08).toFixed(3);
        const saturateVal = (1.0 + (sharpeningLevel / 100) * 0.06).toFixed(3);
        clarityFilterCss = `contrast(${contrastVal}) saturate(${saturateVal}) brightness(1.01)`;
      }

      if (video && video.readyState >= 2 && !videoError) {
        try {
          vWidth = video.videoWidth;
          vHeight = video.videoHeight;
          const vRatio = vWidth / vHeight;
          const cRatio = width / height;

          if (framingMode === 'speaker_track') {
            // 1. SMART SPEAKER TRACKING: Dynamically pans and zooms to active speaker with generous headroom
            const zoom = Math.max(1.0, currentZoomRef.current);
            let sHeight = vHeight / zoom;
            let sWidth = sHeight * cRatio;
            if (sWidth > vWidth) {
              sWidth = vWidth;
              sHeight = sWidth / cRatio;
            }

            let sx = (currentPanXRef.current * vWidth) - (sWidth / 2);
            // Anchor with headroom offset (0.40) so top of head and hair is never clipped
            let sy = (currentPanYRef.current * vHeight) - (sHeight * 0.40);

            // Strict boundary clamping
            sx = Math.max(0, Math.min(vWidth - sWidth, sx));
            sy = Math.max(0, Math.min(vHeight - sHeight, sy));

            appliedSx = sx;
            appliedSy = sy;
            appliedSWidth = sWidth;
            appliedSHeight = sHeight;

            if (clarityFilterCss !== 'none') {
              ctx.filter = clarityFilterCss;
            }
            ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
            ctx.filter = 'none';
            hasDrawnVideo = true;
          } else if (framingMode === 'fit') {
            // 2. SMART FIT: 100% full person visible, head never cut off, with blurred ambient background
            ctx.filter = 'blur(16px) brightness(0.4)';
            ctx.drawImage(video, -20, -20, width + 40, height + 40);
            ctx.filter = 'none';

            let renderW = width;
            let renderH = width / vRatio;

            if (renderH > height) {
              renderH = height;
              renderW = height * vRatio;
            }

            const posX = (width - renderW) / 2;
            const posY = (height - renderH) / 2;

            fitPosX = posX;
            fitPosY = posY;
            fitRenderW = renderW;
            fitRenderH = renderH;

            if (clarityFilterCss !== 'none') {
              ctx.filter = clarityFilterCss;
            }
            ctx.drawImage(video, 0, 0, vWidth, vHeight, posX, posY, renderW, renderH);
            ctx.filter = 'none';
            hasDrawnVideo = true;
          } else {
            // 3. FACE-SAFE 9:16 CROP: Static crop anchored at top 18% to preserve generous headroom
            let sWidth = vWidth;
            let sHeight = vHeight;
            let sx = 0;
            let sy = 0;

            if (vRatio > cRatio) {
              sWidth = vHeight * cRatio;
              sx = (vWidth - sWidth) / 2;
            } else {
              sHeight = vWidth / cRatio;
              sy = Math.max(0, (vHeight - sHeight) * 0.18);
            }

            appliedSx = sx;
            appliedSy = sy;
            appliedSWidth = sWidth;
            appliedSHeight = sHeight;

            if (clarityFilterCss !== 'none') {
              ctx.filter = clarityFilterCss;
            }
            ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
            ctx.filter = 'none';
            hasDrawnVideo = true;
          }
        } catch {
          hasDrawnVideo = false;
        }
      }

      if (!hasDrawnVideo) {
        // Fallback Studio Gradient with Animated Dual-Speaker Face Track Simulation
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#18181b');
        bgGrad.addColorStop(0.5, '#09090b');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Grid lines for studio aesthetic
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Animated Dual Host/Guest Studio figures
        const isHostActive = !activeSpeaker || activeSpeaker.role === 'host';
        const hostScale = isHostActive ? 1.08 : 0.95;
        const guestScale = !isHostActive ? 1.08 : 0.95;

        // Person 1 (Host - Left)
        ctx.save();
        ctx.fillStyle = isHostActive ? '#F5B800' : '#27272a';
        ctx.beginPath();
        ctx.arc(width * 0.32, height * 0.35, 36 * hostScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isHostActive ? '#3f3f46' : '#18181b';
        ctx.beginPath();
        ctx.ellipse(width * 0.32, height * 0.49, 70 * hostScale, 48 * hostScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Person 2 (Guest - Right)
        ctx.save();
        ctx.fillStyle = !isHostActive ? '#38BDF8' : '#27272a';
        ctx.beginPath();
        ctx.arc(width * 0.68, height * 0.35, 36 * guestScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = !isHostActive ? '#3f3f46' : '#18181b';
        ctx.beginPath();
        ctx.ellipse(width * 0.68, height * 0.49, 70 * guestScale, 48 * guestScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#a1a1aa';
        ctx.font = `600 12px ${clip.font || 'Kanit'}`;
        ctx.textAlign = 'center';
        ctx.fillText(
          framingMode === 'speaker_track' ? 'AI Speaker Face Tracking 60 FPS' : '9:16 Studio Ready',
          width / 2,
          height * 0.58
        );
      }

      // ----------------------------------------------------
      // AI FACE DETECTION HUD & RETICLES OVERLAY
      // ----------------------------------------------------
      if (showTrackingBox && speakers.length > 0) {
        speakers.forEach(spk => {
          let cFaceX = 0;
          let cFaceY = 0;
          let cFaceW = 0;
          let cFaceH = 0;

          if (framingMode === 'fit') {
            cFaceX = fitPosX + (spk.faceBox.x * fitRenderW);
            cFaceY = fitPosY + (spk.faceBox.y * fitRenderH);
            cFaceW = spk.faceBox.width * fitRenderW;
            cFaceH = spk.faceBox.height * fitRenderH;
          } else if (hasDrawnVideo) {
            cFaceX = ((spk.faceBox.x * vWidth - appliedSx) / appliedSWidth) * width;
            cFaceY = ((spk.faceBox.y * vHeight - appliedSy) / appliedSHeight) * height;
            cFaceW = ((spk.faceBox.width * vWidth) / appliedSWidth) * width;
            cFaceH = ((spk.faceBox.height * vHeight) / appliedSHeight) * height;
          } else {
            // Fallback studio representation
            const isHost = spk.role === 'host';
            const centerX = width * (isHost ? 0.32 : 0.68);
            cFaceW = 68;
            cFaceH = 74;
            cFaceX = centerX - cFaceW / 2;
            cFaceY = height * 0.35 - cFaceH / 2;
          }

          // Only render if reasonably visible within canvas boundaries
          if (cFaceX + cFaceW > -10 && cFaceX < width + 10 && cFaceY + cFaceH > -10 && cFaceY < height + 10) {
            const isActive = activeSpeaker && activeSpeaker.id === spk.id;
            const cornerLen = Math.max(10, Math.min(18, cFaceW * 0.28));

            ctx.save();
            ctx.lineWidth = isActive ? 2.4 : 1.5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = isActive ? '#F5B800' : 'rgba(56, 189, 248, 0.6)';

            // 4 Sleek Corner Brackets
            // Top-left
            ctx.beginPath();
            ctx.moveTo(cFaceX, cFaceY + cornerLen);
            ctx.lineTo(cFaceX, cFaceY);
            ctx.lineTo(cFaceX + cornerLen, cFaceY);
            ctx.stroke();

            // Top-right
            ctx.beginPath();
            ctx.moveTo(cFaceX + cFaceW - cornerLen, cFaceY);
            ctx.lineTo(cFaceX + cFaceW, cFaceY);
            ctx.lineTo(cFaceX + cFaceW, cFaceY + cornerLen);
            ctx.stroke();

            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(cFaceX, cFaceY + cFaceH - cornerLen);
            ctx.lineTo(cFaceX, cFaceY + cFaceH);
            ctx.lineTo(cFaceX + cornerLen, cFaceY + cFaceH);
            ctx.stroke();

            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(cFaceX + cFaceW - cornerLen, cFaceY + cFaceH);
            ctx.lineTo(cFaceX + cFaceW, cFaceY + cFaceH);
            ctx.lineTo(cFaceX + cFaceW, cFaceY + cFaceH - cornerLen);
            ctx.stroke();

            // Speaker Tag Badge
            ctx.font = 'bold 9px Kanit';
            const badgeLabel = isActive 
              ? `🎙️ ${spk.speakerName} [Active]` 
              : `👤 ${spk.speakerName} [Listening]`;
            const badgeW = ctx.measureText(badgeLabel).width + 14;
            const badgeH = 18;
            const badgeX = Math.max(6, Math.min(width - badgeW - 6, cFaceX + (cFaceW - badgeW) / 2));
            const badgeY = Math.max(16, cFaceY - badgeH - 4);

            ctx.fillStyle = isActive ? 'rgba(10, 10, 14, 0.92)' : 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
            ctx.fill();
            ctx.strokeStyle = isActive ? '#F5B800' : 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = isActive ? '#F5B800' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText(badgeLabel, badgeX + badgeW / 2, badgeY + 12);

            // Active Speaker Direct Cut Tag (No zoom drift, stationary hold)
            if (isActive) {
              const shotText = `🎬 DIRECT CUT • นิ่งสนิท (100% Stationary)`;
              ctx.font = 'bold 8px Kanit';
              const subW = ctx.measureText(shotText).width + 10;
              const subX = Math.max(6, Math.min(width - subW - 6, cFaceX + (cFaceW - subW) / 2));
              const subY = cFaceY + cFaceH + 5;

              ctx.fillStyle = 'rgba(245, 184, 0, 0.95)';
              ctx.beginPath();
              ctx.roundRect(subX, subY, subW, 14, 3);
              ctx.fill();
              ctx.fillStyle = '#000000';
              ctx.textAlign = 'center';
              ctx.fillText(shotText, subX + subW / 2, subY + 10);
            }

            ctx.restore();
          }
        });
      }

      // Color grade tint
      if (clip.visualFx?.colorGrade === 'cinematic') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.fillRect(0, 0, width, height);
      } else if (clip.visualFx?.colorGrade === 'warm') {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fillRect(0, 0, width, height);
      } else if (clip.visualFx?.colorGrade === 'cyberpunk') {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.10)';
        ctx.fillRect(0, 0, width, height);
      }

      // Subtle bottom shadow vignette for contrast
      const vignette = ctx.createLinearGradient(0, height * 0.58, 0, height);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, height * 0.58, width, height * 0.42);

      // Top Dynamic Hook Title
      if (effectiveTime < 3.5 || clip.subtitleStyle === 'Dynamic Hook Title') {
        const bannerY = 18;
        ctx.save();
        ctx.fillStyle = 'rgba(18, 18, 22, 0.92)';
        ctx.beginPath();
        ctx.roundRect(safeMarginX, bannerY, safeMaxWidth, 38, 8);
        ctx.fill();
        ctx.strokeStyle = '#F5B800';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#F5B800';
        ctx.beginPath();
        ctx.roundRect(safeMarginX + 6, bannerY + 7, 46, 24, 5);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('⚡️ HOOK', safeMarginX + 29, bannerY + 23);

        ctx.fillStyle = '#ffffff';
        ctx.font = `600 11px ${clip.font || 'Kanit'}`;
        ctx.textAlign = 'left';
        const truncated = clip.title.length > 24 ? clip.title.substring(0, 24) + '...' : clip.title;
        ctx.fillText(truncated, safeMarginX + 58, bannerY + 23);
        ctx.restore();
      }

      // Render Dynamic Emojis / Overlays
      clip.overlays.forEach(ov => {
        if (effectiveTime >= ov.startTime && effectiveTime <= (ov.startTime + ov.duration)) {
          const xPos = Math.max(safeMarginX + 20, Math.min(width - safeMarginX - 20, (ov.x / 100) * width));
          const yPos = Math.max(70, Math.min(height - 140, (ov.y / 100) * height));

          ctx.save();
          ctx.translate(xPos, yPos);
          if (ov.type === 'emoji') {
            ctx.font = '34px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ov.content, 0, 10);
          } else if (ov.type === 'text') {
            ctx.fillStyle = '#F5B800';
            ctx.beginPath();
            ctx.roundRect(-50, -14, 100, 28, 6);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.font = `bold 11px ${clip.font || 'Kanit'}`;
            ctx.textAlign = 'center';
            ctx.fillText(ov.content, 0, 4);
          }
          ctx.restore();
        }
      });

      // ----------------------------------------------------
      // STRICT SUBTITLE BOUNDARIES & CONTINUOUS TIMELINE
      // ----------------------------------------------------
      const words = clip.transcriptWords || [];
      if (words.length > 0) {
        // Continuous subtitle lookup: never allow gaps from 0.0s to end
        let activeIdx = 0;
        const exactMatchIdx = words.findIndex(w => effectiveTime >= w.start && effectiveTime <= w.end);

        if (exactMatchIdx !== -1) {
          activeIdx = exactMatchIdx;
        } else {
          // Continuity: keep latest sentence so subtitles NEVER vanish
          for (let i = words.length - 1; i >= 0; i--) {
            if (effectiveTime >= words[i].start) {
              activeIdx = i;
              break;
            }
          }
        }

        // Limit to 2-3 words per display chunk to prevent any overflow
        const maxWordsPerLine = Math.min(3, Math.max(2, clip.wordsPerLine || 3));
        const chunkStart = Math.floor(activeIdx / maxWordsPerLine) * maxWordsPerLine;
        const currentChunk = words.slice(chunkStart, chunkStart + maxWordsPerLine);

        if (currentChunk.length > 0) {
          ctx.save();
          const currentText = currentChunk.map(w => w.word).join(' ');

          // Lower-Center Safe Zone (75% height)
          let subY = height * 0.75;
          if (clip.position === 'top') subY = height * 0.22;
          if (clip.position === 'middle') subY = height * 0.50;

          // Safe font size: Medium (16px to 20px)
          const baseFontSize = Math.max(16, Math.min(20, clip.fontSize || 18));
          ctx.font = `bold ${baseFontSize}px ${clip.font || 'Kanit'}`;
          ctx.textAlign = 'center';

          // Measure text width and enforce STRICT zero out-of-bounds
          let measuredWidth = ctx.measureText(currentText).width;
          let safeFontSize = baseFontSize;

          // If text is wider than safeMaxWidth - 24, auto-fit font size
          if (measuredWidth > safeMaxWidth - 24) {
            safeFontSize = Math.max(13, Math.floor(baseFontSize * ((safeMaxWidth - 24) / measuredWidth)));
            ctx.font = `bold ${safeFontSize}px ${clip.font || 'Kanit'}`;
            measuredWidth = ctx.measureText(currentText).width;
          }

          // Container dimensions strictly clamped inside 9:16 borders
          const pillWidth = Math.min(safeMaxWidth, Math.max(120, measuredWidth + 24));
          const pillHeight = Math.max(36, safeFontSize + 16);
          const pillX = (width - pillWidth) / 2; // Always >= 20px from screen edges
          const pillY = subY - pillHeight / 2;

          // Style 1: Karaoke Pop
          if (clip.subtitleStyle === 'Karaoke Pop') {
            ctx.fillStyle = 'rgba(10, 10, 12, 0.90)';
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 10);
            ctx.fill();
            ctx.strokeStyle = 'rgba(245, 184, 0, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Text with subtle gold accent
            ctx.fillStyle = '#ffffff';
            ctx.fillText(currentText, width / 2, subY + 5);

            ctx.fillStyle = clip.highlightColor || '#F5B800';
            ctx.beginPath();
            ctx.roundRect(width / 2 - 14, pillY + pillHeight - 3, 28, 2, 1);
            ctx.fill();
          }
          // Style 2: Bold Impact
          else if (clip.subtitleStyle === 'Bold Impact') {
            ctx.font = `900 ${safeFontSize + 1}px ${clip.font || 'Kanit'}`;
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#000000';
            ctx.strokeText(currentText, width / 2, subY + 5);
            ctx.fillStyle = clip.highlightColor || '#F5B800';
            ctx.fillText(currentText, width / 2, subY + 5);
          }
          // Style 3: Minimal
          else if (clip.subtitleStyle === 'Minimal') {
            ctx.font = `500 ${safeFontSize}px ${clip.font || 'Prompt'}`;
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(currentText, width / 2, subY + 5);
          }
          // Style 4: Emphasis Highlight
          else if (clip.subtitleStyle === 'Emphasis Highlight') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 8);
            ctx.fill();

            const isEmp = currentChunk.some(w => w.isEmphasis);
            ctx.fillStyle = isEmp ? (clip.highlightColor || '#F5B800') : '#ffffff';
            ctx.fillText(currentText, width / 2, subY + 5);
          }
          // Style 5: Dynamic Hook Title style
          else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 8);
            ctx.fill();
            ctx.fillStyle = '#F5B800';
            ctx.fillText(currentText, width / 2, subY + 5);
          }

          ctx.restore();
        }
      }

      ctx.restore();

      // Schedule next 60fps frame if playing
      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    // Initial render
    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isPlaying,
    currentTime,
    clip,
    width,
    height,
    activeVideoUrl,
    videoError,
    framingMode,
    onTimeUpdate,
    checkSfxAndDucking
  ]);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Native HTML5 Video Element (Hardware accelerated decoding) */}
      {activeVideoUrl && (
        <video
          ref={videoRef}
          src={activeVideoUrl}
          playsInline
          preload="auto"
          disablePictureInPicture
          crossOrigin="anonymous"
          onLoadedData={() => {
            setIsVideoLoaded(true);
            setVideoError(null);
          }}
          onError={() => {
            setVideoError('Video source unavailable');
            setIsVideoLoaded(false);
          }}
          className="hidden"
        />
      )}

      {/* 9:16 Canvas Viewport with Ultra-Sharp 2x Retina backbuffer */}
      <canvas
        ref={canvasRef}
        className="rounded-2xl shadow-2xl bg-black border-2 border-[#27272a]"
        style={{ width: `${width}px`, height: `${height}px` }}
      />

      {/* Top Header Floating Controls (Safe Zone) */}
      <div className="absolute top-3.5 inset-x-3 z-20 flex flex-col space-y-1.5 pointer-events-none">
        {/* Row 1: Primary Framing & Sound */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {/* Framing / Active Speaker Direct Cut Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                if (onToggleFramingMode) {
                  const nextMode = isDirectCutMode ? 'fit' : (framingMode === 'fit' ? 'fill' : 'speaker_track');
                  onToggleFramingMode(nextMode);
                }
              }}
              className={`pointer-events-auto px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 backdrop-blur-md border transition-all shadow-md ${
                isDirectCutMode
                  ? 'bg-[#F5B800]/25 border-[#F5B800] text-[#FFF3C4] hover:bg-[#F5B800]/35'
                  : framingMode === 'fit'
                  ? 'bg-black/70 border-white/20 text-zinc-300 hover:text-white'
                  : 'bg-blue-500/20 border-blue-400/40 text-blue-300 hover:bg-blue-500/30'
              }`}
              title="สลับโหมดการจัดกรอบ: ตัดสลับมุมกล้องตามผู้พูดทันที (Direct Cut - ภาพนิ่งสนิท ไม่ซูม) / Fit to Screen / 9:16 Crop"
            >
              {isDirectCutMode && <Target className="w-3 h-3 text-[#F5B800]" />}
              {framingMode === 'fit' && <Maximize2 className="w-3 h-3 text-zinc-300" />}
              {framingMode === 'fill' && <Crop className="w-3 h-3 text-blue-400" />}
              <span>
                {isDirectCutMode && '🎬 Direct Cut'}
                {framingMode === 'fit' && '📐 Fit'}
                {framingMode === 'fill' && '✂️ 9:16 Crop'}
              </span>
            </button>

            {/* Stable Center Lock Toggle */}
            {onToggleStableLock && (
              <button
                type="button"
                onClick={onToggleStableLock}
                className={`pointer-events-auto px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 backdrop-blur-md border transition-all shadow-md ${
                  stableFaceLock
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-black/60 border-white/10 text-zinc-500 hover:text-zinc-300'
                }`}
                title="ล็อกตำแหน่งใบหน้าให้นิ่ง เสถียร ไม่สั่นไหว (Dead Zone Filter)"
              >
                {stableFaceLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{stableFaceLock ? 'ล็อกนิ่ง' : 'ปลดล็อก'}</span>
              </button>
            )}

            {/* AI Face Reticle Toggle */}
            {onToggleTrackingBox && (
              <button
                type="button"
                onClick={onToggleTrackingBox}
                className={`pointer-events-auto px-1.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-0.5 backdrop-blur-md border transition-all shadow-md ${
                  showTrackingBox
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-black/60 border-white/10 text-zinc-500 hover:text-zinc-300'
                }`}
                title="เปิด/ปิด กรอบตรวจจับใบหน้า AI"
              >
                <Scan className="w-3 h-3" />
                <span>{showTrackingBox ? 'HUD' : 'ซ่อน'}</span>
              </button>
            )}
          </div>

          {/* Unmute / Mute Audio Toggle */}
          <button
            type="button"
            onClick={onToggleAudioMute}
            className={`pointer-events-auto px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 backdrop-blur-md border transition-all shadow-md ${
              isAudioMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            title={isAudioMuted ? 'เปิดเสียงต้นฉบับ (Unmute)' : 'ปิดเสียงต้นฉบับ (Mute)'}
          >
            {isAudioMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span>{isAudioMuted ? 'ปิดเสียง' : 'เสียงเปิด'}</span>
          </button>
        </div>

        {/* Row 2: Performance & Clarity Quick Badges */}
        <div className="flex items-center space-x-1.5">
          {/* Framerate Indicator / Toggle */}
          {onToggleFramerate ? (
            <button
              type="button"
              onClick={onToggleFramerate}
              className="pointer-events-auto px-2 py-0.5 rounded-md text-[9px] font-bold font-mono flex items-center space-x-1 backdrop-blur-md bg-black/60 border border-white/10 text-zinc-300 hover:text-white"
              title="สลับเฟรมเรต 60 FPS / 30 FPS"
            >
              <Zap className="w-2.5 h-2.5 text-[#F5B800]" />
              <span>{targetFramerate} FPS</span>
            </button>
          ) : (
            <div className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono flex items-center space-x-1 backdrop-blur-md bg-black/60 border border-white/10 text-[#F5B800]">
              <Zap className="w-2.5 h-2.5" />
              <span>{targetFramerate} FPS</span>
            </div>
          )}

          {/* Clarity & Sharpening Toggle */}
          {onToggleClarity ? (
            <button
              type="button"
              onClick={onToggleClarity}
              className={`pointer-events-auto px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center space-x-1 backdrop-blur-md border transition-all ${
                clarityFilter
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-black/60 border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
              title="เปิด/ปิด ตัวกรองความคมชัดระดับโปร (Clarity & Sharpening)"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{clarityFilter ? `HD คมชัด (${sharpeningLevel}%)` : 'HD: ปิด'}</span>
            </button>
          ) : (
            clarityFilter && (
              <div className="px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center space-x-1 backdrop-blur-md bg-purple-500/20 border border-purple-500/40 text-purple-300">
                <Sparkles className="w-2.5 h-2.5" />
                <span>HD คมชัด</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
