import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const getImgUrl = (img) => {
  if (!img) return "/images/s1.png";
  if (img.startsWith("http"))     return img.replace("127.0.0.1:8000","localhost:8000");
  if (img.startsWith("uploads/")) return `${API}/${img}`;
  return `${API}/uploads/${img}`;
};

export default function ProductDetail({ cartItems, setCartItems, wishlist, setWishlist }) {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [product,      setProduct]      = useState(null);
  const [related,      setRelated]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeColor,  setActiveColor]  = useState(null);
  const [activeImage,  setActiveImage]  = useState("");
  const [activeIndex,  setActiveIndex]  = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty,          setQty]          = useState(1);
  const [inCart,       setInCart]       = useState(false);

  // ── Fetch product + related ────────────────────────
  useEffect(() => {
    setLoading(true);
    setRelated([]);
    setSelectedSize("");
    setQty(1);
    setInCart(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    axios.get(`${API}/api/products/${id}`)
      .then(r => {
        const p = r.data;
        setProduct(p);
        if (p.colorVariants?.length > 0) {
          const first = p.colorVariants[0];
          setActiveColor(first);
          setActiveImage(getImgUrl(first.image || p.images?.[0]));
        } else {
          setActiveImage(getImgUrl(p.images?.[0]));
        }
        setActiveIndex(0);

        // ── Fetch related products (same category) ──
        return axios.get(`${API}/api/products`).then(res => {
          const all = res.data || [];
          const rel = all.filter(item =>
            (item._id || item.id) !== id &&
            item.category && p.category &&
            item.category.toLowerCase() === p.category.toLowerCase() &&
            !item.soldOut && Number(item.stock) > 0
          ).slice(0, 8);

          if (rel.length < 4) {
            const others = all.filter(item =>
              (item._id || item.id) !== id &&
              !rel.find(r => (r._id||r.id) === (item._id||item.id)) &&
              !item.soldOut && Number(item.stock) > 0
            ).slice(0, 8 - rel.length);
            setRelated([...rel, ...others]);
          } else {
            setRelated(rel);
          }
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding:80, textAlign:"center", color:"#8b4513",
                  fontFamily:"Georgia,serif", fontSize:16 }}>
      Loading product...
    </div>
  );
  if (!product) return (
    <div style={{ padding:80, textAlign:"center", color:"#c62828", fontSize:16 }}>
      Product not found.
    </div>
  );

  // ── All images ─────────────────────────────────────
  const allImages = (() => {
    const imgs = [];
    (product.images || []).forEach(img => { if (img) imgs.push(getImgUrl(img)); });
    (product.colorVariants || []).forEach(v => {
      if (v.image) {
        const url = getImgUrl(v.image);
        if (!imgs.includes(url)) imgs.push(url);
      }
    });
    return imgs.length > 0 ? imgs : ["/images/s1.png"];
  })();

  const handleThumbClick = (img, i) => { setActiveImage(img); setActiveIndex(i); };

  const handleColorClick = (variant) => {
    if (variant.stock === 0) return;
    setActiveColor(variant);
    if (variant.image) {
      const url = getImgUrl(variant.image);
      setActiveImage(url);
      const idx = allImages.indexOf(url);
      if (idx !== -1) setActiveIndex(idx);
    }
  };

  // ── Wishlist toggle ────────────────────────────────
  const isWished = wishlist?.some(p => (p._id || p.id) === product._id);
  const toggleWish = () => {
    if (!setWishlist) return;
    if (isWished) {
      setWishlist(wishlist.filter(p => (p._id || p.id) !== product._id));
    } else {
      setWishlist([...(wishlist || []), product]);
    }
  };

  // ── Add to cart ────────────────────────────────────
  const handleAddToCart = async () => {
    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size"); return;
    }

    // Real-time stock check
    try {
      const res = await axios.post(`${API}/api/products/check-stock`, {
        productId: product._id,
        color:     activeColor?.name || "",
        quantity:  qty,
      });
      if (!res.data.canAdd) {
        alert(res.data.available === 0
          ? `Sorry, ${activeColor?.name || "this item"} is sold out!`
          : `Only ${res.data.available} left in stock!`
        );
        return;
      }
    } catch {
      // Stock check endpoint may not exist — proceed anyway
    }

    const itemId  = product._id || product.id;
    const cartKey = `${itemId}_${selectedSize}_${activeColor?.name || ""}`;
    const already = (cartItems || []).some(c =>
      `${c._id || c.id}_${c.selectedSize}_${c.color || ""}` === cartKey
    );

    const cartItem = {
      ...product,
      selectedSize,
      color:    activeColor?.name || product.color || "",
      image:    activeImage,
      quantity: qty,
      stock:    activeColor ? activeColor.stock : product.stock,
    };

    if (!already && setCartItems) {
      setCartItems([...(cartItems || []), cartItem]);
    }

    // ✅ Show CartToast notification
    if (window.showCartToast) {
      window.showCartToast(cartItem);
    }

    setInCart(true);
  };

  // ── Buy Now ────────────────────────────────────────
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/checkout");
  };

  const currentStock = activeColor ? activeColor.stock : product.stock;
  const isSoldOut    = currentStock === 0 || product.soldOut;
  const discount     = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <>
      <style>{`
        .rel-card { transition:transform .22s,box-shadow .22s; background:#fff; border-radius:4px; overflow:hidden; cursor:pointer; border:1px solid #ede0cc; }
        .rel-card:hover { transform:translateY(-5px); box-shadow:0 12px 32px rgba(139,69,19,.13); }
        .rel-card:hover .rel-img { transform:scale(1.05); }
        .rel-img { transition:transform .4s ease; width:100%; height:260px; object-fit:cover; display:block; }
        .rel-wish-btn { position:absolute; top:10px; right:10px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.92); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; box-shadow:0 2px 8px rgba(0,0,0,.12); transition:transform .2s; }
        .rel-wish-btn:hover { transform:scale(1.2); }
        .rel-add-btn { width:100%; padding:10px 0; background:#1a1008; color:#e8d5a3; border:none; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; transition:background .2s; }
        .rel-add-btn:hover { background:#8b4513; }
        .rel-add-btn.sold { background:#ccc; cursor:not-allowed; color:#fff; }
        .rel-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        @media(max-width:900px){ .rel-grid { grid-template-columns:repeat(2,1fr); } }
        .buy-btn:hover { background:#9b5a1a !important; }
        .cart-btn:hover { background:#5c3317 !important; }
      `}</style>

      <div style={{ fontFamily:"'Segoe UI',sans-serif", background:"#fdf8f2",
                    minHeight:"100vh", padding:"32px 0" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 40px" }}>

          {/* BREADCRUMB */}
          <div style={{ fontSize:12, color:"#9a7050", marginBottom:20,
                        display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ cursor:"pointer", color:"#8b4513" }}
              onClick={() => navigate("/home")}>Home</span>
            <span>›</span>
            <span>{product.category || "Products"}</span>
            <span>›</span>
            <span style={{ color:"#5c3317" }}>{product.name}</span>
          </div>

          <div style={{ display:"flex", gap:40, alignItems:"flex-start" }}>

            {/* LEFT — IMAGE GALLERY */}
            <div style={{ display:"flex", gap:12, flexShrink:0 }}>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {allImages.map((img, i) => (
                    <div key={i} onClick={() => handleThumbClick(img, i)}
                      style={{
                        width:72, height:88,
                        border: activeIndex === i ? "2px solid #8b4513" : "1px solid #e8d8c4",
                        borderRadius:4, overflow:"hidden", cursor:"pointer",
                        flexShrink:0, transition:"border-color 0.15s", background:"#fff",
                      }}>
                      <img src={img} alt=""
                        style={{ width:"100%", height:"100%", objectFit:"cover" }}
                        onError={e => { e.target.src = "/images/s1.png"; }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div style={{ position:"relative", flexShrink:0 }}>
                {isSoldOut && (
                  <div style={{ position:"absolute", top:12, left:12, zIndex:2,
                                background:"#c62828", color:"#fff", fontSize:12,
                                fontWeight:700, padding:"5px 12px", letterSpacing:"1px" }}>
                    SOLD OUT
                  </div>
                )}
                {discount && !isSoldOut && (
                  <div style={{ position:"absolute", top:12, right:12, zIndex:2,
                                background:"#8b4513", color:"#fff", fontSize:12,
                                fontWeight:700, padding:"5px 10px" }}>
                    {discount}% OFF
                  </div>
                )}
                <div onClick={toggleWish}
                  style={{
                    position:"absolute", bottom:12, right:12, zIndex:2,
                    width:36, height:36, borderRadius:"50%",
                    background:"#fff", border:"1px solid #e8d8c4",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", fontSize:18,
                    color: isWished ? "#c62828" : "#ccc",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
                  }}>
                  ♥
                </div>
                <img src={activeImage} alt={product.name}
                  onError={e => { e.target.src = "/images/s1.png"; }}
                  style={{ width:400, height:500, objectFit:"cover",
                           borderRadius:4, display:"block", background:"#f5ede0" }} />
              </div>
            </div>

            {/* RIGHT — PRODUCT DETAILS */}
            <div style={{ flex:1, paddingTop:4 }}>

              <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, color:"#2d1b1b",
                           margin:"0 0 8px", fontWeight:600, lineHeight:1.3 }}>
                {product.name}
              </h1>

              {(product.fabric || product.category) && (
                <p style={{ fontSize:13, color:"#9a7050", margin:"0 0 16px",
                            textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  {product.category}{product.fabric ? ` · ${product.fabric}` : ""}
                </p>
              )}

              {/* Price */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <span style={{ fontFamily:"Georgia,serif", fontSize:28,
                               fontWeight:700, color:"#1a1a1a" }}>
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                {product.originalPrice > product.price && (
                  <span style={{ fontSize:16, color:"#999", textDecoration:"line-through" }}>
                    ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
                {discount && (
                  <span style={{ fontSize:13, fontWeight:700, color:"#2e7d32",
                                 background:"#e8f5e9", padding:"2px 8px" }}>
                    {discount}% OFF
                  </span>
                )}
              </div>

              <p style={{ fontSize:13, color:"#2e7d32", fontWeight:600,
                          margin:"0 0 20px", display:"flex", alignItems:"center", gap:6 }}>
                🚚 Free shipping all over India
              </p>

              <div style={{ width:"100%", height:1, background:"#e8d8c4", margin:"0 0 20px" }} />

              {/* Colour Selector */}
              {product.colorVariants?.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700,
                                  letterSpacing:"0.8px", color:"#9a7050",
                                  marginBottom:10, textTransform:"uppercase" }}>
                    Colour
                    {activeColor && (
                      <span style={{ color:"#5c3317", marginLeft:8,
                                     textTransform:"none", fontWeight:600 }}>
                        — {activeColor.name}
                      </span>
                    )}
                  </label>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {product.colorVariants.map((v, i) => {
                      const isActive = activeColor?.name === v.name;
                      const isOOS    = v.stock === 0;
                      return (
                        <button key={i} onClick={() => handleColorClick(v)}
                          disabled={isOOS} title={isOOS ? `${v.name} — Sold Out` : v.name}
                          style={{
                            padding:"7px 16px", fontSize:13, fontWeight:500,
                            border: isActive ? "2px solid #8b4513" : "1.5px solid #e8d8c4",
                            background: isActive ? "#fdf6ee" : "#fff",
                            color: isActive ? "#8b4513" : "#5c3317",
                            cursor: isOOS ? "not-allowed" : "pointer",
                            opacity: isOOS ? 0.4 : 1,
                            textDecoration: isOOS ? "line-through" : "none",
                            borderRadius:4, transition:"all .15s",
                          }}>
                          {v.name}
                          {isOOS && <span style={{ fontSize:9, color:"#c62828", display:"block" }}>sold out</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700,
                                  letterSpacing:"0.8px", color:"#9a7050",
                                  marginBottom:10, textTransform:"uppercase" }}>
                    Size
                    {selectedSize && (
                      <span style={{ color:"#5c3317", marginLeft:8,
                                     textTransform:"none", fontWeight:600 }}>
                        — {selectedSize}
                      </span>
                    )}
                  </label>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {product.sizes.map((s, i) => (
                      <button key={i} onClick={() => setSelectedSize(s)}
                        style={{
                          padding:"7px 18px", fontSize:13, fontWeight:600,
                          border: selectedSize === s ? "2px solid #8b4513" : "1.5px solid #e8d8c4",
                          background: selectedSize === s ? "#fdf6ee" : "#fff",
                          color: selectedSize === s ? "#8b4513" : "#5c3317",
                          cursor:"pointer", borderRadius:4, transition:"all .15s",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Low stock warning */}
              {!isSoldOut && currentStock <= 5 && (
                <div style={{ fontSize:12, color:"#c62828", fontWeight:700,
                              marginBottom:16, background:"#ffebee",
                              padding:"8px 12px", border:"1px solid #ffcdd2" }}>
                  ⚠️ Only {currentStock} left in stock — order soon!
                </div>
              )}

              {/* QTY + ADD TO CART + BUY NOW */}
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                {/* Qty */}
                <div style={{ display:"flex", alignItems:"center", border:"1.5px solid #e8d8c4" }}>
                  <button onClick={() => setQty(q => Math.max(1, q-1))}
                    style={{ width:36, height:44, border:"none", background:"#fff",
                             fontSize:18, cursor:"pointer", color:"#8b4513", fontWeight:700 }}>−</button>
                  <div style={{ width:44, height:44, display:"flex", alignItems:"center",
                                justifyContent:"center", fontSize:15, fontWeight:700,
                                color:"#5c3317", borderLeft:"1px solid #e8d8c4",
                                borderRight:"1px solid #e8d8c4" }}>
                    {qty}
                  </div>
                  <button onClick={() => setQty(q => Math.min(currentStock||10, q+1))}
                    disabled={qty >= (currentStock||10)}
                    style={{ width:36, height:44, border:"none",
                             background: qty>=(currentStock||10) ? "#f5f5f5" : "#fff",
                             fontSize:18,
                             cursor: qty>=(currentStock||10) ? "not-allowed" : "pointer",
                             color:"#8b4513", fontWeight:700,
                             opacity: qty>=(currentStock||10) ? 0.4 : 1 }}>+</button>
                </div>

                {/* Add to Cart */}
                <button className="cart-btn" onClick={handleAddToCart} disabled={isSoldOut}
                  style={{
                    flex:1, height:44,
                    background: isSoldOut ? "#ccc" : inCart ? "#5c3317" : "#1a1008",
                    color:"#fff", border:"none", fontSize:13, fontWeight:700,
                    letterSpacing:"1px", cursor: isSoldOut ? "not-allowed" : "pointer",
                    transition:"background 0.2s",
                  }}>
                  {isSoldOut ? "SOLD OUT" : inCart ? "✓ ADDED" : "ADD TO CART"}
                </button>

                {/* Buy Now */}
                <button className="buy-btn" onClick={handleBuyNow} disabled={isSoldOut}
                  style={{
                    flex:1, height:44,
                    background: isSoldOut ? "#ccc" : "#8b4513",
                    color:"#fff", border:"none", fontSize:13, fontWeight:700,
                    letterSpacing:"1px", cursor: isSoldOut ? "not-allowed" : "pointer",
                    transition:"background 0.2s",
                  }}>
                  BUY NOW
                </button>
              </div>

              {/* Delivery info */}
              <div style={{ background:"#fff", border:"1px solid #e8d8c4",
                            padding:"14px 16px", marginBottom:20 }}>
                {[
                  { icon:"🚚", text:"Free shipping all over India" },
                  { icon:"📅", text:"Estimated delivery: 3–5 business days" },
                  { icon:"↩️", text:"Easy 7-day returns" },
                  { icon:"✅", text:"100% authentic handloom product" },
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"center",
                                        padding:"5px 0",
                                        borderBottom: i < 3 ? "1px solid #f5ede0" : "none" }}>
                    <span>{item.icon}</span>
                    <span style={{ fontSize:12, color:"#5c3317" }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ borderTop:"1px solid #e8d8c4", paddingTop:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#9a7050",
                                letterSpacing:"0.8px", textTransform:"uppercase",
                                marginBottom:8 }}>
                    Product Details
                  </div>
                  <p style={{ fontSize:14, color:"#5c3317", lineHeight:1.7, margin:0 }}>
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RELATED PRODUCTS
          ══════════════════════════════════════════ */}
          {related.length > 0 && (
            <div style={{ marginTop:64, paddingBottom:40 }}>

              {/* Section header */}
              <div style={{ textAlign:"center", marginBottom:32 }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
                  <div style={{ flex:1, height:1,
                                background:"linear-gradient(90deg,transparent,#d4b896,transparent)" }} />
                  <h2 style={{ fontFamily:"Georgia,serif", fontSize:26, color:"#1a1008",
                               fontWeight:600, margin:0, whiteSpace:"nowrap" }}>
                    Related Products
                  </h2>
                  <div style={{ flex:1, height:1,
                                background:"linear-gradient(90deg,transparent,#d4b896,transparent)" }} />
                </div>
                {product.category && (
                  <p style={{ fontSize:12, color:"#a07050", letterSpacing:"1.5px",
                              textTransform:"uppercase", margin:0, fontFamily:"sans-serif" }}>
                    More from {product.category}
                  </p>
                )}
              </div>

              {/* Grid */}
              <div className="rel-grid">
                {related.map((p) => {
                  const pid      = p._id || p.id;
                  const img      = getImgUrl(p.images?.[0] || p.image);
                  const pWished  = wishlist?.some(w => (w._id||w.id) === pid);
                  const pSoldOut = p.soldOut || Number(p.stock) === 0;
                  const pDisc    = p.originalPrice > p.price
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : null;

                  return (
                    <div key={pid} className="rel-card"
                      onClick={() => navigate(`/product/${pid}`)}>

                      {/* Image */}
                      <div style={{ position:"relative", overflow:"hidden" }}>
                        <img className="rel-img" src={img} alt={p.name}
                          onError={e => { e.target.src = "/images/s1.png"; }} />

                        {pSoldOut && (
                          <div style={{ position:"absolute", top:0, left:0, right:0,
                                        background:"rgba(198,40,40,.85)", color:"#fff",
                                        fontSize:10, fontWeight:700, textAlign:"center",
                                        padding:"5px 0", letterSpacing:"1.5px" }}>
                            SOLD OUT
                          </div>
                        )}
                        {pDisc && !pSoldOut && (
                          <div style={{ position:"absolute", top:10, left:10,
                                        background:"#8b4513", color:"#fff",
                                        fontSize:10, fontWeight:700, padding:"3px 8px" }}>
                            {pDisc}% OFF
                          </div>
                        )}

                        {/* Wishlist */}
                        <button className="rel-wish-btn"
                          onClick={e => {
                            e.stopPropagation();
                            if (!setWishlist) return;
                            if (pWished) {
                              setWishlist(wishlist.filter(w => (w._id||w.id) !== pid));
                            } else {
                              setWishlist([...(wishlist||[]), p]);
                            }
                          }}>
                          <span style={{ color: pWished ? "#c62828" : "#bbb" }}>
                            {pWished ? "♥" : "♡"}
                          </span>
                        </button>
                      </div>

                      {/* Info */}
                      <div style={{ padding:"14px 14px 0" }}>
                        <p style={{ fontFamily:"Georgia,serif", fontSize:14, color:"#1a1008",
                                    fontWeight:500, margin:"0 0 4px", lineHeight:1.35,
                                    overflow:"hidden", textOverflow:"ellipsis",
                                    display:"-webkit-box", WebkitLineClamp:2,
                                    WebkitBoxOrient:"vertical" }}>
                          {p.name}
                        </p>
                        {(p.fabric || p.category) && (
                          <p style={{ fontSize:10, color:"#b08060", margin:"0 0 8px",
                                      textTransform:"uppercase", letterSpacing:".5px" }}>
                            {[p.fabric, p.category].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <div style={{ display:"flex", alignItems:"baseline",
                                      gap:6, marginBottom:12 }}>
                          <span style={{ fontFamily:"Georgia,serif", fontSize:16,
                                         fontWeight:700, color:"#1a1008" }}>
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </span>
                          {p.originalPrice > p.price && (
                            <span style={{ fontSize:12, color:"#b08060",
                                           textDecoration:"line-through" }}>
                              ₹{Number(p.originalPrice).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View button */}
                      <button
                        className={`rel-add-btn${pSoldOut ? " sold" : ""}`}
                        disabled={pSoldOut}
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/product/${pid}`);
                        }}>
                        {pSoldOut ? "Sold Out" : "View Product →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}