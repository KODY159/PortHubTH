import createServerClient from "@/lib/supabaseServer";
import Link from "next/link";
import { ArrowLeftFromLine, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import ShareButtons from "@/components/ShareButtonsWrapper";
import StoryCardClient from "@/components/StoryCardClient";
import QASection from "@/components/QASection";
import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";

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

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("portfolios")
    .select("title, description, cover_url, category, university, faculty")
    .eq("id", id)
    .single();

  if (!data) return { title: "Portfolio Not Found | PortHubTH" };

  const parts = [data.title, data.faculty, data.university].filter(Boolean);
  const seoTitle = parts.join(" · ") + " | PortHubTH";
  const seoDescription =
    data.description ??
    `ดูตัวอย่าง Portfolio ${data.category ?? ""} ${data.university ?? ""} บน PortHubTH`;
  const url = `https://porthubth.com/portfolio/${id}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: data.cover_url
        ? [{ url: data.cover_url, width: 1200, height: 630 }]
        : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: data.cover_url ? [data.cover_url] : [],
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createServerClient();

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
          fontFamily: "'Sarabun',sans-serif",
          fontSize: "16px",
        }}
      >
        Portfolio not found
      </div>
    );
  }

  let pdfUrl = "";
  if (data?.pdf_path) {
    const { data: signedData } = await supabase.storage
      .from("portfolios")
      .createSignedUrl(data.pdf_path, 3600);
    pdfUrl = signedData?.signedUrl ?? "";
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: data.title,
    description:
      data.description ??
      `Portfolio ${data.category ?? ""} ${data.university ?? ""}`,
    image: data.cover_url,
    author: { "@type": "Person", name: data.profiles?.name ?? "Anonymous" },
    datePublished: data.created_at,
    keywords: [data.category, data.faculty, data.university]
      .filter(Boolean)
      .join(", "),
    url: `https://porthubth.com/portfolio/${id}`,
  };

  await supabase.rpc("increment_view_count", { row_id: id });

  const tc = data.category
    ? (CATEGORY_COLORS[data.category] ?? DEFAULT_CAT)
    : DEFAULT_CAT;
  const rs = data.result ? RESULT_STYLE[data.result] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Sarabun:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

        /* ── Root ── */
        .pd-root {
          min-height: 100vh; background: #F5F0E8;
          font-family: 'Sarabun', system-ui, sans-serif;
          font-size: 16px; line-height: 1.85;
          display: flex; flex-direction: column; overflow-x: hidden;
        }

        /* ── Navbar ── */
        .pd-nav {
          background: #1A1714; border-bottom: 2px solid #C4581F;
          padding: 0 20px; height: 54px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        /* Nav title: 15px Playfair */
        .pd-nav-title {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 500; color: #F5F0E8;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 60%;
        }
        /* Back link: 13px */
        .pd-nav-back {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #9A9288;
          text-decoration: none; letter-spacing: 0.04em;
          transition: color 0.2s; font-weight: 500;
        }
        .pd-nav-back:hover { color: #C4581F; }

        /* ── Body layout ── */
        .pd-body {
          flex: 1; display: grid;
          grid-template-columns: 1fr;
          gap: 18px; padding: 18px;
          max-width: 1280px; margin: 0 auto;
          width: 100%; box-sizing: border-box;
        }
        .pd-body > * { min-width: 0; }
        @media (min-width: 1024px) {
          .pd-body { grid-template-columns: 1fr 340px; align-items: start; }
        }
        @media (max-width: 1023px) {
          .pd-pdf-iframe { height: 70vh; min-height: 500px; }
        }

        /* ── PDF viewer ── */
        .pd-pdf-wrap {
          background: #EDE8DC; border: 1px solid #D8D1C2; border-top: 3px solid #C4581F;
          display: flex; flex-direction: column;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 0 #D8D1C2, 0 8px 24px rgba(26,23,20,0.12);
          overflow: hidden; max-width: 100%; position: relative;
        }
        .pd-pdf-bar {
          background: #2E2B26; padding: 11px 16px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #1A1714;
        }
        /* PDF filename: 12px DM Mono */
        .pd-pdf-name { font-family: 'DM Mono', monospace; font-size: 12px; color: #9A9288; }
        /* Open button: 12px */
        .pd-pdf-open {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          background: #C4581F; color: #F5F0E8;
          padding: 6px 14px; text-decoration: none;
          letter-spacing: 0.04em; text-transform: uppercase;
          transition: background 0.2s;
        }
        .pd-pdf-open:hover { background: #A8461A; }
        .pd-pdf-iframe {
          width: 100%; max-width: 100%;
          height: calc(100vh - 60px); min-height: 900px;
          border: none; background: white; display: block;
        }

        /* ── Sidebar ── */
        .pd-sidebar { display: flex; flex-direction: column; gap: 14px; }

        /* ── Info card ── */
        .pd-info {
          background: #F5F0E8; border: 1px solid #D8D1C2; border-top: 3px solid #C4581F;
          padding: 20px;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 12px rgba(26,23,20,0.08);
          animation: fadeUp 0.4s ease both;
        }
        .pd-av-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .pd-av {
          width: 42px; height: 42px; background: #1A1714; color: #F5F0E8;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 500;
          flex-shrink: 0; border: 2px solid #C4581F;
        }
        /* Author name: 15px */
        .pd-av-name { font-size: 15px; font-weight: 600; color: #2E2B26; }
        /* Date: 13px */
        .pd-av-date { font-size: 13px; color: #9A9288; margin-top: 2px; }

        .pd-divider { height: 1px; background: #E3DDD0; margin: 14px 0; }

        /* Portfolio title: 18px Playfair */
        .pd-port-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 500; color: #1A1714;
          line-height: 1.4; margin-bottom: 10px;
        }
        /* Description: 15px */
        .pd-desc { font-size: 15px; color: #6B6560; line-height: 1.85; margin-bottom: 14px; }

        /* Result badge: 12px */
        .pd-result {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
          padding: 6px 14px; border: 1px solid; margin-bottom: 12px;
        }
        .pd-result-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        /* Tags: 11px */
        .pd-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .pd-tag {
          font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
          padding: 4px 12px; border: 1px solid; transition: filter 0.15s;
          line-height: 1.5;
        }
        .pd-tag:hover { filter: brightness(0.95); }
        .pd-fac { background: #F5EDDF; color: #8B4513; border-color: #D4AA78; }
        .pd-uni { background: #EDE8DC; color: #4A4640; border-color: #C8BFA8; }

        /* ── Apply info note card ── */
        .pd-note-card {
          background: #F5F0E8; border: 1px solid #D8D1C2;
          padding: 16px 20px; position: relative; overflow: hidden;
          animation: fadeUp 0.5s ease 0.12s both;
        }
        .pd-note-lines {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(
            0deg, transparent, transparent 23px, #E3DDD0 23px, #E3DDD0 24px
          );
          opacity: 0.5;
        }
        /* Note label: 11px */
        .pd-note-label {
          position: relative;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #C4581F; margin-bottom: 10px; font-weight: 600;
          font-family: 'Sarabun', sans-serif;
        }
        /* Note value: 15px */
        .pd-note-val { position: relative; font-size: 15px; color: #2E2B26; line-height: 1.85; }
        .pd-note-val span { color: #C4581F; font-weight: 600; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pd-root">
        {/* ── Navbar ── */}
        <nav className="pd-nav">
          <span className="pd-nav-title">{data.title}</span>
          <Link href="/" className="pd-nav-back">
            <ArrowLeftFromLine size={13} />
            Back to feed
          </Link>
        </nav>

        <div className="pd-body">
          {/* PDF Viewer */}
          <div className="pd-pdf-wrap">
            <div className="pd-pdf-bar">
              <span className="pd-pdf-name">{data.title}.pdf</span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-pdf-open"
              >
                Open in new tab <ArrowUpRight size={12} />
              </a>
            </div>
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="pd-pdf-iframe"
            />
          </div>

          {/* Sidebar */}
          <div className="pd-sidebar">
            {/* Info card */}
            <div className="pd-info">
              <div className="pd-av-row">
                {data.profiles?.avatar_url ? (
                  <Image
                    src={data.profiles.avatar_url}
                    alt="avatar"
                    width={42}
                    height={42}
                    className="object-cover"
                    style={{
                      width: 42,
                      height: 42,
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

              <div className="pd-port-title">{data.title}</div>

              {data.description && (
                <p className="pd-desc">{data.description}</p>
              )}

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

            {/* Story card */}
            {data.story && (
              <StoryCardClient
                story={data.story}
                authorName={data.profiles?.name ?? "Anonymous"}
                avatarUrl={data.profiles?.avatar_url ?? null}
              />
            )}

            {/* Apply info note */}
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

            {/* Share buttons */}
            <ShareButtons title={data.title} portfolioId={data.id} />

            {/* QA Section */}
            <ErrorBoundary context="QASection">
              <QASection portfolioId={data.id} ownerId={data.user_id} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </>
  );
}
