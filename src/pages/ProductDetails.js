import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function ProductDetails({
  wishlist = [],
  setWishlist,
  cartItems = [],
  setCartItems,
}) {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [product,      setProduct]      = useState(null);
  const [related,      setRelated]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeColor,  setActiveColor]  = useState(null);
  const [activeImage,  setActiveImage]  = useState("");
  const [activeThumb,  setActiveThumb]  = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty,          setQty]          = useState(1);
  const [cartMsg,      setCartMsg]      = useState("");
  const [imgZoom,      setImgZoom]      = useState(false);
  const [wishMsg,      setWishMsg]      = useState({});   // { productId: true }

  // ── Image URL helper ──────────────────────────────
  const getImgUrl = (img) => {
    if (!img) return "/images/s1.png";
    if (img.startsWith("http"))    return img.replace("127.0.0.1:8000", "localhost:8000");
    if (img.startsWith("uploads")) return `${API}/${img}`;
    return `/${img}`;
  };

  // ── Fetch product + related ───────────────────────
  useEffect(() => {
    setLoading(true);
    setRelated([]);
    setSelectedSize("");
    setQty(1);
    setCartMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });

    axios.get(`${API}/api/products/${id}`)
      .then(r => {
        const p = r.data;
        setProduct(p);
        if (p.colorVariants?.length > 0) {
          setActiveColor(p.colorVariants[0]);
          setActiveImage(getImgUrl(p.colorVariants[0].image || p.images?.[0]));
        } else {
          setActiveImage(getImgUrl(p.images?.[0]));
        }
        // Fetch all products → filter same category, exclude current
        return axios.get(`${API}/api/products`).then(res => {
          const all = res.data || [];
          const rel = all
            .filter(item =>
              (item._id || item.id) !== id &&
              item.category &&
              p.category &&
              item.category.toLowerCase() === p.category.toLowerCase() &&
              !item.soldOut &&
              Number(item.stock) > 0
            )
            .slice(0, 8);

          // If fewer than 4 same-category, pad with other in-stock products
          if (rel.length < 4) {
            const others = all
              .filter(item =>
                (item._id || item.id) !== id &&
                !rel.find(r => (r._id || r.id) === (item._id || item.id)) &&
                !item.soldOut &&
                Number(item.stock) > 0
              )
              .slice(0, 8 - rel.length);
            setRelated([...rel, ...others]);
          } else {
            setRelated(rel);
          }
        });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Wishlist toggle ───────────────────────────────
  const isWished = (pid) => wishlist.some(w => (w._id || w.id) === pid);

  const toggleWish = (p) => {
    const pid = p._id || p.id;
    if (isWished(pid)) {
      setWishlist(wishlist.filter(w => (w._id || w.id) !== pid));
    } else {
      setWishlist([...wishlist, { ...p, _id: pid }]);
    }
    setWishMsg(prev => ({ ...prev, [pid]: true }));
    setTimeout(() => setWishMsg(prev => ({ ...prev, [pid]: false })), 1500);
  };

  // ── Color click ───────────────────────────────────
  const handleColorClick = (variant) => {
    if (variant.stock === 0) return;
    setActiveColor(variant);
    setActiveImage(getImgUrl(variant.image || product.images?.[0]));
  };

  // ── Add to cart (main product) ────────────────────
  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size"); return;
    }
    const itemId  = product._id || product.id;
    const cartKey = itemId + "_" + selectedSize + "_" + (activeColor?.name || "");
    const already = cartItems.some(c =>
      ((c._id || c.id) + "_" + c.selectedSize + "_" + (c.color || "")) === cartKey
    );
    if (!already) {
      setCartItems([...cartItems, {
        ...product, selectedSize,
        color: activeColor?.name || product.color,
        image: activeImage, quantity: qty,
      }]);
    }
    setCartMsg("✓ Added to cart!");
    setTimeout(() => setCartMsg(""), 2500);
  };

  // ── Quick add related product to cart ────────────
  const handleRelatedCart = (p) => {
    const pid  = p._id || p.id;
    const already = cartItems.some(c => (c._id || c.id) === pid);
    if (!already) {
      setCartItems([...cartItems, {
        ...p,
        image: getImgUrl(p.images?.[0] || p.image),
        quantity: 1,
      }]);
    }
    navigate(`/product/${pid}`);
  };

  // ── Buy now ───────────────────────────────────────
  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  if (loading) return (
    <div style={{ padding:60, textAlign:"center",
                  fontFamily:"Georgia,serif", color:"#8b4513" }}>
      Loading product…
    </div>
  );
  if (!product) return (
    <div style={{ padding:60, textAlign:"center",
                  fontFamily:"Georgia,serif", color:"#c62828" }}>
      Product not found.
    </div>
  );

  const currentStock = activeColor ? activeColor.stock : product.stock;
  const isSoldOut    = currentStock === 0 || product.soldOut;
  const inCart       = cartItems.some(c => (c._id || c.id) === (product._id || product.id));

  const allImages = product.colorVariants?.length > 0
    ? product.colorVariants.map(v => v.image).filter(Boolean)
    : product.images || [];

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Lato:wght@300;400;600&display=swap');

        .rel-card { transition: transform .22s, box-shadow .22s; background:#fff; border-radius:4px; overflow:hidden; cursor:pointer; border:1px solid #ede0cc; }
        .rel-card:hover { transform:translateY(-5px); box-shadow:0 12px 32px rgba(139,69,19,.13); }
        .rel-card:hover .rel-img { transform:scale(1.05); }
        .rel-img { transition:transform .4s ease; width:100%; height:260px; object-fit:cover; display:block; }
        .rel-wish { position:absolute; top:10px; right:10px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.9); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; transition:transform .2s; box-shadow:0 2px 6px rgba(0,0,0,.12); }
        .rel-wish:hover { transform:scale(1.2); }
        .rel-section-title { font-family:'Playfair Display',serif; font-size:26px; color:#1a1008; font-weight:600; text-align:center; margin:0 0 6px; }
        .rel-section-sub { font-family:'Lato',sans-serif; font-size:13px; color:#a07050; text-align:center; letter-spacing:.5px; text-transform:uppercase; margin:0 0 32px; }
        .rel-divider { display:flex; align-items:center; gap:14px; margin-bottom:10px; }
        .rel-divider::before, .rel-divider::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,transparent,#d4b896,transparent); }
        .rel-add-btn { width:100%; padding:9px 0; background:#1a1008; color:#e8d5a3; border:none; font-family:'Lato',sans-serif; font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; transition:background .2s; }
        .rel-add-btn:hover { background:#8b4513; }
        .rel-add-btn.sold { background:#ccc; cursor:not-allowed; color:#fff; }
        .rel-scroll-container { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        @media(max-width:900px) { .rel-scroll-container { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:520px) { .rel-scroll-container { grid-template-columns:repeat(2,1fr); gap:12px; } .rel-img { height:180px; } }
      `}</style>

      <div style={{
        maxWidth:1100, margin:"0 auto",
        padding:"32px 24px 0", fontFamily:"Georgia,serif"
      }}>

        {/* BREADCRUMB */}
        <p style={{ fontSize:12, color:"#9a7050", marginBottom:20, letterSpacing:"0.04em" }}>
          <span style={{ cursor:"pointer" }} onClick={() => navigate("/home")}>Home</span>
          {" › "}
          <span style={{ cursor:"pointer" }} onClick={() => navigate("/home")}>Sarees</span>
          {" › "}
          <span style={{ color:"#1a1008" }}>{product.name}</span>
        </p>

        <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>

          {/* ── LEFT: Images ── */}
          <div style={{ display:"flex", gap:12, flexShrink:0 }}>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {allImages.map((img, i) => (
                  <img key={i} src={getImgUrl(img)} alt=""
                    onClick={() => { setActiveImage(getImgUrl(img)); setActiveThumb(i); }}
                    onError={e => { e.target.src = "/images/s1.png"; }}
                    style={{
                      width:64, height:80, objectFit:"cover", cursor:"pointer", borderRadius:3,
                      border: activeThumb === i ? "2px solid #B8860B" : "1px solid #e0d0b8",
                      opacity: activeThumb === i ? 1 : 0.75, transition:"all 0.15s"
                    }}
                  />
                ))}
              </div>
            )}

            {/* Main image */}
            <div style={{ position:"relative" }}>
              {isSoldOut && (
                <div style={{ position:"absolute", top:12, left:12, background:"#c62828",
                              color:"#fff", fontSize:12, fontWeight:700,
                              padding:"4px 12px", letterSpacing:"1px", zIndex:2 }}>
                  SOLD OUT
                </div>
              )}
              {discount && !isSoldOut && (
                <div style={{ position:"absolute", top:12, right:12, background:"#B8860B",
                              color:"#fff", fontSize:11, fontWeight:700,
                              padding:"4px 10px", zIndex:2 }}>
                  {discount}% OFF
                </div>
              )}

              {/* Wishlist heart */}
              <div onClick={() => toggleWish(product)}
                style={{
                  position:"absolute", bottom:12, right:12,
                  width:36, height:36, borderRadius:"50%",
                  background:"#fff", border:"1px solid #e0d0b8",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", fontSize:18,
                  color: isWished(product._id||product.id) ? "#c62828" : "#ccc",
                  zIndex:2, transition:"color 0.2s"
                }}>
                ♥
              </div>

              <img src={activeImage} alt={product.name}
                onError={e => { e.target.src = "/images/s1.png"; }}
                onClick={() => setImgZoom(true)}
                style={{
                  width:380, height:480, objectFit:"cover",
                  borderRadius:4, cursor:"zoom-in", border:"1px solid #e8ddd0"
                }}
              />
            </div>
          </div>

          {/* ── RIGHT: Details ── */}
          <div style={{ flex:1, minWidth:280 }}>

            <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:600,
                         color:"#1a1008", marginBottom:10 }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:24, fontWeight:700, color:"#1a1008" }}>
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              {product.originalPrice > product.price && (
                <span style={{ fontSize:15, color:"#9a7050", textDecoration:"line-through" }}>
                  ₹{product.originalPrice?.toLocaleString("en-IN")}
                </span>
              )}
              {discount && (
                <span style={{ fontSize:13, color:"#2e7d32", fontWeight:600 }}>
                  {discount}% off
                </span>
              )}
            </div>

            <p style={{ fontSize:13, color:"#2e7d32", margin:"0 0 4px" }}>
              ✓ Free shipping all over India
            </p>

            {(product.fabric || product.color) && (
              <p style={{ fontSize:12, color:"#9a7050", margin:"0 0 16px",
                          textTransform:"uppercase", letterSpacing:"0.5px" }}>
                {product.fabric}{product.color ? ` · ${product.color}` : ""}
              </p>
            )}

            {/* Stock indicator */}
            {!isSoldOut && currentStock <= 5 && currentStock > 0 && (
              <p style={{ fontSize:12, color:"#c62828", margin:"0 0 14px", fontWeight:600 }}>
                ⚠ Only {currentStock} left in stock!
              </p>
            )}

            {/* COLOR VARIANTS */}
            {product.colorVariants?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
                            textTransform:"uppercase", color:"#7a6a52", margin:"0 0 10px" }}>
                  Colour:&nbsp;
                  <span style={{ color:"#1a1008", textTransform:"capitalize" }}>
                    {activeColor?.name || ""}
                  </span>
                </p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {product.colorVariants.map((v, i) => {
                    const isActive = activeColor?.name === v.name;
                    const isOOS    = v.stock === 0;
                    return (
                      <button key={i} onClick={() => handleColorClick(v)}
                        disabled={isOOS} title={isOOS ? `${v.name} — Sold Out` : v.name}
                        style={{
                          padding:"6px 16px",
                          border: isActive ? "2px solid #B8860B" : "1px solid #d4b896",
                          borderRadius:3,
                          background: isActive ? "#fdf6ee" : "#fff",
                          color: isActive ? "#B8860B" : isOOS ? "#ccc" : "#5a4a3a",
                          fontSize:13, fontWeight: isActive ? 600 : 400,
                          cursor: isOOS ? "not-allowed" : "pointer",
                          opacity: isOOS ? 0.5 : 1,
                          textDecoration: isOOS ? "line-through" : "none",
                          transition:"all 0.15s", position:"relative"
                        }}>
                        {v.name}
                        {isOOS && (
                          <span style={{ display:"block", fontSize:9, color:"#c62828", lineHeight:1 }}>
                            sold out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
                            textTransform:"uppercase", color:"#7a6a52", margin:"0 0 10px" }}>
                  Size
                </p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {product.sizes.map((sz, i) => (
                    <button key={i} onClick={() => setSelectedSize(sz)}
                      style={{
                        padding:"6px 16px",
                        border: selectedSize === sz ? "2px solid #B8860B" : "1px solid #d4b896",
                        borderRadius:3,
                        background: selectedSize === sz ? "#fdf6ee" : "#fff",
                        color: selectedSize === sz ? "#B8860B" : "#5a4a3a",
                        fontSize:13, fontWeight: selectedSize === sz ? 600 : 400,
                        cursor:"pointer", transition:"all 0.15s"
                      }}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
                          textTransform:"uppercase", color:"#7a6a52", margin:0 }}>
                Qty
              </p>
              <div style={{ display:"flex", alignItems:"center",
                            border:"1px solid #d4b896", borderRadius:3 }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  style={{ width:34, height:34, border:"none", background:"transparent",
                           fontSize:18, cursor:"pointer", color:"#5a4a3a" }}>−</button>
                <span style={{ width:36, textAlign:"center", fontSize:15,
                               fontWeight:600, color:"#1a1008" }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(currentStock || 10, q+1))}
                  style={{ width:34, height:34, border:"none", background:"transparent",
                           fontSize:18, cursor:"pointer", color:"#5a4a3a" }}>+</button>
              </div>
              {!isSoldOut && (
                <span style={{ fontSize:12, color:"#9a7050" }}>{currentStock} available</span>
              )}
            </div>

            {/* BUTTONS */}
            <div style={{ display:"flex", gap:12, marginBottom:12 }}>
              <button onClick={handleAddToCart} disabled={isSoldOut}
                style={{
                  flex:1, padding:"13px 0",
                  background: isSoldOut ? "#ccc" : inCart ? "#5c3317" : "#1a1008",
                  color:"#e8d5a3", border:"none",
                  fontSize:12, fontWeight:600, letterSpacing:"0.12em",
                  textTransform:"uppercase",
                  cursor: isSoldOut ? "not-allowed" : "pointer", transition:"background 0.2s"
                }}>
                {isSoldOut ? "SOLD OUT" : inCart ? "✓ ADDED TO CART" : "ADD TO CART"}
              </button>
              <button onClick={handleBuyNow} disabled={isSoldOut}
                style={{
                  flex:1, padding:"13px 0",
                  background: isSoldOut ? "#ccc" : "#B8860B",
                  color:"#fff", border:"none",
                  fontSize:12, fontWeight:600, letterSpacing:"0.12em",
                  textTransform:"uppercase",
                  cursor: isSoldOut ? "not-allowed" : "pointer", transition:"background 0.2s"
                }}>
                BUY NOW
              </button>
            </div>

            {cartMsg && (
              <p style={{ fontSize:13, color:"#2e7d32", margin:"0 0 12px", fontWeight:500 }}>
                {cartMsg}
              </p>
            )}

            {/* DELIVERY INFO */}
            <div style={{ border:"1px solid #e8ddd0", borderRadius:3,
                          padding:"12px 16px", marginBottom:20 }}>
              <p style={{ fontSize:13, color:"#1a1008", margin:"0 0 6px", fontWeight:500 }}>
                🚚 Delivery &amp; Return
              </p>
              <p style={{ fontSize:12, color:"#7a6a52", margin:"0 0 4px" }}>
                Estimated delivery: 3–5 business days
              </p>
              <p style={{ fontSize:12, color:"#7a6a52", margin:0 }}>
                Easy 30-day returns &amp; exchange
              </p>
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div style={{ borderTop:"1px solid #e8ddd0", paddingTop:16 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
                            textTransform:"uppercase", color:"#7a6a52", margin:"0 0 10px" }}>
                  Description
                </p>
                <p style={{ fontSize:13, color:"#5a4a3a", lineHeight:1.8, margin:0 }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RELATED PRODUCTS SECTION
      ══════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <div style={{
          maxWidth:1100, margin:"60px auto 0",
          padding:"0 24px 60px",
          fontFamily:"'Lato',sans-serif"
        }}>
          {/* Section header */}
          <div className="rel-divider">
            <h2 className="rel-section-title">Related Products</h2>
          </div>
          {product.category && (
            <p className="rel-section-sub">
              More from {product.category}
            </p>
          )}

          {/* Product grid */}
          <div className="rel-scroll-container">
            {related.map((p) => {
              const pid      = p._id || p.id;
              const img      = getImgUrl(p.images?.[0] || p.image);
              const wished   = isWished(pid);
              const pSoldOut = p.soldOut || Number(p.stock) === 0;
              const pDisc    = p.originalPrice > p.price
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                : null;

              return (
                <div key={pid} className="rel-card"
                  onClick={() => navigate(`/product/${pid}`)}>

                  {/* Image wrapper */}
                  <div style={{ position:"relative", overflow:"hidden" }}>
                    <img
                      className="rel-img"
                      src={img}
                      alt={p.name}
                      onError={e => { e.target.src = "/images/s1.png"; }}
                    />

                    {/* Sold out ribbon */}
                    {pSoldOut && (
                      <div style={{
                        position:"absolute", top:0, left:0, right:0,
                        background:"rgba(198,40,40,.85)", color:"#fff",
                        fontSize:10, fontWeight:700, textAlign:"center",
                        padding:"5px 0", letterSpacing:"1.5px"
                      }}>
                        SOLD OUT
                      </div>
                    )}

                    {/* Discount badge */}
                    {pDisc && !pSoldOut && (
                      <div style={{
                        position:"absolute", top:10, left:10,
                        background:"#B8860B", color:"#fff",
                        fontSize:10, fontWeight:700,
                        padding:"3px 8px", borderRadius:2
                      }}>
                        {pDisc}% OFF
                      </div>
                    )}

                    {/* Wishlist button */}
                    <button
                      className="rel-wish"
                      onClick={e => { e.stopPropagation(); toggleWish(p); }}
                      title={wished ? "Remove from wishlist" : "Add to wishlist"}>
                      <span style={{ color: wished ? "#c62828" : "#bbb", lineHeight:1 }}>
                        {wished ? "♥" : "♡"}
                      </span>
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding:"14px 14px 0" }}>
                    <p style={{
                      fontFamily:"'Playfair Display',serif",
                      fontSize:14, color:"#1a1008", fontWeight:500,
                      margin:"0 0 4px", lineHeight:1.35,
                      overflow:"hidden", textOverflow:"ellipsis",
                      display:"-webkit-box", WebkitLineClamp:2,
                      WebkitBoxOrient:"vertical"
                    }}>
                      {p.name}
                    </p>

                    {(p.fabric || p.category) && (
                      <p style={{ fontSize:10, color:"#b08060", margin:"0 0 8px",
                                  textTransform:"uppercase", letterSpacing:".5px",
                                  fontFamily:"Lato" }}>
                        {[p.fabric, p.category].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    <div style={{ display:"flex", alignItems:"baseline",
                                  gap:6, marginBottom:12 }}>
                      <span style={{ fontFamily:"'Playfair Display',serif",
                                     fontSize:16, fontWeight:700, color:"#1a1008" }}>
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </span>
                      {p.originalPrice > p.price && (
                        <span style={{ fontSize:12, color:"#b08060",
                                       textDecoration:"line-through", fontFamily:"Lato" }}>
                          ₹{Number(p.originalPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick add / View button */}
                  <button
                    className={`rel-add-btn${pSoldOut ? " sold" : ""}`}
                    disabled={pSoldOut}
                    onClick={e => {
                      e.stopPropagation();
                      if (!pSoldOut) handleRelatedCart(p);
                    }}>
                    {pSoldOut ? "Sold Out" : "View Product →"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* IMAGE ZOOM MODAL */}
      {imgZoom && (
        <div onClick={() => setImgZoom(false)}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center",
            zIndex:1000, cursor:"zoom-out"
          }}>
          <img src={activeImage} alt={product.name}
            style={{ maxWidth:"90vw", maxHeight:"90vh", objectFit:"contain" }}
          />
        </div>
      )}
    </>
  );
}