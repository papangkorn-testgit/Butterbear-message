"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Shared AudioContext ───
let sharedAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return sharedAudioCtx;
}

// ─── Playlist ───
const PLAYLIST = [
  { src: "/bgm.mp3",     title: "กอดอุ่น (Warm Hugs)",          artist: "BUTTERBEAR 🧸" },
  { src: "/sunset.mp3",  title: "Sunset in Pattaya",             artist: "YOUNGOHM 🌅"   },
];

const MESSAGES = [
  "วันนี้ก็สู้ๆ กับงานนะ 🧸",
  "ขอให้วันนี้งานไม่หนักนะแงง 🧸",
  "พักเบรกถ่ายรูปอะไรน่ารักๆ มาอวดหมีเนยบ้างก็ได้นะ 📸",
  "เดินทางไปทำงานปลอดภัยนะ 💛",
  "วันนี้ท้องฟ้าสวยเหมือนคนอ่านเลย ☁️",
  "หมีเนยรอเป็นกำลังใจช่วงพักเบรกนะ 🌷",
  "อย่าลืมพักสายตา พักมือบ้างนะ 🌿",
  "ส่งกำลังใจให้คนเก่ง 💖",
  "หมีเนยรักนะ 🍯",
  "ทำงานเหนื่อยๆ ก็พักบ้างนะ 🐻",
  "อย่าลืมดูแลตัวเองด้วยนะ",
  "อย่าลืมดื่มน้ำด้วยนะ 💧",
  "ยิ้มหน่อยนะ สวยอยู่แล้ว 🌸",
  "ขอให้วันนี้มีเรื่องน่ายิ้มบ้างนะ 😊",
  "มีหมีเนยอยู่ข้างๆตลอดนะ 💛",
  "มีหมีเนยคอยเอาใจช่วยทุกเคสเลยนะ 🧸",
  "วันนี้ก็เป็นคนเก่งของหมีเนยเหมือนเดิมนะ ✨",
  "งานเยอะแค่ไหนก็สู้รอยยิ้มเธอไม่ได้ 🌸",
];

// ─── 💛 ข้อความปลอบใจ "เข้มข้น" สำหรับวันเหนื่อยจัดๆ ───
const TIRED_MESSAGES = [

  "หมีเนยรู้ว่าวันนี้หนักมาก แค่ผ่านมาได้ก็เก่งมากแล้ว 💛",
  "ไม่ต้องฝืนยิ้มก็ได้นะ หมีเนยเข้าใจว่าวันนี้มันเหนื่อยจริงๆ 🥺",
  "พักก่อนนะ ทุกอย่างรอได้ แต่ตัวเธอสำคัญที่สุด 🌙",
  "ถึงจะเหนื่อยแค่ไหน หมีเนยก็ยังอยู่ตรงนี้เป็นกำลังใจให้เสมอนะ 🍯",
  "วันนี้เหนื่อยมากใช่มั้ย... กอดแน่นๆ ไปเลยนะ 💖",
  "ไม่ต้องแบกไว้คนเดียวนะ หมีเนยรับฟังอยู่ตลอด 🌿",
  "ขนาดเหนื่อยขนาดนี้ก็ยังสู้มาได้ เก่งมากจริงๆนะ ✨",
  "วันที่หนักที่สุดก็ยังผ่านมาได้ หมีเนยภูมิใจในตัวเธอมากเลย 💖",
  "คนที่เหนื่อยแล้วยังไม่ยอมแพ้ คือคนที่เก่งที่สุดเลยนะ 🧸",

];

const BEAR_REACTIONS = ["🧸", "💛", "🎵", "✨", "🍯", "💕", "🎶", "⭐"];

// ─── 🔐 EASTER EGG — ข้อความลับจากหมีเนย ───
// ✏️  แก้ตรงนี้เลยนะ! ใส่ข้อความที่อยากบอกเขา
const SECRET_MESSAGE_LINES = [
  { icon: "🧸", text: "รู้มั้ยว่าหมีเนยซ่อนข้อความนี้ไว้นานมากแล้ว... รอให้เธอกดเจอเองนะ 🍯" },
  { icon: "💛", text: "ขอบคุณที่แตะหมีเนยซ้ำๆ แปลว่าเธอน่ารักมากเลย แงงเป็นกำลังใจให้น้าา ✨" },
  { icon: "💖", text: "เธอเก่งมากแล้ว แค่แตะหมีเนยจนครบก็รู้ว่าเธอต้องอดทนเก่งในชีวิตแน่ๆเลยสู้ๆน้า🧸" },
];
// ─────────────────────────────────────────────

// ─── 🥺 ข้อความในป๊อปอัปปุ่มลึกลับ — สำหรับวันที่เหนื่อยเป็นพิเศษ ───
const SPECIAL_TIRED_LINES = [
  { delay: "0.05s", icon: "🧸", text: "วันนี้งานหนักเลยสินะ สู้ ๆ นะ หมีเนยเป็นกำลังใจให้อยู่ตรงนี้เสมอ 💛" },
  { delay: "0.25s", icon: "🍯", text: "อย่าลืมหาเวลาจิบน้ำ พักสายตาบ้างนะ เป็นห่วงน้า" },
  { delay: "0.25s", icon: "🍯", text: "ขอให้ช่วงเวลาที่เหลือของงานวันนี้ผ่านไปแบบราบรื่นนะ หมีเนยเอาใจช่วยเต็มที่เลย" },
  { delay: "0.35s", icon: "🌙", text: "อีกนิดเดียวก็ใกล้ได้พักแล้วนะ เก่งมากเลยที่พยายามมาตลอดทั้งวัน 💖" },
];
// ─── Time-based status messages ───
function getTimeBasedStatus(): string {
  const thai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const h = thai.getHours();
  const m = thai.getMinutes();
  const totalMin = h * 60 + m;

  if (totalMin >= 20 * 60 + 30) {
    return "กลับบ้านได้แล้วนะ วันนี้เก่งมากเลย 🧸✨";
  } else if (totalMin >= 20 * 60) {
    return "โค้งสุดท้ายแล้ว ใกล้มากแล้ว หมีเนยภูมิใจในตัวนะ 🤍";
  } else if (h >= 18) {
    return "ท้องฟ้าข้างนอกเริ่มมืดแล้ว เหลืออีกนิดเดียวเองนะ 🌙";
  } else if (h >= 16) {
    return "ช่วงนี้อาจเหนื่อยที่สุดเลย แต่ผ่านมาได้ทุกครั้งนะ หมีเนยเชื่อ 🌿";
  } else if (h >= 14) {
    return "บ่ายแล้วนะ สู้ๆ หมีเนยแอบเป็นกำลังใจอยู่ทุกนาทีเลย 🧸";
  } else if (h >= 12) {
    return "พักกินข้าวด้วยนะ อย่าลืมดูแลท้องตัวเองด้วย 🍜";
  } else {
    return "สำหรับวันที่เหนื่อย 💛";
  }
}

