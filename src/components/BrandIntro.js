import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function BrandIntro() {
  const navigate = useNavigate();
  const heroRef  = useRef();

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const img = heroRef.current.querySelector(".bi-parallax-img");
      if (img) img.style.transform = `translateY(${window.scrollY * 0.15}px) scale(1.08)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Crimson+Pro:ital,wght@0,300;0,400;1,400&family=Lato:wght@300;400;600;700&display=swap');

        :root {
          --cream:   #fdf5ee;
          --blush:   #fae8d8;
          --brown:   #3d1a0e;
          --mid:     #7c3514;
          --gold:    #c9853a;
          --gold-lt: #e8b97a;
          --border:  rgba(201,133,58,0.22);
          --shadow:  rgba(61,26,14,0.10);
        }

        .bi * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══ HERO ══ */
        .bi-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: calc(100vh - 110px); /* subtract topbar + navbar height */
          min-height: 560px;
          max-height: 860px;
          overflow: hidden;
          position: relative;
        }

        /* ── LEFT image ── */
        .bi-left {
          position: relative; overflow: hidden;
          background: #1a0a04;
        }
        .bi-left::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to right, transparent 55%, rgba(253,245,238,0.15) 100%);
          z-index: 1;
        }
        .bi-parallax-img {
          width: 100%; height: 115%; object-fit: cover; object-position: center top;
          display: block; transform-origin: center top;
          will-change: transform; transform: scale(1.08);
        }
        .bi-ribbon {
          position: absolute; top: 24px; left: 0; z-index: 3;
          background: var(--gold); color: #fff;
          font-family: 'Lato', sans-serif; font-size: 9px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          padding: 7px 22px 7px 16px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 50%, 100% 100%, 0 100%);
          animation: badgePulse 3s ease-in-out infinite;
        }
        @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.82} }
        .bi-img-scrim {
          position: absolute; bottom: 0; left: 0; right: 0; height: 100px; z-index: 2;
          background: linear-gradient(to top, rgba(26,10,4,0.5), transparent);
        }

        /* ── RIGHT content ── */
        .bi-right {
          position: relative; z-index: 1; overflow: hidden;
          display: flex; flex-direction: column;
          justify-content: flex-start; /* top-aligned — no more centering gap */
          padding: 40px 56px 36px 60px;
          background: var(--cream);
        }

        /* watermark */
        .bi-right::before {
          content: '❧';
          position: absolute; bottom: -30px; right: -14px;
          font-size: 300px; color: rgba(201,133,58,0.04);
          font-family: Georgia, serif; line-height: 1;
          pointer-events: none; z-index: 0; user-select: none;
        }

        /* ── Logo lockup — BIGGER ── */
        .bi-logo-row {
          display: flex; align-items: center; gap: 18px;
          margin-bottom: 20px;
          animation: fadeUp .5s ease both;
          position: relative; z-index: 1;
        }
        .bi-logo-img {
          width: 90px; height: 90px; border-radius: 50%;
          object-fit: cover; flex-shrink: 0;
          border: 3px solid var(--gold);
          box-shadow: 0 4px 20px rgba(201,133,58,0.25), 0 0 0 5px rgba(201,133,58,0.10);
          background: var(--blush);
        }
        .bi-logo-fallback {
          width: 90px; height: 90px; border-radius: 50%; flex-shrink: 0;
          border: 3px solid var(--gold);
          box-shadow: 0 4px 20px rgba(201,133,58,0.25), 0 0 0 5px rgba(201,133,58,0.10);
          background: var(--blush);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .bi-logo-fallback span {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 700; color: var(--gold); line-height: 1;
        }
        .bi-logo-info { display: flex; flex-direction: column; }
        .bi-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 600;
          color: var(--brown); line-height: 1.1; letter-spacing: .4px;
        }
        .bi-brand-tag {
          font-family: 'Lato', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--gold); margin-top: 4px;
        }
        .bi-brand-sub {
          font-family: 'Crimson Pro', serif; font-size: 12px; font-style: italic;
          color: var(--mid); opacity: 0.6; margin-top: 5px;
        }

        /* ── Since divider ── */
        .bi-rule {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 18px;
          animation: fadeUp .55s .04s ease both; position: relative; z-index: 1;
        }
        .bi-rule-line     { flex: 1; height: 1px; background: var(--border); }
        .bi-rule-diamond  { width: 5px; height: 5px; background: var(--gold); transform: rotate(45deg); flex-shrink: 0; }
        .bi-rule-text     { font-family:'Lato',sans-serif; font-size:8.5px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:var(--gold); white-space:nowrap; }

        /* ── Eyebrow ── */
        .bi-eyebrow {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 12px;
          animation: fadeUp .6s .08s ease both; position: relative; z-index: 1;
        }
        .bi-eyebrow-bar  { width: 32px; height: 1px; background: var(--gold); }
        .bi-eyebrow-text { font-family:'Lato',sans-serif; font-size:9.5px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:var(--gold); }

        /* ── Headline ── */
        .bi-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 3.8vw, 58px);
          font-weight: 300; line-height: 1.05; color: var(--brown);
          margin-bottom: 10px;
          animation: fadeUp .65s .12s ease both; position: relative; z-index: 1;
        }
        .bi-headline em     { font-style: italic; color: var(--gold); font-weight: 400; }
        .bi-headline strong { font-weight: 600; }

        /* ── Telugu ── */
        .bi-telugu {
          font-family: 'Crimson Pro', serif; font-size: 14px; font-style: italic;
          color: var(--mid); opacity: .7; margin-bottom: 12px;
          animation: fadeUp .65s .16s ease both; position: relative; z-index: 1;
        }

        /* ── Ornament ── */
        .bi-ornament {
          display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
          animation: fadeUp .65s .18s ease both; position: relative; z-index: 1;
        }
        .bi-orn-line { flex: 1; height: 1px; background: var(--border); }
        .bi-orn-dot  { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); }

        /* ── Description ── */
        .bi-desc {
          font-family: 'Crimson Pro', serif; font-size: 15.5px; line-height: 1.75;
          color: #6b3a22; max-width: 400px; margin-bottom: 20px;
          animation: fadeUp .65s .22s ease both; position: relative; z-index: 1;
        }

        /* ── CTA buttons ── */
        .bi-cta {
          display: flex; gap: 10px; margin-bottom: 24px;
          animation: fadeUp .7s .26s ease both; position: relative; z-index: 1;
        }
        .bi-btn-primary {
          padding: 12px 28px; background: var(--brown); color: var(--gold-lt);
          font-family: 'Lato', sans-serif; font-size: 10.5px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; border: none; cursor: pointer;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 4px 18px rgba(61,26,14,.22);
        }
        .bi-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(61,26,14,.3); }
        .bi-btn-outline {
          padding: 12px 28px; background: transparent; color: var(--brown);
          font-family: 'Lato', sans-serif; font-size: 10.5px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          border: 1.5px solid var(--border); cursor: pointer; transition: all .2s;
        }
        .bi-btn-outline:hover { background: var(--blush); border-color: var(--gold); color: var(--mid); }

        /* ── Trust stats ── */
        .bi-trust {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--border); padding-top: 18px;
          animation: fadeUp .75s .3s ease both; position: relative; z-index: 1;
        }
        .bi-trust-item { display:flex; flex-direction:column; padding-right:10px; border-right:1px solid var(--border); }
        .bi-trust-item:last-child  { border-right:none; padding-right:0; padding-left:10px; }
        .bi-trust-item:not(:first-child) { padding-left:10px; }
        .bi-trust-num   { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:600; color:var(--brown); line-height:1; margin-bottom:2px; }
        .bi-trust-label { font-family:'Lato',sans-serif; font-size:8.5px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--gold); }

        /* ══ Features strip ══ */
        .bi-strip { display:grid; grid-template-columns:repeat(4,1fr); background:var(--brown); }
        .bi-strip-item { display:flex; align-items:center; gap:12px; padding:18px 22px; border-right:1px solid rgba(255,255,255,.08); transition:background .2s; }
        .bi-strip-item:last-child { border-right:none; }
        .bi-strip-item:hover { background:rgba(255,255,255,.04); }
        .bi-strip-icon  { font-size:20px; flex-shrink:0; }
        .bi-strip-title { display:block; font-family:'Lato',sans-serif; font-size:11px; font-weight:700; color:var(--gold-lt); letter-spacing:.5px; }
        .bi-strip-sub   { display:block; font-family:'Lato',sans-serif; font-size:10px; color:rgba(255,255,255,.4); margin-top:2px; }

        /* ══ Contact strip ══ */
        .bi-contact { background:var(--blush); border-top:1px solid var(--border); padding:26px 60px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }
        .bi-contact-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:600; color:var(--brown); display:block; }
        .bi-contact-tag  { font-family:'Lato',sans-serif; font-size:8.5px; letter-spacing:2px; text-transform:uppercase; color:var(--gold); display:block; margin-top:2px; }
        .bi-contact-links { display:flex; gap:22px; flex-wrap:wrap; }
        .bi-contact-link { display:flex; align-items:center; gap:7px; text-decoration:none; font-family:'Lato',sans-serif; font-size:12.5px; font-weight:600; color:var(--brown); transition:color .2s; }
        .bi-contact-link:hover { color:var(--gold); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        @media(max-width:1100px){ .bi-right { padding:36px 40px 32px 44px; } }
        @media(max-width:900px){
          .bi-hero { grid-template-columns:1fr; height:auto; max-height:none; }
          .bi-left  { height:58vw; min-height:240px; }
          .bi-right { padding:32px 24px; }
          .bi-trust { grid-template-columns:repeat(2,1fr); gap:12px; }
          .bi-strip { grid-template-columns:repeat(2,1fr); }
          .bi-contact { padding:22px 20px; flex-direction:column; align-items:flex-start; }
          .bi-headline { font-size:36px; }
          .bi-logo-img, .bi-logo-fallback { width:76px; height:76px; }
        }
        @media(max-width:480px){
          .bi-headline { font-size:30px; }
          .bi-cta { flex-direction:column; }
          .bi-strip { grid-template-columns:1fr; }
          .bi-logo-img, .bi-logo-fallback { width:64px; height:64px; }
        }
      `}</style>

      <div className="bi">

        {/* ══ HERO ══ */}
        <section className="bi-hero" ref={heroRef}>

          {/* LEFT — image */}
          <div className="bi-left">
            {/* <div className="bi-ribbon">New Arrivals 2026</div> */}
            <img
              className="bi-parallax-img"
              src="/images/hero1.jpeg"
              alt="Mana Vastralu saree collection"
              onError={e => {
                const fallbacks = ["/images/hero2.jpeg","/images/left3.png","/images/manavastralu_logo.jpeg","/images/s1.png"];
                const idx = fallbacks.findIndex(f => e.target.src.endsWith(f));
                if (idx < fallbacks.length - 1) e.target.src = fallbacks[idx + 1];
              }}
            />
            <div className="bi-img-scrim" />
          </div>

          {/* RIGHT — content */}
          <div className="bi-right">

            {/* Logo row */}
            <div className="bi-logo-row">
              <LogoImg />
              <div className="bi-logo-info">
                <span className="bi-brand-name">Mana Vastralu</span>
                <span className="bi-brand-tag">Mana Vastralu · Mana Gurthimpu</span>
                <span className="bi-brand-sub">Celebrating the art of handwoven Indian textiles</span>
              </div>
            </div>

            {/* Since divider */}
            <div className="bi-rule">
              <span className="bi-rule-line"/>
              <span className="bi-rule-diamond"/>
              {/* <span className="bi-rule-text">Since 2020</span> */}
              <span className="bi-rule-diamond"/>
              <span className="bi-rule-line"/>
            </div>

            {/* Eyebrow */}
            {/* <div className="bi-eyebrow">
              <span className="bi-eyebrow-bar"/>
              <span className="bi-eyebrow-text">Handwoven · Authentic · Elegant</span>
            </div> */}

            {/* Headline */}
            <h1 className="bi-headline">
              Tradition<br/>
              woven into<br/>
              every <em>thread</em>
            </h1>

            {/* Telugu */}
            <p className="bi-telugu">
              ఆడావారి ఆనందానికి సరైన చిరునామా మన వస్త్రాలు
            </p>

            {/* Ornament */}
            {/* <div className="bi-ornament">
              <span className="bi-orn-line"/>
              <span className="bi-orn-dot"/>
              <span className="bi-orn-line"/>
            </div> */}

            {/* Description */}
            <p className="bi-desc">
              Discover a collection that speaks the language of tradition and beauty.
              From luxurious wedding silks to graceful festive wear — chosen to
              enhance your confidence and elegance.
            </p>

            {/* CTA */}
            {/* <div className="bi-cta">
              <button className="bi-btn-primary" onClick={() => navigate("/home")}>
                Shop Collection
              </button>
              <button className="bi-btn-outline" onClick={() => navigate("/category/sarees")}>
                New Arrivals →
              </button>
            </div> */}

            {/* Trust stats */}
            <div className="bi-trust">
              {[
                // { num:"2000+", label:"Designs"         },
                { num:"100%",  label:"Pure Silk"       },
                { num:"5★",    label:"Rated"           },
                { num:"50K+",  label:"Happy Customers" },
              ].map((t,i) => (
                <div className="bi-trust-item" key={i}>
                  <span className="bi-trust-num">{t.num}</span>
                  <span className="bi-trust-label">{t.label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ FEATURES STRIP ══ */}
        {/* <div className="bi-strip">
          {[
            { icon:"🚚", title:"Free Shipping",  sub:"Orders above ₹999"  },
            { icon:"↩️", title:"Easy Returns",   sub:"7-day return policy" },
            { icon:"🔒", title:"Secure Payment", sub:"UPI · Cards · COD"  },
            { icon:"✅", title:"100% Authentic", sub:"Certified handloom"  },
          ].map((f,i) => (
            <div className="bi-strip-item" key={i}>
              <span className="bi-strip-icon">{f.icon}</span>
              <div>
                <span className="bi-strip-title">{f.title}</span>
                <span className="bi-strip-sub">{f.sub}</span>
              </div>
            </div>
          ))}
        </div> */}

        {/* ══ CONTACT STRIP ══ */}
        {/* <div className="bi-contact">
          <div>
            <span className="bi-contact-name">Mana Vastralu</span>
            <span className="bi-contact-tag">Mana Vastralu · Mana Gurthimpu</span>
          </div>
          <div className="bi-contact-links">
            <a href="https://instagram.com/mana_vastralu" className="bi-contact-link" target="_blank" rel="noreferrer">
              <span>📸</span><span>mana_vastralu</span>
            </a>
            <a href="https://wa.me/917995869469" className="bi-contact-link" target="_blank" rel="noreferrer">
              <span>💬</span><span>7995869469</span>
            </a>
            <a href="mailto:manavastralu@gmail.com" className="bi-contact-link">
              <span>✉️</span><span>manavastralu@gmail.com</span>
            </a>
          </div>
        </div> */}

      </div>
    </>
  );
}

/* ── Logo image with fallback monogram ── */
function LogoImg() {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="bi-logo-fallback">
        <span>MV</span>
      </div>
    );
  }
  return (
    <img
      className="bi-logo-img"
      src="/images/manavastralu_logo.jpeg"
      alt="Mana Vastralu"
      onError={() => setFailed(true)}
    />
  );
}