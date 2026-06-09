import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function EmailVerify() {
  const navigate = useNavigate();
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res  = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const user = await res.json();

        await fetch("http://localhost:8000/api/auth/login", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email: user.email, name: user.name, photo: user.picture }),
        });

        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName",  user.name);
        localStorage.setItem("userPhoto", user.picture);
        localStorage.setItem("userRole",  "user");
        localStorage.setItem("authToken", tokenResponse.access_token);
        navigate("/home");
      } catch {
        setError("Failed to sign in. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google login failed. Please try again."),
  });

  const handleGuest = () => {
    localStorage.setItem("userRole", "guest");
    navigate("/home");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .mv-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Lato', sans-serif;
          background: #1a0a00;
        }

        /* ── Left panel ── */
        .mv-left {
          flex: 1;
          background:
            linear-gradient(160deg, rgba(139,69,19,0.95) 0%, rgba(80,30,0,0.98) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          position: relative;
          overflow: hidden;
        }
        .mv-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(200,160,74,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 80%, rgba(192,98,42,0.2)  0%, transparent 50%);
        }
        .mv-left-content { position: relative; z-index: 1; text-align: center; }

        /* real logo */
        .mv-logo-wrap {
          width: 160px; height: 160px;
          border-radius: 50%;
          border: 3px solid rgba(200,160,74,0.5);
          padding: 6px;
          margin: 0 auto 28px;
          background: rgba(255,255,255,0.06);
        }
        .mv-logo-wrap img {
          width: 100%; height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .mv-logo-fallback {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #c8a04a, #8b5e1a);
          display: flex; align-items: center; justify-content: center;
          font-size: 64px;
        }

        .mv-left h1 {
          font-family: 'Playfair Display', serif;
          font-size: 38px; font-weight: 700;
          color: #f5e6c8; letter-spacing: -0.5px;
          margin-bottom: 8px; line-height: 1.1;
        }
        .mv-left .tagline {
          font-size: 13px; color: #c8a04a;
          letter-spacing: 3px; text-transform: uppercase;
          margin-bottom: 40px;
        }

        /* decorative dots grid */
        .mv-dots {
          display: grid;
          grid-template-columns: repeat(5, 8px);
          gap: 10px; margin: 40px auto;
        }
        .mv-dots span {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(200,160,74,0.3);
        }
        .mv-dots span:nth-child(3n) { background: rgba(200,160,74,0.7); }

        .mv-features-list { list-style: none; text-align: left; }
        .mv-features-list li {
          display: flex; align-items: center; gap: 14px;
          color: #d4b896; font-size: 14px; padding: 10px 0;
          border-bottom: 1px solid rgba(200,160,74,0.1);
        }
        .mv-features-list li:last-child { border-bottom: none; }
        .mv-features-list .feat-icon {
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(200,160,74,0.12);
          border: 1px solid rgba(200,160,74,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .mv-features-list strong { display: block; color: #f5e6c8; font-size: 13px; margin-bottom: 1px; }
        .mv-features-list span  { color: #9a7050; font-size: 11px; }

        /* ── Right panel ── */
        .mv-right {
          width: 480px; flex-shrink: 0;
          background: #fffaf4;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 52px;
        }
        .mv-right-inner { width: 100%; }

        .mv-right .hello {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 600;
          color: #3b1000; margin-bottom: 8px;
        }
        .mv-right .hello-sub {
          font-size: 14px; color: #9a6040;
          margin-bottom: 36px; line-height: 1.6;
        }

        .mv-error {
          background: #fff0f0; border: 1px solid #fca5a5;
          color: #b91c1c; border-radius: 10px;
          padding: 11px 14px; font-size: 13px;
          margin-bottom: 20px;
        }

        .mv-label {
          font-size: 11px; font-weight: 600;
          color: #b08060; text-transform: uppercase;
          letter-spacing: 1.5px; margin-bottom: 14px;
        }

        /* Google button */
        .mv-google-btn {
          width: 100%; padding: 15px 20px;
          background: #fff;
          border: 1.5px solid #ddc89a;
          border-radius: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          font-size: 15px; font-weight: 600; color: #3b1000;
          font-family: 'Lato', sans-serif;
          transition: all 0.22s; margin-bottom: 16px;
          box-shadow: 0 2px 10px rgba(139,69,19,0.08);
        }
        .mv-google-btn:hover {
          border-color: #8B4513;
          box-shadow: 0 4px 20px rgba(139,69,19,0.15);
          transform: translateY(-1px);
        }
        .mv-google-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        /* divider */
        .mv-or {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 16px;
        }
        .mv-or::before, .mv-or::after {
          content: ''; flex: 1; height: 1px; background: #e8d0b0;
        }
        .mv-or span { font-size: 12px; color: #b08060; white-space: nowrap; }

        /* Guest button */
        .mv-guest-btn {
          width: 100%; padding: 15px 20px;
          background: linear-gradient(135deg, #8B4513 0%, #c0622a 60%, #d4843a 100%);
          border: none; border-radius: 14px; cursor: pointer;
          font-size: 14px; font-weight: 600; color: #fff;
          font-family: 'Lato', sans-serif;
          letter-spacing: 1px; text-transform: uppercase;
          transition: all 0.22s;
          box-shadow: 0 4px 18px rgba(139,69,19,0.3);
        }
        .mv-guest-btn:hover {
          box-shadow: 0 6px 24px rgba(139,69,19,0.42);
          transform: translateY(-1px);
        }

        /* trust bar */
        .mv-trust {
          display: flex; gap: 0;
          margin-top: 36px; padding-top: 24px;
          border-top: 1px solid #f0e0cc;
        }
        .mv-trust-item {
          flex: 1; text-align: center;
          font-size: 11px; color: #b08060;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .mv-trust-item + .mv-trust-item {
          border-left: 1px solid #f0e0cc;
        }
        .mv-trust-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: #fdf0e0;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .mv-trust-item strong { display: block; color: #5c3317; font-size: 12px; font-weight: 600; }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .mv-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #e0c8a8;
          border-top-color: #8B4513;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        /* responsive */
        @media (max-width: 820px) {
          .mv-page { flex-direction: column; }
          .mv-left  { padding: 48px 32px 40px; }
          .mv-right { width: 100%; padding: 48px 32px; }
          .mv-dots, .mv-features-list { display: none; }
          .mv-logo-wrap { width: 120px; height: 120px; }
          .mv-left h1 { font-size: 28px; }
        }
      `}</style>

      <div className="mv-page">

        {/* ── LEFT PANEL ── */}
        <div className="mv-left">
          <div className="mv-left-content">

            {/* Logo — uses your real logo image */}
            <div className="mv-logo-wrap">
              <img
                src="/images/manavastralu_logo.jpeg"
                alt="Mana Vastralu"
                onError={e => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="mv-logo-fallback" style={{ display:"none" }}>🥻</div>
            </div>

            <h1>Mana Vastralu</h1>
            <p className="tagline">Mana Vastralu · Mana Gurthimpu</p>

            {/* decorative dot grid */}
            {/* <div className="mv-dots">
              {Array.from({ length: 15 }).map((_, i) => <span key={i} />)}
            </div> */}

            {/* features */}
            {/* <ul className="mv-features-list">
              {[
                ["🛍️", "2000+ Handpicked Designs", "Banarasi · Kanchipuram · Chanderi"],
                ["🚚", "Free Shipping Above ₹999",   "Pan-India delivery"],
                ["✅", "Easy 30-Day Returns",         "Hassle-free return policy"],
                ["🎁", "Festive & Bridal Collections","New arrivals every week"],
              ].map(([icon, title, sub]) => (
                <li key={title}>
                  <div className="feat-icon">{icon}</div>
                  <div>
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </div>
                </li>
              ))}
            </ul> */}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="mv-right">
          <div className="mv-right-inner">

            <h2 className="hello">Welcome back 👋</h2>
            <p className="hello-sub">
              Sign in to access your wishlist, orders,<br />
              and exclusive member offers.
            </p>

            {error && <div className="mv-error">⚠️ {error}</div>}

            <p className="mv-label">Choose how to continue</p>

            {/* Google */}
            <button className="mv-google-btn" onClick={() => handleGoogle()} disabled={loading}>
              {loading
                ? <span className="mv-spinner" />
                : (
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )
              }
              {loading ? "Signing in…" : "Continue with Google"}
            </button>

            {/* <div className="mv-or"><span>or browse without signing in</span></div> */}

            {/* <button className="mv-guest-btn" onClick={handleGuest}>
              Browse as Guest
            </button> */}

            {/* Trust bar */}
            <div className="mv-trust">
              {[
                ["🔒", "Secure",  "256-bit SSL"],
                ["⭐", "Trusted", "Since 2020"],
                ["📦", "10,000+", "Orders shipped"],
                ["💬", "Support", "7 days a week"],
              ].map(([icon, title, sub]) => (
                <div className="mv-trust-item" key={title}>
                  <div className="mv-trust-icon">{icon}</div>
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </>
  );
}