import React, { useState } from "react";
import { FaArrowLeft, FaWhatsapp, FaEnvelope, FaPhone, FaInstagram } from "react-icons/fa";
import "./ChatBotFAQ.css";

export default function ChatBotFAQ() {
  const [open,     setOpen]     = useState(false);
  const [category, setCategory] = useState(null);
  const [active,   setActive]   = useState(null);

  const faqData = {
    delivery: [
      { q: "How long does delivery take?",           a: "Domestic delivery takes around 5 business days." },
      { q: "Do you offer international shipping?",   a: "Yes, international shipping takes 7–9 business days." },
      { q: "Do you offer same-day or express delivery?", a: "Yes, but it has extra charges." },
      { q: "What are the shipping charges?",         a: "Free delivery on all orders above ₹999." },
    ],
    saree: [
      { q: "What fabrics are available?",            a: "We provide Silk, Banarasi, Organza, Cotton and Designer Sarees." },
      { q: "Do sarees come with blouse pieces?",     a: "Yes, most sarees include matching blouse pieces." },
      { q: "Is the saree lightweight?",              a: "Yes, but it depends on the fabric." },
      { q: "Is the color exactly as shown?",         a: "Yes, we ensure accurate colour representation." },
      { q: "How should I wash or maintain it?",      a: "Gentle hand wash or dry clean recommended based on fabric." },
    ],
    returns: [
      { q: "Can I return a product?",                a: "Yes, returns are accepted with bill and original tags within 7 days." },
      { q: "Is there a return fee?",                 a: "No extra charge if the product has manufacturing defects." },
      { q: "Is exchange available?",                 a: "Yes, but only without removing the tags." },
    ],
    discounts: [
      { q: "Are there any ongoing offers?",          a: "Yes, seasonal offers are available. Follow us on Instagram for updates!" },
      { q: "Is the price inclusive of taxes?",       a: "Yes, all prices are inclusive of taxes." },
    ],
    contact: null, // handled separately as a contact card
  };

  const contactInfo = [
    {
      icon:  <FaPhone />,
      label: "Call Us",
      value: "+91 79958 69469",
      color: "#2e7d32",
      href:  "tel:+917995869469",
    },
    {
      icon:  <FaWhatsapp />,
      label: "WhatsApp",
      value: "+91 79958 69469",
      color: "#25D366",
      href:  "https://wa.me/917995869469",
    },
    {
      icon:  <FaEnvelope />,
      label: "Email",
      value: "manavastralu@gmail.com",
      color: "#C9853A",
      href:  "mailto:manavastralu@gmail.com",
    },
    {
      icon:  <FaInstagram />,
      label: "Instagram",
      value: "@mana_vastralu",
      color: "#E1306C",
      href:  "https://instagram.com/mana_vastralu",
    },
  ];

  const categoryButtons = [
    { key: "delivery",  label: " Delivery"  },
    { key: "saree",     label: " Sarees"    },
    // { key: "returns",   label: "↩️ Returns"   },
    // { key: "discounts", label: "🏷️ Discounts" },
    { key: "contact",   label: " Contact"   },
  ];

  return (
    <div className="chatbot-container">

      {/* CHAT WINDOW */}
      {open && (
        <div className="chat-window">

          {/* HEADER */}
          <div className="chat-header">
            {category && (
              <FaArrowLeft
                className="back-btn"
                onClick={() => { setCategory(null); setActive(null); }}
              />
            )}
            <div className="chat-header-info">
              <div className="chat-header-dot" />
              <h3>Mana Vastralu</h3>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* WELCOME — shown when no category selected */}
          {!category && (
            <>
              <div className="chat-welcome">
                <div className="chat-welcome-logo">🥻</div>
                <p className="chat-welcome-text">
                  Hi!  How can we help you today?<br />
                  <span>Choose a topic below</span>
                </p>
              </div>
              <div className="categories">
                {categoryButtons.map(btn => (
                  <button key={btn.key} onClick={() => { setCategory(btn.key); setActive(null); }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* FAQ QUESTIONS */}
          {category && category !== "contact" && (
            <>
              <div className="chat-section-label">
                {categoryButtons.find(b => b.key === category)?.label}
              </div>
              {faqData[category].map((item, index) => (
                <div key={index} className="faq-item">
                  <div
                    className={`question ${active === index ? "open" : ""}`}
                    onClick={() => setActive(active === index ? null : index)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-chevron">{active === index ? "▲" : "▼"}</span>
                  </div>
                  {active === index && (
                    <div className="answer">{item.a}</div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* CONTACT CARD */}
          {category === "contact" && (
            <>
              <div className="chat-section-label">📞 Contact Us</div>
              <div className="contact-card">
                <div className="contact-brand">
                  <div className="contact-brand-name">Mana Vastralu</div>
                  <div className="contact-brand-tag">Mana Vastralu · Mana Gurthimpu</div>
                </div>
                <div className="contact-list">
                  {contactInfo.map((c, i) => (
                    <a key={i} href={c.href} target="_blank" rel="noreferrer" className="contact-row">
                      <div className="contact-icon" style={{ background: c.color + "18", color: c.color }}>
                        {c.icon}
                      </div>
                      <div className="contact-text">
                        <span className="contact-label">{c.label}</span>
                        <span className="contact-value">{c.value}</span>
                      </div>
                      <span className="contact-arrow">→</span>
                    </a>
                  ))}
                </div>
                <div className="contact-hours">
                   Available Mon–Sat, 9 AM – 7 PM
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* FLOATING BUTTON */}
      <div className="chat-icon" onClick={() => { setOpen(!open); setCategory(null); setActive(null); }}>
        {open ? <span style={{ fontSize: 22 }}>✕</span> : <>💬 <h3>ASK ME?</h3></>}
      </div>

    </div>
  );
}