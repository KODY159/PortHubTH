"use client";
import { useState, useMemo } from "react";
import PortfolioCard from "@/components/PortfolioCard";

type Portfolio = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_url: string | null;
  pdf_url: string;
  created_at: string;
  faculty: string | null;
  university: string | null;
  apply_year: number | null;
  apply_round: string | null;
  result: string | null;
  profiles: { name: string | null; avatar_url: string | null } | null;
};

const RESULT_OPTIONS = ["ทั้งหมด", "ติด", "ไม่ติด", "รอผล"];
const RESULT_STYLE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  ติด: { bg: "#E8F5EE", text: "#1A5C2E", border: "#8ECEBF" },
  ไม่ติด: { bg: "#F5E8E8", text: "#8B1A14", border: "#DBA8A5" },
  รอผล: { bg: "#F5F0DC", text: "#8B6914", border: "#D4C068" },
};

export default function BrowseClient({
  initialData,
  savedIds,
}: {
  initialData: Portfolio[];
  savedIds: string[];
}) {
  const data = initialData;
  const savedSet = new Set(savedIds);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [activeResult, setActiveResult] = useState("ทั้งหมด");
  const [activeUniversity, setActiveUniversity] = useState("ทั้งหมด");

  const categories = useMemo(() => {
    const cats = data.map((d) => d.category).filter((c): c is string => !!c);
    return ["ทั้งหมด", ...Array.from(new Set(cats))];
  }, [data]);

  const universities = useMemo(() => {
    const unis = data.map((d) => d.university).filter((u): u is string => !!u);
    return ["ทั้งหมด", ...Array.from(new Set(unis))];
  }, [data]);

  const filtered = useMemo(
    () =>
      data.filter((item) => {
        const matchSearch =
          search === "" ||
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase()) ||
          item.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.faculty?.toLowerCase().includes(search.toLowerCase()) ||
          item.university?.toLowerCase().includes(search.toLowerCase());
        return (
          matchSearch &&
          (activeCategory === "ทั้งหมด" || item.category === activeCategory) &&
          (activeResult === "ทั้งหมด" || item.result === activeResult) &&
          (activeUniversity === "ทั้งหมด" ||
            item.university === activeUniversity)
        );
      }),
    [data, search, activeCategory, activeResult, activeUniversity],
  );

  const hasFilter =
    search !== "" ||
    activeCategory !== "ทั้งหมด" ||
    activeResult !== "ทั้งหมด" ||
    activeUniversity !== "ทั้งหมด";
  function clearAll() {
    setSearch("");
    setActiveCategory("ทั้งหมด");
    setActiveResult("ทั้งหมด");
    setActiveUniversity("ทั้งหมด");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400&family=DM+Sans:wght@400;500&display=swap');

        .pb-root { min-height: 100vh; background: #F5F0E8; font-family: 'DM Sans', system-ui, sans-serif; color: #1A1714; }

        .pb-header {
          background: #1A1714; border-bottom: 2px solid #C4581F;
          padding: 20px 24px 18px;
          position: relative; overflow: hidden;
        }
        .pb-header::after {
          content: '';
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px);
          pointer-events: none;
        }
        .pb-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 500; color: #F5F0E8;
          letter-spacing: -0.01em; margin-bottom: 4px;
        }
        .pb-header-count { font-size: 11px; color: #9A9288; letter-spacing: 0.04em; }

        /* Search */
        .pb-search-wrap { padding: 16px 20px 0; }
        .pb-search {
          display: flex; align-items: center; gap: 10px;
          background: #EDE8DC; border: 1px solid #E3DDD0;
          padding: 10px 14px;
          transition: border-color 0.2s;
        }
        .pb-search:focus-within { border-color: #C4581F; }
        .pb-search input {
          background: none; border: none; outline: none;
          font-size: 13px; color: #1A1714; flex: 1;
          font-family: 'DM Sans', sans-serif;
        }
        .pb-search input::placeholder { color: #9A9288; }
        .pb-clear {
          background: none; border: none; cursor: pointer;
          color: #9A9288; font-size: 14px; line-height: 1;
          transition: color 0.2s; padding: 0;
        }
        .pb-clear:hover { color: #C4581F; }

        /* Filters */
        .pb-filters { padding: 12px 20px 0; display: flex; flex-direction: column; gap: 8px; }
        .pb-filter-row { display: flex; align-items: center; gap: 6px; overflow-x: auto; }
        .pb-filter-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #9A9288; white-space: nowrap; }
        .pb-pill {
          font-size: 9px; font-weight: 500; letter-spacing: 0.06em;
          padding: 4px 12px; border: 1px solid #E3DDD0;
          background: #F5F0E8; color: #6B6560;
          cursor: pointer; white-space: nowrap;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .pb-pill:hover { border-color: #C8BFA8; color: #1A1714; }
        .pb-pill.active { background: #1A1714; color: #F5F0E8; border-color: #1A1714; }
        .pb-pill.result-pass { background: #E8F5EE; color: #1A5C2E; border-color: #8ECEBF; }
        .pb-pill.result-fail { background: #F5E8E8; color: #8B1A14; border-color: #DBA8A5; }
        .pb-pill.result-wait { background: #F5F0DC; color: #8B6914; border-color: #D4C068; }

        .pb-clear-all {
          background: none; border: none; cursor: pointer;
          font-size: 10px; color: #C4581F; letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0; font-family: 'DM Sans', sans-serif; transition: color 0.2s;
          align-self: flex-start;
        }
        .pb-clear-all:hover { color: #A8461A; }

        /* Grid */
        .pb-grid {
          display: grid; gap: 14px;
          padding: 16px 20px 48px;
          grid-template-columns: repeat(2, 1fr);
          animation: fadeUp 0.4s ease both;
        }
        @media (min-width: 768px)  { .pb-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .pb-grid { grid-template-columns: repeat(4, 1fr); } }

        /* Empty */
        .pb-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; gap: 12px;
        }
        .pb-empty-icon {
          width: 48px; height: 48px; border: 1px solid #E3DDD0;
          background: #EDE8DC;
          display: flex; align-items: center; justify-content: center;
        }
        .pb-empty-text { font-size: 13px; color: #9A9288; font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="pb-root">
        {/* Header */}
        <div className="pb-header">
          <div className="pb-header-title">Portfolio Search</div>
          <div className="pb-header-count">{filtered.length} portfolios</div>
        </div>

        {/* Search */}
        <div className="pb-search-wrap">
          <div className="pb-search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="#9A9288"
                strokeWidth="1.5"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="#9A9288"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              placeholder="ค้นหาชื่อ, คณะ, มหาวิทยาลัย, ชื่อผู้ใช้..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="pb-clear" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="pb-filters">
          <div className="pb-filter-row">
            <span className="pb-filter-label">ผล:</span>
            {RESULT_OPTIONS.map((r) => {
              const isActive = activeResult === r;
              const rs = r !== "ทั้งหมด" ? RESULT_STYLE[r] : null;
              return (
                <button
                  key={r}
                  className={`pb-pill${isActive ? (rs ? ` result-${r === "ติด" ? "pass" : r === "ไม่ติด" ? "fail" : "wait"}` : " active") : ""}`}
                  onClick={() => setActiveResult(r)}
                >
                  {r}
                </button>
              );
            })}
          </div>
          {/* Category filter row */}
          <div className="pb-filter-row">
            <span className="pb-filter-label">หมวด:</span>
            {categories.slice(0, 6).map((c) => (
              <button
                key={c}
                className={`pb-pill${activeCategory === c ? " active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {hasFilter && (
            <button className="pb-clear-all" onClick={clearAll}>
              ล้างตัวกรองทั้งหมด ✕
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="pb-empty">
            <div className="pb-empty-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                stroke="#9A9288"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <circle cx="6.5" cy="6.5" r="5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
            </div>
            <p className="pb-empty-text">ไม่พบผลลัพธ์</p>
            <button className="pb-clear-all" onClick={clearAll}>
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <div className="pb-grid">
            {filtered.map((item, index) => (
              <PortfolioCard
                key={item.id}
                id={item.id}
                title={item.title}
                pdf_url={item.pdf_url}
                cover_url={item.cover_url}
                category={item.category}
                userProfile={item.profiles?.avatar_url}
                username={item.profiles?.name}
                faculty={item.faculty}
                university={item.university}
                result={item.result}
                initialSaved={savedSet.has(item.id)}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
