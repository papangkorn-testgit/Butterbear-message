"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Shared AudioContext (reuse instead of creating new each time) ───
let sharedAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return sharedAudioCtx;
}

const MESSAGES = [
  "เที่ยวให้สนุกนะ 🧸",
  "ถ่ายรูปสวยๆ มาอวดหมีเนยด้วยนะ 📸",
  "เดินทางปลอดภัยนะะ 💛",
  "วันนี้ท้องฟ้าสวยเหมือนคนอ่านเลย ☁️",
  "หมีเนยรอรูปวิวอยู่น้า 🌷",
  "แวะกินของอร่อยด้วยนะ 🍜",
  "อย่าลืมพักเหนื่อยระหว่างทางนะ 🌿",
  "เก็บความทรงจำดีๆ กลับมาด้วยน้า ✨",
  "ส่งกำลังใจให้คนเก่ง 💖",
  "หมีเนยรักนะ 🍯",
  "เที่ยวเผื่อหมีเนยด้วยย 🐻",
  "อย่าลืมดูแลตัวเองด้วยนะ",
  "ถ้าเจอทะเล ฝากบอกว่าหมีเนยคิดถึง 🌊",
  "อย่าลืมดื่มน้ำด้วยนะ 💧",
  "ยิ้มหน่อยนะ สวยอยู่แล้ว 🌸",
  "ขอให้ทริปนี้เต็มไปด้วยเสียงหัวเราะ 😊",
  "มีหมีเนยอยู่ข้างๆตลอดนะ 💛",
  "มีหมีเนยคอยเอาใจช่วยทุกกิโลเมตรเลยนะ 🧸",
  "วันนี้เป็นนักท่องเที่ยวคนเก่งนะ ✨",
  "วิวสวยแค่ไหนก็สู้รอยยิ้มเธอไม่ได้ 🌸",
];

const BEAR_REACTIONS = ["🧸", "💛", "🌸", "✨", "🍯", "💕", "🌷", "⭐"];

interface Sparkle {
  id: number; x: number; y: number;
  size: number; duration: number; delay: number; emoji: string;
}
interface ChatMessage { id: number; text: string; }
interface BearPop { id: number; x: number; y: number; emoji: string; }

// ─── Bear image with emoji fallback ───
function BearImage({
  src, width, height, alt, style, className,
}: {
  src: string; width: number; height: number; alt: string;
  style?: React.CSSProperties; className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width, height, fontSize: width * 0.6,
          borderRadius: style?.borderRadius ?? "50%",
          background: "#FFE0C2",
          ...style,
        }}
        className={className}
      >
        🧸
      </span>
    );
  }
  return (
    <Image
      src={src} width={width} height={height} alt={alt}
      style={style} className={className}
      onError={() => setFailed(true)}
    />
  );
}

