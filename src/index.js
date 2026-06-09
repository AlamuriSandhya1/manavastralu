import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="983841101208-3sdc0kov506djs96hf3bu0g9j9779db5.apps.googleusercontent.com">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);