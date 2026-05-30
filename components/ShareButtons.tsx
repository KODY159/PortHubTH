"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link2, Check, Share2 } from "lucide-react";
import { useMemo } from "react";

export default function ShareButtons({
  title,
  portfolioId,
}: {
  title: string;
  portfolioId: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    await incrementShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        await incrementShare();
      } catch {}
    }
  }

  async function incrementShare() {
    await supabase.rpc("increment_share_count", { row_id: portfolioId });
  }

  return (
    <>
      <style>{`
        .sb-card {
          background: #F5F0E8;
          border: 1px solid #D8D1C2;
          border-top: 3px solid #C4581F;
          padding: 14px 18px;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 12px rgba(26,23,20,0.08);
          animation: fadeUp 0.6s ease 0.15s both;
        }
        .sb-label {
          font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #C4581F; margin-bottom: 10px; font-weight: 500;
        }
        .sb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .sb-btn {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 10px; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; text-decoration: none;
          padding: 8px 10px; border: 1px solid;
          cursor: pointer; transition: filter 0.15s, background 0.15s;
          font-family: 'DM Sans', system-ui, sans-serif;
          white-space: nowrap;
        }
        .sb-btn:hover { filter: brightness(0.94); }

        /* Copy — primary accent */
        .sb-copy {
          background: #C4581F; color: #F5F0E8; border-color: #A8461A;
          grid-column: span 2;
        }
        .sb-copy.copied {
          background: #2E9D52; border-color: #1A5C2E; color: #F5F0E8;
        }

        /* LINE */
        .sb-line { background: #E8F5EE; color: #1A5C2E; border-color: #8ECEBF; }
        /* X / Twitter */
        .sb-x { background: #EDE8DC; color: #2E2B26; border-color: #C8BFA8; }
        /* Facebook */
        .sb-fb { background: #EBF0F8; color: #3A5FA8; border-color: #9BB8E8; }
        /* Native share */
        .sb-native { background: #F0EBF8; color: #7B5EA7; border-color: #C9B8E8; }
      `}</style>

      <div className="sb-card">
        <div className="sb-label">แชร์พอร์ตโฟลิโอ</div>
        <div className="sb-grid">
          {/* Copy link */}
          <button
            className={`sb-btn sb-copy ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? <Check size={11} /> : <Link2 size={11} />}
            {copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}
          </button>

          {/* LINE */}

          <a
            className="sb-btn sb-line"
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={incrementShare}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.25l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            LINE
          </a>

          {/* X */}
          <a
            className="sb-btn sb-x"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={incrementShare}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X (Twitter)
          </a>

          {/* Facebook */}
          <a
            className="sb-btn sb-fb"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={incrementShare}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>

          {/* Native share — only renders if supported */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button className="sb-btn sb-native" onClick={handleNativeShare}>
              <Share2 size={11} />
              แชร์เพิ่มเติม
            </button>
          )}
        </div>
      </div>
    </>
  );
}
