"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function Home() {
  const messages = [
    "วันนี้เหนื่อยมั้ย 🧸",
    "พักบ้างนะะ",
    "อย่าลืมหาอะไรกินน",
    "คนเก่งของวันนี้ 🌷",
    "มีคนเอาใจช่วยอยู่นะ",
    "ขอให้เวรวันนี้ไม่หนักเกินไป",
    "พักสายตาด้วยย",
    "วันนี้เก่งมากแล้วนะ ✨",
    "ส่งกำลังใจให้คนเก่ง 💖",
  ];

  const [chat, setChat] = useState<string[]>([]);

  const chatEndRef =
    useRef<HTMLDivElement | null>(null);

  const sendMessage = () => {
    const random =
      messages[
        Math.floor(Math.random() * messages.length)
      ];

    setChat((prev) => [...prev, random]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  return (
    <main className="h-[100dvh] bg-[#FFF7EF] flex items-center justify-center overflow-hidden">

      {/* Main Card */}
      <div className="w-full max-w-md h-[100dvh] sm:h-[820px] bg-[#FFFDF9] rounded-none sm:rounded-[40px] shadow-2xl border-0 sm:border-[6px] border-[#F4E3D7] overflow-hidden relative">

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/pattern.png')] bg-cover" />

        {/* Header */}
        <div className="bg-[#FFE9D6] p-5 sm:p-6 relative z-10">

          <div className="flex items-center gap-4">

            <Image
              src="/bear.png"
              width={75}
              height={75}
              alt="bear"
              className="rounded-full shadow-md"
            />

            <div>

              <h1 className="text-2xl sm:text-3xl text-[#8B5E3C] font-bold">
                Butterbear
              </h1>

              <p className="text-[#B07D62] text-sm sm:text-base">
                สำหรับวันที่เหนื่อย 💖
              </p>

            </div>

          </div>

        </div>

        {/* Chat Area */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto relative z-10 h-[calc(100dvh-230px)] sm:h-[540px]">

          {/* First Message */}
          <div className="flex gap-3 items-start animate-fadeIn">

            <Image
              src="/bear2.png"
              width={45}
              height={45}
              alt="bear"
              className="rounded-full"
            />

            <div className="bg-[#FFF0DD] text-[#7A5C46] px-5 py-3 rounded-[25px] max-w-[80%] shadow">
              สวัสดีคนเก่งของหมีเนย 🧸
            </div>

          </div>

          {/* Messages */}
          {chat.map((msg, index) => (

            <div
              key={index}
              className="flex gap-3 items-start animate-fadeIn"
            >

              <Image
                src="/bear2.png"
                width={45}
                height={45}
                alt="bear"
                className="rounded-full"
              />

              <div className="bg-[#FFE7C7] text-[#7A5C46] px-5 py-3 rounded-[25px] max-w-[80%] shadow-lg">
                {msg}
              </div>

            </div>

          ))}

          {/* Auto Scroll */}
          <div ref={chatEndRef} />

        </div>

        {/* Bottom Bear */}
        <div className="absolute bottom-32 sm:bottom-28 right-3 sm:right-4 z-10">

          <Image
            src="/bear.png"
            width={140}
            height={140}
            alt="bear"
            className="drop-shadow-xl"
          />

        </div>

        {/* Bottom Button */}
        <div className="absolute bottom-0 left-0 w-full px-5 pt-3 pb-8 bg-[#FFF8F1] border-t border-[#F3D8C2] z-10">

          <button
            onClick={sendMessage}
            className="w-full bg-[#C89B76] hover:scale-[1.02] active:scale-95 transition-all duration-300 text-white py-4 rounded-2xl text-base sm:text-lg shadow-lg"
          >
            รับกำลังใจจากหมีเนย 🤍
          </button>

        </div>

      </div>
    </main>
  );
}