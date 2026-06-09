import React from "react";
import "./FeaturesBar.css";

const features = [
  { img: "/icons/cod.png",      label: "Cash on Delivery"     },
  { img: "/icons/delivery.png", label: "Delivery in 3-4 Days" },
  { img: "/icons/quality.png",  label: "Assured Quality"       },
  { img: "/icons/happy.png",    label: "Happy Customers"       },
];

export default function FeaturesBar() {
  return (
    <div className="fb-root">
      {features.map((f, i) => (
        <div className="fb-item" key={i}>
          <div className="fb-icon-wrap">
            <img src={f.img} alt={f.label} className="fb-icon" />
          </div>
          <p className="fb-label">{f.label}</p>
        </div>
      ))}
    </div>
  );
}