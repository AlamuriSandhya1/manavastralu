// cat > /mnt/user-data/outputs/ProductList.js << 'ENDOFFILE'
import React, { useState, useEffect } from "react";
import "./ProductList.css";
import { FaWhatsapp, FaInstagram, FaShareAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ProductList({
  columns,
  sortType,
  filters,
  wishlist,
  setWishlist,
  cartItems,
  setCartItems
}) {

  const [products,     setProducts]     = useState([]);
  const [shareOpen,    setShareOpen]    = useState(null);
  const [selectedSize, setSelectedSize] = useState({});
  const [loading,      setLoading]      = useState(true);

  // ── FETCH FROM MONGODB ──────────────────────────────
  useEffect(() => {
    fetch("http://localhost:8000/api/products")
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.log("Fetch error:", err); setLoading(false); });
  }, []);

  // ── FILTERING ───────────────────────────────────────
  let filteredProducts = [...products];

  if (filters?.fabric?.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      filters.fabric.includes(p.fabric)
    );
  }
  if (filters?.color?.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      filters.color.includes(p.color)
    );
  }
  if (filters?.price?.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      return filters.price.some(range => {
        if (range === "under1000")  return p.price < 1000;
        if (range === "1000-3000")  return p.price >= 1000 && p.price <= 3000;
        if (range === "3000-6000")  return p.price >= 3000 && p.price <= 6000;
        if (range === "above6000")  return p.price > 6000;
        return true;
      });
    });
  }

  // ── SORTING ─────────────────────────────────────────
  const sortedProducts = [...filteredProducts];
  if (sortType === "low")  sortedProducts.sort((a, b) => a.price - b.price);
  if (sortType === "high") sortedProducts.sort((a, b) => b.price - a.price);

  // ── WISHLIST TOGGLE ──────────────────────────────────
  const toggleLike = (item) => {
    const itemId = item._id || item.id;
    const exists = wishlist.some(p => (p._id || p.id) === itemId);
    setWishlist(exists
      ? wishlist.filter(p => (p._id || p.id) !== itemId)
      : [...wishlist, item]
    );
  };

  // ── ADD TO CART ──────────────────────────────────────
  const addToCart = (item) => {
    if (item.soldOut || Number(item.stock) === 0) return;

    const itemId  = item._id || item.id;
    const size    = selectedSize[itemId] || item.sizes?.[0] || "";
    const cartKey = itemId + "_" + size;

    const cartItem = {
      ...item,
      selectedSize: size,
      quantity: 1,
      stock: Number(item.stock) || 10,
      // normalise image URL so toast shows the photo
      image: (() => {
        const img = item.images?.[0] || item.image || "";
        if (!img) return "/images/s1.png";
        if (img.startsWith("http"))     return img;
        if (img.startsWith("uploads/")) return `http://localhost:8000/${img}`;
        return `http://localhost:8000/uploads/${img}`;
      })(),
    };

    if (!cartItems.some(p => ((p._id || p.id) + "_" + p.selectedSize) === cartKey)) {
      setCartItems([...cartItems, cartItem]);
    }

    // ✅ Fire the toast popup
    if (window.showCartToast) {
      window.showCartToast(cartItem);
    }
  };

  // ── SHARE ────────────────────────────────────────────
  const shareProduct = (platform, item) => {
    const url  = window.location.href;
    const text = `Check out this saree: ${item.name} - ₹${item.price}`;
    if (platform === "whatsapp")
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    if (platform === "instagram")
      window.open("https://www.instagram.com/", "_blank");
  };

  // ── IMAGE URL ────────────────────────────────────────
  const getImageSrc = (item) => {
    if (item.images?.length > 0) {
      const img = item.images[0];
      if (!img) return "/images/s1.png";
      if (img.startsWith("http"))     return img;
      if (img.startsWith("uploads/")) return `http://localhost:8000/${img}`;
      return `http://localhost:8000/uploads/${img}`;
    }
    return "/images/s1.png";
  };

  // ── LOADING ──────────────────────────────────────────
  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 0",
                  fontFamily:"Georgia,serif", color:"#8b4513", fontSize:16 }}>
      Loading products...
    </div>
  );

  if (products.length === 0) return (
    <div style={{ textAlign:"center", padding:"60px 0",
                  fontFamily:"Georgia,serif", color:"#8b4513", fontSize:16 }}>
      No products found. Add products from the Admin panel.
    </div>
  );

  // ── RENDER ───────────────────────────────────────────
  return (
    <div className={`product-section cols-${columns}`}>

      {sortedProducts.map((item, index) => {

        const itemId    = item._id || item.id;
        const isWished  = wishlist.some(p => (p._id || p.id) === itemId);
        const inCart    = cartItems.some(p => (p._id || p.id) === itemId);
        const isSoldOut = item.soldOut === true || Number(item.stock) === 0;
        const discount  = item.originalPrice > item.price
          ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
          : null;

        return (
          <div className="card" key={itemId || index}>

            {/* IMAGE BOX */}
            <div className="img-box" style={{ position:"relative" }}>

              <Link to={`/product/${itemId}`}>
                <img
                  src={getImageSrc(item)}
                  alt={item.name}
                  onError={e => { e.target.src = "/images/s1.png"; }}
                />
              </Link>

              {/* SOLD OUT OVERLAY */}
              {isSoldOut && (
                <div style={{
                  position:"absolute", top:0, left:0, right:0, bottom:0,
                  background:"rgba(0,0,0,0.45)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  zIndex:2,
                }}>
                  <span style={{
                    background:"#c62828", color:"#fff",
                    padding:"8px 20px", fontWeight:700,
                    fontSize:13, letterSpacing:"1.5px",
                  }}>
                    SOLD OUT
                  </span>
                </div>
              )}

              {/* LOW STOCK WARNING */}
              {!isSoldOut && item.stock > 0 && item.stock <= 3 && (
                <div style={{
                  position:"absolute", bottom:8, left:8,
                  background:"#ff6f00", color:"#fff",
                  fontSize:10, fontWeight:700,
                  padding:"3px 8px", letterSpacing:"0.5px", zIndex:2,
                }}>
                  Only {item.stock} left!
                </div>
              )}

              {/* DISCOUNT BADGE */}
              {discount && !isSoldOut && (
                <span className="discount">{discount}% OFF</span>
              )}

              {/* HEART */}
              <div
                className={`heart ${isWished ? "active" : ""}`}
                onClick={() => toggleLike(item)}
                style={{ zIndex:3 }}
              >
                ♥
              </div>

            </div>

            {/* PRODUCT NAME */}
            <h3>{item.name}</h3>

            {/* FABRIC & COLOR */}
            {(item.fabric || item.color) && (
              <p style={{
                fontSize:11, color:"#9a7050",
                margin:"2px 0 6px",
                textTransform:"uppercase", letterSpacing:"0.5px",
              }}>
                {item.fabric}{item.color ? ` · ${item.color}` : ""}
              </p>
            )}

            {/* SIZE SELECTOR */}
            {item.sizes?.length > 0 && !isSoldOut && (
              <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
                {item.sizes.map(size => (
                  <span
                    key={size}
                    onClick={() => setSelectedSize({ ...selectedSize, [itemId]: size })}
                    style={{
                      padding:"2px 8px", fontSize:11, cursor:"pointer",
                      border: selectedSize[itemId] === size
                        ? "1.5px solid #8b4513" : "1px solid #d4b896",
                      color: selectedSize[itemId] === size
                        ? "#8b4513" : "#9a7050",
                      fontWeight: selectedSize[itemId] === size ? 700 : 400,
                      background: selectedSize[itemId] === size ? "#fdf6ee" : "#fff",
                    }}
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}

            {/* PRICE ROW */}
            <p className="price">
              ₹{Number(item.price).toLocaleString()}
              {item.originalPrice > item.price && (
                <span className="old">
                  {" "}₹{Number(item.originalPrice).toLocaleString()}
                </span>
              )}
              <span
                className="share-btn"
                onClick={() => setShareOpen(shareOpen === itemId ? null : itemId)}
              >
                <FaShareAlt />
              </span>
            </p>

            {/* SHARE POPUP */}
            {shareOpen === itemId && (
              <div className="share-popup">
                <FaWhatsapp onClick={() => shareProduct("whatsapp", item)} />
                <FaInstagram onClick={() => shareProduct("instagram", item)} />
              </div>
            )}

            {/* ADD TO CART BUTTON */}
            <button
              className={`cart-btn ${inCart ? "added" : ""}`}
              onClick={() => addToCart(item)}
              disabled={isSoldOut}
              style={{
                opacity:    isSoldOut ? 0.6 : 1,
                cursor:     isSoldOut ? "not-allowed" : "pointer",
                background: isSoldOut ? "#999" : inCart ? "#5c3317" : "",
              }}
            >
              {isSoldOut ? "SOLD OUT"
                : inCart  ? "ADDED TO CART"
                :           "ADD TO CART"}
            </button>

          </div>
        );
      })}

    </div>
  );
}
// ENDOFFILE
// echo "Done"