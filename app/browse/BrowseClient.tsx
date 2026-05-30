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
  pdf_url: string;
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

  // Local state สำหรับ search input (debounce ก่อน push URL)
  const [searchInput, setSearchInput] = useState(currentSearch);

  function pushParams(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      search: currentSearch,
      result: currentResult,
      category: currentCategory,
      page: "0", // reset page when filter change
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "ทั้งหมด") params.set(k, v);
    });
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  }

  // Debounce search FOR TEXT SEARCH
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearchInput(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      pushParams({ search: value, page: "0" });
    }, 400);
  } //bitch ass error nigga

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400&family=DM+Sans:wght@400;500&display=swap');

        .pb-root { min-height: 100vh; background: #F5F0E8; font-family: 'DM Sans', system-ui, sans-serif; color: #1A1714; }

        .pb-header { background: #1A1714; border-bottom: 2px solid #C4581F; padding: 20px 24px 18px; position: relative; overflow: hidden; }
        .pb-header::after { content: ''; position: absolute; inset: 0; background-image: repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px); pointer-events: none; }
        .pb-header-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: #F5F0E8; letter-spacing: -0.01em; margin-bottom: 4px; }
        .pb-header-count { font-size: 11px; color: #9A9288; letter-spacing: 0.04em; }

        .pb-search-wrap { padding: 16px 20px 0; }
        .pb-search { display: flex; align-items: center; gap: 10px; background: #EDE8DC; border: 1px solid #E3DDD0; padding: 10px 14px; transition: border-color 0.2s; }
        .pb-search:focus-within { border-color: #C4581F; }
        .pb-search input { background: none; border: none; outline: none; font-size: 13px; color: #1A1714; flex: 1; font-family: 'DM Sans', sans-serif; }
        .pb-search input::placeholder { color: #9A9288; }
        .pb-clear { background: none; border: none; cursor: pointer; color: #9A9288; font-size: 14px; line-height: 1; transition: color 0.2s; padding: 0; }
        .pb-clear:hover { color: #C4581F; }

        .pb-filters { padding: 12px 20px 0; display: flex; flex-direction: column; gap: 8px; }
        .pb-filter-row { display: flex; align-items: center; gap: 6px; overflow-x: auto; }
        .pb-filter-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #9A9288; white-space: nowrap; }
        .pb-pill { font-size: 9px; font-weight: 500; letter-spacing: 0.06em; padding: 4px 12px; border: 1px solid #E3DDD0; background: #F5F0E8; color: #6B6560; cursor: pointer; white-space: nowrap; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .pb-pill:hover { border-color: #C8BFA8; color: #1A1714; }
        .pb-pill.active { background: #1A1714; color: #F5F0E8; border-color: #1A1714; }
        .pb-pill.result-pass { background: #E8F5EE; color: #1A5C2E; border-color: #8ECEBF; }
        .pb-pill.result-fail { background: #F5E8E8; color: #8B1A14; border-color: #DBA8A5; }
        .pb-pill.result-wait { background: #F5F0DC; color: #8B6914; border-color: #D4C068; }

        .pb-clear-all { background: none; border: none; cursor: pointer; font-size: 10px; color: #C4581F; letter-spacing: 0.05em; text-transform: uppercase; padding: 0; font-family: 'DM Sans', sans-serif; transition: color 0.2s; align-self: flex-start; }
        .pb-clear-all:hover { color: #A8461A; }

        .pb-grid { display: grid; gap: 14px; padding: 16px 20px 24px; grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 768px)  { .pb-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .pb-grid { grid-template-columns: repeat(4, 1fr); } }

        /* Loading overlay */
        .pb-loading { opacity: 0.5; pointer-events: none; transition: opacity 0.2s; }

        /* Pagination */
        .pb-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 20px 48px; }
        .pb-page-btn { font-size: 11px; font-weight: 500; padding: 7px 16px; border: 1px solid #D8D1C2; background: #F5F0E8; color: #4A4640; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; letter-spacing: 0.04em; text-transform: uppercase; }
        .pb-page-btn:hover { border-color: #C4581F; color: #C4581F; }
        .pb-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pb-page-btn.active { background: #1A1714; color: #F5F0E8; border-color: #1A1714; }
        .pb-page-info { font-size: 11px; color: #9A9288; letter-spacing: 0.04em; padding: 0 8px; }

        .pb-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 12px; }
        .pb-empty-icon { width: 48px; height: 48px; border: 1px solid #E3DDD0; background: #EDE8DC; display: flex; align-items: center; justify-content: center; }
        .pb-empty-text { font-size: 13px; color: #9A9288; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
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
          {/* ผลการสมัคร */}
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

          {/* Category */}
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
