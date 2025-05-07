import React from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

// Import existing components
import Register from "./pages/Register";
import LoginForm from "./components/auth/LoginForm";
import SubscriptionPage from "./pages/subscriptions";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/Userprofile";
import ResetPassword from "./pages/ResetPassword";
import SubscriptionSucces from "./pages/subscription/success";  
import SubscriptionReturn from "./pages/subscription/return";

// Import new components for profile sharing
import ShareProfile from "./components/profile/ShareProfile";
import VerifyShare from "./components/profile/VerifyShare";
import PaymentSuccess from "./pages/PaymentSuccess";

// Create a router with future flags enabled
const router = createBrowserRouter([
  { path: "/", element: <Register /> },
  { path: "/login", element: <LoginForm /> },
  { path: "/ForgotPassword", element: <ForgotPassword /> },
  { path: "/ResetPassword", element: <ResetPassword /> },
  { path: "/CreateAccount", element: <CreateAccount /> },
  { path: "/subscription/success", element: <SubscriptionSucces /> },
  { path: "/subscription/return", element: <SubscriptionReturn /> },
  { path: "/subscription", element: <SubscriptionPage /> },
  { path: "/Userprofile", element: <ProfilePage /> },
  { path: "/share-profile", element: <ShareProfile /> },
  { path: "/verify-profile/:token", element: <VerifyShare /> },
  { path: "/payment-sucess", element: <PaymentSuccess /> },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const App = () => {
  // Use the new RouterProvider for React Router v6.4+
  return <RouterProvider router={router} />;
  
  // Alternatively, keep using the old approach if you prefer
  /*
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/subscription/success" element={<SubscriptionSucces />} />
        <Route path="/subscription/return" element={<SubscriptionReturn />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/Userprofile" element={<ProfilePage />} />
        <Route path="/share-profile" element={<ShareProfile />} />
        <Route path="/verify-profile/:token" element={<VerifyShare />} />
        <Route path="/payment-sucess" element={<PaymentSuccess />} />
      </Routes>
    </Router>
  );
  */
};

export default App;
