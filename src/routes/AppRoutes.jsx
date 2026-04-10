import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Public pages
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import TermsAndConditions from "../pages/TermsAndConditions.jsx";

// Protected pages
import Dashboard from "../pages/Dashboard.jsx";
import Deposit from "../pages/Deposit.jsx";
import Withdraw from "../pages/Withdraw.jsx";
import Tasks from "../pages/Tasks.jsx";
import VIP from "../pages/VIP.jsx";
import Profile from "../pages/Profile.jsx";
import About from "../pages/About.jsx";
import Events from "../pages/Events.jsx";
import FAQ from "../pages/FAQ.jsx";
import WalletBinding from "../pages/WalletBinding.jsx";
import Certificate from "../pages/Certificate.jsx";
import Records from "../pages/Records.jsx";
import PersonalInfo from "../pages/PersonalInfo.jsx";
import BindWallet from "../pages/BindWallet.jsx";
import Notifications from "../pages/Notifications.jsx";
import Premium from "../pages/Premium.jsx"; // added Premium page import

// Password update pages
import UpdatePassword from "../pages/UpdatePassword.jsx";
import UpdateWithdrawPassword from "../pages/UpdateWithdrawPassword.jsx";

// Protected route wrapper
import ProtectedRoute from "../components/ProtectedRoute.jsx";

// Bottom navigation (new)
import BottomNav from "../components/BottomNav.jsx";

export default function AppRoutes() {
  console.log("Rendering AppRoutes...");

  // Component rendered inside Router so useLocation can be used here.
  function NavVisibility() {
    const location = useLocation();
    const path = location?.pathname || "";

    // Paths where BottomNav should be hidden
    const hidePaths = [
      "/login",
      "/register",
      "/terms",
      "/update-password",
      "/update-withdraw-password",
      "/", // root redirect - keep hidden
    ];

    // Also hide on exact matches of the public routes above.
    // If you want more complex rules (prefixes etc.) adjust here.
    const shouldHide = hidePaths.includes(path);

    return shouldHide ? null : <BottomNav />;
  }

  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<TermsAndConditions />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/vip" element={<ProtectedRoute><VIP /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
        <Route path="/wallet-binding" element={<ProtectedRoute><WalletBinding /></ProtectedRoute>} />
        <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
        <Route path="/personal-info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
        <Route path="/bind-wallet" element={<ProtectedRoute><BindWallet /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} /> {/* added Premium route */}

        {/* Password update routes */}
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/update-withdraw-password" element={<UpdateWithdrawPassword />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      {/* Render BottomNav conditionally inside Router using current location */}
      <NavVisibility />
    </Router>
  );
}