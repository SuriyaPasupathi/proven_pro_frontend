import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        email: form.email,
        password: form.password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      const { state } = location;
      if (state?.from === '/subscription' && state?.plan) {
        navigate('/subscription', {
          state: {
            selectedPlan: state.plan,
            returnUrl: state.returnUrl,
          },
        });
        return;
      }

      const profileRes = await axios.get('http://localhost:8000/api/profile_status/', {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const { has_profile } = profileRes.data;

      if (has_profile) {
        navigate('/Userprofile');
      } else {
        navigate('/subscription');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-100 to-indigo-200 flex flex-col justify-center items-center px-8">
        
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 text-white text-xl font-bold rounded-full flex items-center justify-center mr-3">
            P
          </div>
          <span className="text-3xl font-extrabold text-gray-800">
            Proven<span className="text-gray-600">Pro</span>
          </span>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold text-gray-700 mb-2">Welcome back!</h2>
        <p className="text-gray-600 mb-6 text-sm">Login to continue your journey with us.</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="enter email address"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-sm text-gray-700">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate('/ForgotPassword')}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
          >
            Log in
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            className="w-full flex items-center justify-center border border-gray-400 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            <img
              src="./src/assets/search.png"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            Sign in with Google
          </button>

          {/* Register */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Register
            </button>
          </div>
        </form>
      </div>

      {/* Right Side (empty) */}
      <div className="hidden md:block w-1/2 bg-white"></div>
    </div>
  );
};

export default LoginForm;
