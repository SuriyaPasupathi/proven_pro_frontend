import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validations, setValidations] = useState({
    length: false,
    specialChar: false,
    containsNumber: false,
    containsLetter: false
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get UID and token from the URL query parameters
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  // Validate password on change
  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      containsNumber: /\d/.test(password),
      containsLetter: /[a-zA-Z]/.test(password)
    });
  }, [password]);

  // Check if all validations pass
  const isValidPassword = Object.values(validations).every(Boolean);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Check if passwords match
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    // Check if password meets all requirements
    if (!isValidPassword) {
      setError("Password does not meet all requirements.");
      return;
    }

    try {
      // Make POST request to API to reset the password
      const res = await axios.post("http://localhost:8000/api/reset-password-confirm/", {
        uid,
        token,
        new_password: password,
      });

      // Show success message
      setMessage("Password reset successful.");

      // Redirect to login page after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Show error message if something goes wrong
      setError(err.response?.data?.error || "Reset failed. Invalid or expired link.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Title and Subtitle */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Set new password</h1>
        <p className="text-center text-gray-600 mb-6">
          Your new password must be different to previously used passwords.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              id="confirm-password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {/* Password Requirements */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${validations.length ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Must be at least 8 characters</span>
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${validations.specialChar ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Must contain one special character</span>
            </div>
           
           
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2 rounded-md font-medium hover:bg-gray-800 transition duration-300 mb-6"
            disabled={!isValidPassword || !confirm}
          >
            Reset your password
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm text-gray-800 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to log in
            </button>
          </div>
        </form>

        {/* Success/Error Messages */}
        {message && <p className="mt-4 text-green-600 text-center text-sm">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;