interface Sparkle    { id: number; x: number; y: number; size: number; duration: number; delay: number; emoji: string; }
interface ChatMessage { id: number; text: string; special?: boolean; }
interface BearPop    { id: number; x: number; y: number; emoji: string; }

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
        role="img" aria-label={alt}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width, height, fontSize: width * 0.6,
          borderRadius: style?.borderRadius ?? "50%",
          background: "#FFE9B8", ...style,
        }}
        className={className}
      >🧸</span>
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
  const [chat, setChat]               = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping]       = useState(false);
  const [isTiredTyping, setIsTiredTyping] = useState(false);

  const isSpecialTime = () => {
    const thai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    return thai.getDate() === 26 && thai.getHours() >= 7 && thai.getHours() < 12;
  };

  const [showSpecialPopup, setShowSpecialPopup] = useState(false);
  const [showWelcome, setShowWelcome]           = useState(() => !isSpecialTime());
  const [showPeriodPage, setShowPeriodPage]     = useState(false);
  const [sparkles, setSparkles]                 = useState<Sparkle[]>([]);
  const [isPressed, setIsPressed]               = useState(false);
  const [isTiredPressed, setIsTiredPressed]     = useState(false);
  const [msgCounter, setMsgCounter]             = useState(0);

  // ── Easter egg state ──
  const [bearTapCount, setBearTapCount]         = useState(0);
  const [showEasterEgg, setShowEasterEgg]       = useState(false);
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(false);
  const [showTapHint, setShowTapHint]           = useState(false);
  const tapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Music player state ──
  const [trackIndex, setTrackIndex]             = useState(0);
  const [isPlaying, setIsPlaying]               = useState(false);
  const [volume, setVolume]                     = useState(0.5);
  const [progress, setProgress]                 = useState(0);
  const [duration, setDuration]                 = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const [thaiTime, setThaiTime] = useState("");
  const [thaiDate, setThaiDate] = useState("");
  const [timeStatus, setTimeStatus] = useState(() => getTimeBasedStatus());
  const [bearPops, setBearPops] = useState<BearPop[]>([]);
  const [bearBounce, setBearBounce]             = useState(false);
  const [bearShake, setBearShake]               = useState(false);
  const [btnSparkle, setBtnSparkle]             = useState(false);
  const [mysteriousTooltip, setMysteriousTooltip] = useState(false);

  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const chatEndRef    = useRef<HTMLDivElement | null>(null);
  const usedIndexes   = useRef<number[]>([]);
  const usedTiredIndexes = useRef<number[]>([]);
  const bearPopIdRef  = useRef(0);

  const SPARKLE_EMOJIS = ["✨", "🎵", "💕", "⭐", "🍯", "🎶", "💛"];

  // ─── Clock + time status ───
  useEffect(() => {
    const tick = () => {
      const thai = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
      setThaiTime(
        thai.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      );
      setThaiDate(
        thai.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      );
      setTimeStatus(getTimeBasedStatus());
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
  }, [chat, isTyping, isTiredTyping]);

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

  // ─── Show hint after 3 taps ───
  useEffect(() => {
    if (bearTapCount >= 3 && bearTapCount < 10 && !easterEggUnlocked) {
      setShowTapHint(true);
      const t = setTimeout(() => setShowTapHint(false), 2500);
      return () => clearTimeout(t);
    }
  }, [bearTapCount, easterEggUnlocked]);

  // ─── BGM — init once ───
  useEffect(() => {
    const audio = new Audio(PLAYLIST[0].src);
    audio.loop    = true;
    audio.volume  = volume;
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  // ─── Track change ───
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = isPlaying;
    audio.pause();
    audio.src = PLAYLIST[trackIndex].src;
    audio.load();
    setProgress(0);
    setDuration(0);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration), { once: true });
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });
    if (wasPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [trackIndex]);

  // ─── Volume sync ───
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  }, [isPlaying]);

  const changeTrack = useCallback((dir: 1 | -1) => {
    setIsPlaying(false);
    setTrackIndex((prev) => (prev + dir + PLAYLIST.length) % PLAYLIST.length);
  }, []);

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

  // ─── Sound effects ───
  const playMessageSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }, []);

  // softer, lower, warmer "hug" chime — used for the tired/comfort message
  const playHugSound = useCallback(() => {
    try {
      const ctx = getAudioCtx(); const now = ctx.currentTime;
      const notes = [[392, 0], [466, 0.16], [523, 0.34]];
      notes.forEach(([freq, delay]) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.14, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.7);
        osc.start(now + delay); osc.stop(now + delay + 0.75);
      });
    } catch {}
  }, []);

  const playPopupSound = useCallback(() => {
    try {
      const ctx = getAudioCtx(); const now = ctx.currentTime;
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
      const ctx = getAudioCtx(); const now = ctx.currentTime;
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

  // ─── Easter egg unlock sound ───
  const playUnlockSound = useCallback(() => {
    try {
      const ctx = getAudioCtx(); const now = ctx.currentTime;
      const notes = [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.38]];
      notes.forEach(([freq, delay]) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.55);
        osc.start(now + delay); osc.stop(now + delay + 0.6);
      });
    } catch {}
  }, []);

  // ─── Bear tap — with easter egg counter ───
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

    // ── Easter egg tap counter ──
    if (!easterEggUnlocked) {
      setBearTapCount((prev) => {
        const next = prev + 1;
        if (next >= 10) {
          // 🎉 UNLOCK!
          setTimeout(() => {
            setEasterEggUnlocked(true);
            setShowEasterEgg(true);
            playUnlockSound();
          }, 300);
          return 10;
        }
        return next;
      });
      // Reset counter if idle for 8 seconds
      if (tapResetTimer.current) clearTimeout(tapResetTimer.current);
      tapResetTimer.current = setTimeout(() => {
        setBearTapCount(0);
        setShowTapHint(false);
      }, 8000);
    }
  }, [easterEggUnlocked, playBearSound, playUnlockSound]);

  // ─── Random message ───
  const getRandomMessage = useCallback(() => {
    if (usedIndexes.current.length >= MESSAGES.length) usedIndexes.current = [];
    const available = MESSAGES.map((_, i) => i).filter((i) => !usedIndexes.current.includes(i));
    const pick = available[Math.floor(Math.random() * available.length)];
    usedIndexes.current.push(pick);
    return MESSAGES[pick];
  }, []);

  // ─── Random tired/comfort message ───
  const getRandomTiredMessage = useCallback(() => {
    if (usedTiredIndexes.current.length >= TIRED_MESSAGES.length) usedTiredIndexes.current = [];
    const available = TIRED_MESSAGES.map((_, i) => i).filter((i) => !usedTiredIndexes.current.includes(i));
    const pick = available[Math.floor(Math.random() * available.length)];
    usedTiredIndexes.current.push(pick);
    return TIRED_MESSAGES[pick];
  }, []);

  const sendMessage = useCallback(() => {
    if (isTyping || isTiredTyping) return;
    setIsTyping(true);
    setTimeout(() => {
      setMsgCounter((c) => c + 1);
      setChat((prev) => [...prev, { id: Date.now(), text: getRandomMessage() }]);
      setIsTyping(false);
      playMessageSound();
    }, 1200 + Math.random() * 600);
  }, [isTyping, isTiredTyping, getRandomMessage, playMessageSound]);

  // ─── "วันนี้เหนื่อยมาก" → ส่งข้อความปลอบใจเข้มข้น ───
  const sendTiredMessage = useCallback(() => {
    if (isTyping || isTiredTyping) return;
    setIsTiredTyping(true);
    setBearBounce(true); setTimeout(() => setBearBounce(false), 600);
    setTimeout(() => {
      setMsgCounter((c) => c + 1);
      setChat((prev) => [...prev, { id: Date.now(), text: getRandomTiredMessage(), special: true }]);
      setIsTiredTyping(false);
      playHugSound();
    }, 1400 + Math.random() * 600);
  }, [isTyping, isTiredTyping, getRandomTiredMessage, playHugSound]);

  // ── Progress dots for easter egg ──
  const tapProgress = Math.min(bearTapCount, 10);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Fredoka', sans-serif;
          background: #FFF7E3;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }
        :root {
          --clr-bg:       #FFF7E3;
          --clr-card:     #FFFDF5;
          --clr-header:   #FFEFC4;
          --clr-header2:  #FFE2A8;
          --clr-border:   #F3DDAE;
          --clr-bubble:   #FFF4DE;
          --clr-bubble1:  #FBEFD2;
          --clr-btn:      #5C9C82;
          --clr-btn2:     #3F7A63;
          --clr-text-h:   #6E4A2E;
          --clr-text-s:   #B2865E;
          --clr-text-m:   #CDA978;
          --clr-accent:   #5C9C82;
          --clr-period-h: #CFE8D6;
          --clr-period-h2:#AFD9C2;
          --clr-period-h3:#8FC6AE;
          --clr-sky:      #7BC4E0;
          --clr-pink:     #F498A8;
          --clr-check-a:  #FFFDF5;
          --clr-check-b:  #3F7A63;
          --clr-hug:      #F3B9C4;
          --clr-hug2:     #E892A2;
        }
        .bg-dots {
          background-color: #FFFAEE;
          background-image: radial-gradient(circle, #F2DDAE 1px, transparent 1px);
          background-size: 28px 28px;
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.7); }
          70%  { transform: translate(-50%,-50%) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        .welcome-popup  { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 100; animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; pointer-events: none; }
        .welcome-overlay { position: fixed; inset: 0; background: rgba(255,239,200,0.7); backdrop-filter: blur(6px); z-index: 99; }
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
          background: linear-gradient(90deg, var(--clr-btn2), #6FB596, var(--clr-btn), var(--clr-btn2));
          background-size: 300% auto;
          animation: shimmerBtn 2.5s linear infinite;
        }
        @keyframes periodSlideIn { 0% { opacity: 0; transform: translateY(50px) scale(0.94); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .period-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(220,238,228,0.82); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; }
        .period-card    { animation: periodSlideIn 0.55s cubic-bezier(0.34,1.3,0.64,1) forwards; }
        @keyframes floatSparkle { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.5; } 50% { transform: translateY(-18px) rotate(15deg); opacity: 1; } }
        .sparkle { position: absolute; animation: floatSparkle var(--dur) ease-in-out infinite; animation-delay: var(--delay); pointer-events: none; user-select: none; }
        @keyframes typingDot { 0%,80%,100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        .typing-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--clr-text-m); display: inline-block; animation: typingDot 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .typing-dot-hug { background: var(--clr-hug2) !important; }
        @keyframes bubblePop { 0% { opacity: 0; transform: translateY(12px) scale(0.85); } 60% { transform: translateY(-3px) scale(1.03); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .bubble-anim { animation: bubblePop 0.45s cubic-bezier(0.34,1.4,0.64,1) forwards; }
        @keyframes btnPulse { 0% { box-shadow: 0 0 0 0 rgba(63,122,99,0.45); } 70% { box-shadow: 0 0 0 16px rgba(63,122,99,0); } 100% { box-shadow: 0 0 0 0 rgba(63,122,99,0); } }
        .btn-pulse { animation: btnPulse 0.5s ease; }
        @keyframes btnPulseHug { 0% { box-shadow: 0 0 0 0 rgba(232,146,162,0.5); } 70% { box-shadow: 0 0 0 16px rgba(232,146,162,0); } 100% { box-shadow: 0 0 0 0 rgba(232,146,162,0); } }
        .btn-pulse-hug { animation: btnPulseHug 0.5s ease; }
        .chat-area::-webkit-scrollbar       { width: 4px; }
        .chat-area::-webkit-scrollbar-track { background: transparent; }
        .chat-area::-webkit-scrollbar-thumb { background: #EFD9A8; border-radius: 999px; }
        .chat-area { scroll-behavior: smooth; }
        .card-shadow { box-shadow: 0 4px 6px -1px rgba(110,74,46,0.08), 0 20px 60px -10px rgba(110,74,46,0.18); }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .online-dot { animation: pulse 2s ease-in-out infinite; }
        @keyframes blinkColon { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }
        .blink { animation: blinkColon 1s step-end infinite; }
        @keyframes bearBob { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
        .bear-bob   { animation: bearBob 3s ease-in-out infinite; }
        @keyframes bearBounceAnim { 0% { transform: scale(1); } 25% { transform: scale(0.88) rotate(-4deg); } 55% { transform: scale(1.18) rotate(3deg); } 75% { transform: scale(0.96) rotate(-2deg); } 100% { transform: scale(1) rotate(0deg); } }
        .bear-bounce { animation: bearBounceAnim 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards !important; }
        @keyframes bearShakeAnim { 0%,100% { transform: rotate(0deg); } 20% { transform: rotate(-8deg) scale(1.05); } 40% { transform: rotate(8deg) scale(1.05); } 60% { transform: rotate(-5deg); } 80% { transform: rotate(5deg); } }
        .bear-shake { animation: bearShakeAnim 0.5s ease forwards !important; }
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-70px) scale(1.4); } }
        .bear-pop { position: fixed; pointer-events: none; z-index: 999; font-size: 22px; animation: floatUp 0.9s ease-out forwards; }
        @keyframes musicBarA { 0%,100% { height: 4px; }  50% { height: 14px; } }
        @keyframes musicBarB { 0%,100% { height: 10px; } 50% { height: 4px; } }
        @keyframes musicBarC { 0%,100% { height: 7px; }  50% { height: 16px; } }
        .music-bar-a { animation: musicBarA 0.7s ease-in-out infinite; }
        .music-bar-b { animation: musicBarB 0.9s ease-in-out infinite; }
        .music-bar-c { animation: musicBarC 0.6s ease-in-out infinite; }
        @keyframes vinylSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .vinyl-spin { animation: vinylSpin 4s linear infinite; }
        .progress-track { width: 100%; height: 4px; background: rgba(63,122,99,0.18); border-radius: 999px; cursor: pointer; position: relative; }
        .progress-fill  { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--clr-btn), var(--clr-btn2)); position: relative; }
        .progress-fill::after { content: ''; position: absolute; right: -5px; top: 50%; transform: translateY(-50%); width: 10px; height: 10px; border-radius: 50%; background: var(--clr-btn2); box-shadow: 0 0 6px rgba(63,122,99,0.5); }
        .vol-slider { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 999px; background: linear-gradient(90deg, var(--clr-btn2) var(--vol), rgba(63,122,99,0.22) var(--vol)); outline: none; width: 100%; }
        .vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--clr-btn2); cursor: pointer; }
        .safe-bottom { padding-bottom: max(16px, env(safe-area-inset-bottom, 16px)); }
        @keyframes mysteriousGlow {
          0%,100% { box-shadow: 0 0 8px 2px rgba(140,205,180,0.35), 0 4px 14px rgba(90,140,115,0.28); }
          50%      { box-shadow: 0 0 18px 6px rgba(150,215,190,0.55), 0 6px 20px rgba(90,140,115,0.38); }
        }
        @keyframes starOrbit { 0% { transform: rotate(0deg) translateX(14px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(14px) rotate(-360deg); } }
        @keyframes starTwinkle { 0%,100% { opacity: 1; transform: scale(1) rotate(0deg); } 30% { opacity: 0.6; transform: scale(0.8) rotate(-15deg); } 60% { opacity: 1; transform: scale(1.2) rotate(10deg); } }
        .mysterious-btn { animation: mysteriousGlow 2.2s ease-in-out infinite; position: relative; overflow: visible !important; }
        .mysterious-btn .star-icon { animation: starTwinkle 1.6s ease-in-out infinite; display: inline-block; font-size: 19px; filter: drop-shadow(0 0 4px rgba(180,235,210,0.9)); }
        .mysterious-btn::before { content: '🎵'; position: absolute; font-size: 9px; top: 50%; left: 50%; animation: starOrbit 2.4s linear infinite; pointer-events: none; opacity: 0.9; transform-origin: 0 0; }
        .mysterious-btn::after  { content: '✦'; position: absolute; font-size: 7px; top: 50%; left: 50%; animation: starOrbit 3.2s linear infinite reverse; pointer-events: none; opacity: 0.75; color: var(--clr-btn2); transform-origin: 0 0; }
        .mysterious-tooltip {
          position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
          background: rgba(63,122,99,0.92); color: #FFF9EC; font-size: 11px;
          font-family: 'Fredoka', sans-serif; white-space: nowrap; padding: 5px 12px;
          border-radius: 999px; pointer-events: none; animation: tooltipFade 0.2s ease; z-index: 30;
        }
        .mysterious-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: rgba(63,122,99,0.92); }
        @keyframes tooltipFade { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes msgFadeSlide { 0% { opacity: 0; transform: translateY(10px) scale(0.97); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .msg-line { animation: msgFadeSlide 0.55s cubic-bezier(0.34,1.3,0.64,1) forwards; opacity: 0; }
        @keyframes periodBtnShimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .period-close-btn { background: linear-gradient(90deg,var(--clr-btn2),#56A483,#3F7A63,#5CB592,var(--clr-btn2)); background-size: 300% auto; animation: periodBtnShimmer 3s linear infinite; }
        @keyframes trackSlideIn { 0% { opacity: 0; transform: translateX(10px); } 100% { opacity: 1; transform: translateX(0); } }
        .track-name-anim { animation: trackSlideIn 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards; }
        .track-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(63,122,99,0.25); transition: all 0.3s ease; }
        .track-dot.active { background: var(--clr-btn2); width: 14px; border-radius: 999px; }
        .nav-btn {
          background: rgba(63,122,99,0.12); border: none; cursor: pointer;
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: var(--clr-btn2);
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .nav-btn:hover { background: rgba(63,122,99,0.22); }
        .nav-btn:active { transform: scale(0.88); }
        .checker-ribbon {
          height: 7px; width: 100%; flex-shrink: 0;
          background-image:
            linear-gradient(45deg, var(--clr-check-b) 25%, transparent 25%, transparent 75%, var(--clr-check-b) 75%),
            linear-gradient(45deg, var(--clr-check-b) 25%, transparent 25%, transparent 75%, var(--clr-check-b) 75%);
          background-size: 14px 14px;
          background-position: 0 0, 7px 7px;
          background-color: var(--clr-check-a);
          opacity: 0.55;
        }
        @keyframes noteFloat {
          0%   { transform: translateY(0) rotate(-6deg); opacity: 0.0; }
          12%  { opacity: 0.85; }
          50%  { transform: translateY(-26px) rotate(8deg); }
          88%  { opacity: 0.85; }
          100% { transform: translateY(-52px) rotate(-4deg); opacity: 0; }
        }
        .note-float { position: absolute; pointer-events: none; animation: noteFloat 4.5s ease-in-out infinite; font-size: 16px; }
        @keyframes statusFadeIn { 0% { opacity: 0; transform: translateY(3px); } 100% { opacity: 1; transform: translateY(0); } }
        .time-status { animation: statusFadeIn 0.5s ease forwards; }

        /* ── TAP HINT ── */
        @keyframes tapHintIn {
          0%   { opacity: 0; transform: translateY(6px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tapHintOut {
          0%   { opacity: 1; }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        .tap-hint {
          animation: tapHintIn 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards;
        }

        /* ── TAP PROGRESS DOTS ── */
        .tap-progress-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(63,122,99,0.18);
          transition: all 0.25s cubic-bezier(0.34,1.5,0.64,1);
          flex-shrink: 0;
        }
        .tap-progress-dot.filled {
          background: var(--clr-btn2);
          transform: scale(1.25);
          box-shadow: 0 0 4px rgba(63,122,99,0.4);
        }

        /* ── EASTER EGG POPUP ── */
        @keyframes eggPopIn {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.5) rotate(-8deg); }
          60%  { transform: translate(-50%,-50%) scale(1.08) rotate(2deg); }
          80%  { transform: translate(-50%,-50%) scale(0.96) rotate(-1deg); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0deg); }
        }
        .easter-egg-popup {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          z-index: 300;
          animation: eggPopIn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          pointer-events: none;
          animation: confettiFall 1.2s ease-out forwards;
        }
        .egg-close-btn {
          background: linear-gradient(90deg,var(--clr-btn2),#56A483,#3F7A63,#5CB592,var(--clr-btn2));
          background-size: 300% auto;
          animation: periodBtnShimmer 3s linear infinite;
        }
        @keyframes starBurst {
          0%   { transform: scale(0) rotate(0deg); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: scale(1.8) rotate(180deg); opacity: 0; }
        }
        .star-burst {
          position: absolute; pointer-events: none;
          animation: starBurst 0.8s ease-out forwards;
        }
        @keyframes secretReveal {
          0%  { opacity: 0; transform: translateX(-8px); }
          100%{ opacity: 1; transform: translateX(0); }
        }
        .secret-line {
          animation: secretReveal 0.5s cubic-bezier(0.34,1.3,0.64,1) forwards;
          opacity: 0;
        }

        /* ── TIRED BUTTON ── */
        @keyframes tiredGlow {
          0%,100% { box-shadow: 0 6px 18px rgba(232,146,162,0.32), 0 2px 8px rgba(232,146,162,0.2); }
          50%      { box-shadow: 0 6px 22px rgba(232,146,162,0.48), 0 2px 10px rgba(232,146,162,0.3); }
        }
        .tired-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--clr-hug), var(--clr-hug2));
          color: #fff; border: none; border-radius: 16px;
          padding: 11px 20px; font-size: 13.5px; font-weight: 600;
          font-family: 'Fredoka', sans-serif; cursor: pointer;
          letter-spacing: 0.2px; margin-bottom: 8px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: transform 0.15s, opacity 0.15s;
          animation: tiredGlow 2.4s ease-in-out infinite;
        }
        .tired-btn:disabled { opacity: 0.7; cursor: not-allowed; animation: none; }
        .tired-btn-main {
          border-radius: 18px;
          padding: 14px 24px;
          font-size: 16px;
          margin-bottom: 10px;
        }

        /* ── SPECIAL (hug) CHAT BUBBLE ── */
        @keyframes hugBadgeIn {
          0%   { opacity: 0; transform: translateY(4px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hug-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(232,146,162,0.18); color: var(--clr-hug2);
          font-size: 10px; font-weight: 600; padding: 2px 9px;
          border-radius: 999px; margin-bottom: 5px;
          animation: hugBadgeIn 0.35s ease forwards;
        }
        @keyframes hugPulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(232,146,162,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(232,146,162,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,146,162,0); }
        }
        .hug-avatar { animation: hugPulseRing 1.8s ease-out infinite; border-radius: 50%; }

        @media (max-width: 430px) {
          .phone-card { border-radius: 0 !important; }
          .header-title { font-size: 18px !important; }
          .cta-btn { font-size: 15px !important; padding: 13px 22px !important; }
        }
        @media(min-width: 480px) {
          .phone-card { height: min(860px, 95dvh) !important; border-radius: 44px !important; border: 5px solid #F4E6C6 !important; }
        }
        button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--clr-btn2); outline-offset: 2px; }
      `}</style>

      {bearPops.map((p) => (
        <div key={p.id} className="bear-pop" style={{ left: p.x, top: p.y }} aria-hidden="true">{p.emoji}</div>
      ))}

      {/* ── 🔐 EASTER EGG OVERLAY ── */}
      {showEasterEgg && (
        <>
          <div
            className="period-overlay"
            style={{ zIndex: 290, background: "rgba(255,245,200,0.88)", backdropFilter: "blur(18px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowEasterEgg(false); }}
          />
          {/* confetti */}
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${10 + Math.random() * 40}%`,
              fontSize: 14 + Math.random() * 10,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.9 + Math.random() * 0.6}s`,
              zIndex: 295,
            }}>
              {["🧸","💛","✨","🍯","🎉","🌸","💕","⭐"][Math.floor(Math.random() * 8)]}
            </div>
          ))}
          <div className="easter-egg-popup" role="dialog" aria-modal="true" aria-label="ข้อความลับจากหมีเนย">
            <div style={{
              background: "linear-gradient(160deg,#FFFDF6 0%,#FFF9E6 50%,#FFF0CC 100%)",
              borderRadius: 36, padding: "0 0 22px",
              border: "2.5px solid rgba(220,185,80,0.55)",
              boxShadow: "0 32px 90px rgba(180,130,40,0.22), 0 8px 24px rgba(180,130,40,0.14), inset 0 1px 0 rgba(255,255,255,0.95)",
              width: "min(340px, calc(100vw - 28px))",
              maxHeight: "88dvh", overflowY: "auto",
              position: "relative", overflow: "hidden",
            }}>
              {/* golden header */}
              <div style={{
                background: "linear-gradient(135deg,#F5DFA0,#E8C96A,#D4A83C)",
                borderRadius: "33px 33px 0 0", padding: "22px 24px 18px",
                position: "relative", overflow: "hidden", marginBottom: 18,
              }}>
                <div style={{ position: "absolute", top: -24, right: -24, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -16, left: -16, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.18)", pointerEvents: "none" }} />

                {/* close */}
                <button
                  onClick={() => setShowEasterEgg(false)} aria-label="ปิด"
                  style={{ position: "absolute", top: 12, right: 12, width: 26, height: 26, borderRadius: "50%", background: "rgba(180,130,40,0.18)", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#8B6820", zIndex: 2 }}
                >✕</button>

                {/* bear5 → unlocked badge */}
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                    <BearImage src="/bear5.png" width={90} height={90} alt="หมีเนย — ปลดล็อคข้อความลับแล้ว"
                      style={{ borderRadius: 22, border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 20px rgba(180,130,40,0.3)", display: "block", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.35)", borderRadius: 999, padding: "3px 12px" }}>
                    <span style={{ fontSize: 9, color: "#7A5C1A", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Secret Unlocked</span>
                    <span aria-hidden="true" style={{ fontSize: 11 }}>✨</span>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, color: "#4A3410", fontWeight: 700, lineHeight: 1.45 }}>เธอเจอข้อความลับแล้วนะ 🎉</div>
                  <div style={{ fontSize: 11.5, color: "#6B4E18", marginTop: 4, opacity: 0.9 }}>แตะหมีเนยครบ 10 ครั้ง — เก่งมากเลย 🐾</div>
                </div>
              </div>

              {/* secret messages */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px", marginBottom: 18 }}>
                {SECRET_MESSAGE_LINES.map((item, i) => (
                  <div
                    key={i}
                    className="secret-line"
                    style={{
                      animationDelay: `${0.08 + i * 0.12}s`,
                      background: i % 2 === 0
                        ? "linear-gradient(135deg,rgba(255,253,240,0.98),rgba(255,244,200,0.88))"
                        : "linear-gradient(135deg,rgba(255,249,225,0.9),rgba(255,240,180,0.8))",
                      borderRadius: 18, padding: "11px 14px",
                      fontSize: 13.5, color: "#5E4A20", lineHeight: 1.75,
                      border: "1px solid rgba(220,185,80,0.3)",
                      display: "flex", gap: 10, alignItems: "flex-start",
                      boxShadow: "0 2px 10px rgba(180,130,40,0.07)",
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} aria-hidden="true">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 22px", marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,160,60,0.4),transparent)" }} />
                <span aria-hidden="true" style={{ fontSize: 13, opacity: 0.55 }}>🍯</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,160,60,0.4),transparent)" }} />
              </div>

              <div style={{ padding: "0 16px" }}>
                <button
                  onClick={() => setShowEasterEgg(false)}
                  className="egg-close-btn"
                  aria-label="ปิดข้อความลับ"
                  style={{ width: "100%", color: "#fff", border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 15, fontWeight: 700, fontFamily: "'Fredoka', sans-serif", cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 8px 24px rgba(63,122,99,0.32), 0 2px 8px rgba(63,122,99,0.18)" }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >ขอบคุณหมีเนยนะ 🧸💛</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PERIOD PAGE — ตอนนี้ใช้สำหรับ "วันที่เหนื่อยเป็นพิเศษ" ── */}
      {showPeriodPage && (
        <div
          className="period-overlay"
          role="dialog" aria-modal="true" aria-label="ข้อความสำหรับวันที่เหนื่อยเป็นพิเศษ"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPeriodPage(false); }}
        >
          <div className="period-card" style={{ width: "min(348px, calc(100vw - 28px))", maxHeight: "92dvh", overflowY: "auto" }}>
            <div style={{
              background: "linear-gradient(160deg,#FFFDF6 0%,#FFF6E2 50%,#F2EAD3 100%)",
              borderRadius: 36, padding: "0 0 24px",
              border: "2px solid rgba(143,198,174,0.55)",
              boxShadow: "0 32px 80px rgba(63,122,99,0.22), 0 8px 24px rgba(63,122,99,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                background: "linear-gradient(135deg,var(--clr-period-h),var(--clr-period-h2),var(--clr-period-h3))",
                borderRadius: "34px 34px 0 0", padding: "22px 24px 18px",
                position: "relative", overflow: "hidden", marginBottom: 20,
              }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.22)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -20, left: -20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.16)", pointerEvents: "none" }} />
                <span className="note-float" style={{ top: 14, left: 22, color: "#fff" }} aria-hidden="true">🍯</span>
                <span className="note-float" style={{ top: 30, right: 30, color: "#fff", animationDelay: "1.4s" }} aria-hidden="true">💛</span>
                <button
                  onClick={() => setShowPeriodPage(false)} aria-label="ปิดหน้าต่างนี้"
                  style={{ position: "absolute", top: 12, right: 12, width: 26, height: 26, borderRadius: "50%", background: "rgba(63,122,99,0.16)", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#3F7A63", zIndex: 2 }}
                >✕</button>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <BearImage src="/bear4.png" width={130} height={130} alt="หมีเนย — กำลังกอดปลอบใจ"
                    style={{ borderRadius: 24, border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 24px rgba(63,122,99,0.25)", display: "block", objectFit: "cover" }}
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 19, color: "#3F5E4A", fontWeight: 600, lineHeight: 1.4 }}>วันนี้เหนื่อยเป็นพิเศษเลยใช่มั้ย 🥺</div>
                  <div style={{ fontSize: 12, color: "#5C8C72", marginTop: 4, opacity: 0.9 }}>ไม่ต้องเก่งทุกวันก็ได้นะ หมีเนยเข้าใจ 💛</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 18px", marginBottom: 20 }}>
               {SPECIAL_TIRED_LINES.map((item, i) => (
                  <div key={i} className="msg-line" style={{
                    animationDelay: item.delay,
                    background: i % 2 === 0 ? "linear-gradient(135deg,rgba(255,253,246,0.95),rgba(243,236,217,0.9))" : "linear-gradient(135deg,rgba(238,247,242,0.9),rgba(223,240,231,0.85))",
                    borderRadius: 18, padding: "12px 15px", fontSize: 13.5, color: "#5E4A30", lineHeight: 1.75,
                    border: "1px solid rgba(143,198,174,0.35)", whiteSpace: "pre-line",
                    display: "flex", gap: 10, alignItems: "flex-start",
                    boxShadow: "0 2px 10px rgba(63,122,99,0.06)",
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} aria-hidden="true">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 24px", marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(95,160,130,0.35),transparent)" }} />
                <span aria-hidden="true" style={{ fontSize: 14, opacity: 0.6 }}>🍯</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(95,160,130,0.35),transparent)" }} />
              </div>
              <div style={{ padding: "0 18px" }}>
                <button
                  onClick={() => setShowPeriodPage(false)}
                  className="period-close-btn" aria-label="ปิดหน้าต่าง — ขอบคุณหมีเนย"
                  style={{ width: "100%", color: "#fff", border: "none", borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 600, fontFamily: "'Fredoka', sans-serif", cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 8px 24px rgba(63,122,99,0.32), 0 2px 8px rgba(63,122,99,0.18)" }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >ขอบคุณหมีเนยนะ 🌿</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Special popup ── */}
      {showSpecialPopup && (
        <>
          <div className="welcome-overlay" style={{ zIndex: 109, background: "rgba(220,238,228,0.75)" }} />
          <div className="special-popup" role="dialog" aria-modal="true" aria-label="ข้อความจากหมีเนย">
            <div style={{ background: "linear-gradient(145deg,#FFFDF6,#F0EAD2)", borderRadius: 32, padding: "28px 24px 24px", textAlign: "center", border: "2.5px solid #CDE6D6", boxShadow: "0 24px 70px rgba(63,122,99,0.26)", width: "min(300px, calc(100vw - 48px))", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -18, right: -18, fontSize: 60, opacity: 0.08, transform: "rotate(20deg)", pointerEvents: "none", userSelect: "none" }} aria-hidden="true">🧸</div>
              <div style={{ position: "absolute", bottom: -14, left: -14, fontSize: 50, opacity: 0.08, transform: "rotate(-15deg)", pointerEvents: "none", userSelect: "none" }} aria-hidden="true">🎵</div>
              <div className="heart-float" style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                <button onClick={handleBearTap} onTouchStart={handleBearTap} aria-label="แตะหมีเนย" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%" }}>
                  <BearImage src="/bear2.png" width={76} height={76} alt="หมีเนยกำลังส่งกำลังใจ" style={{ borderRadius: "50%", border: "3px solid #DCF0E4", boxShadow: "0 8px 24px rgba(63,122,99,0.2)", display: "block" }} />
                </button>
              </div>
              <div style={{ fontSize: 17, color: "#3F5E4A", fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>วันนี้มีประชุมตอนเช้าใช่มั้ยแงง 🥺</div>
              <div style={{ fontSize: 13, color: "#6E4A2E", lineHeight: 1.85, marginBottom: 18 }}>
                ไม่เป็นไรนะ~ หมีเนยอยู่ตรงนี้แล้ว 🧸<br />
                หายใจลึกๆ แล้วก็ไปได้เลย<br />
                <span style={{ fontSize: 12, color: "#5C8C72" }}>วันนี้ก็เก่งมากแล้วนะ ที่ลุกขึ้นมา 🌿</span>
              </div>
              <button
                onClick={() => { setShowSpecialPopup(false); setShowWelcome(true); setTimeout(() => setShowWelcome(false), 3000); }}
                className="special-btn" aria-label="พร้อมแล้ว ปิดหน้าต่างนี้"
                style={{ color: "#fff", border: "none", borderRadius: 999, padding: "13px 32px", fontSize: 15, fontWeight: 600, fontFamily: "'Fredoka', sans-serif", cursor: "pointer", boxShadow: "0 6px 20px rgba(63,122,99,0.38)", letterSpacing: "0.3px", width: "100%" }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >พร้อมแล้วน้า 🧸💛</button>
            </div>
          </div>
        </>
      )}

      {/* ── Welcome ── */}
      {showWelcome && (
        <>
          <div className="welcome-overlay" />
          <div className="welcome-popup" role="status" aria-live="polite">
            <div style={{ background: "linear-gradient(135deg,#FFFDF6,#F2EAD3)", borderRadius: 32, padding: "32px 40px", textAlign: "center", border: "2px solid #E7D6AC", boxShadow: "0 20px 60px rgba(63,122,99,0.2)", minWidth: 260 }}>
              <div style={{ fontSize: 52, marginBottom: 8 }} aria-hidden="true">🧸</div>
              <div style={{ fontSize: 22, color: "#6E4A2E", fontWeight: 600, marginBottom: 6 }}>สวัสดีจ้า~</div>
              <div style={{ fontSize: 15, color: "#5C8C72", lineHeight: 1.6 }}>หมีเนยรอส่งกำลังใจอยู่นะ 💛</div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 6 }}>
                {[0, 1, 2].map((i) => <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
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
            <div key={s.id} className="sparkle" aria-hidden="true"
              style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, "--dur": `${s.duration}s`, "--delay": `${s.delay}s`, zIndex: 1 } as React.CSSProperties}
            >{s.emoji}</div>
          ))}

          {/* ── HEADER ── */}
          <header style={{ background: "linear-gradient(160deg, var(--clr-header) 0%, var(--clr-header2) 100%)", padding: "10px 18px 10px", position: "relative", zIndex: 10, flexShrink: 0, borderBottom: "1.5px solid var(--clr-border)" }}>
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
                <BearImage src="/bear.png" width={48} height={48} alt="หมีเนย — ออนไลน์อยู่"
                  style={{ borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 4px 12px rgba(63,122,99,0.18)" }}
                />
                <div style={{ position: "absolute", bottom: 2, right: 2, width: 11, height: 11, borderRadius: "50%", background: "var(--clr-accent)", border: "2px solid #fff" }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 className="header-title" style={{ fontSize: 19, color: "var(--clr-text-h)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "0.2px" }}>Butterbear 🧸</h1>
                <p key={timeStatus} className="time-status" style={{ fontSize: 11.5, color: "var(--clr-btn2)", marginTop: 2, lineHeight: 1.4, fontWeight: 500 }}>
                  {isTyping || isTiredTyping
                    ? <span style={{ display: "flex", alignItems: "center", gap: 4 }} aria-live="polite" aria-label="หมีเนยกำลังพิมพ์"><span style={{ color: "var(--clr-text-s)" }}>กำลังพิมพ์</span>{[0,1,2].map((i) => <span key={i} className={`typing-dot${isTiredTyping ? " typing-dot-hug" : ""}`} style={{ width: 5, height: 5, animationDelay: `${i*0.2}s` }} />)}</span>
                    : timeStatus}
                </p>
              </div>
              {msgCounter > 0 && (
                <div aria-label={`${msgCounter} ข้อความจากหมีเนย`} style={{ background: "var(--clr-btn2)", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 600, padding: "2px 9px" }}>
                  {msgCounter}
                </div>
              )}
            </div>
          </header>
          <div className="checker-ribbon" aria-hidden="true" />

          {/* ── CHAT AREA ── */}
          <section
            className="chat-area" aria-label="บทสนทนากับหมีเนย" aria-live="polite"
            style={{ flex: 1, overflowY: "auto", padding: "14px 16px 10px", paddingRight: "clamp(16px, 22vw, 90px)", position: "relative", zIndex: 5, display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div style={{ textAlign: "center", marginBottom: 2 }}>
              <span style={{ background: "rgba(63,122,99,0.12)", color: "var(--clr-btn2)", fontSize: 11, padding: "4px 14px", borderRadius: 999, fontWeight: 500 }}>
                {thaiDate}
              </span>
            </div>
            <BubbleMessage img="/bear2.png" text="สวัสดีคนเก่งของหมีเนย 🧸" isFirst />
            {chat.map((msg) => (
              <BubbleMessage key={msg.id} img="/bear2.png" text={msg.text} special={msg.special} />
            ))}
            {isTyping && (
              <div className="bubble-anim" style={{ display: "flex", gap: 10, alignItems: "flex-end" }} aria-hidden="true">
                <BearImage src="/bear2.png" width={36} height={36} alt="" style={{ borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ background: "var(--clr-bubble)", borderRadius: "20px 20px 20px 4px", padding: "12px 18px", display: "flex", gap: 5, alignItems: "center", boxShadow: "0 2px 8px rgba(63,122,99,0.1)" }}>
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            {isTiredTyping && (
              <div className="bubble-anim" style={{ display: "flex", gap: 10, alignItems: "flex-end" }} aria-hidden="true">
                <BearImage src="/bear2.png" width={36} height={36} alt="" style={{ borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ background: "rgba(243,185,196,0.28)", border: "1px solid rgba(232,146,162,0.35)", borderRadius: "20px 20px 20px 4px", padding: "12px 18px", display: "flex", gap: 5, alignItems: "center", boxShadow: "0 2px 8px rgba(232,146,162,0.15)" }}>
                  <span className="typing-dot typing-dot-hug" /><span className="typing-dot typing-dot-hug" /><span className="typing-dot typing-dot-hug" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </section>

          {/* ── BEAR (tappable) + TAP HINT + PROGRESS ── */}
          <div style={{ position: "absolute", bottom: 186, right: 10, zIndex: 20, userSelect: "none" }}>

            {/* Subtle hint: appears after tap 3 */}
            {showTapHint && !easterEggUnlocked && (
              <div
                className="tap-hint"
                aria-hidden="true"
                style={{
                  position: "absolute", bottom: "calc(100% + 6px)", right: 0,
                  background: "rgba(63,122,99,0.88)", color: "#FFFAEE",
                  fontSize: 10, fontFamily: "'Fredoka', sans-serif",
                  padding: "4px 10px", borderRadius: 999,
                  whiteSpace: "nowrap", fontWeight: 500,
                  boxShadow: "0 2px 8px rgba(63,122,99,0.25)",
                  pointerEvents: "none",
                }}
              >
                แตะต่อไปสิ... 🐾
              </div>
            )}

            {/* Progress dots — only show after first tap */}
            {bearTapCount > 0 && !easterEggUnlocked && (
              <div
                aria-hidden="true"
                style={{
                  display: "flex", gap: 3, justifyContent: "center",
                  marginBottom: 5,
                }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`tap-progress-dot${i < tapProgress ? " filled" : ""}`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={handleBearTap} onTouchStart={handleBearTap}
              aria-label="แตะหมีเนยเพื่อรับกำลังใจ"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "block" }}
            >
              <div className={`${bearShake ? "bear-shake" : bearBounce ? "bear-bounce" : "bear-bob"}`} style={{ transformOrigin: "center bottom" }}>
                <BearImage src="/bear.png" width={100} height={100} alt="หมีเนย" style={{ filter: "drop-shadow(0 8px 20px rgba(63,122,99,0.28))" }} />
              </div>
              <div style={{ textAlign: "center", fontSize: 9, color: "var(--clr-text-m)", marginTop: -4, opacity: 0.7, letterSpacing: "0.5px" }} aria-hidden="true">
                {easterEggUnlocked ? "🔓 ปลดล็อคแล้ว!" : "แตะได้นะ 🐾"}
              </div>
            </button>
          </div>

          {/* ── MYSTERIOUS BUTTON ── */}
          <div style={{ position: "absolute", bottom: 175, left: 14, zIndex: 20 }}>
            <button
              onClick={() => { setShowPeriodPage(true); playPopupSound(); setBtnSparkle(true); setTimeout(() => setBtnSparkle(false), 600); }}
              onMouseEnter={() => setMysteriousTooltip(true)} onMouseLeave={() => setMysteriousTooltip(false)}
              onFocus={() => setMysteriousTooltip(true)} onBlur={() => setMysteriousTooltip(false)}
              className="mysterious-btn" aria-label="ข้อความสำหรับวันที่เหนื่อยเป็นพิเศษ — เปิดดู" aria-haspopup="dialog"
              style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#E3F4EB,#BFE6D2,#9BD7BA)", border: "2px solid rgba(180,235,210,0.9)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s" }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span className="star-icon" aria-hidden="true">🍯</span>
              {mysteriousTooltip && <div className="mysterious-tooltip" role="tooltip">วันนี้เหนื่อยมั้ย 🥺</div>}
            </button>
            <div style={{ textAlign: "center", fontSize: 9, color: "var(--clr-text-m)", marginTop: 3, opacity: 0.75, letterSpacing: "0.3px", pointerEvents: "none", whiteSpace: "nowrap" }} aria-hidden="true">พิเศษ ✨</div>
          </div>

          {/* ── BOTTOM ZONE ── */}
          <footer className="safe-bottom" style={{ background: "linear-gradient(180deg,transparent 0%,#FFFBF0 22%)", paddingTop: 8, paddingLeft: 16, paddingRight: 16, position: "relative", zIndex: 10, flexShrink: 0 }}>
            {/* ── ปุ่มหลัก: ขอกำลังใจพิเศษจากหมีเนย ── */}
            <button
              onClick={() => { if (!isTyping && !isTiredTyping) { setIsTiredPressed(true); setTimeout(() => setIsTiredPressed(false), 500); sendTiredMessage(); } }}
              className={`tired-btn tired-btn-main ${isTiredPressed ? "btn-pulse-hug" : ""}`}
              disabled={isTyping || isTiredTyping}
              aria-label={isTiredTyping ? "รอหมีเนยปลอบใจ" : "วันนี้เหนื่อยมากเป็นพิเศษ — ขอกำลังใจเข้มข้น"}
              aria-busy={isTiredTyping}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isTiredTyping ? <>🫂 หมีเนยกำลังกอด...</> : <>วันนี้เหนื่อยมากเป็นพิเศษ 🫂</>}
            </button>

            {/* ── MUSIC PLAYER ── */}
            <div role="region" aria-label="เครื่องเล่นเพลง"
              style={{ background: "linear-gradient(135deg,rgba(255,253,246,0.97),rgba(238,247,242,0.97))", borderRadius: 20, border: "1.5px solid rgba(143,198,174,0.45)", padding: "10px 14px 10px", boxShadow: "0 4px 16px rgba(63,122,99,0.1)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div aria-hidden="true" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(63,122,99,0.28)", position: "relative", overflow: "hidden", background: "#3F7A63" }}>
                  <div className={isPlaying ? "vinyl-spin" : ""} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg,#3F7A63 0%,#9BD7BA 25%,#5C9C82 50%,#CDA978 75%,#3F7A63 100%)", opacity: 0.9 }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFFDF6", border: "2px solid var(--clr-btn)", position: "relative", zIndex: 2 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div key={trackIndex} className="track-name-anim" style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-text-h)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {PLAYLIST[trackIndex].title}
                  </div>
                  <div key={`a-${trackIndex}`} className="track-name-anim" style={{ fontSize: 10, color: "var(--clr-text-s)" }}>
                    {PLAYLIST[trackIndex].artist}
                  </div>
                </div>
                <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16, opacity: isPlaying ? 1 : 0.25, transition: "opacity 0.3s", marginRight: 2 }}>
                  {[{ cls: "music-bar-a", h: 4 }, { cls: "music-bar-b", h: 10 }, { cls: "music-bar-c", h: 7 }].map(({ cls, h }, i) => (
                    <div key={i} className={isPlaying ? cls : ""} style={{ width: 3, height: isPlaying ? undefined : h, background: "var(--clr-btn2)", borderRadius: 2 }} />
                  ))}
                </div>
                <button onClick={() => setShowVolumeSlider((v) => !v)} aria-label={`ปรับระดับเสียง — ${Math.round(volume * 100)}%`} aria-expanded={showVolumeSlider}
                  style={{ background: showVolumeSlider ? "rgba(63,122,99,0.14)" : "transparent", border: "none", cursor: "pointer", fontSize: 15, padding: "3px 5px", borderRadius: 8 }}>
                  {volume === 0 ? "🔇" : volume < 0.4 ? "🔉" : "🔊"}
                </button>
                <button className="nav-btn" onClick={() => changeTrack(-1)} aria-label="เพลงก่อนหน้า">⏮</button>
                <button
                  onClick={togglePlay} aria-label={isPlaying ? "หยุดเพลง" : "เล่นเพลง"} aria-pressed={isPlaying}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--clr-btn),var(--clr-btn2))", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 3px 10px rgba(63,122,99,0.4)", transition: "transform 0.15s", flexShrink: 0 }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >{isPlaying ? "⏸" : "▶️"}</button>
                <button className="nav-btn" onClick={() => changeTrack(1)} aria-label="เพลงถัดไป">⏭</button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 8 }} aria-hidden="true">
                {PLAYLIST.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setIsPlaying(false); setTrackIndex(i); }}
                    aria-label={`เลือกเพลง ${PLAYLIST[i].title}`}
                    className={`track-dot${trackIndex === i ? " active" : ""}`}
                    style={{ border: "none", cursor: "pointer", padding: 0 }}
                  />
                ))}
              </div>
              {showVolumeSlider && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span aria-hidden="true" style={{ fontSize: 10, color: "var(--clr-text-s)" }}>🔈</span>
                  <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} aria-label="ระดับเสียง" className="vol-slider" style={{ "--vol": `${volume * 100}%` } as React.CSSProperties} />
                  <span aria-hidden="true" style={{ fontSize: 10, color: "var(--clr-text-s)" }}>🔊</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--clr-text-s)", minWidth: 28 }} aria-hidden="true">{formatTime(progress * duration)}</span>
                <div
                  className="progress-track"
                  role="slider" aria-label="ตำแหน่งเพลง" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
                  tabIndex={0}
                  onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width); }}
                  onKeyDown={(e) => { if (e.key === "ArrowRight") seekTo(Math.min(1, progress + 0.05)); if (e.key === "ArrowLeft") seekTo(Math.max(0, progress - 0.05)); }}
                >
                  <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--clr-text-s)", minWidth: 28, textAlign: "right" }} aria-hidden="true">{formatTime(duration)}</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}

function BubbleMessage({ img, text, isFirst, special }: { img: string; text: string; isFirst?: boolean; special?: boolean }) {
  return (
    <div className="bubble-anim" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <BearImage src={img} width={36} height={36} alt="" className={special ? "hug-avatar" : undefined} style={{ borderRadius: "50%", flexShrink: 0 }} />
      <div role="article" aria-label={`ข้อความจากหมีเนย: ${text}`} style={{ maxWidth: "76%" }}>
        {special && <div className="hug-badge" aria-hidden="true"><span>🫂</span><span>หมีเนยกอดแน่นๆ</span></div>}
        <div
          style={{
            background: special ? "linear-gradient(135deg,rgba(243,185,196,0.32),rgba(232,146,162,0.22))" : (isFirst ? "var(--clr-bubble1)" : "var(--clr-bubble)"),
            color: special ? "#7A3B49" : "var(--clr-text-h)",
            padding: "12px 18px", borderRadius: "20px 20px 20px 4px",
            fontSize: 15, lineHeight: 1.6,
            boxShadow: special ? "0 2px 12px rgba(232,146,162,0.22)" : "0 2px 10px rgba(63,122,99,0.1)",
            border: special ? "1px solid rgba(232,146,162,0.4)" : "1px solid rgba(143,198,174,0.4)",
            fontWeight: 500,
          }}
        >{text}</div>
      </div>
    </div>
  );
}