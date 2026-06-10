import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = "http://localhost:8000";

export default function Payment({ cartItems, setCartItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { finalTotal, address: checkoutAddress } = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedOnline, setSelectedOnline] = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [scriptLoaded,   setScriptLoaded]   = useState(false);

  useEffect(() => {
    if (window.Razorpay) { setScriptLoaded(true); return; }
    const script = document.createElement("script");
    script.src     = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => setScriptLoaded(true);
    script.onerror = () => setError("Failed to load payment SDK. Please refresh.");
    document.body.appendChild(script);
  }, []);

  const handleRazorpay = () =>
    new Promise(async (resolve, reject) => {
      if (!scriptLoaded) return reject(new Error("Payment SDK not loaded. Please refresh."));
      let orderData;
      try {
        const { data } = await axios.post(`${BASE}/api/payment/create-order`, { amount: finalTotal });
        orderData = data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Could not create payment order.";
        return reject(new Error(msg));
      }
      const options = {
        key:         orderData.key,
        amount:      orderData.amount,
        currency:    orderData.currency || "INR",
        name:        "Mana Vastralu",
        description: "Saree Purchase",
        order_id:    orderData.orderId,
        prefill: {
          name:    localStorage.getItem("userName")  || "",
          email:   localStorage.getItem("userEmail") || "",
          contact: checkoutAddress?.phone || "",
        },
        theme: { color: "#8B4513" },
        handler: async (response) => {
          try {
            const verify = await axios.post(`${BASE}/api/payment/verify`, {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (verify.data.success) resolve(response.razorpay_payment_id);
            else reject(new Error("Payment verification failed. Contact support."));
          } catch (err) {
            reject(new Error(err.response?.data?.message || "Verification failed."));
          }
        },
        modal: { ondismiss: () => reject(new Error("Payment cancelled by user")) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed")));
      rzp.open();
    });

  const handlePay = async () => {
    if (!selectedMethod) { setError("Please select a payment method."); return; }
    if (selectedMethod === "online" && !selectedOnline) {
      setError("Please choose an online payment option."); return;
    }
    if (!cartItems || cartItems.length === 0) { setError("Your cart is empty."); return; }

    setError("");
    setLoading(true);

    try {
      const userEmail  = localStorage.getItem("userEmail") || "guest@gmail.com";
      const userName   = localStorage.getItem("userName")  || "Guest";
      const payType    = selectedMethod === "cod" ? "Cash on Delivery" : selectedOnline;
      let   razorpayId = null;

      if (selectedMethod === "online") {
        razorpayId = await handleRazorpay();
      }

      const addressToSend = checkoutAddress || {};

      const products = cartItems.map(item => {
        const rawImg = item.images?.[0] || item.image || "";
        const imageUrl = rawImg.startsWith("http") ? rawImg
          : rawImg.startsWith("uploads/") ? `${BASE}/${rawImg}`
          : rawImg ? `${BASE}/uploads/${rawImg}` : "";
        return {
          productId:    item._id || item.id,
          name:         item.name,
          price:        Number(item.price),
          quantity:     item.quantity || 1,
          selectedSize: item.selectedSize || "",
          color:        item.color || "",
          image:        imageUrl,
          images:       item.images || [],
        };
      });

      const orderPayload = {
        user_id:        userEmail,
        email:          userEmail,
        userName,
        phone:          addressToSend.phone || "",
        address:        addressToSend,
        payment_method: payType,
        paymentMethod:  payType,
        total_amount:   Number(finalTotal),
        totalAmount:    Number(finalTotal),
        products,
        paymentId:      razorpayId || "",
        paymentStatus:  selectedMethod === "online" ? "Paid" : "Pending",
      };

      const res = await axios.post(`${BASE}/add-order`, orderPayload);

      if (res.data.success) {
        setCartItems([]);
        localStorage.removeItem("cartItems");
        navigate("/order-success", {
          state: {
            orderId:     res.data.orderId,
            totalAmount: finalTotal,
            paymentType: payType,
            items:       cartItems,
          },
        });
      } else {
        setError(res.data.error || "Order could not be placed. Please try again.");
      }
    } catch (err) {
      if (err.message === "Payment cancelled by user") {
        setError("Payment was cancelled. Please try again.");
      } else {
        setError(err.response?.data?.error || err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getItemImg = (item) => {
    const img = item.images?.[0] || "";
    if (!img) return "/images/s1.png";
    if (img.startsWith("http")) return img;
    if (img.startsWith("uploads/")) return `${BASE}/${img}`;
    return `${BASE}/uploads/${img}`;
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.lockRing}></div>
          <h2 style={s.title}>Secure Checkout</h2>
          <div style={s.amountBadge}>₹{Number(finalTotal || 0).toLocaleString("en-IN")}</div>
          <p style={s.brand}>Mana Vastralu</p>
        </div>

        {/* Order summary */}
        {cartItems?.length > 0 && (
          <div style={{ marginBottom:20, background:"#fdf6ee",
                        border:"1px solid #e8d8c4", borderRadius:12, padding:"12px 16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9a7050",
                          textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>
              Order Summary ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})
            </div>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"center",
                                    marginBottom:8, paddingBottom:8,
                                    borderBottom: i < cartItems.length - 1 ? "1px solid #f0e4d6" : "none" }}>
                <img src={getItemImg(item)} alt={item.name}
                  onError={e => { e.target.src = "/images/s1.png"; }}
                  style={{ width:44, height:44, objectFit:"cover",
                           borderRadius:6, border:"1px solid #e8d8c4", flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#5c3317" }}>{item.name}</div>
                  <div style={{ fontSize:11, color:"#9a7050" }}>
                    {item.selectedSize && `Size: ${item.selectedSize} · `}Qty: {item.quantity || 1}
                  </div>
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:"#8b4513" }}>
                  ₹{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                </div>
              </div>
            ))}
            {checkoutAddress?.fullName && (
              <div style={{ marginTop:8, paddingTop:8, borderTop:"1px dashed #e8d8c4",
                            fontSize:11, color:"#9a7050" }}>
                 <strong style={{ color:"#5c3317" }}>{checkoutAddress.fullName}</strong>
                {checkoutAddress.phone && ` · ${checkoutAddress.phone}`}<br/>
                {[checkoutAddress.houseNo, checkoutAddress.landmark,
                  checkoutAddress.village, checkoutAddress.district,
                  checkoutAddress.state, checkoutAddress.pincode
                ].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={s.errorBox}>
            <span></span><span>{error}</span>
          </div>
        )}

        <p style={s.sectionLabel}>Choose Payment Method</p>

        {/* ✅ COD — visible but DISABLED */}
        <div style={{
          ...s.option,
          opacity: 0.45,
          cursor: "not-allowed",
          background: "#f9f9f9",
          border: "1.5px solid #e5e7eb",
          position: "relative",
        }}>
          <span style={s.optIcon}></span>
          <div style={{ flex:1 }}>
            <div style={{ ...s.optTitle, color:"#999" }}>Cash on Delivery</div>
            <div style={{ ...s.optSub, color:"#bbb" }}>Currently unavailable</div>
          </div>
          {/* "Not available" badge */}
          <span style={{
            fontSize:9, fontWeight:700, color:"#fff",
            background:"#9ca3af", padding:"3px 8px",
            borderRadius:20, letterSpacing:"0.5px",
            textTransform:"uppercase", flexShrink:0,
          }}>
            Unavailable
          </span>
        </div>

        {/* ✅ Online Payment — active */}
        <PayOption
          icon=""
          title="Online Payment"
          sub="UPI · Cards · Net Banking · Wallets"
          active={selectedMethod === "online"}
          onClick={() => { setSelectedMethod("online"); setError(""); }}
        />

        {selectedMethod === "online" && (
          <div style={s.subWrap}>
            {[
              { value:"UPI / PhonePe / GPay", label:"UPI / PhonePe / GPay", icon:"" },
              { value:"Debit/Credit Card",    label:"Debit / Credit Card",   icon:"" },
              { value:"Net Banking",          label:"Net Banking",           icon:"" },
            ].map(opt => (
              <div key={opt.value}
                style={{ ...s.subRow, ...(selectedOnline === opt.value ? s.subRowActive : {}) }}
                onClick={() => { setSelectedOnline(opt.value); setError(""); }}>
                <span style={s.subIcon}>{opt.icon}</span>
                <span style={s.subLabel}>{opt.label}</span>
                <Radio on={selectedOnline === opt.value} />
              </div>
            ))}
          </div>
        )}

        <button onClick={handlePay}
          disabled={loading || !scriptLoaded}
          style={{ ...s.payBtn,
                   opacity: (loading || !scriptLoaded) ? 0.65 : 1,
                   cursor:  (loading || !scriptLoaded) ? "not-allowed" : "pointer" }}>
          {loading
            ? <><Spinner /> Placing Order…</>
            : `Pay ₹${Number(finalTotal || 0).toLocaleString("en-IN")} →`
          }
        </button>

        <p style={s.trust}> 256-bit SSL · Powered by Razorpay</p>
      </div>
    </div>
  );
}

function PayOption({ icon, title, sub, active, onClick }) {
  return (
    <div style={{ ...s.option, ...(active ? s.optionActive : {}) }} onClick={onClick}>
      <span style={s.optIcon}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={s.optTitle}>{title}</div>
        <div style={s.optSub}>{sub}</div>
      </div>
      <Radio on={active} />
    </div>
  );
}

function Radio({ on }) {
  return (
    <div style={{ width:20, height:20, borderRadius:"50%",
                  border: on ? "6px solid #8B4513" : "2px solid #ccc",
                  background:"#fff", flexShrink:0, transition:"all .2s" }} />
  );
}

function Spinner() {
  return (
    <span style={{ display:"inline-block", width:14, height:14,
                   border:"2px solid rgba(255,255,255,.4)",
                   borderTopColor:"#fff", borderRadius:"50%",
                   animation:"spin .7s linear infinite",
                   marginRight:8, verticalAlign:"middle" }} />
  );
}

const s = {
  page:        { minHeight:"100vh", background:"linear-gradient(160deg,#1a0a00 0%,#3d1a00 50%,#1a0a00 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"Georgia,serif" },
  card:        { background:"#fffaf5", borderRadius:24, padding:"36px 32px", width:"100%", maxWidth:500, boxShadow:"0 32px 80px rgba(0,0,0,.45)" },
  header:      { textAlign:"center", marginBottom:20 },
  lockRing:    { fontSize:36, marginBottom:8 },
  title:       { margin:"0 0 10px", fontSize:24, fontWeight:700, color:"#1a0a00", letterSpacing:"-0.5px" },
  amountBadge: { display:"inline-block", background:"#8B4513", color:"#fff", fontSize:20, fontWeight:700, padding:"4px 20px", borderRadius:100, marginBottom:6 },
  brand:       { margin:0, fontSize:13, color:"#a0522d", letterSpacing:1, textTransform:"uppercase" },
  sectionLabel:{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 },
  errorBox:    { display:"flex", alignItems:"center", gap:8, background:"#fff5f5", border:"1px solid #fca5a5", color:"#b91c1c", padding:"12px 16px", borderRadius:12, fontSize:13, marginBottom:18 },
  option:      { display:"flex", alignItems:"center", gap:14, border:"1.5px solid #e5e7eb", borderRadius:14, padding:"16px 18px", marginBottom:12, cursor:"pointer", transition:"all .2s", background:"#fff" },
  optionActive:{ border:"1.5px solid #8B4513", background:"#fff8f3", boxShadow:"0 4px 16px rgba(139,69,19,.1)" },
  optIcon:     { fontSize:24 },
  optTitle:    { fontWeight:600, fontSize:15, color:"#1a0a00" },
  optSub:      { fontSize:12, color:"#9ca3af", marginTop:2 },
  subWrap:     { background:"#faf5ef", border:"1.5px solid #e5c9a8", borderRadius:14, padding:"8px 12px", marginBottom:16 },
  subRow:      { display:"flex", alignItems:"center", gap:12, padding:"11px 10px", borderRadius:10, cursor:"pointer", marginBottom:4, transition:"background .15s" },
  subRowActive:{ background:"#f5e6d3" },
  subIcon:     { fontSize:18 },
  subLabel:    { flex:1, fontSize:14, color:"#374151", fontFamily:"sans-serif" },
  payBtn:      { width:"100%", padding:"17px", background:"linear-gradient(90deg,#8B4513,#c0622a)", color:"#fff", border:"none", borderRadius:14, fontSize:17, fontWeight:700, letterSpacing:0.4, display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"0 8px 24px rgba(139,69,19,.35)", transition:"opacity .2s" },
  trust:       { textAlign:"center", fontSize:12, color:"#aaa", marginTop:14, fontFamily:"sans-serif" },
};

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}