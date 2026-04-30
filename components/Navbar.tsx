"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles").select("name, avatar_url").eq("id", userId).single();
    setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const avatarLetter =
    profile?.name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400&family=DM+Sans:wght@400;500&display=swap');

        .p-nav {
          position: sticky; top: 0; z-index: 50;
          background: #1A1714;
          border-bottom: 2px solid #C4581F;
          transition: box-shadow 0.3s ease;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .p-nav.scrolled { box-shadow: 0 4px 20px rgba(26,23,20,0.3); }

        .p-nav-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 20px; height: 52px;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* Logo */
        .p-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .p-logo-mark {
          width: 30px; height: 30px;
          background: #C4581F;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 15px; color: #F5F0E8;
          position: relative; overflow: hidden;
          transition: background 0.2s;
        }
        .p-logo-mark::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .p-logo:hover .p-logo-mark { background: #A8461A; }
        .p-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 14px; font-weight: 500;
          color: #F5F0E8; letter-spacing: 0.01em;
        }
        .p-logo-text em { color: #E07B3A; font-style: italic; }

        /* Nav links */
        .p-nav-links { display: flex; align-items: center; gap: 2px; }
        .p-nav-link {
          font-size: 12px; color: #9A9288;
          padding: 6px 12px; text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase;
          border: 1px solid transparent;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .p-nav-link:hover { color: #F5F0E8; border-color: #4A4640; }

        .p-nav-btn {
          background: #C4581F; color: #F5F0E8;
          font-size: 11px; font-weight: 500;
          padding: 7px 16px; border: none; cursor: pointer;
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: background 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none; display: inline-block;
        }
        .p-nav-btn:hover { background: #A8461A; transform: translateY(-1px); }
        .p-nav-btn:active { transform: translateY(0); }

        /* Profile chip */
        .p-profile-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 4px;
          border: 1px solid #2E2B26;
          text-decoration: none;
          transition: border-color 0.2s;
        }
        .p-profile-chip:hover { border-color: #4A4640; }
        .p-avatar-letter {
          width: 26px; height: 26px;
          background: #C4581F;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; color: #F5F0E8;
          font-family: 'Playfair Display', serif;
        }
        .p-profile-name { font-size: 11px; color: #D3D1C7; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Logout */
        .p-logout {
          font-size: 11px; color: #6B6560;
          padding: 6px 10px; background: none; border: none; cursor: pointer;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .p-logout:hover { color: #F5F0E8; }

        /* Saved link */
        .p-saved {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #9A9288;
          padding: 6px 10px; text-decoration: none;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .p-saved:hover { color: #C4581F; }

        /* Auth buttons */
        .p-login {
          font-size: 11px; color: #D3D1C7;
          padding: 6px 14px;
          border: 1px solid #4A4640;
          text-decoration: none; letter-spacing: 0.05em; text-transform: uppercase;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .p-login:hover { border-color: #9A9288; color: #F5F0E8; }

        /* Divider */
        .p-divider { width: 1px; height: 18px; background: #2E2B26; margin: 0 4px; }

        /* Mobile menu */
        .p-hamburger {
          display: none; background: none; border: none; cursor: pointer;
          color: #9A9288; padding: 4px;
          transition: color 0.2s;
        }
        .p-hamburger:hover { color: #F5F0E8; }

        .p-mobile-menu {
          background: #1A1714;
          border-top: 1px solid #2E2B26;
          padding: 12px 20px 16px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .p-mobile-link {
          font-size: 13px; color: #9A9288;
          padding: 10px 12px; text-decoration: none;
          border: 1px solid transparent;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .p-mobile-link:hover { color: #F5F0E8; border-color: #2E2B26; }
        .p-mobile-divider { height: 1px; background: #2E2B26; margin: 6px 0; }
        .p-mobile-btn {
          background: #C4581F; color: #F5F0E8;
          text-align: center; padding: 11px;
          font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
          border: none; cursor: pointer; text-decoration: none; display: block;
          transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .p-mobile-btn:hover { background: #A8461A; }
        .p-mobile-logout {
          font-size: 12px; color: #6B6560; background: none; border: none; cursor: pointer;
          text-align: left; padding: 10px 12px; letter-spacing: 0.05em; text-transform: uppercase;
          transition: color 0.2s; font-family: 'DM Sans', sans-serif; width: 100%;
        }
        .p-mobile-logout:hover { color: #C4581F; }

        @media (max-width: 768px) {
          .p-nav-links { display: none; }
          .p-hamburger { display: block; }
        }
      `}</style>

      <nav className={`p-nav${scrolled ? " scrolled" : ""}`}>
        <div className="p-nav-inner">
          {/* Logo */}
          <Link href="/" className="p-logo">
            <div className="p-logo-mark">P</div>
            <span className="p-logo-text">
              Thai<em>University</em>Ports.io
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="p-nav-links">
            <Link href="/browse" className="p-nav-link">Browse</Link>

            {user ? (
              <>
                <div className="p-divider" />
                <Link href="/saved" className="p-saved">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  Saved
                </Link>
                <div className="p-divider" />
                <Link href="/profile" className="p-profile-chip">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="avatar" width={26} height={26}
                      className="object-cover" style={{ width: 26, height: 26 }} />
                  ) : (
                    <div className="p-avatar-letter">{avatarLetter}</div>
                  )}
                  <span className="p-profile-name">{profile?.name ?? user.email}</span>
                </Link>
                <button onClick={handleLogout} className="p-logout">Logout</button>
                <div className="p-divider" />
                <Link href="/uploadpage" className="p-nav-btn">+ Upload</Link>
              </>
            ) : (
              <>
                <div className="p-divider" />
                <Link href="/login" className="p-login">Log in</Link>
                <Link href="/signup" className="p-nav-btn" style={{ marginLeft: 6 }}>Sign up</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="p-hamburger" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="p-mobile-menu">
            <Link href="/browse" className="p-mobile-link" onClick={() => setOpen(false)}>Browse</Link>
            <div className="p-mobile-divider" />
            {user ? (
              <>
                <Link href="/profile" className="p-mobile-link" onClick={() => setOpen(false)}>Profile</Link>
                <Link href="/saved" className="p-mobile-link" onClick={() => setOpen(false)}>Saved portfolios</Link>
                <Link href="/uploadpage" className="p-mobile-btn" onClick={() => setOpen(false)}>+ Upload portfolio</Link>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="p-mobile-logout">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="p-mobile-link" onClick={() => setOpen(false)}>Log in</Link>
                <Link href="/signup" className="p-mobile-btn" onClick={() => setOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}