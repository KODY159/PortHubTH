"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  "Health Sciences": { text: "#2E6B5E", bg: "#E6F4F1", border: "#8ECEBF" },
  "Technology":      { text: "#3A5FA8", bg: "#EBF0F8", border: "#9BB8E8" },
  "Engineering":     { text: "#5C7A3E", bg: "#EEF4E8", border: "#AECB8E" },
  "Sciences":        { text: "#1E6B8A", bg: "#E8F4F8", border: "#9ECFDF" },
  "Art":             { text: "#8B5C20", bg: "#F5EDE4", border: "#D4AA68" },
  "Business":        { text: "#4A3A8B", bg: "#EEEAF5", border: "#B8AEE0" },
  "Agricultural":    { text: "#3D6B20", bg: "#EEF4E8", border: "#A0C870" },
  "Social Sciences": { text: "#A04060", bg: "#F8EBF0", border: "#DDA8BE" },
  "Design":          { text: "#7B5EA7", bg: "#F0EBF8", border: "#C9B8E8" },
  "Dev":             { text: "#1E6B8A", bg: "#E8F4F8", border: "#9ECFDF" },
  "Photo":           { text: "#5C7A3E", bg: "#EEF4E8", border: "#AECB8E" },
  "Branding":        { text: "#A04060", bg: "#F8EBF0", border: "#DDA8BE" },
  "Illustration":    { text: "#7B5EA7", bg: "#F0EBF8", border: "#C9B8E8" },
  "Architecture":    { text: "#8B4513", bg: "#F5EDDF", border: "#D4AA78" },
};
const DEFAULT_CC = { text: "#4A4640", bg: "#EDE8DC", border: "#C8BFA8" };

