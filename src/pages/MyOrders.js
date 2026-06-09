import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

const STATUS_COLOR = {
  Confirmed: { bg: "#e8f5e9", color: "#2e7d32", dot: "#4caf50" },
  Shipped:   { bg: "#e3f2fd", color: "#1565c0", dot: "#2196f3" },
  Delivered: { bg: "#f3e5f5", color: "#6a1b9a", dot: "#9c27b0" },
  Cancelled: { bg: "#ffebee", color: "#c62828", dot: "#f44336" },
};

const getImageUrl = (product) => {
  const img = product.image || product.images?.[0];
  if (!img) return "/images/s1.png";
  if (img.startsWith("http")) return img;
  if (img.startsWith("uploads")) return `${API}/${img}`;
  return `${API}/uploads/${img}`;
};

export default function MyOrders({ user }) {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    let email = "";

    if (user?.email) {
      email = user.email;
    }
    if (!email) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData?.email) email = userData.email;
      } catch {}
    }
    if (!email) {
      email = localStorage.getItem("userEmail") || "";
    }
    if (!email) {
      try {
        const u = JSON.parse(localStorage.getItem("user"));
        if (u?.email) email = u.email;
      } catch {}
    }

    if (!email) {
      setLoading(false);
      return;
    }

    axios.get(`${API}/my-orders/${encodeURIComponent(email)}`)
      .then(res => setOrders(res.data))
      .catch(err => console.log("Orders fetch error:", err))
      .finally(() => setLoading(false));

    try {
      const saved = JSON.parse(localStorage.getItem("ratings")) || {};
      setRatings(saved);
    } catch {}
  }, [user]);

  const handleRating = (orderId, productKey, star) => {
    const key = `${orderId}-${productKey}`;
    const saved = JSON.parse(localStorage.getItem("ratings") || "{}");
    if (saved[key]) return;
    saved[key] = star;
    localStorage.setItem("ratings", JSON.stringify(saved));
    setRatings({ ...saved });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric"
      });
    } catch { return dateStr; }
  };

  const hasEmail = user?.email
    || (() => {
      try {
        return JSON.parse(localStorage.getItem("userData"))?.email
          || localStorage.getItem("userEmail");
      } catch { return null; }
    })();

  if (!loading && !hasEmail) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center",
                    fontFamily: "Georgia, serif", padding: "0 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
        <h2 style={{ color: "#1a1008", fontSize: 20, margin: "0 0 8px" }}>
          Please log in to view your orders
        </h2>
        <p style={{ color: "#7a6a52", fontSize: 14, marginBottom: 24 }}>
          Your order history will appear here after you sign in.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 28px", background: "#7c2d12", color: "#fff",
            border: "none", fontSize: 13, cursor: "pointer", letterSpacing: "0.08em"
          }}
        >
          Login / Register
        </button>
      </div>
    );
  }

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px 0",
                  fontFamily: "Georgia, serif", color: "#8b4513", fontSize: 16 }}>
      Loading your orders…
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center",
                  fontFamily: "Georgia, serif", padding: "0 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
      <h2 style={{ color: "#1a1008", fontSize: 20, margin: "0 0 8px" }}>
        No orders yet
      </h2>
      <p style={{ color: "#7a6a52", fontSize: 14, marginBottom: 24 }}>
        When you place an order, it will appear here.
      </p>
      <button
        onClick={() => navigate("/home")}
        style={{
          padding: "10px 28px", background: "#7c2d12", color: "#fff",
          border: "none", fontSize: 13, cursor: "pointer", letterSpacing: "0.08em"
        }}
      >
        Browse Products
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px",
                  fontFamily: "'Segoe UI', sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24,
                     color: "#1a1008", margin: "0 0 4px" }}>
          My Orders
        </h2>
        <p style={{ color: "#9a7050", fontSize: 13, margin: 0 }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {/* ORDER CARDS */}
      {orders.map((order, index) => {
        const statusStyle = STATUS_COLOR[order.status] || STATUS_COLOR["Confirmed"];
        const orderId     = order._id || order.id || "";
        const shortId     = String(orderId).slice(-8).toUpperCase();

        return (
          <div key={orderId || index} style={{
            background: "#fdfaf5",
            border: "1px solid rgba(184,134,11,0.18)",
            borderRadius: 6, marginBottom: 20, overflow: "hidden"
          }}>

            {/* ORDER HEADER */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px",
              background: "#fff", borderBottom: "1px solid #f0e8d8",
              flexWrap: "wrap", gap: 8
            }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#9a7050", textTransform: "uppercase",
                                letterSpacing: "0.8px", marginBottom: 2 }}>Order ID</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1008" }}>
                    #{shortId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9a7050", textTransform: "uppercase",
                                letterSpacing: "0.8px", marginBottom: 2 }}>Date</div>
                  <div style={{ fontSize: 13, color: "#1a1008" }}>
                    {formatDate(order.createdAt || order.created_at)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9a7050", textTransform: "uppercase",
                                letterSpacing: "0.8px", marginBottom: 2 }}>Total</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#B8860B" }}>
                    ₹{Number(order.total_amount || order.totalAmount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9a7050", textTransform: "uppercase",
                                letterSpacing: "0.8px", marginBottom: 2 }}>Payment</div>
                  <div style={{ fontSize: 13, color: "#1a1008" }}>
                    {order.payment_method || order.paymentMethod || "COD"}
                  </div>
                </div>
              </div>

              {/* STATUS BADGE */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: statusStyle.bg, color: statusStyle.color,
                padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%",
                               background: statusStyle.dot, display: "inline-block" }} />
                {order.status || "Confirmed"}
              </div>
            </div>

            {/* ── TRACKING INFO ── */}
            {order.trackingNumber && (
              <div style={{
                margin: "0 20px 0", padding: "12px 16px",
                background: "#f0fdf4", border: "1px solid #86efac",
                borderTop: "none",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap", gap: 8,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 2 }}>
                    🚚 Your order is on the way!
                  </div>
                  <div style={{ fontSize: 12, color: "#15803d" }}>
                    {order.courierName || "DTDC"} · Tracking:{" "}
                    <strong>{order.trackingNumber}</strong>
                  </div>
                  {order.estimatedDelivery && (
                    <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2 }}>
                      Expected delivery:{" "}
                      {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                  )}
                </div>
                {/* ✅ Fixed: proper <a> tag with opening tag */}
                <a
                  href={order.trackingUrl ||
                    `https://www.dtdc.in/trace.asp?txtnbr=${order.trackingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "#16a34a", color: "#fff",
                    padding: "8px 16px", borderRadius: 6,
                    textDecoration: "none", fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}>
                  Track on DTDC →
                </a>
              </div>
            )}

            {/* ── Not shipped yet notice ── */}
            {!order.trackingNumber && order.status === "Confirmed" && (
              <div style={{
                margin: "0 20px", padding: "10px 14px",
                background: "#fefce8", border: "1px solid #fde047",
                borderTop: "none",
                fontSize: 12, color: "#854d0e",
              }}>
                📦 Your order is confirmed and will be shipped soon.
              </div>
            )}

            {/* PRODUCTS */}
            <div style={{ padding: "16px 20px" }}>
              {order.products?.map((p, i) => {
                const ratingKey = `${orderId}-${p.name || i}`;
                const rated     = ratings[ratingKey] || 0;

                return (
                  <div key={p._id || i} style={{
                    display: "flex", gap: 14, alignItems: "flex-start",
                    paddingBottom: 14, marginBottom: 14,
                    borderBottom: i < order.products.length - 1
                      ? "1px solid #f0e8d8" : "none"
                  }}>
                    {/* IMAGE */}
                    <Link to={`/product/${p.productId || p._id || ""}`}>
                      <img
                        src={getImageUrl(p)}
                        alt={p.name}
                        onError={e => { e.target.src = "/images/s1.png"; }}
                        style={{
                          width: 72, height: 84, objectFit: "cover",
                          borderRadius: 4, flexShrink: 0,
                          border: "1px solid #e8d8c4"
                        }}
                      />
                    </Link>

                    {/* PRODUCT INFO */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600,
                                    color: "#1a1008", marginBottom: 3 }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#9a7050", marginBottom: 2 }}>
                        {p.selectedSize && `Size: ${p.selectedSize}`}
                        {p.color && ` · ${p.color}`}
                      </div>
                      <div style={{ fontSize: 12, color: "#7a6a52", marginBottom: 2 }}>
                        Qty: {p.quantity || 1}
                        {p.price && (
                          <span style={{ marginLeft: 10, fontWeight: 600, color: "#B8860B" }}>
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Delivery tag */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                    background: "#e8f5e9", color: "#2e7d32",
                                    fontSize: 11, fontWeight: 600,
                                    padding: "3px 8px", borderRadius: 4, marginTop: 4 }}>
                        ✅ {order.status === "Delivered" ? "Delivered" : "Expected in 3–5 days"}
                      </div>
                    </div>

                    {/* STAR RATING */}
                    <div style={{ flexShrink: 0, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#9a7050",
                                    textTransform: "uppercase", letterSpacing: "0.5px",
                                    marginBottom: 5 }}>
                        Rate
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            onClick={() => handleRating(orderId, p.name || i, star)}
                            style={{
                              fontSize: 18,
                              cursor: rated ? "default" : "pointer",
                              color: star <= rated ? "#f59e0b" : "#d1d5db",
                              transition: "color 0.15s",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {rated > 0 && (
                        <div style={{ fontSize: 10, color: "#9a7050", marginTop: 3 }}>
                          Rated {rated}/5
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* ADDRESS */}
            {order.address && (
              <div style={{
                padding: "10px 20px", background: "#fdf6ee",
                borderTop: "1px solid #f0e8d8",
                fontSize: 12, color: "#7a6a52"
              }}>
                📍 <strong style={{ color: "#1a1008" }}>Deliver to:</strong>{" "}
                {order.address.fullName && `${order.address.fullName}, `}
                {order.address.houseNo && `${order.address.houseNo}, `}
                {order.address.village && `${order.address.village}, `}
                {order.address.district && `${order.address.district}, `}
                {order.address.state && `${order.address.state} `}
                {order.address.pincode && `— ${order.address.pincode}`}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}