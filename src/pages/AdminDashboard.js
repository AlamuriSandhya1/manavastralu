import React, { useState, useRef, useEffect } from "react";

const PASS = "admin123";
const API  = "http://localhost:8000";

const STATUS_CFG = {
  Pending:   { bg:"#2a1f00", color:"#f5c842", dot:"#f5c842" },
  Confirmed: { bg:"#001a2e", color:"#4da6ff", dot:"#4da6ff" },
  Shipped:   { bg:"#1a0030", color:"#c084fc", dot:"#c084fc" },
  Delivered: { bg:"#002210", color:"#4ade80", dot:"#4ade80" },
  Cancelled: { bg:"#2a0000", color:"#f87171", dot:"#f87171" },
};

const getImgUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http"))     return img.replace("127.0.0.1:8000","localhost:8000");
  if (img.startsWith("uploads/")) return `${API}/${img}`;
  return `${API}/uploads/${img}`;
};

const getItemImg = (item) => {
  const raw = item.image || item.images?.[0] || "";
  return raw ? getImgUrl(raw) : null;
};

const renderAddress = (addr, fallbackName) => {
  if (!addr || Object.keys(addr).length === 0) return null;
  const newFormat = addr.fullName || addr.houseNo || addr.village;
  const oldFormat = addr.name || addr.street || addr.city;
  if (!newFormat && !oldFormat) return null;
  if (newFormat) {
    return {
      name:  addr.fullName || fallbackName || "—",
      phone: addr.phone || "",
      line1: [addr.houseNo, addr.landmark].filter(Boolean).join(", "),
      line2: [addr.village, addr.district].filter(Boolean).join(", "),
      line3: [addr.state, addr.pincode ? `— ${addr.pincode}` : ""].filter(Boolean).join(" "),
    };
  }
  return {
    name:  addr.name || fallbackName || "—",
    phone: addr.phone || "",
    line1: addr.street || addr.address || "",
    line2: [addr.city, addr.state].filter(Boolean).join(", "),
    line3: addr.pincode ? `PIN: ${addr.pincode}` : "",
  };
};

