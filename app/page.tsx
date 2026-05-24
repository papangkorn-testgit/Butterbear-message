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
      <div className="w-full max-w-lg h-[100dvh] bg-[#FFFDF9] overflow-hidden relative">

        {/* Header */}
        <div className="bg-[#FFE9D6] p-6 relative z-10 shadow-sm">

          <div className="flex items-center gap-4">

            <Image
              src="/bear.png"
              width={95}
              height={95}
              alt="bear"
              className="rounded-full shadow-md"
            />

            <div>

              <h1 className="text-4xl text-[#8B5E3C] font-bold">
                Butterbear
              </h1>

              <p className="text-[#B07D62] text-lg">
                สำหรับวันที่เหนื่อย 💖
              </p>

            </div>

          </div>

        </div>

        {/* Chat Area */}
        <div className="p-7 space-y-5 overflow-y-auto h-[calc(100dvh-230px)] relative z-10">

          {/* First Message */}
          <div className="flex gap-3 items-start animate-fadeIn">

            <Image
              src="/bear2.png"
              width={60}
              height={60}
              alt="bear"
              className="rounded-full"
            />

            <div className="bg-[#FFF0DD] text-[#7A5C46] text-xl px-6 py-4 rounded-[25px] max-w-[80%] shadow">
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
                width={60}
                height={60}
                alt="bear"
                className="rounded-full"
              />

              <div className="bg-[#FFE7C7] text-[#7A5C46] text-xl px-6 py-4 rounded-[25px] max-w-[80%] shadow-lg">
                {msg}
              </div>

            </div>

          ))}

          {/* Auto Scroll */}
          <div ref={chatEndRef} />

        </div>

        {/* Bottom Bear */}
        <div className="absolute bottom-32 right-2 z-10">

          <Image
            src="/bear.png"
            width={220}
            height={220}
            alt="bear"
            className="drop-shadow-xl"
          />

        </div>

        {/* Bottom Button */}
        <div className="absolute bottom-0 left-0 w-full px-5 pt-3 pb-8 bg-[#FFF8F1] border-t border-[#F3D8C2] z-10">

          <button
            onClick={sendMessage}
            className="w-full bg-[#C89B76] hover:scale-[1.02] active:scale-95 transition-all duration-300 text-white py-5 rounded-2xl text-2xl shadow-lg"
          >
            รับกำลังใจจากหมีเนย 🤍
          </button>

        </div>

      </div>
    </main>
  );
}