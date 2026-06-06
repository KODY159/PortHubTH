"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (password !== confirm) {
      setError("Password ไม่ตรงกัน");
      return;
    }
    if (password.length < 8) {
      setError("Password ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    setLoading(true);
    setError("");
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("[Signup]", error);
      setError("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
      return;
    }
    if (signUpData.user) {
      await supabase
        .from("profiles")
        .insert({ id: signUpData.user.id, name: email.split("@")[0] });
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500&display=swap');

        .sg-root {
          min-height: 100vh; background: #F5F0E8;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; overflow: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .sg-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 27px, #E3DDD0 27px, #E3DDD0 28px);
          opacity: 0.5;
        }
        .sg-corner { position: absolute; font-size: 12px; color: #C4581F; opacity: 0.25; }
        .sg-tl { top: 20px; left: 24px; } .sg-tr { top: 20px; right: 24px; }
        .sg-bl { bottom: 20px; left: 24px; } .sg-br { bottom: 20px; right: 24px; }

        .sg-card {
          position: relative; width: 100%; max-width: 420px;
          background: #F5F0E8; border: 1px solid #C8BFA8;
          box-shadow: 0 2px 0 #E3DDD0, 0 4px 0 #D8D1C2, 0 6px 0 #C8BFA8, 0 12px 32px rgba(26,23,20,0.14);
          padding: 36px 32px;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        .sg-accent-bar { width: 100%; height: 3px; background: #C4581F; margin-bottom: 28px; }

        .sg-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .sg-logo-mark {
          width: 32px; height: 32px; background: #1A1714;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display',serif; font-size: 16px; color: #F5F0E8;
        }
        .sg-logo-text { font-size: 11px; color: #9A9288; letter-spacing: 0.08em; text-transform: uppercase; }

        .sg-title {
          font-family: 'Playfair Display',serif;
          font-size: 26px; font-weight: 500; color: #1A1714;
          margin-bottom: 4px; letter-spacing: -0.01em;
        }
        .sg-subtitle { font-size: 12px; color: #9A9288; margin-bottom: 24px; }

        .sg-google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          background: #F5F0E8; border: 1px solid #D8D1C2;
          padding: 10px; font-size: 12px; color: #4A4640;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans',sans-serif;
        }
        .sg-google-btn:hover { border-color: #C8BFA8; background: #EDE8DC; }

        .sg-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
        .sg-divider-line { flex: 1; height: 1px; background: #E3DDD0; }
        .sg-divider-txt { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #9A9288; }

        .sg-label { display: block; font-size: 9px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #6B6560; margin-bottom: 5px; }

        .sg-input {
          width: 100%; background: #EDE8DC;
          border: 1px solid #D8D1C2; border-bottom: 2px solid #C8BFA8;
          padding: 10px 12px; font-size: 13px; color: #1A1714;
          outline: none; margin-bottom: 12px;
          font-family: 'DM Sans',sans-serif;
          transition: border-color 0.2s, background 0.2s;
        }
        .sg-input:focus { border-color: #C4581F; border-bottom-color: #C4581F; background: #F5F0E8; }
        .sg-input::placeholder { color: #9A9288; }

        .sg-error { font-size: 11px; color: #8B1A14; background: #F5E8E8; border: 1px solid #DBA8A5; padding: 8px 12px; margin-bottom: 12px; }

        .sg-submit {
          width: 100%; background: #1A1714; color: #F5F0E8;
          border: none; padding: 12px; font-size: 12px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          font-family: 'DM Sans',sans-serif; margin-top: 4px;
        }
        .sg-submit:hover { background: #C4581F; transform: translateY(-1px); }
        .sg-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .sg-footer { font-size: 12px; color: #9A9288; text-align: center; margin-top: 18px; }
        .sg-link { color: #C4581F; text-decoration: none; transition: color 0.2s; }
        .sg-link:hover { color: #A8461A; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="sg-root">
        <div className="sg-bg" />
        <span className="sg-corner sg-tl">◆</span>
        <span className="sg-corner sg-tr">◆</span>
        <span className="sg-corner sg-bl">◆</span>
        <span className="sg-corner sg-br">◆</span>

        <div className="sg-card">
          <div className="sg-accent-bar" />
          <div className="sg-logo-row">
            <div className="sg-logo-mark">P</div>
            <span className="sg-logo-text">ThaiUniversityPorts.io</span>
          </div>
          <h1 className="sg-title">สร้างบัญชี</h1>
          <p className="sg-subtitle">เพื่ออัปโหลดพอร์ตโฟลิโอของคุณ</p>

          <button className="sg-google-btn" onClick={handleGoogleLogin}>
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

          <div className="sg-divider">
            <div className="sg-divider-line" />
            <span className="sg-divider-txt">หรือ</span>
            <div className="sg-divider-line" />
          </div>

          {error && <div className="sg-error">{error}</div>}

          <label className="sg-label">Email</label>
          <input
            className="sg-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="sg-label">Password (อย่างน้อย 8 ตัว)</label>
          <input
            className="sg-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="sg-label">Confirm Password</label>
          <input
            className="sg-input"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          />

          <button
            className="sg-submit"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "กำลังสร้างบัญชี..." : "Sign up"}
          </button>

          <p className="sg-footer">
            มีบัญชีแล้ว?{" "}
            <Link href={`/login?next=${next}`} className="sg-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
