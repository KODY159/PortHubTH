"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "Health Sciences": { bg: "#E6F4F1", text: "#2E6B5E", border: "#8ECEBF" },
  Technology: { bg: "#EBF0F8", text: "#3A5FA8", border: "#9BB8E8" },
  Engineering: { bg: "#EEF4E8", text: "#5C7A3E", border: "#AECB8E" },
  Sciences: { bg: "#E8F4F8", text: "#1E6B8A", border: "#9ECFDF" },
  Art: { bg: "#F5EDE4", text: "#8B5C20", border: "#D4AA68" },
  Business: { bg: "#EEEAF5", text: "#4A3A8B", border: "#B8AEE0" },
  Agricultural: { bg: "#EEF4E8", text: "#3D6B20", border: "#A0C870" },
  "Social Sciences": { bg: "#F8EBF0", text: "#A04060", border: "#DDA8BE" },
  Design: { bg: "#F0EBF8", text: "#7B5EA7", border: "#C9B8E8" },
  Dev: { bg: "#E8F4F8", text: "#1E6B8A", border: "#9ECFDF" },
  Photo: { bg: "#EEF4E8", text: "#5C7A3E", border: "#AECB8E" },
  Branding: { bg: "#F8EBF0", text: "#A04060", border: "#DDA8BE" },
  Illustration: { bg: "#F0EBF8", text: "#7B5EA7", border: "#C9B8E8" },
  Media: { bg: "#F5EDE4", text: "#8B5C20", border: "#D4AA68" },
  Architecture: { bg: "#F5EDDF", text: "#8B4513", border: "#D4AA78" },
};

const DEFAULT_CAT = { bg: "#F5F0E8", text: "#4A4640", border: "#C8BFA8" };

const RESULT_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  ติด: { bg: "#E8F5EE", text: "#1A5C2E", border: "#8ECEBF", dot: "#2E9D52" },
  ไม่ติด: { bg: "#F5E8E8", text: "#8B1A14", border: "#DBA8A5", dot: "#C4381F" },
  รอผล: { bg: "#F5F0DC", text: "#8B6914", border: "#D4C068", dot: "#C4A01F" },
};

