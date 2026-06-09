import React, { useState } from "react";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt, FaTag, FaTruck, FaCheckCircle,
  FaTrash, FaMapMarkerAlt, FaLock, FaEdit
} from "react-icons/fa";

const SHIPPING_CHARGE    = 70;
const FREE_SHIPPING_ABOVE = 999;

export default function Checkout({ cartItems, setCartItems }) {
  const navigate = useNavigate();

  const savedAddress = (() => {
    try { return JSON.parse(localStorage.getItem("userData")) || {}; } catch { return {}; }
  })();

  const [address, setAddress] = useState({
    fullName: savedAddress.fullName || localStorage.getItem("userName") || "",
    phone:    savedAddress.phone    || "",
    houseNo:  savedAddress.houseNo  || "",
    landmark: savedAddress.landmark || "",
    village:  savedAddress.village  || "",
    district: savedAddress.district || "",
    state:    savedAddress.state    || "",
    pincode:  savedAddress.pincode  || "",
  });

  const [showForm,     setShowForm]     = useState(false);
  const [addressSaved, setAddressSaved] = useState(
    !!(savedAddress.houseNo && savedAddress.state)
  );
  const [formError, setFormError] = useState("");

  const removeItem = (id) =>
    setCartItems(cartItems.filter(item => (item._id || item.id) !== id));

  const productTotal  = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1), 0
  );
  const discount      = Math.round(productTotal * 0.10);
  const afterDiscount = productTotal - discount;
  const shipping      = afterDiscount >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_CHARGE;
  const finalTotal    = afterDiscount + shipping;

  const handleSaveAddress = () => {
    const required = ["fullName","phone","houseNo","village","district","state","pincode"];
    const missing  = required.find(f => !address[f]?.trim());
    if (missing)                    { setFormError("Please fill all required fields."); return; }
    if (address.phone.length < 10)  { setFormError("Enter a valid 10-digit phone number."); return; }
    if (address.pincode.length !== 6){ setFormError("Enter a valid 6-digit pincode."); return; }

    // Save to localStorage
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem("userData")) || {}; } catch { return {}; }
    })();
    localStorage.setItem("userData", JSON.stringify({ ...existing, ...address }));

    setAddressSaved(true);
    setShowForm(false);
    setFormError("");
  };

  const getImage = (item) => {
    const img = item.images?.[0];
    if (!img) return "/images/s1.png";
    if (img.startsWith("http"))     return img;
    if (img.startsWith("uploads/")) return `http://localhost:8000/${img}`;
    return "/images/s1.png";
  };

  // ── EMPTY CART ──────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="ck-empty">
        <div className="ck-empty-icon">🛍️</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet</p>
        <button className="ck-empty-btn" onClick={() => navigate("/home")}>
          Browse Sarees
        </button>
      </div>
    );
  }

  const steps = [
    { num:1, label:"Cart" },
    { num:2, label:"Address" },
    { num:3, label:"Payment" },
  ];

  return (
    <div className="ck-root">

      {/* PROGRESS STEPS */}
      <div className="ck-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`ck-step ${s.num <= 2 ? "active" : ""}`}>
              <div className="ck-step-circle">
                {s.num < 2 ? <FaCheckCircle /> : s.num}
              </div>
              <span className="ck-step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`ck-step-line ${s.num < 2 ? "done" : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="ck-body">

        {/* ── LEFT ── */}
        <div className="ck-left">

          {/* DELIVERY ADDRESS CARD */}
          <div className="ck-card">
            <div className="ck-card-head">
              <div className="ck-card-title">
                <FaMapMarkerAlt className="ck-card-icon" />
                <span>Delivery Address</span>
              </div>
              {addressSaved && (
                <button
                  className="ck-link-btn"
                  onClick={() => { setShowForm(!showForm); setFormError(""); }}>
                  {showForm ? "Cancel" : (
                    <><FaEdit style={{ fontSize:11, marginRight:4 }} />Change Address</>
                  )}
                </button>
              )}
            </div>

            {/* Saved address display */}
            {addressSaved && !showForm && (
              <div className="ck-address-display">
                <div className="ck-address-name">
                  {address.fullName}
                  <span className="ck-address-phone">{address.phone}</span>
                </div>
                <div className="ck-address-line">
                  {address.houseNo}
                  {address.landmark ? `, ${address.landmark}` : ""},&nbsp;
                  {address.village}, {address.district}
                </div>
                <div className="ck-address-line">
                  {address.state} — <strong>{address.pincode}</strong>
                </div>
                <div className="ck-address-tag">
                  <FaCheckCircle style={{ color:"#2e7d32", fontSize:12 }} />
                  Delivery available
                </div>
              </div>
            )}

            {/* No address yet */}
            {!addressSaved && !showForm && (
              <div className="ck-address-empty">
                <FaMapMarkerAlt style={{ fontSize:28, color:"#C9853A", marginBottom:8 }} />
                <p>Add a delivery address to continue</p>
                <button className="ck-add-addr-btn" onClick={() => setShowForm(true)}>
                  + Add New Address
                </button>
              </div>
            )}

            {/* Address form */}
            {showForm && (
              <div className="ck-form">
                {formError && <div className="ck-form-error">{formError}</div>}
                <div className="ck-form-grid">
                  {[
                    { key:"fullName", label:"Full Name",           type:"text", req:true  },
                    { key:"phone",    label:"Phone",               type:"tel",  req:true  },
                    { key:"houseNo",  label:"House / Flat No",     type:"text", req:true  },
                    { key:"landmark", label:"Landmark (optional)", type:"text", req:false },
                    { key:"village",  label:"Village / City",      type:"text", req:true  },
                    { key:"district", label:"District",            type:"text", req:true  },
                    { key:"state",    label:"State",               type:"text", req:true  },
                    { key:"pincode",  label:"Pincode",             type:"text", req:true  },
                  ].map(({ key, label, type, req }) => (
                    <div className="ck-field" key={key}>
                      <label className="ck-label">{label}{req && " *"}</label>
                      <input
                        type={type}
                        value={address[key]}
                        maxLength={key==="phone" ? 10 : key==="pincode" ? 6 : 100}
                        onChange={e => setAddress({ ...address, [key]: e.target.value })}
                        className="ck-input"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
                <button className="ck-save-addr-btn" onClick={handleSaveAddress}>
                  Save &amp; Continue
                </button>
              </div>
            )}
          </div>

          {/* PRODUCT LIST */}
          {addressSaved && !showForm && (
            <div className="ck-card">
              <div className="ck-card-head">
                <div className="ck-card-title">
                  <span>Order Items ({cartItems.length})</span>
                </div>
              </div>

              {cartItems.map(item => {
                const id       = item._id || item.id;
                const qty      = item.quantity || 1;
                const itemTotal = Number(item.price) * qty;

                return (
                  <div className="ck-item" key={id}>
                    <div className="ck-item-img-wrap">
                      <img
                        src={getImage(item)}
                        alt={item.name}
                        className="ck-item-img"
                        onError={e => { e.target.src = "/images/s1.png"; }}
                      />
                    </div>
                    <div className="ck-item-info">
                      <div className="ck-item-name">{item.name}</div>
                      {item.fabric && (
                        <div className="ck-item-type">
                          {item.fabric}{item.color ? ` · ${item.color}` : ""}
                        </div>
                      )}
                      {item.selectedSize && (
                        <div className="ck-item-meta">
                          Size: <strong>{item.selectedSize}</strong>
                        </div>
                      )}
                      <div className="ck-item-meta">Qty: <strong>{qty}</strong></div>
                      <div className="ck-item-price-row">
                        <span className="ck-item-price">₹{itemTotal.toLocaleString()}</span>
                        {item.originalPrice > item.price && (
                          <span className="ck-item-old">
                            ₹{(item.originalPrice * qty).toLocaleString()}
                          </span>
                        )}
                        {item.originalPrice > item.price && (
                          <span className="ck-item-off">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                          </span>
                        )}
                      </div>
                      <div className="ck-item-delivery">
                        <FaTruck style={{ fontSize:12 }} />
                        {shipping === 0
                          ? <span className="ck-free-ship">Free Delivery</span>
                          : <span>Shipping: ₹{SHIPPING_CHARGE}</span>
                        }
                      </div>
                    </div>
                    <button
                      className="ck-remove-btn"
                      onClick={() => removeItem(id)}
                      title="Remove">
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="ck-right">

          {/* COUPON */}
          <div className="ck-card ck-coupon-card">
            <div className="ck-coupon-row">
              <FaTag style={{ color:"#C9853A", fontSize:14 }} />
              <span className="ck-coupon-text">Have a coupon code?</span>
              <button className="ck-link-btn">Apply</button>
            </div>
          </div>

          {/* PRICE SUMMARY */}
          <div className="ck-card ck-price-card">
            <div className="ck-price-head">Price Details</div>

            <div className="ck-price-row">
              <span>Price ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})</span>
              <span>₹{productTotal.toLocaleString()}</span>
            </div>
            <div className="ck-price-row ck-discount">
              <span>Discount (10%)</span>
              <span>− ₹{discount.toLocaleString()}</span>
            </div>
            <div className={`ck-price-row ${shipping === 0 ? "ck-free" : ""}`}>
              <span>Delivery Charges</span>
              <span>
                {shipping === 0
                  ? <><s style={{ color:"#888", fontSize:12 }}>₹{SHIPPING_CHARGE}</s> FREE</>
                  : `₹${shipping}`}
              </span>
            </div>

            <div className="ck-price-divider" />

            <div className="ck-price-row ck-total">
              <span>Total Amount</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="ck-save-banner">
                🎉 You will save <strong>₹{discount.toLocaleString()}</strong> on this order
              </div>
            )}
          </div>

          {/* Address warning */}
          {!addressSaved && (
            <div className="ck-addr-warn">
              ⚠ Please add a delivery address to proceed
            </div>
          )}

          {/* ✅ PLACE ORDER BUTTON — passes address correctly to Payment.js */}
          <button
            className="ck-place-btn"
            disabled={!addressSaved}
            onClick={() => navigate("/payment", {
              state: {
                cartItems,
                finalTotal,
                address,      // ✅ full address object passed here
              }
            })}>
            <FaLock style={{ fontSize:13 }} />
            Place Order · ₹{finalTotal.toLocaleString()}
          </button>

          {/* SECURITY */}
          <div className="ck-secure">
            <FaShieldAlt style={{ color:"#2e7d32", fontSize:13 }} />
            <span>Safe &amp; Secure Payments. Easy returns.</span>
          </div>

          {/* PAYMENT ICONS */}
          <div className="ck-pay-icons">
            {["UPI","Cards","Net Banking","COD"].map(p => (
              <span key={p} className="ck-pay-pill">{p}</span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}