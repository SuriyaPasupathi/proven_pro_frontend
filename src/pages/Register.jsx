import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('green');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[\W_]/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasSpecialChar;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live password validation
    if (name === 'password') {
      if (!validatePassword(value)) {
        setMessage('❌ Password must be 8+ characters, include uppercase, lowercase, and special character.');
        setMessageColor('red');
      } else {
        setMessage('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      setMessage('❌ Password must be 8+ characters, include uppercase, lowercase, and special character.');
      setMessageColor('red');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match.');
      setMessageColor('red');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Account created successfully! Redirecting...');
        setMessageColor('green');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorMsg = Object.values(data).flat().join(' | ');
        setMessage(`❌ ${errorMsg}`);
        setMessageColor('red');
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('❌ Something went wrong.');
      setMessageColor('red');
    }
  };
  
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      console.log("Google response:", credentialResponse);
      
      // Send the token to your backend
      const response = await axios.post('http://127.0.0.1:8000/api/google-auth/', {
        token: credentialResponse.credential
      });

      console.log("Backend response:", response.data);
      
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      // Since this is the Register page, always redirect to subscription
      // This ensures new users go through the subscription flow
      setMessage('✅ Account created! Redirecting to subscription page...');
      setMessageColor('green');
      setTimeout(() => {
        navigate('/subscription');
      }, 1500);
    } catch (error) {
      console.error('Google login error:', error);
      setMessage(`❌ Google login failed: ${error.response?.data?.error || 'Unknown error'}`);
      setMessageColor('red');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-1/2 bg-[#3C5A78] flex flex-col justify-center items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-md p-2">
            <div className="w-8 h-8 bg-[#3C5A78] rounded-full flex items-center justify-center font-bold text-white">P</div>
          </div>
          <h1 className="text-white text-3xl font-bold">Proven<span className="font-normal">Pro</span></h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-b from-white to-blue-50 p-8">
        <div className="w-full max-w-md bg-transparent space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">Sign up</h2>
          <p className="text-sm text-gray-500 mb-6">Create your free account</p>

          {message && (
            <p className={`text-sm text-center font-medium ${messageColor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3C5A78] focus:border-[#3C5A78]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3C5A78] focus:border-[#3C5A78]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3C5A78] focus:border-[#3C5A78]"
              />
              <div className="text-xs text-gray-500 mt-1 ml-1 space-y-1">
                <p>• At least 8 characters</p>
                <p>• One uppercase & lowercase letter</p>
                <p>• One special character</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3C5A78] focus:border-[#3C5A78]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#3C5A78] text-white py-2 rounded-md hover:bg-[#2c4459] transition duration-300 font-medium"
            >
              Register
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Sign-in */}
          <div className="mt-4">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log('Google Login Failed');
                setMessage('❌ Google login failed');
                setMessageColor('red');
              }}
              useOneTap
              theme="outline"
              text="signup_with"
              shape="rectangular"
              logo_alignment="center"
              width="100%"
            />
          </div>

          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3C5A78] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
