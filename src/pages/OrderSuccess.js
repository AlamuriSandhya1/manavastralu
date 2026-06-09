import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { orderId, totalAmount, paymentType, items = [] } = state || {};

  return (
    <div style={{
      maxWidth: 520, margin: "60px auto", padding: "40px 32px",
      background: "#fdfaf5", border: "1px solid rgba(184,134,11,0.2)",
      textAlign: "center", fontFamily: "Georgia, serif"
    }}>

      {/* TICK */}
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "#e8f5e9", border: "2px solid #4caf50",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: 28, color: "#4caf50"
      }}>✓</div>

      <h2 style={{ color: "#1a1008", fontSize: 22, margin: "0 0 8px" }}>
        Order Placed Successfully!
      </h2>
      <p style={{ color: "#7a6a52", fontSize: 14, margin: "0 0 24px" }}>
        Thank you for shopping with Aishwarya Silks
      </p>

      {/* ORDER DETAILS */}
      <div style={{
        background: "#fff", border: "1px solid rgba(184,134,11,0.15)",
        borderRadius: 4, padding: "16px 20px", textAlign: "left",
        marginBottom: 24
      }}>
        <div style={{ display:"flex", justifyContent:"space-between",
                      fontSize:13, color:"#7a6a52", marginBottom:8 }}>
          <span>Order ID</span>
          <span style={{ color:"#1a1008", fontWeight:600, fontSize:11 }}>
            #{String(orderId).slice(-8).toUpperCase()}
          </span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between",
                      fontSize:13, color:"#7a6a52", marginBottom:8 }}>
          <span>Payment</span>
          <span style={{ color:"#1a1008" }}>{paymentType}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between",
                      fontSize:13, color:"#7a6a52", borderTop:"1px solid #f0e8d8",
                      paddingTop:8, marginTop:8 }}>
          <span>Total Paid</span>
          <span style={{ color:"#B8860B", fontWeight:700, fontSize:15 }}>
            ₹{Number(totalAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ITEMS */}
      {items.length > 0 && (
        <div style={{ textAlign:"left", marginBottom:24 }}>
          <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase",
                      color:"#B8860B", marginBottom:10 }}>Items Ordered</p>
          {items.map((item, i) => (
            <div key={i} style={{
              display:"flex", gap:12, alignItems:"center",
              marginBottom:10, paddingBottom:10,
              borderBottom:"1px solid #f5ede0"
            }}>
              <img
                src={
                  item.images?.[0]?.startsWith("uploads")
                    ? `http://127.0.0.1:8000/${item.images[0]}`
                    : item.images?.[0] || "/images/s1.png"
                }
                alt={item.name}
                style={{ width:48, height:56, objectFit:"cover",
                         borderRadius:2, flexShrink:0 }}
                onError={e => { e.target.src = "/images/s1.png"; }}
              />
              <div>
                <p style={{ fontSize:13, color:"#1a1008", margin:"0 0 2px" }}>{item.name}</p>
                <p style={{ fontSize:11, color:"#9a7050", margin:0 }}>
                  ₹{item.price?.toLocaleString()}
                  {item.selectedSize ? ` · Size: ${item.selectedSize}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize:12, color:"#9a7050", marginBottom:24 }}>
        Estimated delivery: <strong>3–5 business days</strong>
      </p>

      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <button
          onClick={() => navigate("/my-orders")}
          style={{
            padding:"10px 24px", background:"#1a1008", color:"#e8d5a3",
            border:"none", fontSize:12, letterSpacing:"0.1em",
            textTransform:"uppercase", cursor:"pointer"
          }}
        >
          View Orders
        </button>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding:"10px 24px", background:"transparent",
            border:"1px solid rgba(184,134,11,0.3)", color:"#7a6a52",
            fontSize:12, letterSpacing:"0.1em",
            textTransform:"uppercase", cursor:"pointer"
          }}
        >
          Continue Shopping
        </button>
      </div>

    </div>
  );
}