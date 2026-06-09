import React, { useState } from "react";
import { Link } from "react-router-dom";

const C = {
  bg:     "#7c2d12",
  text:   "#fde8d0",
  muted:  "#fca57a",
  border: "rgba(255,255,255,.12)",
  input:  "rgba(255,255,255,.12)",
  bottom: "#5c1e08",
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) { setSent(true); setEmail(""); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Lato:wght@300;400;600&display=swap');

        .mv-footer { background:${C.bg}; color:${C.text}; font-family:'Lato',sans-serif; padding:64px 0 0; }
        .mv-footer-inner { max-width:1280px; margin:0 auto; padding:0 40px; display:grid; grid-template-columns:1.4fr 1fr 1fr 1.2fr; gap:48px; }

        .mv-footer-brand-name { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:#fff; margin:0 0 10px; }
        .mv-footer-brand-tagline { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:${C.muted}; margin-bottom:18px; }
        .mv-footer-brand-desc { font-size:13.5px; line-height:1.8; color:${C.text}; max-width:260px; }
        .mv-footer-contact { margin-top:22px; display:flex; flex-direction:column; gap:8px; }
        .mv-footer-contact-row { display:flex; align-items:center; gap:10px; font-size:13px; color:${C.text}; }
        .mv-footer-contact-row a { color:${C.text}; text-decoration:none; }
        .mv-footer-contact-row a:hover { color:#fff; }
        .mv-footer-social { display:flex; gap:12px; margin-top:20px; }
        .mv-footer-social a { width:36px; height:36px; border-radius:50%; border:1px solid ${C.border}; display:flex; align-items:center; justify-content:center; color:${C.text}; text-decoration:none; font-size:14px; transition:.2s; }
        .mv-footer-social a:hover { background:rgba(255,255,255,.15); color:#fff; }

        .mv-footer-col h4 { font-family:'Playfair Display',serif; font-size:16px; font-weight:600; color:#fff; margin:0 0 20px; }
        .mv-footer-col ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
        .mv-footer-col ul li a { font-size:13.5px; color:${C.text}; text-decoration:none; transition:color .2s; display:flex; align-items:center; gap:6px; }
        .mv-footer-col ul li a:hover { color:#fff; padding-left:4px; }
        .mv-footer-col ul li a::before { content:'›'; color:${C.muted}; }

        .mv-footer-newsletter p { font-size:13.5px; color:${C.text}; line-height:1.7; margin-bottom:18px; }
        .mv-footer-newsletter form { display:flex; flex-direction:column; gap:10px; }
        .mv-footer-newsletter input { background:${C.input}; border:1px solid ${C.border}; border-radius:8px; padding:11px 16px; color:#fff; font-size:13px; font-family:'Lato',sans-serif; outline:none; }
        .mv-footer-newsletter input::placeholder { color:rgba(253,232,208,.5); }
        .mv-footer-newsletter button { background:#fff; color:${C.bg}; border:none; border-radius:8px; padding:11px; font-size:13px; font-weight:700; font-family:'Lato',sans-serif; cursor:pointer; letter-spacing:.5px; transition:.2s; }
        .mv-footer-newsletter button:hover { background:#fde8d0; }
        .mv-footer-newsletter .success { background:rgba(255,255,255,.12); border-radius:8px; padding:11px 16px; font-size:13px; color:#fff; text-align:center; }

        .mv-footer-divider { border:none; border-top:1px solid ${C.border}; margin:48px 0 0; }
        .mv-footer-bottom { background:${C.bottom}; padding:18px 40px; display:flex; justify-content:space-between; align-items:center; max-width:100%; }
        .mv-footer-bottom p { font-size:12px; color:${C.muted}; margin:0; }
        .mv-footer-bottom a { color:${C.text}; text-decoration:none; font-weight:600; }
        .mv-footer-bottom a:hover { color:#fff; }

        @media(max-width:900px) {
          .mv-footer-inner { grid-template-columns:1fr 1fr; gap:36px; }
          .mv-footer-bottom { flex-direction:column; gap:8px; text-align:center; padding:16px 24px; }
        }
        @media(max-width:560px) {
          .mv-footer-inner { grid-template-columns:1fr; }
        }
      `}</style>

      <footer className="mv-footer">
        <div className="mv-footer-inner">

          {/* Brand column */}
          <div>
            <p className="mv-footer-brand-name">Mana Vastralu</p>
            <p className="mv-footer-brand-tagline">Mana Vastralu · Mana Gurthimpu</p>
            <p className="mv-footer-brand-desc">
              Celebrating the art of handwoven Indian textiles — bringing authentic
              sarees, blouses, and festive wear from weavers to your doorstep.
            </p>
            <div className="mv-footer-contact">
              <div className="mv-footer-contact-row">
                <span>📍</span> Jagtial, Telangana, India
              </div>
              <div className="mv-footer-contact-row">
                <span>📞</span>
                <a href="tel:+917995869469">+91 79958 69469</a>
              </div>
              <div className="mv-footer-contact-row">
                <span>✉️</span>
                <a href="mailto:manavastralu@gmail.com">manavastralu@gmail.com</a>
              </div>
            </div>
            <div className="mv-footer-social">
              <a href="https://instagram.com/mana_vastralu" target="_blank" rel="noreferrer" title="Instagram">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://wa.me/917995869469" target="_blank" rel="noreferrer" title="WhatsApp">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mv-footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/my-orders">Track Your Order</Link></li>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/best-sellers">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="mv-footer-col">
            <h4>Help &amp; Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">Returns &amp; Refunds</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div className="mv-footer-col">
              <h4>Newsletter</h4>
            </div>
            <div className="mv-footer-newsletter">
              <p>Subscribe to get festive offers, new arrivals, and exclusive deals delivered to your inbox.</p>
              {sent
                ? <div className="success">🎉 Thank you for subscribing!</div>
                : (
                  <form onSubmit={handleNewsletter}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit">SUBSCRIBE →</button>
                  </form>
                )
              }
            </div>
          </div>
        </div>

        <hr className="mv-footer-divider" style={{margin:"48px 40px 0"}} />

        <div className="mv-footer-bottom">
          <p>© 2026 <Link to="/home">Mana Vastralu</Link> · All rights reserved</p>
          <p>Designed with ❤️ for every Indian woman</p>
        </div>
      </footer>
    </>
  );
}