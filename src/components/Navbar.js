import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const C = {
  topBar: "#7c2d12",
  nav:    "#ffffff",
  accent: "#92400e",
  soft:   "#fdf6ee",
  border: "#e8d5c0",
  text:   "#3b1f0e",
  sub:    "#78350f",
};

function CartIcon({ cartItems, onClick }) {
  const count   = cartItems?.length || 0;
  const prevRef = useRef(count);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (count > prevRef.current) {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }
    prevRef.current = count;
  }, [count]);

  return (
    <div onClick={onClick} className={bounce ? "cart-bounce" : ""}
      style={{
        position:"relative", cursor:"pointer",
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        width:38, height:38, borderRadius:"50%",
        background: count > 0 ? "rgba(139,69,19,0.08)" : "transparent",
        border: count > 0 ? "1.5px solid rgba(139,69,19,0.2)" : "1.5px solid transparent",
        transition:"all 0.2s", flexShrink:0,
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={count > 0 ? "#8b4513" : "#5c3317"} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {count > 0 && (
        <div style={{
          position:"absolute", top:-4, right:-4,
          background:"linear-gradient(135deg,#c62828,#e53935)",
          color:"#fff", borderRadius:"50%",
          width: count > 9 ? 20 : 18,
          height: count > 9 ? 20 : 18,
          fontSize: count > 9 ? 9 : 10,
          fontWeight:700, display:"flex",
          alignItems:"center", justifyContent:"center",
          border:"2px solid #fff",
          boxShadow:"0 2px 6px rgba(198,40,40,0.4)",
          fontFamily:"sans-serif", minWidth:18,
        }}>
          {count > 99 ? "99+" : count}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ cartItems = [], wishlist = [], user, onLogout }) {
  const navigate = useNavigate();
  const [shopOpen,     setShopOpen]   = useState(false);
  const [mobileOpen,   setMobile]     = useState(false);
  const [searchVal,    setSearch]     = useState("");
  const [userMenuOpen, setUserMenu]   = useState(false);
  const [logoError,    setLogoError]  = useState(false);

  const shopRef     = useRef();
  const userMenuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (shopRef.current     && !shopRef.current.contains(e.target))     setShopOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${searchVal.trim()}`);
      setSearch("");
    }
  };

  const handleLogout = () => {
    setUserMenu(false);
    setMobile(false);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhoto");
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");
    if (onLogout) onLogout();
    navigate("/");
  };

  const resolvedUser = user || (() => {
    try { return JSON.parse(localStorage.getItem("userData")); } catch { return null; }
  })();

  const userEmail   = resolvedUser?.email || localStorage.getItem("userEmail") || "";
  const userName    = resolvedUser?.name  || resolvedUser?.fullName || localStorage.getItem("userName") || "";
  const userDisplay = userName || userEmail;
  const userInitial = userDisplay ? userDisplay[0].toUpperCase() : "?";
  const userShort   = userDisplay.length > 16 ? userDisplay.slice(0,16) + "…" : userDisplay;
  const isLoggedIn  = !!userEmail;

  const categories = [
    { label:"Sarees",  path:"/category/sarees"  },
    { label:"Blouses", path:"/category/blouses" },
  ];

  // Try multiple logo paths in order
  const logoPaths = [
    "/images/manavastralu_logo.jpeg",
    "/images/manavastralu1.jpg",
    "/images/flogo.jpg",
    "/images/flogo.png",
  ];
  const [logoIdx, setLogoIdx] = useState(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Lato:wght@300;400;600;700&display=swap');

        /* ── TOPBAR ── */
        .mv-topbar {
          background: ${C.topBar}; color: #fff;
          font-family: 'Lato', sans-serif; font-size: 12px;
          padding: 7px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .mv-topbar a {
          color: #fde8d0; text-decoration: none;
          margin-left: 20px; font-size: 11px;
          letter-spacing: 0.5px; transition: color .2s;
        }
        .mv-topbar a:hover { color: #fff; }
        .mv-topbar-marquee { overflow: hidden; flex: 1; white-space: nowrap; min-width: 0; }
        .mv-topbar-marquee span {
          display: inline-block;
          animation: mv-marquee 30s linear infinite;
        }
        @keyframes mv-marquee {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }

        /* ── MAIN NAV ── */
        .mv-nav {
          background: ${C.nav};
          border-bottom: 1px solid ${C.border};
          font-family: 'Lato', sans-serif;
          position: sticky; top: 0; z-index: 1000;
          box-shadow: 0 2px 16px rgba(120,53,15,.07);
        }
        .mv-nav-inner {
          max-width: 1320px; margin: 0 auto;
          padding: 0 24px;
          display: flex; align-items: center;
          gap: 20px;
          height: 80px; /* ← taller nav to accommodate bigger logo */
        }

        /* ══════════════════════════
           LOGO — bigger & bolder
        ══════════════════════════ */
        .mv-logo {
          display: flex; align-items: center;
          gap: 12px; text-decoration: none; flex-shrink: 0;
        }

        /* The logo image circle — increased from 48px → 64px */
        .mv-logo-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: ${C.soft};
          border: 2.5px solid ${C.border};
          box-shadow: 0 2px 12px rgba(120,53,15,0.15);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex-shrink: 0;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .mv-logo:hover .mv-logo-circle {
          border-color: ${C.accent};
          box-shadow: 0 4px 18px rgba(146,64,14,0.22);
        }
        .mv-logo-circle img {
          width: 100%; height: 100%;
          object-fit: cover; border-radius: 50%;
          display: block;
        }
        .mv-logo-monogram {
          font-family: 'Playfair Display', serif;
          font-size: 20px; color: ${C.accent}; font-weight: 700;
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #fdf0e4, #f5d9bc);
        }

        /* Text beside logo */
        .mv-logo-text { display: flex; flex-direction: column; gap: 2px; }
        .mv-logo-main {
          font-size: 20px; font-weight: 700; color: ${C.text};
          line-height: 1.1; font-family: 'Playfair Display', serif;
          letter-spacing: 0.2px;
        }
        .mv-logo:hover .mv-logo-main { color: ${C.accent}; }
        .mv-logo-sub {
          font-size: 9.5px; letter-spacing: 2px; color: ${C.sub};
          text-transform: uppercase;
          font-family: 'Lato', sans-serif; font-weight: 600;
        }

        /* ── DESKTOP LINKS ── */
        .mv-links {
          display: flex; align-items: center;
          gap: 2px; flex: 1; justify-content: center;
        }
        .mv-link {
          font-size: 13px; font-weight: 600; color: ${C.text};
          text-decoration: none; padding: 8px 14px;
          border-radius: 4px; letter-spacing: .3px; transition: color .2s;
          white-space: nowrap;
        }
        .mv-link:hover { color: ${C.accent}; }

        /* ── DROPDOWN ── */
        .mv-dropdown-wrap { position: relative; }
        .mv-dropdown-btn {
          background: none; border: none;
          font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 600;
          color: ${C.text}; padding: 8px 14px; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          border-radius: 4px; transition: color .2s; white-space: nowrap;
        }
        .mv-dropdown-btn:hover { color: ${C.accent}; }
        .mv-dropdown-btn svg { transition: transform .2s; }
        .mv-dropdown-btn.open svg { transform: rotate(180deg); }
        .mv-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: #fff; border: 1px solid ${C.border};
          border-radius: 10px; min-width: 200px;
          box-shadow: 0 8px 32px rgba(120,53,15,.12);
          overflow: hidden; z-index: 200;
          animation: fadeDown .15s ease;
        }
        .mv-dropdown a {
          display: block; padding: 12px 20px;
          font-size: 13px; color: ${C.text};
          text-decoration: none; transition: background .15s;
        }
        .mv-dropdown a:hover { background: ${C.soft}; color: ${C.accent}; }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── SEARCH ── */
        .mv-search {
          display: flex; align-items: center;
          background: ${C.soft}; border: 1px solid ${C.border};
          border-radius: 24px; padding: 7px 16px; gap: 6px;
          width: 190px; transition: width .25s, box-shadow .2s;
        }
        .mv-search:focus-within { width: 240px; box-shadow: 0 0 0 3px rgba(146,64,14,0.1); }
        .mv-search input {
          border: none; background: transparent; font-size: 13px;
          color: ${C.text}; outline: none; flex: 1; min-width: 0;
          font-family: 'Lato', sans-serif;
        }
        .mv-search input::placeholder { color: #b08060; }
        .mv-search button {
          background: none; border: none; cursor: pointer;
          color: ${C.accent}; display: flex; padding: 0; flex-shrink: 0;
        }

        /* ── ICONS ── */
        .mv-icons { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .mv-icon-btn {
          position: relative; background: none; border: none;
          cursor: pointer; color: ${C.text};
          display: flex; align-items: center; justify-content: center;
          transition: color .2s; padding: 8px; border-radius: 8px; flex-shrink: 0;
        }
        .mv-icon-btn:hover { color: ${C.accent}; background: ${C.soft}; }
        .mv-badge {
          position: absolute; top: -4px; right: -4px;
          background: ${C.topBar}; color: #fff;
          font-size: 9px; font-weight: 700;
          width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }

        /* ── USER AVATAR ── */
        .mv-user-wrap { position: relative; }
        .mv-avatar-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          padding: 4px 8px 4px 4px; border-radius: 24px;
          transition: background .2s;
        }
        .mv-avatar-btn:hover { background: ${C.soft}; }
        .mv-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: ${C.accent}; color: #fff;
          font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid ${C.border}; flex-shrink: 0;
        }
        .mv-avatar-name {
          font-size: 12px; font-weight: 600; color: ${C.text};
          max-width: 100px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
          font-family: 'Lato', sans-serif;
        }
        .mv-caret      { color: ${C.sub}; transition: transform .2s; flex-shrink: 0; }
        .mv-caret.open { transform: rotate(180deg); }

        .mv-user-menu {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #fff; border: 1px solid ${C.border};
          border-radius: 12px; min-width: 210px;
          box-shadow: 0 8px 32px rgba(120,53,15,.14);
          overflow: hidden; z-index: 300; animation: fadeDown .15s ease;
        }
        .mv-user-menu-header { padding: 14px 18px 10px; border-bottom: 1px solid ${C.border}; }
        .mv-user-menu-label  { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: ${C.sub}; }
        .mv-user-menu-email  { font-size: 12px; font-weight: 600; color: ${C.text}; word-break: break-all; margin-top: 2px; }
        .mv-menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; font-size: 13px; color: ${C.text};
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          font-family: 'Lato', sans-serif; font-weight: 500;
          transition: background .15s;
        }
        .mv-menu-item:hover  { background: ${C.soft}; color: ${C.accent}; }
        .mv-menu-item.danger { color: #b91c1c; }
        .mv-menu-item.danger:hover { background: #fff5f5; }
        .mv-menu-divider { height: 1px; background: ${C.border}; margin: 4px 0; }

        /* ── HAMBURGER ── */
        .mv-hamburger {
          display: none; background: none; border: none;
          cursor: pointer; padding: 6px;
          flex-direction: column; gap: 5px; flex-shrink: 0;
        }
        .mv-hamburger span {
          display: block; width: 22px; height: 2px;
          background: ${C.text}; border-radius: 2px; transition: .3s;
        }

        /* ── MOBILE DRAWER ── */
        .mv-drawer { position: fixed; inset: 0; z-index: 2000; display: flex; }
        .mv-drawer-overlay { flex: 1; background: rgba(0,0,0,.5); }
        .mv-drawer-panel {
          width: 290px; background: #fff; height: 100%;
          overflow-y: auto; padding: 0;
          box-shadow: -4px 0 32px rgba(0,0,0,.2);
          animation: slideIn .25s ease; margin-left: auto;
          display: flex; flex-direction: column;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .mv-drawer-header {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 20px 16px;
          border-bottom: 1px solid ${C.border}; background: ${C.soft};
        }
        .mv-drawer-logo-img {
          width: 52px; height: 52px; border-radius: 50%;
          object-fit: cover; border: 2px solid ${C.border}; flex-shrink: 0;
        }
        .mv-drawer-logo-fallback {
          width: 52px; height: 52px; border-radius: 50%;
          background: ${C.accent}; color: #fff;
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mv-drawer-brand  { font-family: 'Playfair Display', serif; font-size: 17px; color: ${C.text}; font-weight: 700; }
        .mv-drawer-tagline{ font-size: 10px; color: ${C.sub}; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
        .mv-drawer-close  { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 20px; color: ${C.sub}; padding: 4px; }

        .mv-drawer-user {
          padding: 14px 20px; border-bottom: 1px solid ${C.border}; background: #fff8f2;
          display: flex; align-items: center; gap: 10px;
        }
        .mv-drawer-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: ${C.accent}; color: #fff;
          font-size: 15px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mv-drawer-u-name  { font-size: 13px; font-weight: 600; color: ${C.text}; }
        .mv-drawer-u-email { font-size: 11px; color: ${C.sub}; word-break: break-all; }

        .mv-drawer-nav { padding: 8px 0; flex: 1; }
        .mv-drawer-section {
          font-size: 10px; font-weight: 700; color: ${C.sub};
          letter-spacing: 1px; text-transform: uppercase;
          padding: 12px 20px 4px;
        }
        .mv-drawer-link {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 20px; font-size: 14px; color: ${C.text};
          text-decoration: none; font-weight: 500;
          font-family: 'Lato', sans-serif; transition: background .15s;
          border-bottom: 1px solid rgba(232,213,192,0.4);
        }
        .mv-drawer-link:hover { background: ${C.soft}; color: ${C.accent}; }
        .mv-drawer-link .drawer-icon { font-size: 16px; width: 22px; text-align: center; }

        .mv-drawer-footer { padding: 16px 20px; border-top: 1px solid ${C.border}; }
        .mv-drawer-logout {
          display: flex; align-items: center; gap: 10px;
          width: 100%; text-align: left; background: #fff5f5;
          border: 1px solid #fecaca; border-radius: 8px;
          padding: 11px 16px; font-size: 14px; color: #b91c1c;
          font-weight: 600; font-family: 'Lato', sans-serif;
          cursor: pointer; transition: background .2s;
        }
        .mv-drawer-logout:hover { background: #fee2e2; }
        .mv-drawer-login-btn {
          display: block; width: 100%; text-align: center;
          background: ${C.accent}; color: #fff;
          border: none; border-radius: 8px;
          padding: 12px; font-size: 14px; font-weight: 600;
          font-family: 'Lato', sans-serif; cursor: pointer;
          text-decoration: none; transition: background .2s;
        }
        .mv-drawer-login-btn:hover { background: #7c3510; }

        @keyframes cart-bounce {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .cart-bounce { animation: cart-bounce 0.5s ease; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .mv-link, .mv-dropdown-btn { padding: 8px 10px; font-size: 12.5px; }
          .mv-search { width: 160px; }
          .mv-logo-main { font-size: 18px; }
        }
        @media (max-width: 820px) {
          .mv-links, .mv-search, .mv-avatar-name,
          .mv-caret  { display: none !important; }
          .mv-hamburger { display: flex; }
          .mv-topbar-links { display: none; }
          .mv-nav-inner { height: 70px; padding: 0 16px; gap: 12px; }
          .mv-logo-circle { width: 56px; height: 56px; }
          .mv-logo-main   { font-size: 17px; }
          .mv-logo-sub    { display: none; }
        }
        @media (max-width: 480px) {
          .mv-logo-circle { width: 48px; height: 48px; }
          .mv-logo-main   { font-size: 16px; }
          .mv-nav-inner   { gap: 8px; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="mv-topbar">
        <div className="mv-topbar-marquee">
          <span>
            Latest Collections — Free Shipping All Over India &nbsp;&nbsp;✦&nbsp;&nbsp;
            Festive &amp; Bridal Collections Now Live &nbsp;&nbsp;✦&nbsp;&nbsp;
            2000+ Handpicked Designs &nbsp;&nbsp;✦&nbsp;&nbsp;
            Easy 30-Day Returns &nbsp;&nbsp;✦&nbsp;&nbsp;
          </span>
        </div>
        <div className="mv-topbar-links" style={{ display:"flex", flexShrink:0 }}>
          <Link to="/my-orders">Track Order</Link>
          {isLoggedIn
            ? <Link to="/profile">My Account</Link>
            : <Link to="/">Login / Register</Link>
          }
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="mv-nav">
        <div className="mv-nav-inner">

          {/* ══ LOGO ══ */}
          <Link to="/home" className="mv-logo">
            <div className="mv-logo-circle">
              {!logoError ? (
                <img
                  src={logoPaths[logoIdx]}
                  alt="Mana Vastralu"
                  onError={() => {
                    if (logoIdx < logoPaths.length - 1) {
                      setLogoIdx(i => i + 1);
                    } else {
                      setLogoError(true);
                    }
                  }}
                />
              ) : (
                <div className="mv-logo-monogram">MV</div>
              )}
            </div>
            <div className="mv-logo-text">
              <span className="mv-logo-main">Mana Vastralu</span>
              <span className="mv-logo-sub">Mana Vastralu · Mana Gurthimpu</span>
            </div>
          </Link>

          {/* ══ DESKTOP NAV ══ */}
          <div className="mv-links">
            <Link to="/home" className="mv-link">Home</Link>
            <div className="mv-dropdown-wrap" ref={shopRef}>
              <button
                className={`mv-dropdown-btn${shopOpen ? " open" : ""}`}
                onClick={() => setShopOpen(v => !v)}>
                Shop by Category
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {shopOpen && (
                <div className="mv-dropdown">
                  {categories.map(c => (
                    <Link key={c.path} to={c.path} onClick={() => setShopOpen(false)}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ══ SEARCH ══ */}
          <form className="mv-search" onSubmit={handleSearch}>
            <input
              value={searchVal}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sarees…"
            />
            <button type="submit">
              <svg width="14" height="14" fill="none" stroke="currentColor"
                strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {/* ══ ICONS ══ */}
          <div className="mv-icons">

            {/* Wishlist */}
            <button className="mv-icon-btn" onClick={() => navigate("/wishlist")} title="Wishlist">
              <svg width="20" height="20" fill="none" stroke="currentColor"
                strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlist.length > 0 && <span className="mv-badge">{wishlist.length}</span>}
            </button>

            {/* Cart */}
            <CartIcon cartItems={cartItems} onClick={() => navigate("/cart")} />

            {/* My Orders */}
            <button className="mv-icon-btn" onClick={() => navigate("/my-orders")} title="My Orders">
              <svg width="20" height="20" fill="none" stroke="currentColor"
                strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </button>

            {/* Account */}
            {isLoggedIn ? (
              <div className="mv-user-wrap" ref={userMenuRef}>
                <button className="mv-avatar-btn" onClick={() => setUserMenu(v => !v)}>
                  <div className="mv-avatar">{userInitial}</div>
                  <span className="mv-avatar-name">{userShort}</span>
                  <svg className={`mv-caret${userMenuOpen ? " open" : ""}`}
                    width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="mv-user-menu">
                    <div className="mv-user-menu-header">
                      <div className="mv-user-menu-label">Signed in as</div>
                      <div className="mv-user-menu-email">{userEmail}</div>
                    </div>
                    <Link to="/profile" className="mv-menu-item" onClick={() => setUserMenu(false)}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Profile
                    </Link>
                    <Link to="/my-orders" className="mv-menu-item" onClick={() => setUserMenu(false)}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="mv-menu-item" onClick={() => setUserMenu(false)}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      Wishlist
                    </Link>
                    <div className="mv-menu-divider"/>
                    <button className="mv-menu-item danger" onClick={handleLogout}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="mv-icon-btn" onClick={() => navigate("/")} title="Login">
                <svg width="20" height="20" fill="none" stroke="currentColor"
                  strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}

            {/* Hamburger */}
            <button className="mv-hamburger" onClick={() => setMobile(true)} aria-label="Menu">
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="mv-drawer">
          <div className="mv-drawer-overlay" onClick={() => setMobile(false)} />
          <div className="mv-drawer-panel">
            <div className="mv-drawer-header">
              {!logoError ? (
                <img src={logoPaths[logoIdx]} alt="Mana Vastralu" className="mv-drawer-logo-img"
                  onError={() => {
                    if (logoIdx < logoPaths.length - 1) setLogoIdx(i => i + 1);
                    else setLogoError(true);
                  }}
                />
              ) : (
                <div className="mv-drawer-logo-fallback">MV</div>
              )}
              <div>
                <div className="mv-drawer-brand">Mana Vastralu</div>
                <div className="mv-drawer-tagline">Mana Gurthimpu</div>
              </div>
              <button className="mv-drawer-close" onClick={() => setMobile(false)}>✕</button>
            </div>

            {isLoggedIn && (
              <div className="mv-drawer-user">
                <div className="mv-drawer-avatar">{userInitial}</div>
                <div>
                  <div className="mv-drawer-u-name">{userName || "User"}</div>
                  <div className="mv-drawer-u-email">{userEmail}</div>
                </div>
              </div>
            )}

            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}` }}>
              <form onSubmit={handleSearch}
                style={{ display:"flex", alignItems:"center", gap:8,
                         background:C.soft, border:`1px solid ${C.border}`,
                         borderRadius:24, padding:"8px 16px" }}>
                <input value={searchVal} onChange={e => setSearch(e.target.value)}
                  placeholder="Search sarees…"
                  style={{ border:"none", background:"transparent", outline:"none",
                           flex:1, fontSize:14, color:C.text, fontFamily:"'Lato',sans-serif" }} />
                <button type="submit" style={{ background:"none", border:"none",
                  cursor:"pointer", color:C.accent, display:"flex" }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
              </form>
            </div>

            <div className="mv-drawer-nav">
              <div className="mv-drawer-section">Shop</div>
              {[
                { to:"/home",             icon:"🏠", label:"Home"         },
                { to:"/new-arrivals",     icon:"✨", label:"New Arrivals" },
                { to:"/best-sellers",     icon:"🔥", label:"Best Sellers" },
                { to:"/category/sarees",  icon:"🥻", label:"Sarees"       },
                { to:"/category/blouses", icon:"👗", label:"Blouses"      },
              ].map(item => (
                <Link key={item.to} to={item.to} className="mv-drawer-link"
                  onClick={() => setMobile(false)}>
                  <span className="drawer-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="mv-drawer-section">Account</div>
              {[
                { to:"/my-orders", icon:"📦", label:"My Orders" },
                { to:"/wishlist",  icon:"❤️", label:"Wishlist"  },
                { to:"/cart",      icon:"🛒", label:"Cart"      },
                { to:"/contact",   icon:"📞", label:"Contact"   },
              ].map(item => (
                <Link key={item.to} to={item.to} className="mv-drawer-link"
                  onClick={() => setMobile(false)}>
                  <span className="drawer-icon">{item.icon}</span>
                  {item.label}
                  {item.to === "/cart" && cartItems.length > 0 && (
                    <span style={{ marginLeft:"auto", background:C.topBar, color:"#fff",
                                   borderRadius:12, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="mv-drawer-footer">
              {isLoggedIn ? (
                <button className="mv-drawer-logout" onClick={handleLogout}>
                  <svg width="16" height="16" fill="none" stroke="currentColor"
                    strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              ) : (
                <Link to="/" className="mv-drawer-login-btn" onClick={() => setMobile(false)}>
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}