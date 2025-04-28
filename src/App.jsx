import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import existing components
import Register from "./pages/Register";
import LoginForm from "./components/auth/LoginForm";
import SubscriptionPage from "./pages/subscriptions";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/Userprofile";
import ResetPassword from "./pages/ResetPassword";

// Import new components for profile sharing
import ShareProfile from "./components/profile/ShareProfile";
import VerifyShare from "./components/profile/VerifyShare";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Existing Auth Routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />

        {/* Existing App Pages */}
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/Userprofile" element={<ProfilePage />} />

        {/* New Profile Sharing Routes */}
        <Route path="/share-profile" element={<ShareProfile />} />
        <Route path="/verify-profile/:token" element={<VerifyShare />} />
      </Routes>
    </Router>
  );
};

export default App;
