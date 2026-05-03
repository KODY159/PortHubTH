"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [faculty, setFaculty] = useState("");
  const [university, setUniversity] = useState("");
  const [applyYear, setApplyYear] = useState("");
  const [applyRound, setApplyRound] = useState("");
  const [result, setResult] = useState("");

  async function handleUpload() {
    if (!title || !pdfFile || !coverFile) {
      setError("กรุณากรอก title และแนบไฟล์ให้ครบ");
      return;
    }

    if (pdfFile.type !== "application/pdf") {
      setError("กรุณาแนบไฟล์ PDF เท่านั้น");
      return;
    }

    if (!coverFile.type.startsWith("image/")) {
      setError("กรุณาแนบไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (pdfFile.size > 20 * 1024 * 1024) {
      setError("PDF ต้องไม่เกิน 20MB");
      return;
    }

    if (coverFile.size > 8 * 1024 * 1024) {
      setError("รูปปกต้องไม่เกิน 8MB");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // ✅ สำคัญ: ใช้ folder = userId
      const coverExt = coverFile.name.split(".").pop();
      const coverPath = `${userId}/${Date.now()}.${coverExt}`;

      const pdfPath = `${userId}/${Date.now()}.pdf`;

      // upload cover
      const { data: coverData, error: coverError } = await supabase.storage
        .from("covers")
        .upload(coverPath, coverFile);

      if (coverError) throw new Error(coverError.message);

      // upload pdf
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from("portfolios")
        .upload(pdfPath, pdfFile);

      if (pdfError) throw new Error(pdfError.message);

      // public url
      const coverUrl = supabase.storage
        .from("covers")
        .getPublicUrl(coverData.path).data.publicUrl;

      const pdfUrl = supabase.storage
        .from("portfolios")
        .getPublicUrl(pdfData.path).data.publicUrl;

      //เก็บ path ด้วย
      const { error: insertError } = await supabase.from("portfolios").insert({
        title,
        description,
        category,
        cover_url: coverUrl,
        pdf_url: pdfUrl,

        cover_path: coverData.path,
        pdf_path: pdfData.path,

        user_id: userId,
        uploaded_by: session.user.email,
        faculty,
        university,
        apply_year: applyYear ? parseInt(applyYear) : null,
        apply_round: applyRound,
        result,
      });

      if (insertError) throw new Error(insertError.message);

      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }
      setLoading(false);
    }
  }

  const CATEGORIES = [
    "Health Sciences",
    "Technology",
    "Engineering",
    "Sciences",
    "Art",
    "Business",
    "Agricultural",
    "Social Sciences",
  ];

  const CATEGORY_ACCENT: Record<string, string> = {
    "Health Sciences": "#2E6B5E",
    Technology: "#3A5FA8",
    Engineering: "#5C7A3E",
    Sciences: "#1E6B8A",
    Art: "#8B5C20",
    Business: "#4A3A8B",
    Agricultural: "#3D6B20",
    "Social Sciences": "#A04060",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .up-root { min-height: 100vh; background: #F5F0E8; font-family: 'DM Sans', system-ui, sans-serif; color: #1A1714; position: relative; }

        /* ruled bg */
        .up-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 27px, #E3DDD0 27px, #E3DDD0 28px);
          opacity: 0.35;
        }

        /* ── Navbar ── */
        .up-nav {
          position: sticky; top: 0; z-index: 50;
          background: #1A1714; border-bottom: 2px solid #C4581F;
          padding: 0 24px; height: 50px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .up-nav-logo { display: flex; align-items: center; gap: 10px; }
        .up-nav-mark { width: 28px; height: 28px; background: #C4581F; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display',serif; font-size: 14px; color: #F5F0E8; }
        .up-nav-brand { font-family: 'Playfair Display',serif; font-size: 13px; color: #F5F0E8; }
        .up-nav-back { font-size: 10px; color: #9A9288; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s; }
        .up-nav-back:hover { color: #C4581F; }

        /* ── Form container ── */
        .up-wrap { position: relative; display: flex; justify-content: center; padding: 36px 20px 60px; }
        .up-form {
          position: relative; z-index: 1;
          width: 100%; max-width: 560px;
          background: #F5F0E8;
          border: 1px solid #D8D1C2;
          border-top: 4px solid #C4581F;
          padding: 32px 28px;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 0 #D8D1C2, 0 8px 32px rgba(26,23,20,0.14);
          display: flex; flex-direction: column; gap: 22px;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── Header ── */
        .up-form-title { font-family: 'Playfair Display',serif; font-size: 22px; font-weight: 500; color: #1A1714; letter-spacing: -0.01em; }
        .up-form-sub { font-size: 12px; color: #9A9288; margin-top: 2px; }

        /* ── Divider ── */
        .up-section-divider { display: flex; align-items: center; gap: 10px; }
        .up-section-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #9A9288; white-space: nowrap; font-weight: 500; }
        .up-section-line { flex: 1; height: 1px; background: #E3DDD0; }
        .up-section-dot { width: 5px; height: 5px; background: #C4581F; flex-shrink: 0; }

        /* ── Labels & Inputs ── */
        .up-label { display: block; font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #6B6560; margin-bottom: 5px; }
        .up-label span { color: #C4581F; }
        .up-input {
          width: 100%; background: #EDE8DC;
          border: 1px solid #D8D1C2; border-bottom: 2px solid #C8BFA8;
          padding: 10px 12px; font-size: 13px; color: #1A1714; outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans',sans-serif;
        }
        .up-input:focus { border-color: #C4581F; border-bottom-color: #C4581F; background: #F5F0E8; }
        .up-input::placeholder { color: #9A9288; }
        .up-textarea {
          width: 100%; resize: none; background: #EDE8DC;
          border: 1px solid #D8D1C2; border-bottom: 2px solid #C8BFA8;
          padding: 10px 12px; font-size: 13px; color: #1A1714; outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans',sans-serif; line-height: 1.6; min-height: 80px;
        }
        .up-textarea:focus { border-color: #C4581F; border-bottom-color: #C4581F; background: #F5F0E8; }
        .up-textarea::placeholder { color: #9A9288; }

        /* ── Two-col ── */
        .up-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* ── Category chips ── */
        .up-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .up-chip {
          font-size: 10px; font-weight: 500; padding: 5px 12px;
          border: 1px solid #D8D1C2; background: #EDE8DC; color: #6B6560;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans',sans-serif; letter-spacing: 0.03em;
        }
        .up-chip:hover { border-color: #C8BFA8; }
        .up-chip.active { border-width: 2px; }

        /* ── Round pills ── */
        .up-rounds { display: flex; gap: 6px; flex-wrap: wrap; }
        .up-round {
          font-size: 10px; padding: 5px 14px;
          border: 1px solid #D8D1C2; background: #EDE8DC; color: #6B6560;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans',sans-serif;
        }
        .up-round:hover { border-color: #C8BFA8; }
        .up-round.active { background: #1A1714; color: #F5F0E8; border-color: #1A1714; }

        /* ── Result buttons ── */
        .up-results { display: flex; gap: 8px; }
        .up-result {
          font-size: 11px; font-weight: 500; padding: 7px 18px;
          border: 1px solid; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans',sans-serif; letter-spacing: 0.03em;
        }

        /* ── File drop zones ── */
        .up-dropzone {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 8px;
          border: 1px dashed #C8BFA8; background: #EDE8DC;
          padding: 28px; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .up-dropzone:hover { border-color: #C4581F; background: #F5EDDF; }
        .up-dropzone.has-file { border-color: #C4581F; background: #F5EDDF; }
        .up-drop-icon { color: #9A9288; }
        .up-drop-txt { font-size: 11px; color: #9A9288; text-align: center; }
        .up-drop-txt span { color: #C4581F; font-weight: 500; }
        .up-drop-filename { font-size: 10px; color: #C4581F; font-weight: 500; letter-spacing: 0.03em; }

        /* ── Error ── */
        .up-error { font-size: 11px; color: #8B1A14; background: #F5E8E8; border: 1px solid #DBA8A5; padding: 10px 12px; }

        /* ── Submit ── */
        .up-submit {
          width: 100%; background: #1A1714; color: #F5F0E8;
          border: none; padding: 14px; font-size: 12px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          font-family: 'DM Sans',sans-serif;
        }
        .up-submit:hover { background: #C4581F; transform: translateY(-1px); }
        .up-submit:active { transform: translateY(0); }
        .up-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .up-progress {
          width: 100%; height: 3px; background: #E3DDD0; overflow: hidden;
        }
        .up-progress-bar {
          height: 100%; background: #C4581F;
          animation: progress 1.5s ease-in-out infinite;
        }
        @keyframes progress { 0% { width: 0%; margin-left: 0; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="up-root">
        <div className="up-bg" />

        {/* Navbar */}
        <nav className="up-nav">
          <div className="up-nav-logo">
            <div className="up-nav-mark">P</div>
            <span className="up-nav-brand">ThaiUniversityPorts.io</span>
          </div>
          <Link href="/" className="up-nav-back">
            ← Back to feed
          </Link>
        </nav>

        <div className="up-wrap">
          <div className="up-form">
            {/* Header */}
            <div>
              <div className="up-form-title">Upload portfolio</div>
              <div className="up-form-sub">แนบไฟล์ PDF และรูปปกของผลงานคุณ</div>
            </div>

            {/* Progress bar when loading */}
            {loading && (
              <div className="up-progress">
                <div className="up-progress-bar" />
              </div>
            )}

            {/* ── Basic info ── */}
            <div className="up-section-divider">
              <div className="up-section-dot" />
              <span className="up-section-label">ข้อมูลพื้นฐาน</span>
              <div className="up-section-line" />
            </div>

            <div>
              <label className="up-label">
                Title <span>*</span>
              </label>
              <input
                className="up-input"
                placeholder="ชื่อผลงาน"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="up-label">Description</label>
              <textarea
                className="up-textarea"
                placeholder="อธิบายผลงานของคุณ"
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* ── Category ── */}
            <div className="up-section-divider">
              <div className="up-section-dot" />
              <span className="up-section-label">Category</span>
              <div className="up-section-line" />
            </div>

            <div>
              <div className="up-chips">
                {CATEGORIES.map((c) => {
                  const isActive = category === c;
                  const accent = CATEGORY_ACCENT[c] ?? "#4A4640";
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`up-chip${isActive ? " active" : ""}`}
                      style={
                        isActive
                          ? {
                              background: `${accent}18`,
                              color: accent,
                              borderColor: accent,
                            }
                          : {}
                      }
                      onClick={() => setCategory(c === category ? "" : c)}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <input
                className="up-input"
                style={{ marginTop: 4 }}
                placeholder="หรือพิมพ์เอง เช่น Animation, UX..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            {/* ── University info ── */}
            <div className="up-section-divider">
              <div className="up-section-dot" />
              <span className="up-section-label">ข้อมูลมหาวิทยาลัย</span>
              <div className="up-section-line" />
            </div>

            <div className="up-row">
              <div>
                <label className="up-label">คณะที่ยื่น</label>
                <input
                  className="up-input"
                  placeholder="เช่น สถาปัตยกรรมศาสตร์"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </div>
              <div>
                <label className="up-label">มหาวิทยาลัย</label>
                <input
                  className="up-input"
                  placeholder="เช่น จุฬาลงกรณ์มหาวิทยาลัย"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
            </div>

            <div className="up-row">
              <div>
                <label className="up-label">ปีที่ยื่น</label>
                <input
                  className="up-input"
                  type="number"
                  placeholder="เช่น 2567"
                  value={applyYear}
                  onChange={(e) => setApplyYear(e.target.value)}
                />
              </div>
              <div>
                <label className="up-label">รอบที่ยื่น</label>
                <div className="up-rounds">
                  {["Portfolio", "รอบ 1", "รอบ 2"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`up-round${applyRound === r ? " active" : ""}`}
                      onClick={() => setApplyRound(r === applyRound ? "" : r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Result ── */}
            <div className="up-section-divider">
              <div className="up-section-dot" />
              <span className="up-section-label">ผลการสมัคร</span>
              <div className="up-section-line" />
            </div>

            <div className="up-results">
              {[
                {
                  label: "ติด",
                  bg: "#E8F5EE",
                  text: "#1A5C2E",
                  border: "#8ECEBF",
                },
                {
                  label: "ไม่ติด",
                  bg: "#F5E8E8",
                  text: "#8B1A14",
                  border: "#DBA8A5",
                },
                {
                  label: "รอผล",
                  bg: "#F5F0DC",
                  text: "#8B6914",
                  border: "#D4C068",
                },
              ].map((r) => (
                <button
                  key={r.label}
                  type="button"
                  className="up-result"
                  style={
                    result === r.label
                      ? {
                          background: r.bg,
                          color: r.text,
                          borderColor: r.border,
                          borderWidth: 2,
                        }
                      : {
                          background: "#EDE8DC",
                          color: "#6B6560",
                          borderColor: "#D8D1C2",
                        }
                  }
                  onClick={() => setResult(r.label === result ? "" : r.label)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* ── Files ── */}
            <div className="up-section-divider">
              <div className="up-section-dot" />
              <span className="up-section-label">ไฟล์</span>
              <div className="up-section-line" />
            </div>

            {/* Cover */}
            <div>
              <label className="up-label">
                รูปปก <span>*</span>{" "}
                <span
                  style={{
                    color: "#9A9288",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (ไม่เกิน 5MB)
                </span>
              </label>
              <label className={`up-dropzone${coverFile ? " has-file" : ""}`}>
                {coverFile ? (
                  <>
                    <svg
                      className="up-drop-icon"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C4581F"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="up-drop-filename">{coverFile.name}</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="up-drop-icon"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9A9288"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="up-drop-txt">คลิกเพื่อเลือกรูปปก</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {/* PDF */}
            <div>
              <label className="up-label">
                ไฟล์ PDF <span>*</span>{" "}
                <span
                  style={{
                    color: "#9A9288",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (ไม่เกิน 20MB)
                </span>
              </label>
              <label className={`up-dropzone${pdfFile ? " has-file" : ""}`}>
                {pdfFile ? (
                  <>
                    <svg
                      className="up-drop-icon"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C4581F"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="up-drop-filename">{pdfFile.name}</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="up-drop-icon"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9A9288"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <span className="up-drop-txt">คลิกเพื่อเลือกไฟล์ PDF</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {error && <div className="up-error">{error}</div>}

            <button
              className="up-submit"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "กำลังอัปโหลด..." : "Upload portfolio"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
