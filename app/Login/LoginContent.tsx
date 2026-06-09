"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
//
const SHARED_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500&display=swap');

  .pa-root {
    min-height: 100vh; background: #F5F0E8;
    display: flex; align-items: center; justify-content: center;
    padding: 24px; position: relative; overflow: hidden;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  /* Ruled lines bg */
  .pa-bg-lines {
    position: absolute; inset: 0; pointer-events: none;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 27px, #E3DDD0 27px, #E3DDD0 28px);
    opacity: 0.5;
  }
  /* Corner marks */
  .pa-corner { position: absolute; font-size: 12px; color: #C4581F; opacity: 0.25; }
  .pa-tl { top: 20px; left: 24px; }
  .pa-tr { top: 20px; right: 24px; }
  .pa-bl { bottom: 20px; left: 24px; }
  .pa-br { bottom: 20px; right: 24px; }

  .pa-card {
    position: relative; width: 100%; max-width: 420px;
    background: #F5F0E8;
    border: 1px solid #C8BFA8;
    box-shadow: 0 2px 0 #E3DDD0, 0 4px 0 #D8D1C2, 0 6px 0 #C8BFA8, 0 12px 32px rgba(26,23,20,0.14);
    padding: 36px 32px;
    animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }

  .pa-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .pa-logo-mark {
    width: 32px; height: 32px; background: #1A1714;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 16px; color: #F5F0E8;
  }
  .pa-logo-text { font-size: 11px; color: #9A9288; letter-spacing: 0.08em; text-transform: uppercase; }

  .pa-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 500; color: #1A1714;
    margin-bottom: 4px; letter-spacing: -0.01em;
  }
  .pa-subtitle { font-size: 12px; color: #9A9288; margin-bottom: 24px; line-height: 1.6; }

  .pa-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 18px 0;
  }
  .pa-divider-line { flex: 1; height: 1px; background: #E3DDD0; }
  .pa-divider-txt { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #9A9288; }

  .pa-label {
    display: block; font-size: 9px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase; color: #6B6560;
    margin-bottom: 5px;
  }
  .pa-input {
    width: 100%; background: #EDE8DC;
    border: 1px solid #D8D1C2; border-bottom: 2px solid #C8BFA8;
    padding: 10px 12px; font-size: 13px; color: #1A1714;
    outline: none; margin-bottom: 12px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s, background 0.2s;
  }
  .pa-input:focus { border-color: #C4581F; border-bottom-color: #C4581F; background: #F5F0E8; }
  .pa-input::placeholder { color: #9A9288; }

  .pa-google-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #F5F0E8; border: 1px solid #D8D1C2;
    padding: 10px; font-size: 12px; color: #4A4640;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .pa-google-btn:hover { border-color: #C8BFA8; background: #EDE8DC; }

  .pa-submit {
    width: 100%; background: #1A1714; color: #F5F0E8;
    border: none; padding: 12px; font-size: 12px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
    font-family: 'DM Sans', sans-serif; margin-top: 4px;
  }
  .pa-submit:hover { background: #C4581F; transform: translateY(-1px); }
  .pa-submit:active { transform: translateY(0); }
  .pa-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .pa-error {
    font-size: 11px; color: #8B1A14;
    background: #F5E8E8; border: 1px solid #DBA8A5;
    padding: 8px 12px; margin-bottom: 12px;
  }
  .pa-footer-txt { font-size: 12px; color: #9A9288; text-align: center; margin-top: 18px; }
  .pa-footer-link { color: #C4581F; text-decoration: none; transition: color 0.2s; }
  .pa-footer-link:hover { color: #A8461A; }

  .pa-accent-bar { width: 100%; height: 3px; background: #C4581F; margin-bottom: 28px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email หรือ Password ไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    router.push(next);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  return (
    <>
      <style>{SHARED_STYLE}</style>
      <div className="pa-root">
        <div className="pa-bg-lines" />
        <span className="pa-corner pa-tl">◆</span>
        <span className="pa-corner pa-tr">◆</span>
        <span className="pa-corner pa-bl">◆</span>
        <span className="pa-corner pa-br">◆</span>

        <div className="pa-card">
          <div className="pa-accent-bar" />
          <div className="pa-logo-row">
            <Image
              src="/logo.png"
              alt="logo"
              width={0}
              height={0}
              sizes="100vw"
              priority
              className="object-contain"
              style={{ height: "42px", width: "auto" }}
            />
            <span className="pa-logo-text">PortHubTH</span>
          </div>
          <h1 className="pa-title">เข้าสู่ระบบ</h1>
          <p className="pa-subtitle">เพื่ออัปโหลดพอร์ตโฟลิโอของคุณ</p>

          <button className="pa-google-btn" onClick={handleGoogleLogin}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="pa-divider">
            <div className="pa-divider-line" />
            <span className="pa-divider-txt">หรือ</span>
            <div className="pa-divider-line" />
          </div>

          {error && <div className="pa-error">{error}</div>}

          <label className="pa-label">Email</label>
          <input
            className="pa-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="pa-label">Password</label>
          <input
            className="pa-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            className="pa-submit"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "Log in"}
          </button>

          <p className="pa-footer-txt">
            ยังไม่มีบัญชี?{" "}
            <Link href="/signup" className="pa-footer-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