export default function SavedPage() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      fetchSaved(session.user.id);
    });
  }, []);

  async function fetchSaved(userId: string) {
    const { data, error } = await supabase
      .from("saved_portfolios")
      .select(`id, created_at, portfolios(id, title, cover_url, category, profiles(name, avatar_url))`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }
    setSavedItems(data ?? []);
    setLoading(false);
  }

  async function handleUnsave(savedId: string) {
    setSavedItems(prev => prev.filter(s => s.id !== savedId));
    const { error } = await supabase.from("saved_portfolios").delete().eq("id", savedId);
    if (error) fetchSaved(user.id);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .sv-root { min-height: 100vh; background: #F5F0E8; font-family: 'DM Sans', system-ui, sans-serif; color: #1A1714; }

        /* ── Navbar ── */
        .sv-nav {
          background: #1A1714; border-bottom: 2px solid #C4581F;
          padding: 0 20px; height: 50px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .sv-nav-logo { display: flex; align-items: center; gap: 10px; }
        .sv-nav-mark {
          width: 28px; height: 28px; background: #C4581F;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 14px; color: #F5F0E8;
        }
        .sv-nav-brand { font-family: 'Playfair Display', serif; font-size: 13px; color: #F5F0E8; }
        .sv-nav-back {
          font-size: 10px; color: #9A9288; text-decoration: none;
          letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s;
        }
        .sv-nav-back:hover { color: #C4581F; }

        /* ── Content ── */
        .sv-content { max-width: 1100px; margin: 0 auto; padding: 28px 20px 60px; }

        /* ── Page header ── */
        .sv-page-hd { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
        .sv-page-hd-left { display: flex; align-items: center; gap: 12px; }
        .sv-bk-icon {
          width: 40px; height: 40px; background: #1A1714;
          display: flex; align-items: center; justify-content: center;
          border-top: 3px solid #C4581F;
        }
        .sv-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 500; color: #1A1714;
          letter-spacing: -0.01em;
        }
        .sv-page-sub { font-size: 11px; color: #9A9288; margin-top: 2px; }
        .sv-count {
          font-size: 10px; font-weight: 500; letter-spacing: 0.08em;
          background: #EDE8DC; border: 1px solid #D8D1C2;
          padding: 4px 12px; color: #4A4640;
        }

        /* ── Skeleton ── */
        .sv-skeleton { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 640px)  { .sv-skeleton { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .sv-skeleton { grid-template-columns: repeat(4, 1fr); } }
        .sv-skel-card { background: #EDE8DC; border: 1px solid #D8D1C2; overflow: hidden; }
        .sv-skel-thumb { width: 100%; aspect-ratio: 1/1.414; background: #E3DDD0; animation: pulse 1.8s ease infinite; }
        .sv-skel-body { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
        .sv-skel-line { height: 10px; background: #E3DDD0; animation: pulse 1.8s ease infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* ── Empty state ── */
        .sv-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 80px 20px; }
        .sv-empty-icon {
          width: 64px; height: 64px; background: #EDE8DC; border: 1px solid #D8D1C2;
          border-top: 3px solid #C4581F;
          display: flex; align-items: center; justify-content: center;
        }
        .sv-empty-title { font-family: 'Playfair Display', serif; font-size: 16px; color: #4A4640; }
        .sv-empty-sub { font-size: 12px; color: #9A9288; }
        .sv-empty-btn {
          background: #1A1714; color: #F5F0E8;
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 11px 24px; text-decoration: none; transition: background 0.2s;
          font-family: 'DM Sans', sans-serif; display: inline-block;
        }
        .sv-empty-btn:hover { background: #C4581F; }

        /* ── Grid ── */
        .sv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 640px)  { .sv-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .sv-grid { grid-template-columns: repeat(4, 1fr); } }

        /* ── Saved card ── */
        .sv-card {
          background: #F5F0E8; border: 1px solid #D8D1C2;
          overflow: hidden; display: flex; flex-direction: column;
          position: relative;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, box-shadow 0.25s;
          animation: fadeUp 0.4s ease both;
        }
        .sv-card:hover { transform: translateY(-4px); border-color: #C4581F; box-shadow: 0 10px 28px rgba(26,23,20,0.14); }
        .sv-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #C4581F; transform: scaleX(0); transform-origin: left; transition: transform 0.3s; }
        .sv-card:hover::before { transform: scaleX(1); }

        /* Unsave button */
        .sv-unsave {
          position: absolute; top: 8px; right: 8px; z-index: 2;
          width: 28px; height: 28px;
          background: rgba(245,240,232,0.92); border: 1px solid #D8D1C2;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.2s, border-color 0.2s;
        }
        .sv-card:hover .sv-unsave { opacity: 1; }
        .sv-unsave:hover { border-color: #C4581F; background: #F5EDDF; }

        /* Thumb */
        .sv-thumb { position: relative; width: 100%; aspect-ratio: 1/1.414; overflow: hidden; }
        .sv-thumb img { transition: transform 0.5s ease; }
        .sv-card:hover .sv-thumb img { transform: scale(1.04); }
        .sv-thumb-letter {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 500;
        }
        .sv-thumb-fade { position: absolute; bottom: 0; left: 0; right: 0; height: 36px; background: linear-gradient(to top, #F5F0E8, transparent); pointer-events: none; }

        /* Body */
        .sv-card-body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .sv-card-title { font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 500; color: #2E2B26; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sv-user-row { display: flex; align-items: center; gap: 5px; }
        .sv-avatar { width: 16px; height: 16px; border-radius: 50%; background: #C4581F; color: #F5F0E8; display: flex; align-items: center; justify-content: center; font-size: 7px; font-family: 'Playfair Display', serif; font-weight: 600; flex-shrink: 0; }
        .sv-username { font-size: 10px; color: #9A9288; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sv-cat-badge { font-size: 9px; font-weight: 500; padding: 2px 8px; border: 1px solid; letter-spacing: 0.04em; align-self: flex-start; transition: filter 0.15s; }
        .sv-view { font-size: 10px; color: #C4581F; margin-top: auto; letter-spacing: 0.05em; text-transform: uppercase; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="sv-root">
        {/* Navbar */}
        <nav className="sv-nav">
          <div className="sv-nav-logo">
            <div className="sv-nav-mark">P</div>
            <span className="sv-nav-brand">ThaiUniversityPorts.io</span>
          </div>
          <Link href="/profile" className="sv-nav-back">← Back to profile</Link>
        </nav>

        <div className="sv-content">
          {/* Page header */}
          <div className="sv-page-hd">
            <div className="sv-page-hd-left">
              <div className="sv-bk-icon">
                <svg width="16" height="18" viewBox="0 0 24 24" fill="#F5F0E8" stroke="#F5F0E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <div className="sv-page-title">Saved portfolios</div>
                <div className="sv-page-sub">พอร์ตโฟลิโอที่คุณบันทึกไว้</div>
              </div>
            </div>
            {!loading && savedItems.length > 0 && (
              <span className="sv-count">{savedItems.length} saved</span>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="sv-skeleton">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="sv-skel-card">
                  <div className="sv-skel-thumb" />
                  <div className="sv-skel-body">
                    <div className="sv-skel-line" style={{ width: "70%" }} />
                    <div className="sv-skel-line" style={{ width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && savedItems.length === 0 && (
            <div className="sv-empty">
              <div className="sv-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8BFA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="sv-empty-title">ยังไม่มีพอร์ตที่บันทึก</div>
              <div className="sv-empty-sub">กดปุ่ม bookmark บนการ์ดเพื่อบันทึกพอร์ตที่สนใจ</div>
              <Link href="/browse" className="sv-empty-btn">Browse portfolios</Link>
            </div>
          )}

          {/* Grid */}
          {!loading && savedItems.length > 0 && (
            <div className="sv-grid">
              {savedItems.map((saved, i) => {
                const port = saved.portfolios;
                if (!port) return null;
                const cc = port.category ? (CATEGORY_COLORS[port.category] ?? DEFAULT_CC) : DEFAULT_CC;

                return (
                  <div key={saved.id} className="sv-card" style={{ animationDelay: `${i * 0.04}s` }}>
                    {/* Unsave */}
                    <button className="sv-unsave" onClick={() => handleUnsave(saved.id)} title="ยกเลิกการเซฟ">
                      <svg width="12" height="14" viewBox="0 0 24 24" fill="#C4581F" stroke="#C4581F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>

                    <Link href={`/portfolio/${port.id}`} style={{ display: "flex", flexDirection: "column", flex: 1, textDecoration: "none" }}>
                      {/* Thumb */}
                      <div className="sv-thumb">
                        {port.cover_url ? (
                          <Image src={port.cover_url} alt="cover" fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover" />
                        ) : (
                          <div className="sv-thumb-letter" style={{ background: cc.bg, color: cc.text }}>
                            {port.title?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="sv-thumb-fade" />
                      </div>

                      {/* Body */}
                      <div className="sv-card-body">
                        <div className="sv-card-title">{port.title}</div>

                        <div className="sv-user-row">
                          {port.profiles?.avatar_url ? (
                            <Image src={port.profiles.avatar_url} alt="avatar" width={16} height={16}
                              className="object-cover" style={{ width: 16, height: 16, borderRadius: "50%" }} />
                          ) : (
                            <div className="sv-avatar">{port.profiles?.name?.charAt(0).toUpperCase() ?? "A"}</div>
                          )}
                          <span className="sv-username">{port.profiles?.name ?? "Anonymous"}</span>
                        </div>

                        {port.category && (
                          <span className="sv-cat-badge" style={{ background: cc.bg, color: cc.text, borderColor: cc.border }}>
                            {port.category}
                          </span>
                        )}

                        <span className="sv-view">View →</span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}