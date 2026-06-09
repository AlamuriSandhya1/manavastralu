import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

export default function Wishlist({ wishlist, setWishlist, cartItems = [], setCartItems }) {

  const navigate = useNavigate();

  const removeItem = (item) => {
    const id = item._id || item.id;
    setWishlist(wishlist.filter(i => (i._id || i.id) !== id));
  };

  const moveToCart = (item) => {
    // ✅ Block if sold out OR stock is 0
    const isSoldOut = item.soldOut === true || Number(item.stock) === 0;
    if (isSoldOut) return;

    const id = item._id || item.id;
    const alreadyInCart = cartItems?.some(c => (c._id || c.id) === id);
    if (!alreadyInCart) {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    removeItem(item);
    navigate("/cart");
  };

  const getImage = (item) => {
    const img = item.images?.[0];
    if (!img) return "/images/s1.png";
    if (img.startsWith("uploads/") || img.startsWith("uploads\\")) {
      return `http://localhost:8000/${img}`;
    }
    if (img.startsWith("http")) return img;
    return "/" + img;
  };

  if (wishlist.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "50vh", fontFamily: "Georgia, serif"
      }}>
        <FaHeart style={{ fontSize: 48, color: "#e0c8b0", marginBottom: 16 }} />
        <h2 style={{ color: "#1a1008", fontSize: 22, margin: "0 0 8px" }}>
          Your wishlist is empty
        </h2>
        <p style={{ color: "#7a6a52", fontSize: 14, margin: "0 0 24px" }}>
          Save sarees you love by clicking the heart icon
        </p>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "10px 28px", background: "#1a1008", color: "#e8d5a3",
            border: "none", fontSize: 12, letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: "pointer"
          }}
        >
          Browse Sarees
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#1a1008", margin: 0 }}>
          My Wishlist
        </h2>
        <span style={{ fontSize: 13, color: "#9a7050" }}>
          ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
        </span>
      </div>

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 20
      }}>
        {wishlist.map(item => {
          const id = item._id || item.id;
          const inCart = cartItems?.some(c => (c._id || c.id) === id);

          // ✅ Check BOTH soldOut flag AND stock === 0
          const isSoldOut = item.soldOut === true || Number(item.stock) === 0;

          const discount = item.originalPrice > item.price
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : null;

          return (
            <div key={id} style={{
              background: "#fdfaf5",
              border: "1px solid rgba(184,134,11,0.15)",
              borderRadius: 4, overflow: "hidden",
              display: "flex", flexDirection: "column"
            }}>

              {/* IMAGE */}
              <div style={{ position: "relative" }}>
                <Link to={`/product/${id}`}>
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    onError={e => { e.target.src = "/images/s1.png"; }}
                    style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
                  />
                </Link>

                {/* SOLD OUT overlay on image */}
                {isSoldOut && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2,
                  }}>
                    <span style={{
                      background: "#c62828", color: "#fff",
                      padding: "7px 18px", fontWeight: 700,
                      fontSize: 12, letterSpacing: "1.5px",
                    }}>
                      SOLD OUT
                    </span>
                  </div>
                )}

                {/* Discount badge — hidden when sold out */}
                {discount && !isSoldOut && (
                  <span style={{
                    position: "absolute", top: 8, left: 8,
                    background: "#B8860B", color: "#fff",
                    fontSize: 10, fontWeight: 700,
                    padding: "3px 7px", letterSpacing: "0.5px", zIndex: 3,
                  }}>
                    {discount}% OFF
                  </span>
                )}

                {/* Remove heart */}
                <div
                  onClick={() => removeItem(item)}
                  title="Remove from wishlist"
                  style={{
                    position: "absolute", top: 8, right: 8, zIndex: 3,
                    width: 30, height: 30, borderRadius: "50%",
                    background: "#fff", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 15, color: "#c62828",
                    border: "1px solid rgba(198,40,40,0.2)"
                  }}
                >
                  ♥
                </div>
              </div>

              {/* INFO */}
              <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
                <Link to={`/product/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 style={{
                    fontFamily: "Georgia, serif", fontSize: 13,
                    color: "#1a1008", margin: "0 0 4px", lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>
                    {item.name}
                  </h3>
                </Link>

                {(item.fabric || item.color) && (
                  <p style={{ fontSize: 10, color: "#9a7050", margin: "0 0 8px",
                              textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {item.fabric}{item.color ? ` · ${item.color}` : ""}
                  </p>
                )}

                {/* Price */}
                <div style={{ display: "flex", alignItems: "baseline",
                              gap: 6, marginBottom: 12, marginTop: "auto" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1008" }}>
                    ₹{item.price?.toLocaleString()}
                  </span>
                  {item.originalPrice > item.price && (
                    <span style={{ fontSize: 12, color: "#9a7050", textDecoration: "line-through" }}>
                      ₹{item.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Move to Cart button */}
                <button
                  onClick={() => moveToCart(item)}
                  disabled={isSoldOut}
                  style={{
                    width: "100%", padding: "9px 0",
                    background: isSoldOut ? "#999" : inCart ? "#5c3317" : "#1a1008",
                    color: isSoldOut ? "#fff" : "#e8d5a3",
                    border: "none", fontSize: 11,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    cursor: isSoldOut ? "not-allowed" : "pointer",
                    opacity: isSoldOut ? 0.7 : 1,
                    marginBottom: 6,
                  }}
                >
                  {isSoldOut ? "Sold Out" : inCart ? "Already in Cart" : "Move to Cart"}
                </button>

                <button
                  onClick={() => removeItem(item)}
                  style={{
                    width: "100%", padding: "8px 0",
                    background: "transparent", color: "#9a7050",
                    border: "1px solid rgba(184,134,11,0.2)", fontSize: 11,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}