// ══════════════════════════════════════════════════════
//  2FA LOGIN COMPONENT
// ══════════════════════════════════════════════════════
function AdminLogin2FA({ onSuccess }) {
  const [step,     setStep]     = useState(1);
  const [password, setPassword] = useState("");
  const [otp,      setOtp]      = useState(["","","","","",""]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s <= 1 ? (clearInterval(t), 0) : s - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const handlePasswordSubmit = async () => {
    if (!password) { setError("Enter your admin password"); return; }
    setLoading(true); setError(""); setInfo("");
    try {
      const res  = await fetch(`${API}/api/admin/request-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Incorrect password");
      } else {
        setInfo(data.message);
        setStep(2);
        setTimeLeft(300);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  };

  const handleOtpChange = (i, val) => {
    const v = val.replace(/\D/g,"").slice(-1);
    const next = [...otp]; next[i] = v; setOtp(next); setError("");
    if (v && i < 5) otpRefs.current[i+1]?.focus();
    if (v && i === 5 && next.every(d => d !== "")) handleOtpSubmit(next.join(""));
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i-1]?.focus();
    if (e.key === "Enter" && otp.every(d => d !== "")) handleOtpSubmit(otp.join(""));
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (pasted.length === 6) { setOtp(pasted.split("")); handleOtpSubmit(pasted); }
  };

  const handleOtpSubmit = async (otpVal) => {
    const code = otpVal || otp.join("");
    if (code.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    if (timeLeft === 0)     { setError("OTP expired. Request a new one."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/admin/verify-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ otp: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Invalid OTP");
        setOtp(["","","","","",""]);
        otpRefs.current[0]?.focus();
      } else {
        onSuccess(data.sessionToken);
      }
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  };

  const resendOtp = async () => {
    if (timeLeft > 240) return;
    setOtp(["","","","","",""]); setLoading(true); setError(""); setInfo("");
    try {
      const res  = await fetch(`${API}/api/admin/request-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) { setInfo("New OTP sent!"); setTimeLeft(300); setTimeout(() => otpRefs.current[0]?.focus(), 100); }
      else setError(data.message);
    } catch { setError("Failed to resend"); }
    setLoading(false);
  };

  return (
    <div style={S.loginPage}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .l-box{animation:fadeUp .5s ease both}
        .l-inp:focus{border-color:#c8a04a!important;box-shadow:0 0 0 3px rgba(200,160,74,0.15)!important}
        .l-btn:hover{background:#d4aa55!important;transform:translateY(-1px)}
        .l-back:hover{border-color:rgba(200,160,74,0.3)!important;color:#c8a04a!important}
        .otp-i:focus{border-color:#c8a04a!important;box-shadow:0 0 0 3px rgba(200,160,74,0.15)!important}
      `}</style>
      <div className="l-box" style={S.loginBox}>
        <div style={{width:56,height:56,background:"linear-gradient(135deg,#c8a04a,#8b5e1a)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px"}}>🥻</div>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:"#e8d5a3",margin:"0 0 4px",textAlign:"center"}}>Mana Vastralu</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#7a5a30",textAlign:"center",margin:"0 0 20px",letterSpacing:"0.1em",textTransform:"uppercase"}}>
          {step===1 ? "Admin Console" : "Two-Factor Auth"}
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {[1,2].map(s => (
            <div key={s} style={{height:6,borderRadius:3,transition:"all .3s",
              width: step===s ? 24 : 8,
              background: step>=s ? "#c8a04a" : "rgba(200,160,74,0.2)"}} />
          ))}
        </div>
        {error && <div style={{fontSize:12,color:"#f87171",margin:"0 0 12px",background:"rgba(198,40,40,0.1)",padding:"8px 12px",borderRadius:6,border:"1px solid rgba(198,40,40,0.2)",fontFamily:"'DM Sans',sans-serif"}}>⚠️ {error}</div>}
        {info  && <div style={{fontSize:12,color:"#4ade80",margin:"0 0 12px",background:"rgba(74,222,128,0.08)",padding:"8px 12px",borderRadius:6,border:"1px solid rgba(74,222,128,0.2)",fontFamily:"'DM Sans',sans-serif"}}>✓ {info}</div>}

        {step === 1 && (
          <>
            <label style={{display:"block",fontSize:10,fontWeight:600,color:"#7a5a30",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>Admin Password</label>
            <input className="l-inp" type="password" placeholder="Enter admin password"
              value={password} onChange={e=>{setPassword(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handlePasswordSubmit()}
              style={{width:"100%",padding:"12px 14px",fontSize:14,border:"1.5px solid rgba(200,160,74,0.25)",borderRadius:8,outline:"none",fontFamily:"'DM Sans',sans-serif",background:"#0f0a04",color:"#e8d5a3",marginBottom:12,boxSizing:"border-box",transition:"border-color .2s"}}/>
            <div style={{fontSize:11,color:"#5a3a10",marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
              🔐 A 6-digit OTP will be sent to your admin email
            </div>
            <button className={loading?"":"l-btn"} onClick={handlePasswordSubmit} disabled={loading}
              style={{width:"100%",padding:"13px",background:loading?"#5a3a10":"#c8a04a",color:loading?"#9a7050":"#1a1008",border:"none",borderRadius:8,fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:loading?"not-allowed":"pointer",letterSpacing:"0.06em",transition:"all .2s"}}>
              {loading ? "Sending OTP…" : "Continue →"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{fontSize:13,color:"#9a7050",textAlign:"center",margin:"0 0 20px",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>
              Enter the 6-digit OTP sent to<br/>
              <strong style={{color:"#c8a04a"}}>your admin email</strong>
            </p>
            <div style={{display:"flex",gap:8,marginBottom:14,justifyContent:"center"}} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input key={i} ref={el=>otpRefs.current[i]=el}
                  className="otp-i" type="text" inputMode="numeric"
                  maxLength={1} value={digit}
                  onChange={e=>handleOtpChange(i,e.target.value)}
                  onKeyDown={e=>handleOtpKeyDown(i,e)}
                  style={{width:44,height:52,textAlign:"center",fontSize:22,fontWeight:700,
                    border: `1.5px solid ${digit?"#c8a04a":"rgba(200,160,74,0.25)"}`,
                    borderRadius:8,background:digit?"rgba(200,160,74,0.08)":"#0f0a04",
                    color:"#c8a04a",outline:"none",fontFamily:"monospace",transition:"all .2s"}}/>
              ))}
            </div>
            <div style={{textAlign:"center",fontSize:12,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif",marginBottom:14}}>
              {timeLeft > 0
                ? `⏱ OTP expires in ${fmt(timeLeft)}`
                : <span style={{color:"#f87171"}}>OTP expired — request a new one</span>}
            </div>
            <button className={loading||otp.some(d=>!d)?"":"l-btn"}
              onClick={()=>handleOtpSubmit()} disabled={loading||otp.some(d=>!d)}
              style={{width:"100%",padding:"13px",background:loading||otp.some(d=>!d)?"#5a3a10":"#c8a04a",color:loading||otp.some(d=>!d)?"#9a7050":"#1a1008",border:"none",borderRadius:8,fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:loading||otp.some(d=>!d)?"not-allowed":"pointer",letterSpacing:"0.06em",transition:"all .2s",marginBottom:8}}>
              {loading ? "Verifying…" : "Verify & Sign In →"}
            </button>
            <button className="l-back" onClick={resendOtp} disabled={loading||timeLeft>240}
              style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid rgba(200,160,74,0.15)",borderRadius:8,color:"#7a5a30",fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:loading||timeLeft>240?"not-allowed":"pointer",marginBottom:8,opacity:timeLeft>240?0.4:1,transition:"all .2s"}}>
              {timeLeft>240 ? `Resend in ${fmt(timeLeft-240)}` : "↩ Resend OTP"}
            </button>
            <button className="l-back" onClick={()=>{setStep(1);setOtp(["","","","","",""]);setError("");setInfo("");}}
              style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid rgba(200,160,74,0.15)",borderRadius:8,color:"#7a5a30",fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"all .2s"}}>
              ← Back to Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ══════════════════════════════════════════════════════
export default function AdminDashboard() {
  // ✅ All hooks inside the component
  const [authed,        setAuthed]        = useState(false);
  const [tab,           setTab]           = useState("products");
  const [filter,        setFilter]        = useState("All");
  const [users,         setUsers]         = useState([]);
  const [products,      setProducts]      = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [editingProduct,setEditingProduct]= useState(null);
  const [editForm,      setEditForm]      = useState({});
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [addForm,       setAddForm]       = useState({
    name:"", description:"", price:"", originalPrice:"",
    fabric:"", color:"", category:"", stock:"10", sizes:"",
  });
  const [addImages,     setAddImages]     = useState([]);
  const [addLoading,    setAddLoading]    = useState(false);
  const [addSuccess,    setAddSuccess]    = useState("");
  // ✅ Tracking state inside component
  const [trackingForm,  setTrackingForm]  = useState({});
  const [trackingOpen,  setTrackingOpen]  = useState(null);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const isSoldOut = (p) => p.soldOut || Number(p.stock) === 0;

  const handleAuthSuccess = async () => {
    try {
      const [uRes, pRes, oRes] = await Promise.all([
        fetch(`${API}/api/admin/users?password=${PASS}`),
        fetch(`${API}/api/admin/products?password=${PASS}`),
        fetch(`${API}/api/admin/orders?password=${PASS}`),
      ]);
      setUsers(await uRes.json());
      setProducts(await pRes.json());
      setOrders(await oRes.json());
      setAuthed(true);
    } catch (err) { console.error("Load failed:", err); }
  };

  // ✅ handleAddTracking inside component, uses order variable correctly
  const handleAddTracking = async (orderId) => {
    const form = trackingForm[orderId] || {};
    if (!form.trackingNumber) { alert("Enter tracking number"); return; }
    try {
      const res = await fetch(`${API}/api/admin/orders/${orderId}/tracking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password:          PASS,
          courierName:       form.courierName       || "DTDC",
          trackingNumber:    form.trackingNumber,
          estimatedDelivery: form.estimatedDelivery || "",
          status:            "Shipped",
        }),
      });
      const data = await res.json();
      setOrders(orders.map(o =>
        o._id === orderId ? { ...o, ...data.order } : o
      ));
      setTrackingOpen(null);
      alert("✅ Tracking added! Customer can now track their order.");
    } catch { alert("Failed to add tracking"); }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setAddImages(prev => {
      const combined = [...prev, ...files];
      if (combined.length > 4) { alert("Maximum 4 images."); return combined.slice(0,4); }
      return combined;
    });
    e.target.value = "";
  };

  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.price) { alert("Name and Price required"); return; }
    if (addImages.length === 0) { alert("Upload at least 1 image"); return; }
    setAddLoading(true);
    try {
      const fd = new FormData();
      Object.entries(addForm).forEach(([k,v]) => {
        fd.append(k, k==="sizes" ? JSON.stringify(v.split(",").map(s=>s.trim()).filter(Boolean)) : v);
      });
      addImages.forEach(img => fd.append("images", img));
      const res = await fetch(`${API}/api/products`,{method:"POST",body:fd});
      const data = await res.json();
      if (!res.ok) { alert("Error: "+(data.error||"Upload failed")); return; }
      setProducts([data,...products]);
      setAddForm({name:"",description:"",price:"",originalPrice:"",fabric:"",color:"",category:"",stock:"10",sizes:""});
      setAddImages([]);
      setAddSuccess(`Product added with ${data.images?.length||0} image(s)!`);
      setTimeout(()=>setAddSuccess(""),3000);
      setShowAddForm(false);
    } catch(err) { alert("Failed: "+err.message); }
    setAddLoading(false);
  };

  const handleUpdateProduct = async (id) => {
    try {
      const payload = { ...editForm,
        sizes: typeof editForm.sizes==="string" ? editForm.sizes.split(",").map(s=>s.trim()).filter(Boolean) : editForm.sizes,
        soldOut: Number(editForm.stock)===0 };
      await fetch(`${API}/api/products/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      setProducts(products.map(p=>p._id===id?{...p,...payload}:p));
      setEditingProduct(null);
    } catch { alert("Update failed"); }
  };

  const markSoldOut = async (p) => {
    const payload = {...editForm,stock:0,soldOut:true,sizes:typeof editForm.sizes==="string"?editForm.sizes.split(",").map(s=>s.trim()).filter(Boolean):editForm.sizes};
    await fetch(`${API}/api/products/${p._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    setProducts(products.map(pr=>pr._id===p._id?{...pr,stock:0,soldOut:true}:pr));
    setEditingProduct(null);
  };

  const markInStock = async (p,newStock=10) => {
    const payload = {...editForm,stock:newStock,soldOut:false,sizes:typeof editForm.sizes==="string"?editForm.sizes.split(",").map(s=>s.trim()).filter(Boolean):editForm.sizes};
    await fetch(`${API}/api/products/${p._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    setProducts(products.map(pr=>pr._id===p._id?{...pr,stock:newStock,soldOut:false}:pr));
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${API}/api/products/${id}`,{method:"DELETE"});
    setProducts(products.filter(p=>p._id!==id));
  };

  const handleOrderStatus = async (id,status) => {
    await fetch(`${API}/api/admin/orders/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:PASS,status})});
    setOrders(orders.map(o=>o._id===id?{...o,status}:o));
  };

  if (!authed) return <AdminLogin2FA onSuccess={handleAuthSuccess} />;

  const soldOutCount   = products.filter(p=>isSoldOut(p)).length;
  const revenue        = orders.reduce((s,o)=>s+Number(o.total_amount||o.totalAmount||0),0);
  const visibleOrders  = filter==="All" ? orders : orders.filter(o=>o.status===filter);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#1e1409}
        ::-webkit-scrollbar-thumb{background:#5c3a10;border-radius:3px}
        .tab-btn:hover{background:rgba(200,160,74,0.08)!important}
        .action-btn:hover{opacity:.85;transform:translateY(-1px)}
        .stat-card{transition:transform .2s}
        .stat-card:hover{transform:translateY(-3px)}
        select option{background:#2a1a08;color:#e8d5a3}
        .upload-zone:hover{border-color:rgba(200,160,74,0.7)!important;background:rgba(200,160,74,0.08)!important}
        .fpill{cursor:pointer;transition:all .15s}
        .fpill:hover{border-color:rgba(200,160,74,0.5)!important}
      `}</style>

      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={{padding:"28px 20px 20px"}}>
          <div style={{width:44,height:44,background:"linear-gradient(135deg,#c8a04a,#8b5e1a)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12}}>🥻</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#e8d5a3",fontWeight:600,lineHeight:1.2}}>Mana Vastralu</div>
          <div style={{fontSize:10,color:"#7a5a30",marginTop:2,letterSpacing:"0.1em",textTransform:"uppercase"}}>Admin Console</div>
          <div style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:5,background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:20,padding:"3px 10px"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
            <span style={{fontSize:9,color:"#4ade80",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.5px"}}>2FA SECURED</span>
          </div>
        </div>
        <div style={{padding:"0 12px"}}>
          {[{key:"products",icon:"🛍️",label:"Products"},{key:"orders",icon:"📦",label:"Orders"},{key:"users",icon:"👥",label:"Users"}].map(t=>(
            <button key={t.key} className="tab-btn" onClick={()=>setTab(t.key)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",marginBottom:4,background:tab===t.key?"rgba(200,160,74,0.15)":"transparent",border:tab===t.key?"1px solid rgba(200,160,74,0.25)":"1px solid transparent",borderRadius:8,cursor:"pointer",transition:"all .15s",color:tab===t.key?"#c8a04a":"#9a7050",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:tab===t.key?500:400,textAlign:"left"}}>
              <span style={{fontSize:16}}>{t.icon}</span>{t.label}
              {tab===t.key&&<span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:"#c8a04a"}}/>}
            </button>
          ))}
        </div>
        <div style={{marginTop:"auto",padding:"20px 12px"}}>
          <button onClick={()=>setAuthed(false)} style={{width:"100%",padding:"10px",background:"rgba(198,40,40,0.1)",border:"1px solid rgba(198,40,40,0.2)",borderRadius:8,color:"#f87171",fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",letterSpacing:"0.06em"}}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={S.main}>
        <div style={S.topbar}>
          <div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#e8d5a3",margin:0,fontWeight:600}}>
              {tab==="products"?"Products":tab==="orders"?"Orders":"Users"}
            </h1>
            <p style={{fontSize:12,color:"#7a5a30",margin:"2px 0 0",fontFamily:"'DM Sans',sans-serif"}}>
              {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
          {[
            {label:"Total Products",val:products.length,icon:"🛍️",sub:"In catalogue"},
            {label:"Total Orders",val:orders.length,icon:"📦",sub:"All time"},
            {label:"Revenue",val:`₹${revenue.toLocaleString()}`,icon:"💰",sub:"Total earned"},
            {label:"Sold Out",val:soldOutCount,icon:"🚫",sub:"Need restock"},
          ].map((s,i)=>(
            <div key={i} className="stat-card" style={S.statCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:11,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{s.label}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:"#e8d5a3",fontWeight:600,lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:11,color:"#5a3a10",marginTop:6,fontFamily:"'DM Sans',sans-serif"}}>{s.sub}</div>
                </div>
                <span style={{fontSize:24,opacity:0.6}}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ══ PRODUCTS TAB ══ */}
        {tab==="products"&&(
          <div style={S.panel}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9a7050"}}>
                {products.length} products in store
                {soldOutCount>0&&<span style={{marginLeft:10,color:"#f87171",fontSize:11}}>· {soldOutCount} sold out</span>}
              </div>
              <button onClick={()=>{setShowAddForm(!showAddForm);setAddImages([]);}}
                style={{background:showAddForm?"rgba(198,40,40,0.15)":"#c8a04a",color:showAddForm?"#f87171":"#1a1008",border:showAddForm?"1px solid rgba(198,40,40,0.3)":"none",padding:"9px 20px",fontSize:12,fontWeight:600,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.06em",transition:"all .2s"}}>
                {showAddForm?"✕ Cancel":"+ Add Product"}
              </button>
            </div>
            {addSuccess&&<div style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.3)",color:"#4ade80",padding:"10px 16px",borderRadius:8,marginBottom:16,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>✅ {addSuccess}</div>}

            {showAddForm&&(
              <div style={S.addForm}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:"#e8d5a3",marginBottom:20}}>New Product</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                  <div style={{gridColumn:"1/-1"}}><label style={S.formLabel}>Product Name *</label><input value={addForm.name} onChange={e=>setAddForm({...addForm,name:e.target.value})} placeholder="e.g. Kanchipuram Pure Silk Saree" style={S.formInput}/></div>
                  {[["price","Selling Price (₹) *","number"],["originalPrice","Original Price (₹)","number"],["stock","Stock Quantity","number"]].map(([k,l,t])=>(
                    <div key={k}><label style={S.formLabel}>{l}</label><input type={t} value={addForm[k]} onChange={e=>setAddForm({...addForm,[k]:e.target.value})} style={S.formInput}/></div>
                  ))}
                  <div><label style={S.formLabel}>Fabric</label>
                    <select value={addForm.fabric} onChange={e=>setAddForm({...addForm,fabric:e.target.value})} style={S.formInput}>
                      <option value="">Select</option>
                      {["Silk","Cotton","Chiffon","Georgette","Organza","Linen","Banarasi","Chanderi"].map(f=><option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div><label style={S.formLabel}>Color</label><input value={addForm.color} onChange={e=>setAddForm({...addForm,color:e.target.value})} placeholder="Red, Gold, ALL COLOURS" style={S.formInput}/></div>
                  <div><label style={S.formLabel}>Category</label>
                    <select value={addForm.category} onChange={e=>setAddForm({...addForm,category:e.target.value})} style={S.formInput}>
                      <option value="">Select</option>
                      {["Bridal","Festive","Office Wear","Casual","Wedding","Party Wear"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={S.formLabel}>Sizes (comma separated)</label><input value={addForm.sizes} onChange={e=>setAddForm({...addForm,sizes:e.target.value})} placeholder="S,M,L,XL" style={S.formInput}/></div>
                  <div style={{gridColumn:"1/-1"}}><label style={S.formLabel}>Description</label><textarea value={addForm.description} rows={3} onChange={e=>setAddForm({...addForm,description:e.target.value})} placeholder="Describe the saree..." style={{...S.formInput,resize:"vertical",height:80}}/></div>
                  <div style={{gridColumn:"1/-1"}}>
                    <label style={S.formLabel}>Product Images * ({addImages.length}/4)</label>
                    <label className="upload-zone" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px",border:"2px dashed rgba(200,160,74,0.35)",borderRadius:8,cursor:"pointer",background:"rgba(200,160,74,0.03)",transition:"all .2s"}}>
                      <span style={{fontSize:32,marginBottom:8}}>📷</span>
                      <span style={{fontSize:13,color:"#c8a04a",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Click to upload images</span>
                      <span style={{fontSize:11,color:"#7a5a30",marginTop:4}}>PNG, JPG · Hold Ctrl for multiple</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageSelect} style={{display:"none"}}/>
                    </label>
                    {addImages.length>0&&(
                      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}>
                        {addImages.map((img,i)=>(
                          <div key={i} style={{position:"relative"}}>
                            {i===0&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(200,160,74,0.92)",color:"#1a1008",fontSize:9,fontWeight:700,textAlign:"center",padding:"3px 0",borderRadius:"0 0 6px 6px"}}>MAIN</div>}
                            <img src={URL.createObjectURL(img)} alt="" style={{width:88,height:88,objectFit:"cover",borderRadius:6,border:i===0?"2px solid #c8a04a":"1px solid rgba(200,160,74,0.25)",display:"block"}}/>
                            <div onClick={()=>setAddImages(addImages.filter((_,j)=>j!==i))} style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:"50%",background:"#c62828",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,cursor:"pointer",fontWeight:700}}>✕</div>
                          </div>
                        ))}
                        {addImages.length<4&&(
                          <label style={{width:88,height:88,borderRadius:6,border:"2px dashed rgba(200,160,74,0.3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:4,background:"rgba(200,160,74,0.03)"}}>
                            <span style={{fontSize:22,color:"#c8a04a"}}>+</span>
                            <span style={{fontSize:10,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif"}}>Add more</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageSelect} style={{display:"none"}}/>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:20}}>
                  <button onClick={handleAddProduct} disabled={addLoading} style={{background:addLoading?"#5a3a10":"#c8a04a",color:"#1a1008",border:"none",padding:"10px 24px",fontSize:13,fontWeight:600,borderRadius:8,cursor:addLoading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{addLoading?"Uploading...":"Save Product"}</button>
                  <button onClick={()=>{setShowAddForm(false);setAddImages([]);}} style={{background:"transparent",color:"#9a7050",border:"1px solid rgba(200,160,74,0.2)",padding:"10px 20px",fontSize:13,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
              {products.length===0?(
                <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:"#5a3a10",fontFamily:"'DM Sans',sans-serif",fontSize:14}}>No products yet.</div>
              ):products.map((p)=>{
                const imgUrl=getImgUrl(p.images?.[0]);
                const soldOut=isSoldOut(p);
                return(
                  <div key={p._id} style={S.productCard}>
                    <div style={{position:"relative",height:200,background:"#1a1008",borderRadius:"8px 8px 0 0",overflow:"hidden"}}>
                      {imgUrl?<img src={imgUrl} alt={p.name} onError={e=>{e.target.style.display="none";}} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,opacity:0.3}}>🥻</div>}
                      {p.images?.length>1&&<div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,0.7)",color:"#c8a04a",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:4}}>📷 {p.images.length}</div>}
                      <div style={{position:"absolute",top:10,left:10,background:soldOut?"rgba(198,40,40,0.9)":"rgba(74,222,128,0.9)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:4,letterSpacing:"0.5px"}}>{soldOut?"SOLD OUT":"IN STOCK"}</div>
                      <div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.7)",color:Number(p.stock)<=3?"#f87171":"#c8a04a",fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:4}}>{Number(p.stock)||0} left</div>
                    </div>
                    <div style={{padding:"14px 16px"}}>
                      <h4 style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#e8d5a3",margin:"0 0 4px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</h4>
                      <p style={{fontSize:11,color:"#7a5a30",margin:"0 0 10px",fontFamily:"'DM Sans',sans-serif"}}>{p.category}{p.fabric?` · ${p.fabric}`:""}{p.color?` · ${p.color}`:""}</p>
                      <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:12}}>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#c8a04a",fontWeight:600}}>₹{Number(p.price).toLocaleString()}</span>
                        {p.originalPrice>p.price&&<span style={{fontSize:12,color:"#5a3a10",textDecoration:"line-through"}}>₹{Number(p.originalPrice).toLocaleString()}</span>}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="action-btn" onClick={()=>{setEditingProduct(editingProduct===p._id?null:p._id);setEditForm({name:p.name,description:p.description||"",price:p.price,originalPrice:p.originalPrice||"",stock:p.stock,fabric:p.fabric||"",color:p.color||"",category:p.category||"",sizes:p.sizes?.join(",")|| ""});}} style={{flex:1,padding:"7px 0",background:"rgba(200,160,74,0.15)",color:"#c8a04a",border:"1px solid rgba(200,160,74,0.25)",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s",fontFamily:"'DM Sans',sans-serif"}}>✏️ Edit</button>
                        <button className="action-btn" onClick={()=>handleDeleteProduct(p._id)} style={{flex:1,padding:"7px 0",background:"rgba(198,40,40,0.1)",color:"#f87171",border:"1px solid rgba(198,40,40,0.2)",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s",fontFamily:"'DM Sans',sans-serif"}}>🗑 Delete</button>
                      </div>
                    </div>
                    {editingProduct===p._id&&(
                      <div style={{borderTop:"1px solid rgba(200,160,74,0.15)",padding:"16px",background:"rgba(200,160,74,0.03)"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                          {[["name","Name"],["price","Price (₹)"],["originalPrice","Orig. Price"],["stock","Stock"],["fabric","Fabric"],["color","Color"],["category","Category"],["sizes","Sizes"]].map(([k,l])=>(
                            <div key={k}><label style={S.formLabel}>{l}</label><input value={editForm[k]||""} type={["price","originalPrice","stock"].includes(k)?"number":"text"} onChange={e=>setEditForm({...editForm,[k]:e.target.value})} style={{...S.formInput,padding:"6px 10px",fontSize:12}}/></div>
                          ))}
                          <div style={{gridColumn:"1/-1"}}><label style={S.formLabel}>Description</label><textarea value={editForm.description||""} rows={2} onChange={e=>setEditForm({...editForm,description:e.target.value})} style={{...S.formInput,resize:"vertical",height:60,fontSize:12}}/></div>
                          <div style={{gridColumn:"1/-1"}}><label style={S.formLabel}>Quick Actions</label>
                            <div style={{display:"flex",gap:8}}>
                              <button onClick={()=>markSoldOut(p)} style={{flex:1,padding:"8px",background:"rgba(198,40,40,0.15)",color:"#f87171",border:"1px solid rgba(198,40,40,0.3)",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🚫 Mark Sold Out</button>
                              <button onClick={()=>markInStock(p,10)} style={{flex:1,padding:"8px",background:"rgba(74,222,128,0.1)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.2)",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✅ Restock (10)</button>
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:8,marginTop:12}}>
                          <button onClick={()=>handleUpdateProduct(p._id)} style={{flex:1,padding:"8px",background:"#c8a04a",color:"#1a1008",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Save Changes</button>
                          <button onClick={()=>setEditingProduct(null)} style={{flex:1,padding:"8px",background:"transparent",color:"#9a7050",border:"1px solid rgba(200,160,74,0.2)",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ ORDERS TAB ══ */}
        {tab==="orders"&&(
          <div style={S.panel}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9a7050"}}>
                {visibleOrders.length} {filter==="All"?"total":filter.toLowerCase()} orders
              </span>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["All","Pending","Confirmed","Shipped","Delivered","Cancelled"].map(f=>(
                  <span key={f} className="fpill" onClick={()=>setFilter(f)}
                    style={{fontSize:11,padding:"4px 12px",borderRadius:12,fontFamily:"'DM Sans',sans-serif",
                      background:filter===f?"rgba(200,160,74,0.25)":"rgba(200,160,74,0.07)",
                      border:filter===f?"1px solid rgba(200,160,74,0.6)":"1px solid rgba(200,160,74,0.15)",
                      color:filter===f?"#c8a04a":"#7a5a30",fontWeight:filter===f?600:400}}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {visibleOrders.length===0?(
                <div style={{textAlign:"center",padding:"60px 0",color:"#5a3a10",fontFamily:"'DM Sans',sans-serif"}}>No orders yet.</div>
              ):visibleOrders.map((o)=>{
                const sc=STATUS_CFG[o.status]||STATUS_CFG.Pending;
                const itemList=Array.isArray(o.products)&&o.products.length>0?o.products:Array.isArray(o.items)&&o.items.length>0?o.items:[];
                const totalAmt=Number(o.total_amount||o.totalAmount||0);
                const payMethod=o.payment_method||o.paymentMethod||"—";
                const addrData=renderAddress(o.address,o.userName||o.email?.split("@")[0]);
                return(
                  <div key={o._id} style={{...S.orderCard,padding:0,overflow:"hidden"}}>

                    {/* ORDER HEADER */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,padding:"14px 20px",borderBottom:"1px solid rgba(200,160,74,0.1)",background:"rgba(200,160,74,0.03)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#c8a04a,#8b5e1a)",display:"flex",alignItems:"center",justifyContent:"center",color:"#1a1008",fontSize:15,fontWeight:700,fontFamily:"'Playfair Display',serif",flexShrink:0}}>{(o.email||"G")[0].toUpperCase()}</div>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#e8d5a3",fontWeight:600}}>{o.email?.split("@")[0]||"Guest"}</span>
                            <span style={{fontSize:10,color:"#5a3a10",fontFamily:"monospace",background:"rgba(200,160,74,0.1)",padding:"2px 7px",borderRadius:4}}>#{String(o._id).slice(-6).toUpperCase()}</span>
                          </div>
                          <div style={{fontSize:11,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{o.email} · {fmt(o.createdAt||o.created_at)}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#c8a04a",fontWeight:600}}>₹{totalAmt.toLocaleString()}</div>
                          <div style={{fontSize:10,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif"}}>{payMethod}</div>
                        </div>
                        <div style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,background:sc.bg,color:sc.color,display:"flex",alignItems:"center",gap:5,fontFamily:"'DM Sans',sans-serif"}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:sc.dot}}/>{o.status||"Confirmed"}
                        </div>
                        <select value={o.status||"Confirmed"} onChange={e=>handleOrderStatus(o._id,e.target.value)}
                          style={{padding:"5px 10px",fontSize:11,background:"#2a1a08",border:"1px solid rgba(200,160,74,0.25)",borderRadius:6,color:"#c8a04a",cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                          {["Pending","Confirmed","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* ORDER BODY — items + address */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 220px",padding:"18px 20px",gap:0}}>
                      <div style={{paddingRight:16}}>
                        <div style={{fontSize:10,color:"#5a3a10",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>Items Ordered ({itemList.length})</div>
                        {itemList.length===0?(
                          <div style={{fontSize:12,color:"#5a3a10",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>No item details available</div>
                        ):(
                          <div style={{display:"flex",flexDirection:"column",gap:10}}>
                            {itemList.map((item,j)=>{
                              const imgUrl=getItemImg(item);
                              return(
                                <div key={j} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(200,160,74,0.04)",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(200,160,74,0.1)"}}>
                                  {imgUrl?(<img src={imgUrl} alt={item.name} onError={e=>{e.target.onerror=null;e.target.src="/images/s1.png";}} style={{width:64,height:72,objectFit:"cover",borderRadius:4,flexShrink:0,border:"1px solid rgba(200,160,74,0.2)"}}/>):(<div style={{width:64,height:72,borderRadius:4,background:"rgba(200,160,74,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🥻</div>)}
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:13,color:"#e8d5a3",fontWeight:600,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</div>
                                    <div style={{fontSize:11,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif",marginTop:3,display:"flex",gap:8,flexWrap:"wrap"}}>
                                      {(item.selectedSize||item.size)&&<span>Size: <strong style={{color:"#c8a04a"}}>{item.selectedSize||item.size}</strong></span>}
                                      {item.color&&<span>· <strong style={{color:"#c8a04a"}}>{item.color}</strong></span>}
                                      <span>· Qty: <strong style={{color:"#c8a04a"}}>{item.quantity||1}</strong></span>
                                    </div>
                                    {item.productId&&<div style={{fontSize:9,color:"#5a3a10",fontFamily:"monospace",marginTop:3}}>ID: {item.productId}</div>}
                                  </div>
                                  <div style={{flexShrink:0,textAlign:"right"}}>
                                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#c8a04a",fontWeight:600}}>₹{(Number(item.price||0)*(item.quantity||1)).toLocaleString()}</div>
                                    {item.quantity>1&&<div style={{fontSize:10,color:"#5a3a10",fontFamily:"'DM Sans',sans-serif"}}>₹{Number(item.price||0).toLocaleString()} × {item.quantity}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div style={{borderLeft:"1px solid rgba(200,160,74,0.1)",paddingLeft:16}}>
                        <div style={{fontSize:10,color:"#5a3a10",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>Delivery Address</div>
                        {addrData?(
                          <div style={{fontSize:12,color:"#9a7050",fontFamily:"'DM Sans',sans-serif",lineHeight:1.85}}>
                            <div style={{color:"#e8d5a3",fontWeight:600,fontSize:13,marginBottom:3}}>{addrData.name}</div>
                            {addrData.phone&&<div style={{color:"#c8a04a",marginBottom:4}}>📞 {addrData.phone}</div>}
                            {addrData.line1&&<div>{addrData.line1}</div>}
                            {addrData.line2&&<div>{addrData.line2}</div>}
                            {addrData.line3&&<div style={{fontWeight:600,color:"#b8a080"}}>{addrData.line3}</div>}
                          </div>
                        ):(
                          <div style={{fontSize:12,color:"#5a3a10",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>No address saved</div>
                        )}
                        <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(200,160,74,0.1)"}}>
                          <div style={{fontSize:10,color:"#5a3a10",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Order ID</div>
                          <div style={{fontSize:9,color:"#7a5a30",fontFamily:"monospace",wordBreak:"break-all",lineHeight:1.5}}>{o._id}</div>
                          {o.paymentId&&<><div style={{fontSize:10,color:"#5a3a10",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Payment ID</div><div style={{fontSize:9,color:"#7a5a30",fontFamily:"monospace",wordBreak:"break-all"}}>{o.paymentId}</div></>}
                        </div>
                      </div>
                    </div>

                    {/* ✅ TRACKING SECTION — inside orders.map, uses correct variable "o" */}
                    <div style={{marginTop:0,padding:"12px 20px",borderTop:"1px solid rgba(200,160,74,0.1)"}}>
                      {o.trackingNumber ? (
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:14}}>🚚</span>
                            <div>
                              <div style={{fontSize:12,color:"#c8a04a",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
                                {o.courierName||"DTDC"} · {o.trackingNumber}
                              </div>
                              {o.estimatedDelivery&&(
                                <div style={{fontSize:11,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif"}}>
                                  Expected: {o.estimatedDelivery}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:6}}>
                            <a href={o.trackingUrl||`https://www.dtdc.in/trace.asp?txtnbr=${o.trackingNumber}`}
                              target="_blank" rel="noreferrer"
                              style={{fontSize:11,background:"rgba(200,160,74,0.15)",color:"#c8a04a",border:"1px solid rgba(200,160,74,0.3)",padding:"4px 10px",borderRadius:6,textDecoration:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                              Track on DTDC →
                            </a>
                            <button onClick={()=>setTrackingOpen(trackingOpen===o._id?null:o._id)}
                              style={{fontSize:11,background:"transparent",color:"#7a5a30",border:"1px solid rgba(200,160,74,0.2)",padding:"4px 10px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                              Update
                            </button>
                          </div>
                        </div>
                      ):(
                        <button onClick={()=>setTrackingOpen(trackingOpen===o._id?null:o._id)}
                          style={{fontSize:12,background:"rgba(200,160,74,0.1)",color:"#c8a04a",border:"1px solid rgba(200,160,74,0.25)",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                          🚚 Add Tracking / Ship Order
                        </button>
                      )}

                      {/* Tracking form */}
                      {trackingOpen===o._id&&(
                        <div style={{marginTop:12,background:"rgba(200,160,74,0.05)",border:"1px solid rgba(200,160,74,0.2)",borderRadius:8,padding:"14px"}}>
                          <div style={{fontSize:12,color:"#c8a04a",fontWeight:700,marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>🚚 Add Shipping Details</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                            <div>
                              <label style={S.formLabel}>Courier</label>
                              <select value={trackingForm[o._id]?.courierName||"DTDC"}
                                onChange={e=>setTrackingForm({...trackingForm,[o._id]:{...(trackingForm[o._id]||{}),courierName:e.target.value}})}
                                style={{...S.formInput,padding:"7px 10px",fontSize:12}}>
                                {["DTDC","Delhivery","Bluedart","Ekart","India Post","Shadowfax","Xpressbees"].map(c=><option key={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.formLabel}>Tracking Number *</label>
                              <input placeholder="e.g. Z12345678"
                                value={trackingForm[o._id]?.trackingNumber||""}
                                onChange={e=>setTrackingForm({...trackingForm,[o._id]:{...(trackingForm[o._id]||{}),trackingNumber:e.target.value}})}
                                style={{...S.formInput,padding:"7px 10px",fontSize:12}}/>
                            </div>
                            <div style={{gridColumn:"1/-1"}}>
                              <label style={S.formLabel}>Expected Delivery Date</label>
                              <input type="date"
                                value={trackingForm[o._id]?.estimatedDelivery||""}
                                onChange={e=>setTrackingForm({...trackingForm,[o._id]:{...(trackingForm[o._id]||{}),estimatedDelivery:e.target.value}})}
                                style={{...S.formInput,padding:"7px 10px",fontSize:12}}/>
                            </div>
                          </div>
                          <div style={{display:"flex",gap:8,marginTop:10}}>
                            <button onClick={()=>handleAddTracking(o._id)}
                              style={{flex:1,padding:"8px",background:"#c8a04a",color:"#1a1008",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                              ✅ Mark as Shipped
                            </button>
                            <button onClick={()=>setTrackingOpen(null)}
                              style={{padding:"8px 14px",background:"transparent",color:"#7a5a30",border:"1px solid rgba(200,160,74,0.2)",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ USERS TAB ══ */}
        {tab==="users"&&(
          <div style={S.panel}>
            <div style={{marginBottom:20,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9a7050"}}>{users.length} registered users</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {users.map((u)=>(
                <div key={u._id} style={S.userCard}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    {u.photo?<img src={u.photo} alt="" style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(200,160,74,0.3)"}}/>:
                      <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#c8a04a,#8b5e1a)",display:"flex",alignItems:"center",justifyContent:"center",color:"#1a1008",fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>{u.name?.[0]?.toUpperCase()||"?"}</div>}
                    <div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#e8d5a3",fontWeight:600}}>{u.name||"—"}</div>
                      <div style={{fontSize:11,color:"#7a5a30",fontFamily:"'DM Sans',sans-serif"}}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid rgba(200,160,74,0.1)"}}>
                    {[{v:u.loginCount||0,l:"Logins"},{v:fmt(u.lastLogin),l:"Last seen"},{v:fmt(u.createdAt),l:"Joined"}].map((x,i)=>(
                      <div key={i} style={{textAlign:"center"}}>
                        <div style={{fontSize:i===0?18:11,color:"#c8a04a",fontFamily:i===0?"'Playfair Display',serif":"'DM Sans',sans-serif",fontWeight:i===0?600:400}}>{x.v}</div>
                        <div style={{fontSize:10,color:"#5a3a10",fontFamily:"'DM Sans',sans-serif"}}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const S = {
  loginPage:   {minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f0a04",backgroundImage:"radial-gradient(ellipse at 20% 50%,rgba(139,94,26,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(200,160,74,0.1) 0%,transparent 40%)"},
  loginBox:    {background:"#1a1008",border:"1px solid rgba(200,160,74,0.2)",borderRadius:16,padding:"40px 36px",width:360,boxShadow:"0 24px 80px rgba(0,0,0,0.6)"},
  page:        {display:"flex",minHeight:"100vh",background:"#0f0a04",fontFamily:"'DM Sans',sans-serif"},
  sidebar:     {width:220,background:"#140d04",borderRight:"1px solid rgba(200,160,74,0.1)",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"},
  main:        {flex:1,padding:"28px 32px",overflowY:"auto",background:"#0f0a04",backgroundImage:"radial-gradient(ellipse at 80% 0%,rgba(139,94,26,0.08) 0%,transparent 50%)"},
  topbar:      {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24},
  statCard:    {background:"#1a1008",border:"1px solid rgba(200,160,74,0.15)",borderRadius:12,padding:"20px"},
  panel:       {background:"#140d04",border:"1px solid rgba(200,160,74,0.1)",borderRadius:12,padding:"24px"},
  productCard: {background:"#1a1008",border:"1px solid rgba(200,160,74,0.12)",borderRadius:10,overflow:"hidden",transition:"border-color .2s"},
  orderCard:   {background:"#1a1008",border:"1px solid rgba(200,160,74,0.12)",borderRadius:10},
  userCard:    {background:"#1a1008",border:"1px solid rgba(200,160,74,0.12)",borderRadius:10,padding:"16px"},
  addForm:     {background:"#1a1008",border:"1px solid rgba(200,160,74,0.2)",borderRadius:10,padding:"24px",marginBottom:24},
  formLabel:   {display:"block",fontSize:10,fontWeight:600,color:"#7a5a30",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5,fontFamily:"'DM Sans',sans-serif"},
  formInput:   {width:"100%",padding:"9px 12px",fontSize:13,background:"#0f0a04",border:"1px solid rgba(200,160,74,0.2)",borderRadius:6,color:"#e8d5a3",outline:"none",fontFamily:"'DM Sans',sans-serif",transition:"border-color .2s"},
};