const THUMB_GRADIENTS = [
  "linear-gradient(135deg, #EDE8DC 0%, #C8BFA8 100%)",
  "linear-gradient(135deg, #E8EEF5 0%, #9BB8D4 100%)",
  "linear-gradient(135deg, #EEF4E8 0%, #AECB8E 100%)",
  "linear-gradient(135deg, #F5EDE4 0%, #D4AA78 100%)",
  "linear-gradient(135deg, #F0EBF8 0%, #C9B8E8 100%)",
  "linear-gradient(135deg, #F8EBF0 0%, #DDA8BE 100%)",
];
const THUMB_LETTERS = [
  "#8B4513",
  "#1E6B8A",
  "#5C7A3E",
  "#8B5C20",
  "#7B5EA7",
  "#A04060",
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? "#C4581F" : "none"}
      stroke={filled ? "#C4581F" : "rgba(26,23,20,0.5)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

type PortfolioCardProps = {
  id: string;
  title: string;
  cover_url: string | null;
  category?: string | null;
  userProfile?: string | null;
  username?: string | null;
  faculty?: string | null;
  university?: string | null;
  result?: string | null;
  initialSaved?: boolean;
  priority?: boolean;
  view_count?: number;
  save_count?: number;
  share_count?: number;
};

export default function PortfolioCard({
  id,
  title,
  cover_url,
  category,
  userProfile,
  username,
  faculty,
  university,
  result,
  initialSaved = false,
  priority,
  view_count = 0,
  save_count = 0,
  share_count = 0,
}: PortfolioCardProps) {
  const idx = hashStr(id ?? title ?? "0") % THUMB_GRADIENTS.length;
  const rs = result ? RESULT_COLORS[result] : null;
  const cc = category
    ? (CATEGORY_COLORS[category] ?? DEFAULT_CAT)
    : DEFAULT_CAT;

  const [saved, setSaved] = useState<boolean>(initialSaved);
  const [saveLoading, setSaveLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || saveLoading) return;
    const next = !saved;
    setSaved(next);
    setSaveLoading(true);
    if (!next) {
      const { error } = await supabase
        .from("saved_portfolios")
        .delete()
        .eq("user_id", userId)
        .eq("portfolio_id", id);
      if (error) setSaved(true);
    } else {
      const { error } = await supabase
        .from("saved_portfolios")
        .insert({ user_id: userId, portfolio_id: id });
      if (error) setSaved(false);
    }
    setSaveLoading(false);
  }

  function renderSaveBtn() {
    if (!userId) return null;
    return (
      <button
        onClick={handleSave}
        disabled={saveLoading}
        title={saved ? "ยกเลิกการเซฟ" : "เซฟพอร์ตนี้"}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 30,
          height: 30,
          background: saved
            ? "rgba(245,240,232,0.95)"
            : "rgba(245,240,232,0.80)",
          border: `1px solid ${saved ? "#C4581F" : "rgba(26,23,20,0.15)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: saveLoading ? 0.5 : 1,
          transition: "all 0.2s",
        }}
      >
        <BookmarkIcon filled={saved} />
      </button>
    );
  }

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400&display=swap');

        .p-card {
          border: 1px solid #E3DDD0;
          background: #F5F0E8;
          overflow: hidden;
          display: flex; flex-direction: column; height: 100%;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.25s ease, border-color 0.2s;
          font-family: 'DM Sans', system-ui, sans-serif;
          position: relative;
        }
        .p-card::before {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; background: #C4581F;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s ease; z-index: 1;
        }
        .p-card:hover { transform: translateY(-5px) rotate(-0.2deg); border-color: #C4581F; box-shadow: 0 12px 32px rgba(26,23,20,0.14), 0 2px 0 #C4581F; }
        .p-card:hover::before { transform: scaleX(1); }

        .p-card-thumb { position: relative; width: 100%; aspect-ratio: 1/1.414; overflow: hidden; }
        .p-card-thumb img { transition: transform 0.5s ease; }
        .p-card:hover .p-card-thumb img { transform: scale(1.04); }

        .p-card-body { padding: 12px 14px 10px; display: flex; flex-direction: column; gap: 8px; }

        .p-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 500;
          color: #2E2B26; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .p-badge-row { display: flex; flex-wrap: wrap; gap: 4px; }
        .p-badge {
          font-size: 9px; font-weight: 500;
          padding: 2px 8px; letter-spacing: 0.04em;
          border: 1px solid; font-family: 'DM Sans', sans-serif;
          white-space: nowrap; transition: filter 0.15s;
        }
        .p-badge:hover { filter: brightness(0.95); }

        .p-result-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 600;
          padding: 3px 9px; border: 1px solid;
          letter-spacing: 0.04em; font-family: 'DM Sans', sans-serif;
        }
        .p-result-dot { width: 5px; height: 5px; border-radius: 50%; }

        .p-user-row { display: flex; align-items: center; gap: 6px; }
        .p-user-avatar {
          width: 18px; height: 18px; border-radius: 50%;
          background: #C4581F; color: #F5F0E8;
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; font-family: 'Playfair Display', serif; font-weight: 600;
          flex-shrink: 0;
        }
        .p-username { font-size: 10px; color: #9A9288; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .p-divider { height: 1px; background: #E3DDD0; margin: 0 14px; }

        .p-stats-row {
          display: flex; flex-direction: row; align-items: center;
          justify-content: space-between;
          padding: 9px 14px 12px;
        }
        .p-stats-group {
          display: flex; flex-direction: row; align-items: center; gap: 14px;
        }
        .p-stat-item {
          display: flex; flex-direction: row; align-items: center; gap: 6px;
        }
        .p-stat-num {
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 400;
          color: #4A4640; letter-spacing: 0.02em; line-height: 1;
        }
        .p-view-link {
          font-size: 10px; font-weight: 500; color: #C4581F;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: letter-spacing 0.2s; flex-shrink: 0;
        }
        .p-card:hover .p-view-link { letter-spacing: 0.13em; }

        .p-thumb-fade {
          position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
          background: linear-gradient(to top, #F5F0E8, transparent);
          pointer-events: none;
        }
      `}</style>

      <Link
        href={`/portfolio/${id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="p-card">
          {/* Thumbnail */}
          {cover_url ? (
            <div className="p-card-thumb">
              <Image
                src={cover_url}
                alt="cover"
                fill
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
              <div className="p-thumb-fade" />
              {rs && (
                <div
                  className="p-result-badge"
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: rs.bg,
                    color: rs.text,
                    borderColor: rs.border,
                  }}
                >
                  <span
                    className="p-result-dot"
                    style={{ background: rs.dot }}
                  />
                  {result}
                </div>
              )}
              {renderSaveBtn()}
            </div>
          ) : (
            <div
              className="p-card-thumb"
              style={{
                background: THUMB_GRADIENTS[idx],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontFamily: "'Playfair Display',serif",
                color: THUMB_LETTERS[idx],
                fontWeight: 500,
              }}
            >
              {title?.charAt(0).toUpperCase()}
              <div
                className="p-thumb-fade"
                style={{
                  background: "linear-gradient(to top, #F5F0E8, transparent)",
                }}
              />
              {rs && (
                <div
                  className="p-result-badge"
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: rs.bg,
                    color: rs.text,
                    borderColor: rs.border,
                  }}
                >
                  <span
                    className="p-result-dot"
                    style={{ background: rs.dot }}
                  />
                  {result}
                </div>
              )}
              {renderSaveBtn()}
            </div>
          )}

          {/* Body */}
          <div className="p-card-body">
            <div className="p-card-title">{title}</div>
            <div className="p-badge-row">
              {category && (
                <span
                  className="p-badge"
                  style={{
                    background: cc.bg,
                    color: cc.text,
                    borderColor: cc.border,
                  }}
                >
                  {category}
                </span>
              )}
              {faculty && (
                <span
                  className="p-badge"
                  style={{
                    background: "#F5EDDF",
                    color: "#8B4513",
                    borderColor: "#D4AA78",
                  }}
                >
                  {faculty}
                </span>
              )}
              {university && (
                <span
                  className="p-badge"
                  style={{
                    background: "#EDE8DC",
                    color: "#4A4640",
                    borderColor: "#C8BFA8",
                  }}
                >
                  {university}
                </span>
              )}
            </div>
            <div className="p-user-row">
              {userProfile ? (
                <Image
                  src={userProfile}
                  alt="avatar"
                  width={18}
                  height={18}
                  className="rounded-full object-cover"
                  style={{ width: 18, height: 18, borderRadius: "50%" }}
                />
              ) : (
                <div className="p-user-avatar">
                  {username?.charAt(0).toUpperCase() ?? "A"}
                </div>
              )}
              <span className="p-username">{username ?? "Anonymous"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="p-divider" />

          {/* Stats row */}
          <div className="p-stats-row">
            <div className="p-stats-group">
              <div className="p-stat-item">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C4581F"
                  strokeWidth="1.8"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="p-stat-num">{formatCount(view_count)}</span>
              </div>

              <div className="p-stat-item">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C4581F"
                  strokeWidth="1.8"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span className="p-stat-num">{formatCount(save_count)}</span>
              </div>

              <div className="p-stat-item">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C4581F"
                  strokeWidth="1.8"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span className="p-stat-num">{formatCount(share_count)}</span>
              </div>
            </div>
            <div className="p-view-link">View →</div>
          </div>
        </div>
      </Link>
    </>
  );
}
