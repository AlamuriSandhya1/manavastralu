import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CartToast } from "./components/CartToast";
import OrderSuccess    from "./pages/OrderSuccess";
import AdminDashboard  from "./pages/AdminDashboard";
import TopBar          from "./components/TopBar";
import Navbar          from "./components/Navbar";
import BrandIntro      from "./components/BrandIntro";
import ProductList     from "./components/ProductList";
import FeaturesBar     from "./components/FeaturesBar";
import Footer          from "./components/Footer";
import ChatBotFAQ      from "./components/ChatBotFAQ";
import EmailVerify     from "./pages/EmailVerify";
import ForgotPassword  from "./pages/ForgotPassword";
import Wishlist        from "./pages/Wishlist";
import Cart            from "./pages/Cart";
import ProductDetails  from "./pages/ProductDetails";
import Checkout        from "./pages/Checkout";
import AddProduct      from "./pages/AddProduct";
import Payment         from "./pages/Payment";
import MyOrders        from "./pages/MyOrders";

// ── Protected Route ──────────────────────────────────────────
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  const role  = localStorage.getItem("userRole");
  if (!token && role !== "guest") return <Navigate to="/" replace />;
  return children;
}

const HIDE_LAYOUT_ON = ["/", "/forgot-password", "/admin"];

// ── App ──────────────────────────────────────────────────────
function App() {
  const location   = useLocation();
  const hideLayout = HIDE_LAYOUT_ON.includes(location.pathname);

  const [columns]  = useState(5);
  const [sortType] = useState("best");
  const [filters]  = useState({ price: [], fabric: [], color: [], type: [] });

  // Wishlist — persisted to localStorage
  const [wishlist, setWishlistRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wishlist")) || []; }
    catch { return []; }
  });
  const setWishlist = (val) => {
    const next = typeof val === "function" ? val(wishlist) : val;
    setWishlistRaw(next);
    localStorage.setItem("wishlist", JSON.stringify(next));
  };

  // Cart — persisted to localStorage
  const [cartItems, setCartItemsRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cartItems")) || []; }
    catch { return []; }
  });
  const setCartItems = (val) => {
    const next = typeof val === "function" ? val(cartItems) : val;
    setCartItemsRaw(next);
    localStorage.setItem("cartItems", JSON.stringify(next));
  };

  const cartCount = cartItems.length;
  const wishCount = wishlist.length;

  useEffect(() => {
    axios.get("http://localhost:8000/users")
      .then(res => console.log("Users:", res.data))
      .catch(err => console.log("Backend error:", err));
  }, []);

  return (
    <>
      {!hideLayout && <TopBar />}
      {!hideLayout && <Navbar cartCount={cartCount} wishCount={wishCount} />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/"                element={<EmailVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ADMIN — no navbar */}
        <Route path="/admin"           element={<AdminDashboard />} />

        {/* HOME */}
        <Route path="/home" element={
          <ProtectedRoute>
            <>
              <BrandIntro />
              <ProductList
                columns={columns}
                sortType={sortType}
                filters={filters}
                wishlist={wishlist}
                setWishlist={setWishlist}
                cartItems={cartItems}
                setCartItems={setCartItems}
              />
              <FeaturesBar />
            </>
          </ProtectedRoute>
        } />

        {/* PRODUCT DETAILS */}
        <Route path="/product/:id" element={
          <ProtectedRoute>
            <ProductDetails
              wishlist={wishlist}
              setWishlist={setWishlist}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          </ProtectedRoute>
        } />

        {/* WISHLIST */}
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist
              wishlist={wishlist}
              setWishlist={setWishlist}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          </ProtectedRoute>
        } />

        {/* CART */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart cartItems={cartItems} setCartItems={setCartItems} />
          </ProtectedRoute>
        } />

        {/* CHECKOUT */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout cartItems={cartItems} setCartItems={setCartItems} />
          </ProtectedRoute>
        } />

        {/* PAYMENT */}
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment cartItems={cartItems} setCartItems={setCartItems} />
          </ProtectedRoute>
        } />

        {/* ORDER SUCCESS */}
        <Route path="/order-success" element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        } />

        {/* MY ORDERS */}
        <Route path="/my-orders" element={
          <ProtectedRoute><MyOrders /></ProtectedRoute>
        } />

        {/* ADD PRODUCT */}
        <Route path="/add-product" element={
          <ProtectedRoute><AddProduct /></ProtectedRoute>
        } />

        {/* CATCH ALL — always last */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ✅ CartToast OUTSIDE Routes — renders toast popups globally */}
      <CartToast />

      {!hideLayout && <ChatBotFAQ />}
      {!hideLayout && <Footer />}
    </>
  );
}

export default App;