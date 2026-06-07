import PortfolioCard from "@/components/PortfolioCard";
import Link from "next/link";
import createServerClient from "@/lib/supabaseServer";

export const revalidate = 60;

export default async function Home() {
  const supabaseServer = await createServerClient();

  const { data, error } = await supabaseServer
    .from("portfolios")
    .select(`*, profiles(name, avatar_url)`)
    .order("score", { ascending: false })
    .limit(8);

  const {
    data: { session },
  } = await supabaseServer.auth.getSession();
  let savedIds = new Set<string>();
  if (session?.user) {
    const { data: saved } = await supabaseServer
      .from("saved_portfolios")
      .select("portfolio_id")
      .eq("user_id", session.user.id);
    savedIds = new Set(saved?.map((s) => s.portfolio_id) ?? []);
  }

  const { count } = await supabaseServer
    .from("portfolios")
    .select("*", { count: "exact", head: true });

  if (error) return <div>{error.message}</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Sarabun:wght@300;400;500;600&display=swap');

        .ph-root {
          min-height: 100vh;
          background: #F5F0E8;
          font-family: 'Sarabun', system-ui, sans-serif;
          color: #1A1714;
          font-size: 16px;
          line-height: 1.85;
        }

        /* ── HERO ── */
        .ph-hero {
          position: relative; overflow: hidden;
          padding: 72px 24px 64px; text-align: center;
          background: #F5F0E8;
        }
        .ph-hero-lines {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(
            0deg, transparent, transparent 27px, #E3DDD0 27px, #E3DDD0 28px
          );
          opacity: 0.6;
        }
        .ph-hero::before, .ph-hero::after {
          content: '◆';
          position: absolute; font-size: 11px; color: #C4581F; opacity: 0.4;
        }
        .ph-hero::before { top: 22px; left: 26px; }
        .ph-hero::after  { top: 22px; right: 26px; }

        .ph-hero-inner { position: relative; }

        /* Section label: 11px minimum for Latin ALL-CAPS */
        .ph-label {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #C4581F; margin-bottom: 22px;
          font-family: 'Sarabun', sans-serif;
          font-weight: 600;
        }
        .ph-label-line { width: 28px; height: 1px; background: #C4581F; }

        /* Hero title: clamp 36–56px */
        .ph-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 500; line-height: 1.2;
          color: #1A1714; margin-bottom: 18px;
          letter-spacing: -0.01em;
        }
        .ph-title em { color: #C4581F; font-style: italic; }

        /* Subtitle: 17px — อ่านง่ายบน hero */
        .ph-sub {
          font-size: 17px; color: #6B6560;
          max-width: 480px; margin: 0 auto 36px;
          line-height: 1.9;
          font-weight: 400;
        }

        /* CTA buttons */
        .ph-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .ph-btn-p {
          background: #1A1714; color: #F5F0E8;
          font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 14px 32px; border: 2px solid #1A1714;
          cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          font-family: 'Sarabun', sans-serif;
          display: inline-block;
        }
        .ph-btn-p:hover { background: #2E2B26; transform: translateY(-2px); }
        .ph-btn-s {
          background: transparent; color: #4A4640;
          font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 14px 32px; border: 2px solid #C8BFA8;
          cursor: pointer; text-decoration: none;
          transition: border-color 0.2s, color 0.2s, transform 0.2s;
          font-family: 'Sarabun', sans-serif;
          display: inline-block;
        }
        .ph-btn-s:hover { border-color: #C4581F; color: #C4581F; transform: translateY(-2px); }

        /* ── STATS ── */
        .ph-stats {
          display: flex;
          border-top: 1px solid #E3DDD0;
          border-bottom: 1px solid #E3DDD0;
          background: #EDE8DC;
        }
        .ph-stat {
          flex: 1; padding: 20px 16px; text-align: center;
          border-right: 1px solid #E3DDD0; position: relative;
          transition: background 0.2s;
        }
        .ph-stat:last-child { border-right: none; }
        .ph-stat:hover { background: #E3DDD0; }

        /* Stat number: 28–32px Playfair */
        .ph-stat-n {
          font-family: 'Playfair Display', serif;
          font-size: 30px; color: #C4581F;
          line-height: 1.1; margin-bottom: 5px;
        }
        /* Stat label: 12px minimum */
        .ph-stat-l {
          font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #9A9288; font-weight: 500;
        }

        /* ── SECTION HEADER ── */
        .ph-sec-hd {
          display: flex; align-items: center; gap: 14px;
          padding: 32px 24px 14px;
        }
        .ph-sec-lbl {
          font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #9A9288; white-space: nowrap;
          font-family: 'Sarabun', sans-serif;
          font-weight: 600;
        }
        .ph-sec-line { flex: 1; height: 1px; background: #E3DDD0; }
        .ph-sec-ornament { font-size: 9px; color: #C4581F; }

        /* ── CARD GRID ── */
        .ph-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 18px; padding: 0 24px 28px;
          animation: fadeUp 0.5s ease both;
        }
        @media (min-width: 640px)  { .ph-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .ph-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1280px) { .ph-grid { grid-template-columns: repeat(4, 1fr); } }

        /* ── CTA ── */
        .ph-cta { display: flex; justify-content: center; padding-bottom: 64px; }
        .ph-cta-btn {
          font-size: 13px; color: #6B6560;
          border: 1px solid #D8D1C2; padding: 12px 32px;
          text-decoration: none; letter-spacing: 0.06em; text-transform: uppercase;
          transition: all 0.2s; font-family: 'Sarabun', sans-serif;
          display: inline-block; font-weight: 500;
        }
        .ph-cta-btn:hover { border-color: #C4581F; color: #C4581F; }

        .ph-footer-rule {
          height: 3px;
          background: linear-gradient(90deg, transparent, #C4581F 20%, #C4581F 80%, transparent);
          opacity: 0.3; margin: 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <main className="ph-root">
        {/* ── Hero ── */}
        <div className="ph-hero">
          <div className="ph-hero-lines" />
          <div className="ph-hero-inner">
            <div className="ph-label">
              <span className="ph-label-line" />
              Portfolio Gallery
              <span className="ph-label-line" />
            </div>
            <h1 className="ph-title">
              รวม Port<em>Folio</em> จริง
              <br />
              จากรุ่นพี่ที่ยื่นติด
              <br />
              สำรวจแนวทางของแต่ละคณะ
              <br />
              และมหาวิทยาลัยชั้นนำ
            </h1>
            <p className="ph-sub">
              เเละร่วมกันเเชร์ประสบการณ์เเละเเนวทางที่ทำให้ติดคณะเเละมหาวิทยาลัยนั้น
            </p>
            <div className="ph-btns">
              <Link href="/browse" className="ph-btn-p">
                Browse portfolios
              </Link>
              <Link href="/uploadpage" className="ph-btn-s">
                Upload yours
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="ph-stats">
          {[
            { n: count ?? 0, l: "Portfolios" },
            { n: 12, l: "Faculties" },
            { n: 6, l: "Categories" },
          ].map((s, i) => (
            <div key={i} className="ph-stat">
              <div className="ph-stat-n">{s.n}+</div>
              <div className="ph-stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── Featured ── */}
        <div className="ph-sec-hd">
          <span className="ph-sec-ornament">◆</span>
          <span className="ph-sec-lbl">Featured this week</span>
          <div className="ph-sec-line" />
        </div>

        <div className="ph-grid">
          {data?.map((item, index) => (
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
              initialSaved={savedIds.has(item.id)}
              priority={index < 4}
              view_count={item.view_count ?? 0}
              save_count={item.save_count ?? 0}
              share_count={item.share_count ?? 0}
            />
          ))}
        </div>

        <div className="ph-footer-rule" />

        <div className="ph-cta" style={{ paddingTop: 36 }}>
          <Link href="/browse" className="ph-cta-btn">
            ดูทั้งหมด →
          </Link>
        </div>
      </main>
    </>
  );
}
