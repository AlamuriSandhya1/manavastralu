import React, { useState, useEffect, useRef } from "react";
 
export function CartToast() {
  const [toasts, setToasts] = useState([]);
 
  useEffect(() => {
    // Global function any component can call
    window.showCartToast = (item) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, item }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    return () => { delete window.showCartToast; };
  }, []);
 
  const getImg = (item) => {
    const img = item?.images?.[0] || item?.image || "";
    if (!img) return "/images/s1.png";
    if (img.startsWith("http"))     return img;
    if (img.startsWith("uploads/")) return `http://localhost:8000/${img}`;
    return `http://localhost:8000/uploads/${img}`;
  };
 
  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(120%); opacity: 0; }
        }
        .cart-toast {
          animation: slideInRight 0.35s cubic-bezier(.21,1.02,.73,1) forwards;
        }
        .cart-toast.removing {
          animation: slideOutRight 0.3s ease forwards;
        }
        @keyframes cartBounce {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.35); }
          50%  { transform: scale(0.92); }
          70%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .cart-bounce { animation: cartBounce 0.5s ease; }
      `}</style>
 
      {/* Toast stack — bottom right */}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        zIndex: 99999, display: "flex",
        flexDirection: "column", gap: 10,
        pointerEvents: "none",
      }}>
        {toasts.map(({ id, item }) => (
          <div key={id} className="cart-toast" style={{
            background: "#fff",
            border: "1px solid #e8d8c4",
            borderLeft: "4px solid #8b4513",
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 8px 32px rgba(139,69,19,0.18)",
            minWidth: 280, maxWidth: 340,
            pointerEvents: "auto",
          }}>
            {/* Green check */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#2e7d32,#43a047)",
              display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
              fontSize: 16, color: "#fff",
            }}>✓</div>
 
            {/* Product image */}
            <img
              src={getImg(item)}
              alt={item?.name}
              onError={e => { e.target.src = "/images/s1.png"; }}
              style={{
                width: 44, height: 44, borderRadius: 8,
                objectFit: "cover", border: "1px solid #e8d8c4",
                flexShrink: 0,
              }}
            />
 
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: "#2e7d32",
                marginBottom: 2,
              }}>Added to Cart!</div>
              <div style={{
                fontSize: 12, color: "#5c3317", fontWeight: 600,
                whiteSpace: "nowrap", overflow: "hidden",
                textOverflow: "ellipsis",
              }}>{item?.name}</div>
              {item?.selectedSize && (
                <div style={{ fontSize: 11, color: "#9a7050", marginTop: 1 }}>
                  Size: {item.selectedSize}
                </div>
              )}
            </div>
 
            {/* Price */}
            <div style={{
              fontSize: 14, fontWeight: 700, color: "#8b4513",
              fontFamily: "Georgia, serif", flexShrink: 0,
            }}>
              ₹{Number(item?.price || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
 