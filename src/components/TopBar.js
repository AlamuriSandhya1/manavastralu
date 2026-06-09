import React from "react";
import "./TopBar.css";

function TopBar() {
  const items = [
    { text: "మన వస్త్రాలు · మన గుర్తింపు", telugu: true },
    // { text: "Free Shipping on Orders Above ₹999" },
    // { text: "2000+ Handpicked Designs" },
    { text: "Pure Quality · Trusted Since Years" },
    // { text: "Festive & Bridal Collections Now Live" },
    { text: "ఆడావారి ఆనందానికి సరైన చిరునామా", telugu: true },
    { text: "Shop Now · New Arrivals Every Week" },
  ];

  const doubled = [...items, ...items]; // seamless loop

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <span className="topbar-floral">❀</span>
        <div className="marquee-track">
          <div className="marquee-content">
            {doubled.map((item, i) => (
              <React.Fragment key={i}>
                <span className={`marquee-item${item.telugu ? " telugu" : ""}`}>
                  {item.text}
                </span>
                <span className="marquee-dot" />
              </React.Fragment>
            ))}
          </div>
        </div>
        <span className="topbar-floral">❀</span>
      </div>
    </div>
  );
}

export default TopBar;