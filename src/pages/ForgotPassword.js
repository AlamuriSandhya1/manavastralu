import React, { useState } from "react";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // later backend will send real mail
    if (email !== "") {
      setSent(true);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-box">
        <h2>Password Recovery</h2>

        {sent ? (
          <>
            <p style={{color:"green", marginBottom:"15px"}}>
              Recovery link sent successfully 📩
            </p>
            <p>Please check your email inbox.</p>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="auth-btn" onClick={handleSubmit}>
              Send Recovery Mail
            </button>
          </>
        )}

      </div>

    </div>
  );
}