export default function Home() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const isSpecialTime = () => {
    const thai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    return thai.getDate() === 26 && thai.getHours() >= 7 && thai.getHours() < 12;
  };

  const [showSpecialPopup, setShowSpecialPopup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !isSpecialTime());
  const [showPeriodPage, setShowPeriodPage] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [msgCounter, setMsgCounter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [thaiTime, setThaiTime] = useState("");
  const [thaiDate, setThaiDate] = useState("");
  const [bearPops, setBearPops] = useState<BearPop[]>([]);
  const [bearBounce, setBearBounce] = useState(false);
  const [bearShake, setBearShake] = useState(false);
  const [btnSparkle, setBtnSparkle] = useState(false);
  const [mysteriousTooltip, setMysteriousTooltip] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const usedIndexes = useRef<number[]>([]);
  const bearPopIdRef = useRef(0);

  const SPARKLE_EMOJIS = ["✨", "🌸", "💕", "⭐", "🍯", "🌷", "💛"];

  // ─── Clock ───
  useEffect(() => {
    const tick = () => {
      const thai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
      setThaiTime(
        thai.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      );
      setThaiDate(
        thai.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Sparkles ───
  useEffect(() => {
    setSparkles(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: 10 + Math.random() * 12,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 5,
        emoji: SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)],
      }))
    );
  }, []);

  // ─── Auto-scroll chat ───
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  // ─── Welcome / special popup ───
  useEffect(() => {
    if (isSpecialTime()) {
      setShowSpecialPopup(true);
      setTimeout(() => playPopupSound(), 400);
    } else {
      const t = setTimeout(() => setShowWelcome(false), 3200);
      return () => clearTimeout(t);
    }
  }, []);

  // ─── BGM (reuse audio element) ───
  useEffect(() => {
    const audio = new Audio("/bgm.mp3");
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  }, [isPlaying]);

  const seekTo = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  }, []);

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
  };

  // ─── Sound effects (shared AudioContext) ───
  const playMessageSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }, []);

  const playPopupSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      [[1046, 0], [1318, 0.12]].forEach(([freq, delay]) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.13, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
        osc.start(now + delay); osc.stop(now + delay + 0.5);
      });
    } catch {}
  }, []);

  const playBearSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.32);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    } catch {}
  }, []);

  // ─── Bear tap ───
  const handleBearTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setBearBounce(true); setTimeout(() => setBearBounce(false), 600);
    playBearSound();
    if (Math.random() < 0.25) { setBearShake(true); setTimeout(() => setBearShake(false), 500); }
    let cx = 0, cy = 0;
    if ("touches" in e && e.touches.length > 0) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else if ("clientX" in e) { cx = e.clientX; cy = e.clientY; }
    const count = 3 + Math.floor(Math.random() * 3);
    const newPops: BearPop[] = Array.from({ length: count }, () => {
      bearPopIdRef.current += 1;
      return {
        id: bearPopIdRef.current,
        x: cx + (Math.random() - 0.5) * 70,
        y: cy - 10 + (Math.random() - 0.5) * 40,
        emoji: BEAR_REACTIONS[Math.floor(Math.random() * BEAR_REACTIONS.length)],
      };
    });
    setBearPops((prev) => [...prev, ...newPops]);
    setTimeout(() => {
      setBearPops((prev) => prev.filter((p) => !newPops.find((n) => n.id === p.id)));
    }, 1000);
  }, []);

  // ─── Random message (no repeat until all used) ───
  const getRandomMessage = useCallback(() => {
    if (usedIndexes.current.length >= MESSAGES.length) usedIndexes.current = [];
    const available = MESSAGES.map((_, i) => i).filter((i) => !usedIndexes.current.includes(i));
    const pick = available[Math.floor(Math.random() * available.length)];
    usedIndexes.current.push(pick);
    return MESSAGES[pick];
  }, []);

  const sendMessage = useCallback(() => {
    if (isTyping) return;
    setIsTyping(true);
    setTimeout(() => {
      setMsgCounter((c) => c + 1);
      setChat((prev) => [...prev, { id: Date.now(), text: getRandomMessage() }]);
      setIsTyping(false);
      playMessageSound();
    }, 1200 + Math.random() * 600);
  }, [isTyping, getRandomMessage, playMessageSound]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Fredoka', sans-serif;
          background: #FFF0E4;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── Design tokens ── */
        :root {
          --clr-bg:       #FFF0E4;
          --clr-card:     #FFFCF8;
          --clr-header:   #FFE0C2;
          --clr-header2:  #FECFAE;
          --clr-border:   #F5D3BB;
          --clr-bubble:   #FFF0E0;
          --clr-bubble1:  #FFECD8;
          --clr-btn:      #D4A07A;
          --clr-btn2:     #C07A50;
          --clr-text-h:   #7A4F2E;
          --clr-text-s:   #B07D62;
          --clr-text-m:   #C89B76;
          --clr-accent:   #5CB85C;
          --clr-period-h: #FDDCBF;
          --clr-period-h2:#FBCAAA;
          --clr-period-h3:#F9BCA0;
        }

        /* ── Background dot pattern ── */
        .bg-dots {
          background-color: #FFF7EF;
          background-image: radial-gradient(circle, #F5C9A8 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* ── Popups ── */
        @keyframes popIn {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.7); }
          70%  { transform: translate(-50%,-50%) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        .welcome-popup  { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 100; animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; pointer-events: none; }
        .welcome-overlay { position: fixed; inset: 0; background: rgba(255,235,215,0.7); backdrop-filter: blur(6px); z-index: 99; }

        @keyframes specialPopIn {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.6) rotate(-3deg); }
          65%  { transform: translate(-50%,-50%) scale(1.06) rotate(1deg); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0deg); }
        }
        .special-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 110; animation: specialPopIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes heartFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.1); } }
        .heart-float { animation: heartFloat 1.8s ease-in-out infinite; }
        @keyframes shimmerBtn { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .special-btn {
          background: linear-gradient(90deg, #D4A07A, #E8B98A, #C07A50, #D4A07A);
          background-size: 300% auto;
          animation: shimmerBtn 2.5s linear infinite;
        }

        /* ── Period page ── */
        @keyframes periodSlideIn { 0% { opacity: 0; transform: translateY(50px) scale(0.94); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .period-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(255,230,210,0.82); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; }
        .period-card    { animation: periodSlideIn 0.55s cubic-bezier(0.34,1.3,0.64,1) forwards; }

        /* ── Sparkles ── */
        @keyframes floatSparkle { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.5; } 50% { transform: translateY(-18px) rotate(15deg); opacity: 1; } }
        .sparkle { position: absolute; animation: floatSparkle var(--dur) ease-in-out infinite; animation-delay: var(--delay); pointer-events: none; user-select: none; }

        /* ── Typing indicator ── */
        @keyframes typingDot { 0%,80%,100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        .typing-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--clr-text-m); display: inline-block; animation: typingDot 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        /* ── Chat bubble ── */
        @keyframes bubblePop { 0% { opacity: 0; transform: translateY(12px) scale(0.85); } 60% { transform: translateY(-3px) scale(1.03); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .bubble-anim { animation: bubblePop 0.45s cubic-bezier(0.34,1.4,0.64,1) forwards; }

        /* ── Send button ── */
        @keyframes btnPulse { 0% { box-shadow: 0 0 0 0 rgba(200,155,118,0.5); } 70% { box-shadow: 0 0 0 16px rgba(200,155,118,0); } 100% { box-shadow: 0 0 0 0 rgba(200,155,118,0); } }
        .btn-pulse { animation: btnPulse 0.5s ease; }

        /* ── Scrollbar ── */
        .chat-area::-webkit-scrollbar       { width: 4px; }
        .chat-area::-webkit-scrollbar-track { background: transparent; }
        .chat-area::-webkit-scrollbar-thumb { background: #E8C9B0; border-radius: 999px; }
        .chat-area { scroll-behavior: smooth; }

        .card-shadow { box-shadow: 0 4px 6px -1px rgba(180,120,80,0.08), 0 20px 60px -10px rgba(180,120,80,0.18); }

        /* ── Online dot ── */
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .online-dot { animation: pulse 2s ease-in-out infinite; }

        /* ── Clock colon blink ── */
        @keyframes blinkColon { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }
        .blink { animation: blinkColon 1s step-end infinite; }

        /* ── Bear animations ── */
        @keyframes bearBob { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
        .bear-bob   { animation: bearBob 3s ease-in-out infinite; }
        @keyframes bearBounceAnim { 0% { transform: scale(1); } 25% { transform: scale(0.88) rotate(-4deg); } 55% { transform: scale(1.18) rotate(3deg); } 75% { transform: scale(0.96) rotate(-2deg); } 100% { transform: scale(1) rotate(0deg); } }
        .bear-bounce { animation: bearBounceAnim 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards !important; }
        @keyframes bearShakeAnim { 0%,100% { transform: rotate(0deg); } 20% { transform: rotate(-8deg) scale(1.05); } 40% { transform: rotate(8deg) scale(1.05); } 60% { transform: rotate(-5deg); } 80% { transform: rotate(5deg); } }
        .bear-shake { animation: bearShakeAnim 0.5s ease forwards !important; }

        /* ── Bear pop floats ── */
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-70px) scale(1.4); } }
        .bear-pop { position: fixed; pointer-events: none; z-index: 999; font-size: 22px; animation: floatUp 0.9s ease-out forwards; }

        /* ── Music bars ── */
        @keyframes musicBarA { 0%,100% { height: 4px; }  50% { height: 14px; } }
        @keyframes musicBarB { 0%,100% { height: 10px; } 50% { height: 4px; } }
        @keyframes musicBarC { 0%,100% { height: 7px; }  50% { height: 16px; } }
        .music-bar-a { animation: musicBarA 0.7s ease-in-out infinite; }
        .music-bar-b { animation: musicBarB 0.9s ease-in-out infinite; }
        .music-bar-c { animation: musicBarC 0.6s ease-in-out infinite; }

        /* ── Vinyl spin ── */
        @keyframes vinylSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .vinyl-spin { animation: vinylSpin 4s linear infinite; }

        /* ── Progress / volume ── */
        .progress-track { width: 100%; height: 4px; background: rgba(200,155,118,0.25); border-radius: 999px; cursor: pointer; position: relative; }
        .progress-fill  { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #D4A07A, #C07A50); position: relative; }
        .progress-fill::after { content: ''; position: absolute; right: -5px; top: 50%; transform: translateY(-50%); width: 10px; height: 10px; border-radius: 50%; background: #C07A50; box-shadow: 0 0 6px rgba(192,122,80,0.5); }
        .vol-slider { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 999px; background: linear-gradient(90deg, #C07A50 var(--vol), rgba(200,155,118,0.3) var(--vol)); outline: none; width: 100%; }
        .vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #C07A50; cursor: pointer; }

        /* ── Safe area ── */
        .safe-bottom { padding-bottom: max(16px, env(safe-area-inset-bottom, 16px)); }

        /* ── Mysterious button ── */
        @keyframes mysteriousGlow {
          0%,100% { box-shadow: 0 0 8px 2px rgba(255,210,120,0.35), 0 4px 14px rgba(200,120,90,0.28); }
          50%      { box-shadow: 0 0 18px 6px rgba(255,220,140,0.55), 0 6px 20px rgba(200,120,90,0.38); }
        }
        @keyframes starTwinkle { 0%,100% { opacity: 1; transform: scale(1) rotate(0deg); } 30% { opacity: 0.6; transform: scale(0.8) rotate(-15deg); } 60% { opacity: 1; transform: scale(1.2) rotate(10deg); } }
        @keyframes starOrbit { 0% { transform: rotate(0deg) translateX(14px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(14px) rotate(-360deg); } }
        .mysterious-btn { animation: mysteriousGlow 2.2s ease-in-out infinite; position: relative; overflow: visible !important; }
        .mysterious-btn .star-icon { animation: starTwinkle 1.6s ease-in-out infinite; display: inline-block; font-size: 19px; filter: drop-shadow(0 0 4px rgba(255,230,100,0.8)); }
        .mysterious-btn::before { content: '⭐'; position: absolute; font-size: 8px; top: 50%; left: 50%; animation: starOrbit 2.4s linear infinite; pointer-events: none; opacity: 0.85; transform-origin: 0 0; }
        .mysterious-btn::after  { content: '✦'; position: absolute; font-size: 7px; top: 50%; left: 50%; animation: starOrbit 3.2s linear infinite reverse; pointer-events: none; opacity: 0.7; color: #FFD700; transform-origin: 0 0; }

        /* ── Tooltip ── */
        .mysterious-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(122,79,46,0.92);
          color: #FFF5EC;
          font-size: 11px;
          font-family: 'Fredoka', sans-serif;
          white-space: nowrap;
          padding: 5px 12px;
          border-radius: 999px;
          pointer-events: none;
          animation: tooltipFade 0.2s ease;
          z-index: 30;
        }
        .mysterious-tooltip::after {
          content: '';
          position: absolute;
          top: 100%; left: 50%; transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(122,79,46,0.92);
        }
        @keyframes tooltipFade { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        /* ── Message fade-slide ── */
        @keyframes msgFadeSlide { 0% { opacity: 0; transform: translateY(10px) scale(0.97); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .msg-line { animation: msgFadeSlide 0.55s cubic-bezier(0.34,1.3,0.64,1) forwards; opacity: 0; }

        /* ── Period close btn ── */
        @keyframes periodBtnShimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .period-close-btn { background: linear-gradient(90deg,#E8A87C,#D4814E,#C9724A,#E09870,#E8A87C); background-size: 300% auto; animation: periodBtnShimmer 3s linear infinite; }

        /* ── Responsive: desktop card ── */
        @media(min-width: 480px) {
          .phone-card { height: min(860px, 95dvh) !important; border-radius: 44px !important; border: 5px solid #F4DECE !important; }
        }

        /* ── Focus ring for keyboard nav ── */
        button:focus-visible, [role="button"]:focus-visible {
          outline: 2px solid #C07A50;
          outline-offset: 2px;
        }
      `}</style>

      {/* Bear pop floats */}
      {bearPops.map((p) => (
        <div key={p.id} className="bear-pop" style={{ left: p.x, top: p.y }} aria-hidden="true">
          {p.emoji}
        </div>
      ))}

      {/* ── PERIOD PAGE ── */}
      {showPeriodPage && (
        <div
          className="period-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="ข้อความพิเศษจากหมีเนย"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPeriodPage(false); }}
        >
          <div className="period-card" style={{ width: "min(348px, calc(100vw - 28px))", maxHeight: "92dvh", overflowY: "auto" }}>
            <div style={{
              background: "linear-gradient(160deg,#FFF8F2 0%,#FFF0E2 50%,#FFE8D4 100%)",
              borderRadius: 36,
              padding: "0 0 24px",
              border: "2px solid rgba(245,195,155,0.7)",
              boxShadow: "0 32px 80px rgba(180,90,50,0.24), 0 8px 24px rgba(200,120,80,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Banner */}
              <div style={{
                background: "linear-gradient(135deg,var(--clr-period-h),var(--clr-period-h2),var(--clr-period-h3))",
                borderRadius: "34px 34px 0 0",
                padding: "22px 24px 18px",
                position: "relative",
                overflow: "hidden",
                marginBottom: 20,
              }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.18)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -20, left: -20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.12)", pointerEvents: "none" }} />

                {/* Close */}
                <button
                  onClick={() => setShowPeriodPage(false)}
                  aria-label="ปิดหน้าต่างนี้"
                  style={{
                    position: "absolute", top: 12, right: 12,
                    width: 26, height: 26, borderRadius: "50%",
                    background: "rgba(180,100,60,0.15)", border: "none",
                    cursor: "pointer", fontSize: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#A06845", zIndex: 2,
                  }}
                >✕</button>

                {/* Bear */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <BearImage
                    src="/bear3.png"
                    width={130}
                    height={130}
                    alt="หมีเนย — กำลังส่งกำลังใจ"
                    style={{
                      borderRadius: 24,
                      border: "3px solid rgba(255,255,255,0.85)",
                      boxShadow: "0 8px 24px rgba(180,100,50,0.22)",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 19, color: "#6B3E20", fontWeight: 600, lineHeight: 1.4 }}>
                    หมีเนยอยู่ตรงนี้เสมอนะ 🧸
                  </div>
                  <div style={{ fontSize: 12, color: "#A06040", marginTop: 4, opacity: 0.85 }}>
                    ไม่ว่าจะเป็นยังไง หมีเนยเข้าใจ 💛
                  </div>
                </div>
              </div>

              {/* Message cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 18px", marginBottom: 20 }}>
                {[
                  { delay: "0.05s", icon: "🧸", text: "เที่ยวให้สนุกนะะ หมีเนยส่งกำลังใจตามไปด้วยทุกก้าวเลย 💛" },
                  { delay: "0.15s", icon: "📸", text: "ถ่ายรูปสวยๆ มาอวดหมีเนยด้วยน้า หมีเนยรอดูอยู่เลย 🌷" },
                  { delay: "0.25s", icon: "✨", text: "เดินทางปลอดภัยนะะ อย่าลืมพักเหนื่อยระหว่างทาง แล้วแวะกินของอร่อยด้วยน้า 🍜" },
                  { delay: "0.35s", icon: "🌸", text: "เก็บความทรงจำดีๆ กลับมาด้วยนะ มีหมีเนยคอยเอาใจช่วยทุกกิโลเมตรเลย 🧸💖" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="msg-line"
                    style={{
                      animationDelay: item.delay,
                      background: i % 2 === 0
                        ? "linear-gradient(135deg,rgba(255,245,232,0.95),rgba(255,235,215,0.9))"
                        : "linear-gradient(135deg,rgba(255,238,220,0.9),rgba(255,228,205,0.85))",
                      borderRadius: 18, padding: "12px 15px",
                      fontSize: 13.5, color: "#7A4A28", lineHeight: 1.75,
                      border: "1px solid rgba(245,200,160,0.45)",
                      whiteSpace: "pre-line",
                      display: "flex", gap: 10, alignItems: "flex-start",
                      boxShadow: "0 2px 10px rgba(200,130,80,0.07)",
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} aria-hidden="true">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 24px", marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(210,160,110,0.35),transparent)" }} />
                <span aria-hidden="true" style={{ fontSize: 14, opacity: 0.6 }}>🌷</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(210,160,110,0.35),transparent)" }} />
              </div>

              {/* Close button */}
              <div style={{ padding: "0 18px" }}>
                <button
                  onClick={() => setShowPeriodPage(false)}
                  className="period-close-btn"
                  aria-label="ปิดหน้าต่าง — ขอบคุณหมีเนย"
                  style={{
                    width: "100%", color: "#fff", border: "none",
                    borderRadius: 999, padding: "14px 24px", fontSize: 15,
                    fontWeight: 600, fontFamily: "'Fredoka', sans-serif",
                    cursor: "pointer", letterSpacing: "0.3px",
                    boxShadow: "0 8px 24px rgba(192,100,60,0.32), 0 2px 8px rgba(192,100,60,0.18)",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  ขอบคุณหมีเนยนะ 🌸
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Special popup — date 26 ── */}
      {showSpecialPopup && (
        <>
          <div className="welcome-overlay" style={{ zIndex: 109, background: "rgba(255,225,200,0.75)" }} />
          <div className="special-popup" role="dialog" aria-modal="true" aria-label="ข้อความจากหมีเนย">
            <div style={{
              background: "linear-gradient(145deg,#FFF8F0,#FFE8D0)",
              borderRadius: 32, padding: "28px 24px 24px",
              textAlign: "center", border: "2.5px solid #F5C9A0",
              boxShadow: "0 24px 70px rgba(180,100,50,0.28)",
              width: "min(300px, calc(100vw - 48px))",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -18, right: -18, fontSize: 60, opacity: 0.08, transform: "rotate(20deg)", pointerEvents: "none", userSelect: "none" }} aria-hidden="true">🧸</div>
              <div style={{ position: "absolute", bottom: -14, left: -14, fontSize: 50, opacity: 0.08, transform: "rotate(-15deg)", pointerEvents: "none", userSelect: "none" }} aria-hidden="true">💛</div>
              <div className="heart-float" style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                <button
                  onClick={handleBearTap}
                  onTouchStart={handleBearTap}
                  aria-label="แตะหมีเนย"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%" }}
                >
                  <BearImage
                    src="/bear2.png" width={76} height={76}
                    alt="หมีเนยกำลังส่งกำลังใจ"
                    style={{ borderRadius: "50%", border: "3px solid #FFD9B8", boxShadow: "0 8px 24px rgba(180,100,50,0.18)", display: "block" }}
                  />
                </button>
              </div>
              <div style={{ fontSize: 17, color: "#7A4F2E", fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>
                วันนี้มีประชุมตอนเช้าใช่มั้ยแงง 🥺
              </div>
              <div style={{ fontSize: 13, color: "#A06845", lineHeight: 1.85, marginBottom: 18 }}>
                ไม่เป็นไรนะ~ หมีเนยอยู่ตรงนี้แล้ว 🧸<br />
                หายใจลึกๆ แล้วก็ไปได้เลย<br />
                <span style={{ fontSize: 12, color: "#B8724A" }}>วันนี้ก็เก่งมากแล้วนะ ที่ลุกขึ้นมา 🌸</span>
              </div>
              <button
                onClick={() => { setShowSpecialPopup(false); setShowWelcome(true); setTimeout(() => setShowWelcome(false), 3000); }}
                className="special-btn"
                aria-label="พร้อมแล้ว ปิดหน้าต่างนี้"
                style={{
                  color: "#fff", border: "none", borderRadius: 999,
                  padding: "13px 32px", fontSize: 15, fontWeight: 600,
                  fontFamily: "'Fredoka', sans-serif", cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(192,122,80,0.4)",
                  letterSpacing: "0.3px", width: "100%",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                พร้อมแล้วน้า 🧸💛
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Welcome ── */}
      {showWelcome && (
        <>
          <div className="welcome-overlay" />
          <div className="welcome-popup" role="status" aria-live="polite">
            <div style={{
              background: "linear-gradient(135deg,#FFF5EC,#FFE8D5)",
              borderRadius: 32, padding: "32px 40px",
              textAlign: "center", border: "2px solid #F5D0B5",
              boxShadow: "0 20px 60px rgba(180,120,80,0.25)", minWidth: 260,
            }}>
              <div style={{ fontSize: 52, marginBottom: 8 }} aria-hidden="true">🧸</div>
              <div style={{ fontSize: 22, color: "#8B5E3C", fontWeight: 600, marginBottom: 6 }}>สวัสดีจ้า~</div>
              <div style={{ fontSize: 15, color: "#B07D62", lineHeight: 1.6 }}>หมีเนยรอส่งกำลังใจอยู่นะ 💛</div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <main style={{ height: "100dvh", background: "var(--clr-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div
          className="card-shadow phone-card"
          style={{ width: "100%", maxWidth: 420, height: "100dvh", background: "var(--clr-card)", borderRadius: 0, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <div className="bg-dots" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", zIndex: 0 }} />
          {sparkles.map((s) => (
            <div
              key={s.id}
              className="sparkle"
              aria-hidden="true"
              style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, "--dur": `${s.duration}s`, "--delay": `${s.delay}s`, zIndex: 1 } as React.CSSProperties}
            >
              {s.emoji}
            </div>
          ))}

          {/* ── HEADER ── */}
          <header style={{
            background: "linear-gradient(160deg, var(--clr-header) 0%, var(--clr-header2) 100%)",
            padding: "10px 18px 10px",
            position: "relative", zIndex: 10, flexShrink: 0,
            borderBottom: "1.5px solid var(--clr-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingTop: "env(safe-area-inset-top,0px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="online-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--clr-accent)" }} aria-hidden="true" />
                <span style={{ fontSize: 11, color: "var(--clr-text-s)", fontWeight: 500 }}>ออนไลน์</span>
              </div>
              <time aria-label={`เวลา ${thaiTime} วันที่ ${thaiDate}`} style={{ textAlign: "right" }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: "var(--clr-text-h)", letterSpacing: "1px", lineHeight: 1 }}>
                  {thaiTime.split(":").map((part, i) => (
                    <span key={i}>{i > 0 && <span className="blink" aria-hidden="true" style={{ margin: "0 1px" }}>:</span>}{part}</span>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "var(--clr-text-s)", marginTop: 1 }}>{thaiDate}</div>
              </time>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <BearImage
                  src="/bear.png" width={48} height={48}
                  alt="หมีเนย — ออนไลน์อยู่"
                  style={{ borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 4px 12px rgba(180,120,80,0.2)" }}
                />
                <div style={{ position: "absolute", bottom: 2, right: 2, width: 11, height: 11, borderRadius: "50%", background: "var(--clr-accent)", border: "2px solid #fff" }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 19, color: "var(--clr-text-h)", fontWeight: 600, lineHeight: 1.2 }}>Butterbear 🧸</h1>
                <p style={{ fontSize: 12, color: "var(--clr-text-s)", marginTop: 1 }}>
                  {isTyping
                    ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }} aria-live="polite" aria-label="หมีเนยกำลังพิมพ์">
                        <span>กำลังพิมพ์</span>
                        {[0, 1, 2].map((i) => <span key={i} className="typing-dot" style={{ width: 5, height: 5, animationDelay: `${i * 0.2}s` }} />)}
                      </span>
                    )
                    : "สำหรับวันที่เหนื่อย 💛"}
                </p>
              </div>
              {msgCounter > 0 && (
                <div
                  aria-label={`${msgCounter} ข้อความจากหมีเนย`}
                  style={{ background: "var(--clr-text-m)", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 600, padding: "2px 9px" }}
                >
                  {msgCounter}
                </div>
              )}
            </div>
          </header>

          {/* ── CHAT AREA ──
               padding-right: 120px บนหน้าจอ mobile เพื่อไม่ให้ bear ทับ bubble
               แต่ถ้า window กว้างพอ ลด padding ลง
          ── */}
          <section
            className="chat-area"
            aria-label="บทสนทนากับหมีเนย"
            aria-live="polite"
            style={{
              flex: 1, overflowY: "auto",
              padding: "14px 16px 10px",
              paddingRight: "clamp(16px, 28vw, 120px)", /* ← ป้องกัน bear ทับ */
              position: "relative", zIndex: 5,
              display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 2 }}>
              <span style={{ background: "rgba(200,155,118,0.15)", color: "var(--clr-text-s)", fontSize: 11, padding: "4px 14px", borderRadius: 999, fontWeight: 500 }}>
                {thaiDate}
              </span>
            </div>
            <BubbleMessage img="/bear2.png" text="สวัสดีคนเก่งของหมีเนย 🧸" isFirst />
            {chat.map((msg) => (
              <BubbleMessage key={msg.id} img="/bear2.png" text={msg.text} />
            ))}
            {isTyping && (
              <div className="bubble-anim" style={{ display: "flex", gap: 10, alignItems: "flex-end" }} aria-hidden="true">
                <BearImage src="/bear2.png" width={36} height={36} alt="" style={{ borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ background: "#FFF0DD", borderRadius: "20px 20px 20px 4px", padding: "12px 18px", display: "flex", gap: 5, alignItems: "center", boxShadow: "0 2px 8px rgba(180,120,80,0.12)" }}>
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </section>

          {/* ── BEAR (tappable) ── */}
          <div style={{ position: "absolute", bottom: 170, right: 12, zIndex: 20, userSelect: "none" }}>
            <button
              onClick={handleBearTap}
              onTouchStart={handleBearTap}
              aria-label="แตะหมีเนยเพื่อรับกำลังใจ"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "block" }}
            >
              <div className={`${bearShake ? "bear-shake" : bearBounce ? "bear-bounce" : "bear-bob"}`} style={{ transformOrigin: "center bottom" }}>
                <BearImage
                  src="/bear.png" width={100} height={100}
                  alt="หมีเนย"
                  style={{ filter: "drop-shadow(0 8px 20px rgba(180,120,80,0.3))" }}
                />
              </div>
              <div style={{ textAlign: "center", fontSize: 9, color: "var(--clr-text-m)", marginTop: -4, opacity: 0.7, letterSpacing: "0.5px" }} aria-hidden="true">
                แตะได้นะ 🐾
              </div>
            </button>
          </div>

          {/* ── MYSTERIOUS BUTTON (with tooltip + label) ── */}
          <div style={{ position: "absolute", bottom: 175, left: 14, zIndex: 20 }}>
            <button
              onClick={() => { setShowPeriodPage(true); playPopupSound(); setBtnSparkle(true); setTimeout(() => setBtnSparkle(false), 600); }}
              onMouseEnter={() => setMysteriousTooltip(true)}
              onMouseLeave={() => setMysteriousTooltip(false)}
              onFocus={() => setMysteriousTooltip(true)}
              onBlur={() => setMysteriousTooltip(false)}
              className="mysterious-btn"
              aria-label="ข้อความพิเศษจากหมีเนย — เปิดดู"
              aria-haspopup="dialog"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg,#FFE9A0,#FFD060,#FFC040)",
                border: "2px solid rgba(255,230,130,0.85)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.15s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span className="star-icon" aria-hidden="true">✨</span>
              {mysteriousTooltip && (
                <div className="mysterious-tooltip" role="tooltip">ข้อความพิเศษ 🧸</div>
              )}
            </button>
            {/* Visible label under button */}
            <div style={{ textAlign: "center", fontSize: 9, color: "var(--clr-text-m)", marginTop: 3, opacity: 0.75, letterSpacing: "0.3px", pointerEvents: "none", whiteSpace: "nowrap" }} aria-hidden="true">
              พิเศษ ✨
            </div>
          </div>

          {/* ── BOTTOM ZONE ── */}
          <footer className="safe-bottom" style={{ background: "linear-gradient(180deg,transparent 0%,#FFF8F2 22%)", paddingTop: 8, paddingLeft: 16, paddingRight: 16, position: "relative", zIndex: 10, flexShrink: 0 }}>
            <button
              onClick={() => { if (!isTyping) { setIsPressed(true); setTimeout(() => setIsPressed(false), 500); sendMessage(); } }}
              className={isPressed ? "btn-pulse" : ""}
              disabled={isTyping}
              aria-label={isTyping ? "รอหมีเนยพิมพ์ข้อความ" : "รับกำลังใจจากหมีเนย"}
              aria-busy={isTyping}
              style={{
                width: "100%",
                background: isTyping
                  ? "linear-gradient(135deg,#D4B498,#C4967A)"
                  : "linear-gradient(135deg,#D4A07A,#C07A50)",
                color: "#fff", border: "none", borderRadius: 18,
                padding: "14px 24px", fontSize: 16, fontWeight: 600,
                fontFamily: "'Fredoka', sans-serif",
                cursor: isTyping ? "not-allowed" : "pointer",
                transition: "transform 0.15s, opacity 0.15s",
                opacity: isTyping ? 0.85 : 1,
                boxShadow: isTyping ? "none" : "0 6px 20px rgba(192,122,80,0.35), 0 2px 8px rgba(192,122,80,0.2)",
                letterSpacing: "0.3px",
                marginBottom: 10,
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isTyping ? "หมีเนยกำลังพิมพ์... 🐾" : "รับกำลังใจจากหมีเนย 🤍"}
            </button>

            {/* ── MUSIC PLAYER ── */}
            <div
              role="region"
              aria-label="เครื่องเล่นเพลง"
              style={{
                background: "linear-gradient(135deg,rgba(255,240,220,0.97),rgba(255,225,195,0.97))",
                borderRadius: 20, border: "1.5px solid rgba(244,200,160,0.6)",
                padding: "10px 14px 10px",
                boxShadow: "0 4px 16px rgba(180,120,80,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                {/* Vinyl disc */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 3px 10px rgba(139,94,60,0.3)",
                    position: "relative", overflow: "hidden", background: "#8B5E3C",
                  }}
                >
                  <div
                    className={isPlaying ? "vinyl-spin" : ""}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg,#7A4F2E 0%,#C89B76 25%,#8B5E3C 50%,#D4A07A 75%,#7A4F2E 100%)", opacity: 0.85 }}
                  />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFF5EC", border: "2px solid #D4A07A", position: "relative", zIndex: 2 }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-text-h)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    กอดอุ่น (Warm Hugs)
                  </div>
                  <div style={{ fontSize: 10, color: "var(--clr-text-s)" }}>BUTTERBEAR 🧸</div>
                </div>

                {/* Music bars */}
                <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16, opacity: isPlaying ? 1 : 0.25, transition: "opacity 0.3s", marginRight: 2 }}>
                  {[{ cls: "music-bar-a", h: 4 }, { cls: "music-bar-b", h: 10 }, { cls: "music-bar-c", h: 7 }].map(({ cls, h }, i) => (
                    <div key={i} className={isPlaying ? cls : ""} style={{ width: 3, height: isPlaying ? undefined : h, background: "var(--clr-text-m)", borderRadius: 2 }} />
                  ))}
                </div>

                {/* Volume */}
                <button
                  onClick={() => setShowVolumeSlider((v) => !v)}
                  aria-label={`ปรับระดับเสียง — ปัจจุบัน ${Math.round(volume * 100)}%`}
                  aria-expanded={showVolumeSlider}
                  style={{ background: showVolumeSlider ? "rgba(200,155,118,0.2)" : "transparent", border: "none", cursor: "pointer", fontSize: 15, padding: "3px 5px", borderRadius: 8 }}
                >
                  {volume === 0 ? "🔇" : volume < 0.4 ? "🔉" : "🔊"}
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "หยุดเพลง" : "เล่นเพลง"}
                  aria-pressed={isPlaying}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg,#D4A07A,#C07A50)",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                    boxShadow: "0 3px 10px rgba(192,122,80,0.4)",
                    transition: "transform 0.15s", flexShrink: 0,
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {isPlaying ? "⏸" : "▶️"}
                </button>
              </div>

              {showVolumeSlider && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span aria-hidden="true" style={{ fontSize: 10, color: "var(--clr-text-s)" }}>🔈</span>
                  <input
                    type="range" min={0} max={1} step={0.01} value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    aria-label="ระดับเสียง"
                    className="vol-slider"
                    style={{ "--vol": `${volume * 100}%` } as React.CSSProperties}
                  />
                  <span aria-hidden="true" style={{ fontSize: 10, color: "var(--clr-text-s)" }}>🔊</span>
                </div>
              )}

              {/* Progress bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--clr-text-s)", minWidth: 28 }} aria-hidden="true">
                  {formatTime(progress * duration)}
                </span>
                <div
                  className="progress-track"
                  role="slider"
                  aria-label="ตำแหน่งเพลง"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                  tabIndex={0}
                  onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width); }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") seekTo(Math.min(1, progress + 0.05));
                    if (e.key === "ArrowLeft")  seekTo(Math.max(0, progress - 0.05));
                  }}
                >
                  <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--clr-text-s)", minWidth: 28, textAlign: "right" }} aria-hidden="true">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}

// ─── Chat bubble ───
function BubbleMessage({ img, text, isFirst }: { img: string; text: string; isFirst?: boolean }) {
  return (
    <div className="bubble-anim" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <BearImage
        src={img} width={36} height={36}
        alt=""           /* decorative — message text is the content */
        style={{ borderRadius: "50%", flexShrink: 0 }}
      />
      <div
        role="article"
        aria-label={`ข้อความจากหมีเนย: ${text}`}
        style={{
          background: isFirst ? "var(--clr-bubble1)" : "var(--clr-bubble)",
          color: "var(--clr-text-h)",
          padding: "12px 18px",
          borderRadius: "20px 20px 20px 4px",
          maxWidth: "76%",
          fontSize: 15, lineHeight: 1.6,
          boxShadow: "0 2px 10px rgba(180,120,80,0.12)",
          border: "1px solid rgba(244,200,160,0.5)",
          fontWeight: 500,
        }}
      >
        {text}
      </div>
    </div>
  );
}