"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import PortfolioCard from "@/components/PortfolioCard";

type Portfolio = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_url: string | null;
  created_at: string;
  faculty: string | null;
  university: string | null;
  apply_year: number | null;
  apply_round: string | null;
  result: string | null;
  save_count: number;
  view_count: number;
  share_count: number;
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

const CATEGORIES = [
  "ทั้งหมด",
  "Health Sciences",
  "Technology",
  "Engineering",
  "Sciences",
  "Art",
  "Business",
  "Agricultural",
  "Social Sciences",
];

export default function BrowseClient({
  initialData,
  savedIds,
  currentPage,
  totalPages,
  currentSearch,
  currentResult,
  currentCategory,
}: {
  initialData: Portfolio[];
  savedIds: string[];
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentResult: string;
  currentCategory: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const savedSet = new Set(savedIds);
  const [searchInput, setSearchInput] = useState(currentSearch);

  function pushParams(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      search: currentSearch,
      result: currentResult,
      category: currentCategory,
      page: "0",
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "ทั้งหมด") params.set(k, v);
    });
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  }

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      pushParams({ search: value, page: "0" });
    }, 400);
  }

  const hasFilter =
    currentSearch ||
    (currentResult && currentResult !== "ทั้งหมด") ||
    (currentCategory && currentCategory !== "ทั้งหมด");

  function clearAll() {
    setSearchInput("");
    startTransition(() => router.push("/browse"));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400&family=Sarabun:wght@400;500;600&display=swap');

        .pb-root {
          min-height: 100vh;
          background: #F5F0E8;
          font-family: 'Sarabun', system-ui, sans-serif;
          color: #1A1714;
          font-size: 16px;
          line-height: 1.85;
        }

        /* ── Header ── */
        .pb-header {
          background: #1A1714; border-bottom: 2px solid #C4581F;
          padding: 22px 24px 20px; position: relative; overflow: hidden;
        }
        .pb-header::after {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px);
          pointer-events: none;
        }
        /* Header title: 22px Playfair */
        .pb-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 500; color: #F5F0E8;
          letter-spacing: -0.01em; margin-bottom: 4px;
        }
        /* Count text: 14px */
        .pb-header-count { font-size: 14px; color: #9A9288; letter-spacing: 0.02em; }

        /* ── Search ── */
        .pb-search-wrap { padding: 18px 24px 0; }
        .pb-search {
          display: flex; align-items: center; gap: 10px;
          background: #EDE8DC; border: 1px solid #E3DDD0;
          padding: 12px 16px; transition: border-color 0.2s;
        }
        .pb-search:focus-within { border-color: #C4581F; }
        /* Search input: 15px */
        .pb-search input {
          background: none; border: none; outline: none;
          font-size: 15px; color: #1A1714; flex: 1;
          font-family: 'Sarabun', sans-serif;
          line-height: 1.6;
        }
        .pb-search input::placeholder { color: #9A9288; }
        .pb-clear {
          background: none; border: none; cursor: pointer;
          color: #9A9288; font-size: 15px; line-height: 1;
          transition: color 0.2s; padding: 0;
        }
        .pb-clear:hover { color: #C4581F; }

        /* ── Filters ── */
        .pb-filters { padding: 14px 24px 0; display: flex; flex-direction: column; gap: 10px; }
        .pb-filter-row { display: flex; align-items: center; gap: 8px; overflow-x: auto; }
        /* Filter label: 12px minimum */
        .pb-filter-label {
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          color: #9A9288; white-space: nowrap; font-weight: 600;
        }
        /* Pills: 12px — อ่านออกชัด */
        .pb-pill {
          font-size: 12px; font-weight: 500; letter-spacing: 0.03em;
          padding: 6px 14px; border: 1px solid #E3DDD0;
          background: #F5F0E8; color: #6B6560;
          cursor: pointer; white-space: nowrap;
          transition: all 0.2s; font-family: 'Sarabun', sans-serif;
          line-height: 1.4;
        }
        .pb-pill:hover { border-color: #C8BFA8; color: #1A1714; }
        .pb-pill.active { background: #1A1714; color: #F5F0E8; border-color: #1A1714; }
        .pb-pill.result-pass { background: #E8F5EE; color: #1A5C2E; border-color: #8ECEBF; }
        .pb-pill.result-fail { background: #F5E8E8; color: #8B1A14; border-color: #DBA8A5; }
        .pb-pill.result-wait { background: #F5F0DC; color: #8B6914; border-color: #D4C068; }

        /* Clear all: 12px */
        .pb-clear-all {
          background: none; border: none; cursor: pointer;
          font-size: 12px; color: #C4581F; letter-spacing: 0.03em;
          padding: 0; font-family: 'Sarabun', sans-serif;
          font-weight: 500; transition: color 0.2s; align-self: flex-start;
        }
        .pb-clear-all:hover { color: #A8461A; }

        /* ── Grid ── */
        .pb-grid {
          display: grid; gap: 16px;
          padding: 18px 24px 28px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 768px)  { .pb-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .pb-grid { grid-template-columns: repeat(4, 1fr); } }

        .pb-loading { opacity: 0.5; pointer-events: none; transition: opacity 0.2s; }

        /* ── Pagination ── */
        .pb-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 18px 24px 52px;
        }
        /* Pagination buttons: 13px */
        .pb-page-btn {
          font-size: 13px; font-weight: 500;
          padding: 9px 18px; border: 1px solid #D8D1C2;
          background: #F5F0E8; color: #4A4640;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Sarabun', sans-serif; letter-spacing: 0.02em;
        }
        .pb-page-btn:hover { border-color: #C4581F; color: #C4581F; }
        .pb-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pb-page-btn.active { background: #1A1714; color: #F5F0E8; border-color: #1A1714; }
        /* Page info: 13px */
        .pb-page-info { font-size: 13px; color: #9A9288; letter-spacing: 0.02em; padding: 0 8px; }

        /* ── Empty state ── */
        .pb-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; gap: 14px;
        }
        .pb-empty-icon {
          width: 52px; height: 52px; border: 1px solid #E3DDD0;
          background: #EDE8DC; display: flex; align-items: center; justify-content: center;
        }
        /* Empty text: 15px */
        .pb-empty-text { font-size: 15px; color: #9A9288; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pb-root">
        {/* Header */}
        <div className="pb-header">
          <div className="pb-header-title">Portfolio Search</div>
          <div className="pb-header-count">
            {isPending ? "กำลังโหลด..." : `${initialData.length} portfolios`}
          </div>
        </div>

        {/* Search */}
        <div className="pb-search-wrap">
          <div className="pb-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
              placeholder="ค้นหาชื่อ, คณะ, มหาวิทยาลัย..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchInput && (
              <button
                className="pb-clear"
                onClick={() => {
                  setSearchInput("");
                  pushParams({ search: "" });
                }}
              >
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
              const isActive = (currentResult || "ทั้งหมด") === r;
              const rs = r !== "ทั้งหมด" ? RESULT_STYLE[r] : null;
              return (
                <button
                  key={r}
                  className={`pb-pill${isActive ? (rs ? ` result-${r === "ติด" ? "pass" : r === "ไม่ติด" ? "fail" : "wait"}` : " active") : ""}`}
                  onClick={() => pushParams({ result: r })}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <div className="pb-filter-row">
            <span className="pb-filter-label">หมวด:</span>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`pb-pill${(currentCategory || "ทั้งหมด") === c ? " active" : ""}`}
                onClick={() => pushParams({ category: c })}
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

        {/* Grid */}
        <div className={isPending ? "pb-loading" : ""}>
          {initialData.length === 0 ? (
            <div className="pb-empty">
              <div className="pb-empty-icon">
                <svg
                  width="20"
                  height="20"
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
            <div
              className="pb-grid"
              style={{ animation: "fadeUp 0.4s ease both" }}
            >
              {initialData.map((item, index) => (
                <PortfolioCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  cover_url={item.cover_url}
                  category={item.category}
                  userProfile={item.profiles?.avatar_url}
                  username={item.profiles?.name}
                  faculty={item.faculty}
                  university={item.university}
                  result={item.result}
                  initialSaved={savedSet.has(item.id)}
                  priority={index < 4}
                  view_count={item.view_count ?? 0}
                  save_count={item.save_count ?? 0}
                  share_count={item.share_count ?? 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pb-pagination">
            <button
              className="pb-page-btn"
              disabled={currentPage === 0 || isPending}
              onClick={() => pushParams({ page: String(currentPage - 1) })}
            >
              ← ก่อนหน้า
            </button>
            <span className="pb-page-info">
              หน้า {currentPage + 1} / {totalPages}
            </span>
            <button
              className="pb-page-btn"
              disabled={currentPage >= totalPages - 1 || isPending}
              onClick={() => pushParams({ page: String(currentPage + 1) })}
            >
              ถัดไป →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
