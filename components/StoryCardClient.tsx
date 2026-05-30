"use client";
import { useState } from "react";
import Image from "next/image";

const COLLAPSE_THRESHOLD = 400;

type Props = {
  story: string;
  authorName: string;
  avatarUrl: string | null;
};

export default function StoryCardClient({
  story,
  authorName,
  avatarUrl,
}: Props) {
  const isLong = story.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <style>{`
        /* ── Story card shell ── */
        .st-card {
          background: #F5F0E8;
          border: 1px solid #D8D1C2;
          padding: 18px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 12px rgba(26,23,20,0.06);
          animation: fadeUp 0.4s ease 0.08s both;
        }

        /*
          ruled lines — ลายเส้นบรรทัดสไตล์เดียวกับ story textarea ตอน upload
          ทำด้วย repeating-linear-gradient บน ::before
          ทุก 28px จะมีเส้นสีอ่อน
        */
        .st-card::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(
            0deg,
            transparent, transparent 27px,
            #E3DDD0 27px, #E3DDD0 28px
          );
          opacity: 0.45;
        }

        /* ── Header row (label + ornament line) ── */
        .st-header {
          position: relative; /* ลอยอยู่เหนือ ::before */
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .st-dot { width: 5px; height: 5px; background: #C4581F; flex-shrink: 0; }
        .st-label {
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #C4581F; font-weight: 500; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .st-line { flex: 1; height: 1px; background: #E3DDD0; }

        /* ── Author row ── */
        .st-author {
          position: relative;
          display: flex; align-items: center; gap: 7px;
          margin-bottom: 12px;
        }
        .st-av {
          width: 20px; height: 20px; border-radius: 50%;
          background: #1A1714; color: #F5F0E8;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 9px; font-weight: 600;
          flex-shrink: 0; border: 1.5px solid #C4581F;
        }
        .st-av-name { font-size: 10px; color: #6B6560; font-family: 'DM Sans', sans-serif; }

        /* ── Story text ── */
        .st-text-wrap { position: relative; }

        .st-text {
          position: relative;
          font-size: 12.5px; color: #2E2B26; line-height: 1.85;
          white-space: pre-wrap;   /* รักษา line break จากที่ user พิมพ์ */
          word-break: break-word;
          font-family: 'DM Sans', sans-serif;
        }

        /*
          collapsed state: ใช้ -webkit-line-clamp จำกัดที่ 7 บรรทัด
          พอ expanded = true จะเอา class นี้ออก แสดงเต็ม
        */
        .st-text.collapsed {
          display: -webkit-box;
          -webkit-line-clamp: 7;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /*
          fade overlay — ปิดท้ายตัวหนังสือตอน collapsed
          ซ่อนเมื่อ expanded
        */
        .st-fade {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 56px;
          background: linear-gradient(to top, #F5F0E8 30%, transparent);
          pointer-events: none;
        }

        /* ── Toggle button ── */
        .st-toggle {
          position: relative; /* ลอยเหนือ ::before */
          display: block; margin-top: 10px;
          background: none; border: none; cursor: pointer;
          font-size: 10px; color: #C4581F;
          letter-spacing: 0.08em; text-transform: uppercase;
          font-family: 'DM Sans', sans-serif; padding: 0;
          transition: color 0.2s;
        }
        .st-toggle:hover { color: #A8461A; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="st-card">
        {/* Section header */}
        <div className="st-header">
          <div className="st-dot" />
          <span className="st-label">Story จากเจ้าของพอร์ต</span>
          <div className="st-line" />
        </div>

        {/* Author */}
        <div className="st-author">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={authorName}
              width={20}
              height={20}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "1.5px solid #C4581F",
                objectFit: "cover",
              }}
            />
          ) : (
            <div className="st-av">{authorName.charAt(0).toUpperCase()}</div>
          )}
          <span className="st-av-name">{authorName}</span>
        </div>

        {/* Text + collapse */}
        <div className="st-text-wrap">
          <p className={`st-text${isLong && !expanded ? " collapsed" : ""}`}>
            {story}
          </p>
          {/* fade ซ่อนตอน expanded หรือตอน story สั้น */}
          {isLong && !expanded && <div className="st-fade" />}
        </div>

        {/* Toggle button — แสดงเฉพาะเมื่อ story ยาว */}
        {isLong && (
          <button className="st-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded ? "ย่อ ↑" : "อ่านต่อ ↓"}
          </button>
        )}
      </div>
    </>
  );
}
