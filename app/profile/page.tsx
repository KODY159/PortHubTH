"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [portfolios, setPortfolios] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      await Promise.all([
        fetchProfile(session.user.id),
        getPortFolio(session.user.id).then(setPortfolios),
      ]);
    };
    init();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      setName(data.name ?? "");
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatar_url ?? "");
    }
  }

  async function getPortFolio(userId: string) {
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  }

  async function handleSave() {
    if (!user) return;

    if (avatarFile) {
      if (!avatarFile.type.startsWith("image/")) {
        setError("กรุณาแนบไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (avatarFile.size > 5 * 1024 * 1024) {
        setError("รูปต้องไม่เกิน 5MB");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const path = `${user.id}/avatar.png`;

        // 🔥 overwrite ไฟล์เดิม
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw new Error("อัปโหลดรูปไม่สำเร็จ");

        // 🔥 ดึง URL + กัน cache
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);

        newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      }
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        name,
        bio,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      });
      if (upsertError) throw new Error("บันทึกข้อมูลไม่สำเร็จ");
      setAvatarUrl(newAvatarUrl);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("ลบพอร์ตโฟลิโอนี้?");
    if (!confirmed) return;

    try {
      const { data: portfolio, error: fetchError } = await supabase
        .from("portfolios")
        .select("cover_path, pdf_path")
        .eq("id", id)
        .single();

      if (fetchError || !portfolio) {
        throw new Error("ดึงข้อมูลไม่สำเร็จ");
      }

      // ✅ ลบ DB ก่อน
      const { error: deleteError } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error("ลบข้อมูลไม่สำเร็จ");
      }

      // ✅ ลบไฟล์แบบ best effort
      await Promise.allSettled([
        portfolio.cover_path
          ? supabase.storage.from("covers").remove([portfolio.cover_path])
          : null,
        portfolio.pdf_path
          ? supabase.storage.from("portfolios").remove([portfolio.pdf_path])
          : null,
      ]);

      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err.message);
      alert(err.message);
    }
  }

  const avatarLetter =
    name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .pp-root { min-height: 100vh; background: #F5F0E8; font-family: 'DM Sans', system-ui, sans-serif; color: #1A1714; }

        /* ── Navbar ── */
        .pp-nav {
          background: #1A1714; border-bottom: 2px solid #C4581F;
          padding: 0 20px; height: 50px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .pp-nav-logo { display: flex; align-items: center; gap: 10px; }
        .pp-nav-mark {
          width: 28px; height: 28px; background: #C4581F;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 14px; color: #F5F0E8;
        }
        .pp-nav-brand { font-family: 'Playfair Display', serif; font-size: 13px; color: #F5F0E8; }
        .pp-nav-back {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: #9A9288; background: none; border: none; cursor: pointer;
          letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s;
          padding: 6px 10px;
        }
        .pp-nav-back:hover { color: #C4581F; }

        /* ── Content ── */
        .pp-content { max-width: 680px; margin: 0 auto; padding: 28px 20px 60px; display: flex; flex-direction: column; gap: 16px; }

        /* ── Card base ── */
        .pp-card {
          background: #F5F0E8;
          border: 1px solid #D8D1C2;
          border-top: 3px solid #C4581F;
          padding: 22px;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 16px rgba(26,23,20,0.08);
          animation: fadeUp 0.4s ease both;
        }
        .pp-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 500; color: #1A1714;
          margin-bottom: 4px; letter-spacing: -0.01em;
        }
        .pp-card-sub { font-size: 11px; color: #9A9288; margin-bottom: 20px; }
        .pp-divider { height: 1px; background: #E3DDD0; margin: 14px 0; }

        /* ── Avatar upload ── */
        .pp-av-row { display: flex; align-items: center; gap: 16px; }
        .pp-av-circle {
          width: 64px; height: 64px;
          background: #1A1714;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 26px; color: #F5F0E8;
          flex-shrink: 0; border: 3px solid #C4581F;
        }
        .pp-av-upload {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          border: 1px dashed #C8BFA8; background: #EDE8DC;
          padding: 12px 20px; cursor: pointer;
          transition: border-color 0.2s, background 0.2s; flex: 1;
        }
        .pp-av-upload:hover { border-color: #C4581F; background: #F5EDDF; }
        .pp-av-upload-txt { font-size: 10px; color: #9A9288; text-align: center; }

        /* ── Form fields ── */
        .pp-label {
          display: block; font-size: 9px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase; color: #6B6560;
          margin-bottom: 5px;
        }
        .pp-input {
          width: 100%;
          background: #EDE8DC; border: 1px solid #D8D1C2;
          border-bottom: 2px solid #C8BFA8;
          padding: 10px 12px; font-size: 13px; color: #1A1714;
          outline: none; transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif; margin-bottom: 12px;
        }
        .pp-input:focus { border-color: #C4581F; border-bottom-color: #C4581F; background: #F5F0E8; }
        .pp-input::placeholder { color: #9A9288; }
        .pp-textarea {
          width: 100%; resize: none;
          background: #EDE8DC; border: 1px solid #D8D1C2;
          border-bottom: 2px solid #C8BFA8;
          padding: 10px 12px; font-size: 13px; color: #1A1714;
          outline: none; transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif; margin-bottom: 12px;
          min-height: 80px; line-height: 1.6;
        }
        .pp-textarea:focus { border-color: #C4581F; border-bottom-color: #C4581F; background: #F5F0E8; }

        /* ── Alerts ── */
        .pp-error { font-size: 11px; color: #8B1A14; background: #F5E8E8; border: 1px solid #DBA8A5; padding: 8px 12px; margin-bottom: 10px; }
        .pp-success { font-size: 11px; color: #1A5C2E; background: #E8F5EE; border: 1px solid #8ECEBF; padding: 8px 12px; margin-bottom: 10px; }

        /* ── Save button ── */
        .pp-save {
          width: 100%; background: #1A1714; color: #F5F0E8;
          border: none; padding: 12px; font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .pp-save:hover { background: #C4581F; transform: translateY(-1px); }
        .pp-save:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* ── Saved shortcut ── */
        .pp-saved-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          background: #F5F0E8; border: 1px solid #D8D1C2;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
          animation: fadeUp 0.4s ease 0.1s both;
        }
        .pp-saved-link:hover { border-color: #C4581F; background: #F5EDDF; }
        .pp-saved-link-icon {
          width: 36px; height: 36px; background: #1A1714;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pp-saved-link-label { font-size: 13px; color: #2E2B26; font-weight: 500; }
        .pp-saved-link-sub { font-size: 10px; color: #9A9288; margin-top: 2px; }
        .pp-saved-link-count {
          font-size: 10px; font-weight: 500; letter-spacing: 0.06em;
          background: #EDE8DC; color: #4A4640; padding: 3px 10px;
          border: 1px solid #D8D1C2;
          margin-left: auto; margin-right: 12px;
        }
        .pp-arrow { color: #9A9288; font-size: 14px; transition: color 0.2s; }
        .pp-saved-link:hover .pp-arrow { color: #C4581F; }

        /* ── My Portfolios section ── */
        .pp-my-card {
          background: #F5F0E8; border: 1px solid #D8D1C2;
          border-top: 3px solid #C4581F; padding: 20px;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 16px rgba(26,23,20,0.08);
          animation: fadeUp 0.4s ease 0.2s both;
        }
        .pp-my-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .pp-my-title-row { display: flex; align-items: center; gap: 12px; }
        .pp-my-title-label {
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #9A9288; font-weight: 500;
        }
        .pp-my-title-line { width: 24px; height: 1px; background: #D8D1C2; }
        .pp-port-count {
          font-size: 10px; color: #C4581F;
          background: #F5EDDF; border: 1px solid #D4AA78;
          padding: 2px 10px; letter-spacing: 0.05em;
        }
        .pp-upload-btn {
          font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          background: #1A1714; color: #F5F0E8;
          padding: 6px 14px; border: none; cursor: pointer;
          text-decoration: none; transition: background 0.2s;
          font-family: 'DM Sans', sans-serif; display: inline-block;
        }
        .pp-upload-btn:hover { background: #C4581F; }

        /* Empty state */
        .pp-empty {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 36px; border: 1px dashed #D8D1C2; background: #EDE8DC;
        }
        .pp-empty-icon {
          width: 40px; height: 40px; background: #F5F0E8; border: 1px solid #D8D1C2;
          display: flex; align-items: center; justify-content: center;
        }
        .pp-empty-txt { font-size: 12px; color: #9A9288; }

        /* Portfolio grid */
        .pp-port-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (min-width: 480px) { .pp-port-grid { grid-template-columns: repeat(3, 1fr); } }

        .pp-port-item {
          background: #EDE8DC; border: 1px solid #D8D1C2;
          overflow: hidden; position: relative;
          transition: border-color 0.2s, transform 0.2s;
        }
        .pp-port-item:hover { border-color: #C4581F; transform: translateY(-2px); }
        .pp-port-thumb { position: relative; width: 100%; aspect-ratio: 1/1.414; }
        .pp-port-letter {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 500; color: #C4581F;
          background: linear-gradient(135deg, #EDE8DC, #C8BFA8);
        }
        .pp-port-fade { position: absolute; bottom: 0; left: 0; right: 0; height: 32px; background: linear-gradient(to top, #EDE8DC, transparent); pointer-events: none; }

        /* Action buttons overlay */
        .pp-port-actions {
          position: absolute; top: 6px; right: 6px;
          display: flex; gap: 4px;
          opacity: 0; transition: opacity 0.2s;
        }
        .pp-port-item:hover .pp-port-actions { opacity: 1; }
        .pp-port-act {
          width: 28px; height: 28px;
          background: rgba(245,240,232,0.9); border: 1px solid #D8D1C2;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
        }
        .pp-port-act:hover { background: #F5F0E8; border-color: #C4581F; }
        .pp-port-act.del:hover { background: #F5E8E8; border-color: #DBA8A5; }

        /* Port info */
        .pp-port-info { padding: 8px 10px 10px; }
        .pp-port-name { font-size: 11px; font-weight: 500; color: #2E2B26; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pp-port-date { font-size: 9px; color: #9A9288; margin-top: 2px; letter-spacing: 0.03em; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pp-root">
        {/* Navbar */}
        <nav className="pp-nav">
          <div className="pp-nav-logo">
            <div className="pp-nav-mark">P</div>
            <span className="pp-nav-brand">ThaiUniversityPorts.io</span>
          </div>
          <button className="pp-nav-back" onClick={() => router.back()}>
            ← Back
          </button>
        </nav>

        <div className="pp-content">
          {/* Profile settings card */}
          <div className="pp-card">
            <div className="pp-card-title">Profile settings</div>
            <div className="pp-card-sub">{user?.email}</div>

            {/* Avatar */}
            <label className="pp-label">รูปโปรไฟล์</label>
            <div className="pp-av-row" style={{ marginBottom: 16 }}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={64}
                  height={64}
                  className="object-cover"
                  style={{ width: 64, height: 64, border: "3px solid #C4581F" }}
                />
              ) : (
                <div className="pp-av-circle">{avatarLetter}</div>
              )}
              <label className="pp-av-upload">
                <svg
                  width="18"
                  height="18"
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
                <span className="pp-av-upload-txt">
                  {avatarFile ? avatarFile.name : "คลิกเพื่อเปลี่ยนรูป"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  style={{ display: "none" }}
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="pp-divider" />

            {/* Name */}
            <label className="pp-label">ชื่อ</label>
            <input
              className="pp-input"
              placeholder="ชื่อของคุณ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Bio */}
            <label className="pp-label">Bio</label>
            <textarea
              className="pp-textarea"
              placeholder="แนะนำตัวเองสั้นๆ"
              value={bio}
              rows={3}
              onChange={(e) => setBio(e.target.value)}
            />

            {error && <div className="pp-error">{error}</div>}
            {success && <div className="pp-success">บันทึกสำเร็จ ✓</div>}

            <button className="pp-save" onClick={handleSave} disabled={loading}>
              {loading ? "กำลังบันทึก..." : "Save changes"}
            </button>
          </div>

          {/* Saved shortcut */}
          <Link href="/saved" className="pp-saved-link">
            <div className="pp-saved-link-icon">
              <svg
                width="14"
                height="16"
                viewBox="0 0 24 24"
                fill="#F5F0E8"
                stroke="#F5F0E8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={{ marginLeft: 12 }}>
              <div className="pp-saved-link-label">Saved portfolios</div>
              <div className="pp-saved-link-sub">พอร์ตที่คุณบันทึกไว้</div>
            </div>
            <span className="pp-saved-link-count">Saved</span>
            <span className="pp-arrow">›</span>
          </Link>

          {/* My portfolios */}
          <div className="pp-my-card">
            <div className="pp-my-header">
              <div className="pp-my-title-row">
                <span className="pp-my-title-label">My portfolios</span>
                <div className="pp-my-title-line" />
                {portfolios.length > 0 && (
                  <span className="pp-port-count">
                    {portfolios.length} portfolios
                  </span>
                )}
              </div>
              <Link href="/uploadpage" className="pp-upload-btn">
                + Upload
              </Link>
            </div>

            {portfolios.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#9A9288"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </div>
                <p className="pp-empty-txt">ยังไม่มีพอร์ตโฟลิโอ</p>
                <Link href="/uploadpage" className="pp-upload-btn">
                  + Upload portfolio
                </Link>
              </div>
            ) : (
              <div className="pp-port-grid">
                {portfolios.map((item) => (
                  <div key={item.id} className="pp-port-item">
                    <div className="pp-port-thumb">
                      {item.cover_url ? (
                        <Image
                          src={item.cover_url}
                          alt="cover"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="pp-port-letter">
                          {item.title?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="pp-port-fade" />
                      {/* Action buttons */}
                      <div className="pp-port-actions">
                        <Link
                          href={`/portfolio/${item.id}/edit`}
                          className="pp-port-act"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="#4A4640"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" />
                          </svg>
                        </Link>
                        <button
                          className="pp-port-act del"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(item.id);
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="#8B1A14"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            <path d="M1 1l10 10M11 1L1 11" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <Link href={`/portfolio/${item.id}`}>
                      <div className="pp-port-info">
                        <div className="pp-port-name">{item.title}</div>
                        <div className="pp-port-date">
                          {new Date(item.created_at).toLocaleDateString(
                            "th-TH",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
