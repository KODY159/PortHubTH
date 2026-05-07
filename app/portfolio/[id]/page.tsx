import createClient from "@/lib/supabaseServer";
import Link from "next/link";
import { ArrowLeftFromLine, ArrowUpRight } from "lucide-react";
import Image from "next/image";

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

const RESULT_STYLE: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  ติด: { bg: "#E8F5EE", text: "#1A5C2E", border: "#8ECEBF", dot: "#2E9D52" },
  ไม่ติด: { bg: "#F5E8E8", text: "#8B1A14", border: "#DBA8A5", dot: "#C4381F" },
  รอผล: { bg: "#F5F0DC", text: "#8B6914", border: "#D4C068", dot: "#C4A01F" },
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select(`*, profiles(name, avatar_url)`)
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F0E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9A9288",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        Portfolio not found
      </div>
    );
  }

  const tc = data.category
    ? (CATEGORY_COLORS[data.category] ?? DEFAULT_CAT)
    : DEFAULT_CAT;
  const rs = data.result ? RESULT_STYLE[data.result] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

        .pd-root {
          min-height: 100vh;
          background: #F5F0E8;
          font-family: 'DM Sans', system-ui, sans-serif;
          display: flex; flex-direction: column;
        }

        /* ── Navbar ── */
        .pd-nav {
          background: #1A1714;
          border-bottom: 2px solid #C4581F;
          padding: 0 20px; height: 50px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .pd-nav-title {
          font-family: 'Playfair Display', serif;
          font-size: 14px; font-weight: 500; color: #F5F0E8;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 60%;
        }
        .pd-nav-back {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: #9A9288;
          text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .pd-nav-back:hover { color: #C4581F; }

        /* ── Body layout ── */
        .pd-body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px; padding: 16px;
          max-width: 1280px; margin: 0 auto; width: 100%;
        }
        @media (min-width: 1024px) {
          .pd-body { grid-template-columns: 1fr 300px; }
        }

        /* ── PDF viewer ── */
        .pd-pdf-wrap {
          background: #EDE8DC;
          border: 1px solid #D8D1C2;
          border-top: 3px solid #C4581F;
          display: flex; flex-direction: column;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 0 #D8D1C2, 0 8px 24px rgba(26,23,20,0.12);
          overflow: hidden;
        }
        .pd-pdf-bar {
          background: #2E2B26;
          padding: 10px 14px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #1A1714;
        }
        .pd-pdf-name {
          font-family: 'DM Mono', monospace;
          font-size: 10px; color: #9A9288;
        }
        .pd-pdf-open {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 500;
          background: #C4581F; color: #F5F0E8;
          padding: 5px 12px; text-decoration: none;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: background 0.2s;
        }
        .pd-pdf-open:hover { background: #A8461A; }
        .pd-pdf-iframe {
          width: 100%; flex: 1;
          min-height: 85vh;
        }

        /* ── Sidebar ── */
        .pd-sidebar { display: flex; flex-direction: column; gap: 12px; }

        /* ── Info card ── */
        .pd-info {
          background: #F5F0E8;
          border: 1px solid #D8D1C2;
          border-top: 3px solid #C4581F;
          padding: 18px;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 12px rgba(26,23,20,0.08);
          animation: fadeUp 0.4s ease both;
        }

        /* Avatar row */
        .pd-av-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .pd-av {
          width: 38px; height: 38px;
          background: #1A1714; color: #F5F0E8;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 500;
          flex-shrink: 0; border: 2px solid #C4581F;
        }
        .pd-av-name { font-size: 13px; font-weight: 500; color: #2E2B26; }
        .pd-av-date { font-size: 9px; color: #9A9288; letter-spacing: 0.04em; margin-top: 2px; }

        .pd-divider { height: 1px; background: #E3DDD0; margin: 12px 0; }

        /* Title */
        .pd-port-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 500; color: #1A1714;
          line-height: 1.35; margin-bottom: 8px;
        }

        /* Description */
        .pd-desc { font-size: 12px; color: #6B6560; line-height: 1.7; margin-bottom: 12px; }

        /* Result badge */
        .pd-result {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.05em;
          padding: 5px 12px; border: 1px solid;
          margin-bottom: 10px;
        }
        .pd-result-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* Tags */
        .pd-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .pd-tag {
          font-size: 9px; font-weight: 500; letter-spacing: 0.06em;
          padding: 3px 10px; border: 1px solid;
          transition: filter 0.15s;
        }
        .pd-tag:hover { filter: brightness(0.95); }

        /* Faculty special */
        .pd-fac { background: #F5EDDF; color: #8B4513; border-color: #D4AA78; }
        /* University special */
        .pd-uni { background: #EDE8DC; color: #4A4640; border-color: #C8BFA8; }

        /* ── Ruled note card ── */
        .pd-note-card {
          background: #F5F0E8;
          border: 1px solid #D8D1C2;
          padding: 14px 18px;
          position: relative; overflow: hidden;
          animation: fadeUp 0.5s ease 0.1s both;
        }
        .pd-note-lines {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 23px, #E3DDD0 23px, #E3DDD0 24px);
          opacity: 0.5;
        }
        .pd-note-label {
          position: relative;
          font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #C4581F; margin-bottom: 8px; font-weight: 500;
        }
        .pd-note-val { position: relative; font-size: 12px; color: #2E2B26; }
        .pd-note-val span { color: #C4581F; font-weight: 500; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pd-root">
        {/* Navbar */}
        <nav className="pd-nav">
          <span className="pd-nav-title">{data.title}</span>
          <Link href="/" className="pd-nav-back">
            <ArrowLeftFromLine size={12} />
            Back to feed
          </Link>
        </nav>

        {/* Body */}
        <div className="pd-body">
          {/* PDF viewer */}
          <div className="pd-pdf-wrap">
            <div className="pd-pdf-bar">
              <span className="pd-pdf-name">{data.title}.pdf</span>
              <a
                href={data.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-pdf-open"
              >
                Open in new tab <ArrowUpRight size={11} />
              </a>
            </div>
            <iframe
              src={`${data.pdf_url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="pd-pdf-iframe"
              style={{
                height: "calc(100vh - 120px)",
                minHeight: "85vh",
                border: "none",
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="pd-sidebar">
            {/* Info card */}
            <div className="pd-info">
              {/* Avatar */}
              <div className="pd-av-row">
                {data.profiles?.avatar_url ? (
                  <Image
                    src={data.profiles.avatar_url}
                    alt="avatar"
                    width={38}
                    height={38}
                    className="object-cover"
                    style={{
                      width: 38,
                      height: 38,
                      border: "2px solid #C4581F",
                    }}
                    loading="eager"
                  />
                ) : (
                  <div className="pd-av">
                    {data.profiles?.name?.charAt(0).toUpperCase() ?? "A"}
                  </div>
                )}
                <div>
                  <div className="pd-av-name">
                    {data.profiles?.name ?? "Anonymous"}
                  </div>
                  <div className="pd-av-date">
                    {new Date(data.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="pd-divider" />

              {/* Title */}
              <div className="pd-port-title">{data.title}</div>

              {/* Description */}
              {data.description && (
                <p className="pd-desc">{data.description}</p>
              )}

              {/* Result badge */}
              {rs && (
                <div
                  className="pd-result"
                  style={{
                    background: rs.bg,
                    color: rs.text,
                    borderColor: rs.border,
                  }}
                >
                  <span
                    className="pd-result-dot"
                    style={{ background: rs.dot }}
                  />
                  {data.result}
                </div>
              )}

              {/* Tags */}
              <div className="pd-tags">
                {data.category && (
                  <span
                    className="pd-tag"
                    style={{
                      background: tc.bg,
                      color: tc.text,
                      borderColor: tc.border,
                    }}
                  >
                    {data.category}
                  </span>
                )}
                {data.faculty && (
                  <span className="pd-tag pd-fac">{data.faculty}</span>
                )}
                {data.university && (
                  <span className="pd-tag pd-uni">{data.university}</span>
                )}
                {data.apply_round && (
                  <span
                    className="pd-tag"
                    style={{
                      background: "#EDE8DC",
                      color: "#4A4640",
                      borderColor: "#C8BFA8",
                    }}
                  >
                    {data.apply_round}
                  </span>
                )}
              </div>
            </div>

            {/* Apply year note card */}
            {(data.apply_year || data.apply_round) && (
              <div className="pd-note-card">
                <div className="pd-note-lines" />
                <div className="pd-note-label">ข้อมูลการสมัคร</div>
                {data.apply_year && (
                  <div className="pd-note-val">
                    ปี <span>{data.apply_year}</span>
                  </div>
                )}
                {data.apply_round && (
                  <div className="pd-note-val">
                    รอบ <span>{data.apply_round}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
