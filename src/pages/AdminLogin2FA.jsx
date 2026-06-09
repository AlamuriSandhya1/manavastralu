// ── HOW TO INTEGRATE 2FA into AdminDashboard.jsx ────────────────
//
// 1. Add this import at the top of AdminDashboard.jsx:
//    import AdminLogin2FA from "./AdminLogin2FA";
//
// 2. Replace the existing state:
//    const [authed, setAuthed] = useState(false);
//    const [password, setPassword] = useState("");
//
//    With:
//    const [authed,   setAuthed]   = useState(false);
//    const [session,  setSession]  = useState("");
//
// 3. Replace the entire LOGIN SCREEN section (if (!authed) return ...)
//    With this:

/*
  if (!authed) return (
    <AdminLogin2FA
      onSuccess={(sessionToken) => {
        setSession(sessionToken);
        setAuthed(true);
        // Load dashboard data
        Promise.all([
          fetch(`${API}/api/admin/users?password=admin123`).then(r => r.json()),
          fetch(`${API}/api/admin/products?password=admin123`).then(r => r.json()),
          fetch(`${API}/api/admin/orders?password=admin123`).then(r => r.json()),
        ]).then(([u, p, o]) => {
          setUsers(u);
          setProducts(p);
          setOrders(o);
        });
      }}
    />
  );
*/

// 4. Add ADMIN_PASS to your .env:
//    ADMIN_PASS=admin123
//    (or whatever password you want)
//
// 5. Add the 2FA routes to server.js (from admin-2fa-route.js)