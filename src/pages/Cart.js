import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Cart({ cartItems, setCartItems }) {
  const navigate = useNavigate();

  const removeItem = (itemId, selectedSize) => {
    setCartItems(cartItems.filter(item =>
      !((item._id || item.id) === itemId && item.selectedSize === selectedSize)
    ));
  };

  // ✅ Stock limit check added
const updateQty = (itemId, selectedSize, delta) => {
  setCartItems(cartItems.map(item => {
    if ((item._id || item.id) === itemId && item.selectedSize === selectedSize) {
      const newQty   = (item.quantity || 1) + delta;
      const maxStock = Number(item.stock) || 10; // ✅ force Number conversion

      console.log("Stock check:", item.name, "stock:", item.stock, "newQty:", newQty, "max:", maxStock);

      if (newQty < 1)        return null;
      if (newQty > maxStock) return item;  // block here
      return { ...item, quantity: newQty };
    }
    return item;
  }).filter(Boolean));
};

  const getImageSrc = (item) => {
    if (item.images?.length > 0) {
      const img = item.images[0];
      if (img.startsWith("http"))     return img;
      if (img.startsWith("uploads/")) return `http://localhost:8000/${img}`;
      return `http://localhost:8000/uploads/${img}`;
    }
    return "/images/s1.png";
  };

  const subtotal = cartItems.reduce((sum, item) =>
    sum + (Number(item.price) * (item.quantity || 1)), 0);
  const savings  = cartItems.reduce((sum, item) =>
    sum + ((Number(item.originalPrice || item.price) - Number(item.price))
           * (item.quantity || 1)), 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total    = subtotal + shipping;

  // ── EMPTY CART ───────────────────────────────────────
  if (cartItems.length === 0) return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:"60vh",
      fontFamily:"'Segoe UI',sans-serif",
      background:"#fdf8f2", padding:40, textAlign:"center"
    }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🛒</div>
      <h2 style={{ fontFamily:"Georgia,serif", color:"#5c3317",
                   fontSize:24, marginBottom:8 }}>
        Your cart is empty
      </h2>
      <p style={{ color:"#9a7050", fontSize:14, marginBottom:28 }}>
        Looks like you haven't added any sarees yet.
      </p>
      <button onClick={() => navigate("/home")}
        style={{ background:"#8b4513", color:"#fff", border:"none",
                 padding:"12px 32px", fontSize:13, fontWeight:700,
                 letterSpacing:"1px", cursor:"pointer" }}>
        CONTINUE SHOPPING
      </button>
    </div>
  );

  // ── CART PAGE ────────────────────────────────────────
  return (
    <div style={{
      background:"#fdf8f2", minHeight:"100vh",
      fontFamily:"'Segoe UI',sans-serif", padding:"32px 40px"
    }}>

      {/* HEADER */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:24,
                     color:"#5c3317", margin:0 }}>
          Shopping Cart
        </h1>
        <p style={{ color:"#9a7050", fontSize:13, marginTop:4 }}>
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px",
                    gap:24, alignItems:"start" }}>

        {/* LEFT — CART ITEMS */}
        <div>
          {/* Column headers */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"80px 1fr 140px 120px 40px",
            gap:16, padding:"10px 16px", marginBottom:8,
            fontSize:11, fontWeight:700, color:"#9a7050",
            letterSpacing:"0.8px", textTransform:"uppercase",
            borderBottom:"2px solid #e8d8c4"
          }}>
            <span>Image</span>
            <span>Product</span>
            <span style={{ textAlign:"center" }}>Quantity</span>
            <span style={{ textAlign:"right" }}>Price</span>
            <span></span>
          </div>

          {/* Items */}
          {cartItems.map((item, index) => {
            const itemId   = item._id || item.id;
            const qty      = item.quantity || 1;
            const maxStock = item.stock || 10;
            const atMax    = qty >= maxStock;
            const itemTotal = Number(item.price) * qty;

            return (
              <div key={`${itemId}_${item.selectedSize}_${index}`}
                style={{
                  display:"grid",
                  gridTemplateColumns:"80px 1fr 140px 120px 40px",
                  gap:16, padding:"16px",
                  background:"#fff", marginBottom:8,
                  border:"1px solid #e8d8c4",
                  alignItems:"center",
                }}>

                {/* IMAGE */}
                <Link to={`/product/${itemId}`}>
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                    onError={e => { e.target.src = "/images/s1.png"; }}
                    style={{ width:80, height:80, objectFit:"cover",
                             display:"block", cursor:"pointer" }}
                  />
                </Link>

                {/* DETAILS */}
                <div>
                  <Link to={`/product/${itemId}`} style={{ textDecoration:"none" }}>
                    <div style={{ fontWeight:600, color:"#5c3317",
                                  fontSize:14, marginBottom:4 }}>
                      {item.name}
                    </div>
                  </Link>
                  {item.fabric && (
                    <div style={{ fontSize:11, color:"#9a7050",
                                  textTransform:"uppercase", letterSpacing:"0.5px",
                                  marginBottom:4 }}>
                      {item.fabric}{item.color ? ` · ${item.color}` : ""}
                    </div>
                  )}
                  {item.selectedSize && (
                    <div style={{ display:"inline-block", fontSize:11,
                                  border:"1px solid #e8d8c4", padding:"2px 8px",
                                  color:"#8b4513", fontWeight:600, marginBottom:4 }}>
                      Size: {item.selectedSize}
                    </div>
                  )}
                  {item.originalPrice > item.price && (
                    <div style={{ fontSize:11, color:"#2e7d32",
                                  fontWeight:600 }}>
                      You save ₹{((item.originalPrice - item.price) * qty).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* QUANTITY CONTROLS */}
                <div style={{ display:"flex", flexDirection:"column",
                              alignItems:"center", gap:4 }}>
                  <div style={{ display:"flex", alignItems:"center" }}>

                    {/* MINUS */}
                    <button
                      onClick={() => updateQty(itemId, item.selectedSize, -1)}
                      style={{
                        width:28, height:28, border:"1px solid #e8d8c4",
                        background:"#fff", cursor:"pointer", fontSize:16,
                        color:"#8b4513", fontWeight:700,
                        display:"flex", alignItems:"center", justifyContent:"center"
                      }}>
                      −
                    </button>

                    {/* COUNT */}
                    <div style={{
                      width:36, height:28,
                      border:"1px solid #e8d8c4",
                      borderLeft:"none", borderRight:"none",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:700, color:"#5c3317"
                    }}>
                      {qty}
                    </div>

                    {/* PLUS — disabled at max stock */}
                    <button
                      onClick={() => updateQty(itemId, item.selectedSize, 1)}
                      disabled={atMax}
                      style={{
                        width:28, height:28, border:"1px solid #e8d8c4",
                        background: atMax ? "#f5f5f5" : "#fff",
                        cursor:     atMax ? "not-allowed" : "pointer",
                        fontSize:16, color:"#8b4513", fontWeight:700,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        opacity: atMax ? 0.4 : 1,
                      }}>
                      +
                    </button>
                  </div>

                  {/* MAX STOCK WARNING */}
                  {atMax && (
                    <div style={{ fontSize:10, color:"#c62828",
                                  fontWeight:600, textAlign:"center" }}>
                      Max {maxStock} available
                    </div>
                  )}

                  {/* LOW STOCK WARNING */}
                  {!atMax && maxStock <= 5 && (
                    <div style={{ fontSize:10, color:"#f57f17",
                                  fontWeight:600, textAlign:"center" }}>
                      Only {maxStock} left!
                    </div>
                  )}
                </div>

                {/* PRICE */}
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, color:"#8b4513",
                                fontSize:15, fontFamily:"Georgia,serif" }}>
                    ₹{itemTotal.toLocaleString()}
                  </div>
                  {item.originalPrice > item.price && (
                    <div style={{ fontSize:11, color:"#9a7050",
                                  textDecoration:"line-through" }}>
                      ₹{(Number(item.originalPrice) * qty).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* REMOVE */}
                <button
                  onClick={() => removeItem(itemId, item.selectedSize)}
                  title="Remove item"
                  style={{
                    width:28, height:28, border:"1px solid #ffcdd2",
                    background:"#fff5f5", cursor:"pointer", color:"#c62828",
                    fontSize:14, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0
                  }}>
                  ✕
                </button>

              </div>
            );
          })}

          {/* CONTINUE SHOPPING */}
          <button onClick={() => navigate("/home")}
            style={{
              marginTop:12, background:"transparent", color:"#8b4513",
              border:"1px solid #c8a97a", padding:"10px 20px",
              fontSize:12, fontWeight:600, cursor:"pointer",
              letterSpacing:"0.8px"
            }}>
            ← Continue Shopping
          </button>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div style={{
          background:"#fff", border:"1px solid #e8d8c4",
          padding:"24px", position:"sticky", top:20
        }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:16,
                       color:"#5c3317", margin:"0 0 20px",
                       paddingBottom:12, borderBottom:"1px solid #e8d8c4" }}>
            Order Summary
          </h3>

          <div style={{ display:"flex", flexDirection:"column",
                        gap:10, marginBottom:16 }}>

            <div style={{ display:"flex", justifyContent:"space-between",
                          fontSize:13, color:"#5c3317" }}>
              <span>Subtotal ({cartItems.length} items)</span>
              <span style={{ fontWeight:600 }}>₹{subtotal.toLocaleString()}</span>
            </div>

            {savings > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between",
                            fontSize:13, color:"#2e7d32" }}>
                <span>Total Savings</span>
                <span style={{ fontWeight:600 }}>−₹{savings.toLocaleString()}</span>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between",
                          fontSize:13, color:"#5c3317" }}>
              <span>Shipping</span>
              <span style={{ fontWeight:600,
                             color: shipping === 0 ? "#2e7d32" : "#5c3317" }}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>

            {shipping > 0 && (
              <div style={{ fontSize:11, color:"#9a7050",
                            background:"#fdf6ee", padding:"8px 10px",
                            border:"1px dashed #c8a97a" }}>
                Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping
              </div>
            )}
          </div>

          {/* TOTAL */}
          <div style={{
            display:"flex", justifyContent:"space-between",
            padding:"14px 0", borderTop:"2px solid #e8d8c4", marginBottom:20
          }}>
            <span style={{ fontFamily:"Georgia,serif", fontSize:16,
                           color:"#5c3317", fontWeight:600 }}>
              Total
            </span>
            <span style={{ fontFamily:"Georgia,serif", fontSize:20,
                           color:"#8b4513", fontWeight:700 }}>
              ₹{total.toLocaleString()}
            </span>
          </div>

          {/* CHECKOUT BUTTON */}
          <Link to="/checkout" style={{ textDecoration:"none" }}>
            <button style={{
              width:"100%", padding:"14px", background:"#8b4513",
              color:"#fff", border:"none", fontSize:13, fontWeight:700,
              letterSpacing:"1px", cursor:"pointer", marginBottom:10
            }}>
              PROCEED TO CHECKOUT →
            </button>
          </Link>

          {/* TRUST BADGES */}
          <div style={{ display:"flex", justifyContent:"center",
                        gap:16, marginTop:16 }}>
            {["🔒 Secure", "↩️ Easy Returns", "✅ Authentic"].map(b => (
              <div key={b} style={{ fontSize:10, color:"#9a7050",
                                    textAlign:"center", fontWeight:600 }}>
                {b}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}