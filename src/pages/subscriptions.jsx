import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function SubscriptionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Reordering plans in logical order: Free, Standard, Premium
  const plans = [
    {
      name: "Basic",
      price: "Free",
      type: "free",
      popular: false,
      features: [
        "Profile Name and Image",
        "Review Ratings",
        "Job Title and Job Specialization",
        "Client's Previous Reviews",
        "Copy URL Link"
      ]
    },
    {
      name: "Premium",
      price: "20",
      type: "premium",
      popular: true,
      features: [
        "Profile Name and Image",
        "Review Ratings",
        "Job Title and Job Specialization",
        "Client's Previous Reviews",
        "Copy URL Link",
        "Email, Mobile and Social Media Link",
        "Displays Services, Experiences, Skills and Tools",
        "Displays Education and Certifications",
        "Video Introduction",
        "Exhibit Portfolio / Previous Works"
      ]
    },
    {
      name: "Standard",
      price: "10",
      type: "standard",
      popular: false,
      features: [
        "Profile Name and Image",
        "Review Ratings",
        "Job Title and Job Specialization",
        "Client's Previous Reviews",
        "Copy URL Link",
        "Email, Mobile and Social Media Link",
        "Displays Services, Experiences, Skills and Tools"
      ]
    }
  ];

  const handleSubscription = async (plan) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        navigate("/login", { 
          state: { 
            from: '/subscription', 
            plan: plan.type,
            returnUrl: '/subscription'
          } 
        });
        return;
      }

      if (plan.type === 'free') {
        const response = await axios.post(
          'http://localhost:8000/api/update-subscription/',
          { subscription_type: plan.type },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.has_profile) {
          navigate("/profile");
        } else {
          navigate("/CreateAccount", { 
            state: { subscription_type: plan.type } 
          });
        }
      } else {
        // Handle paid subscription
        try {
          console.log('Initiating payment for:', plan.type);
          const response = await axios.post(
            'http://localhost:8000/api/create-payment-intent/',
            { subscription_type: plan.type },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('Payment response:', response.data);
          const stripe = await loadStripe(response.data.publicKey);
          const { error } = await stripe.redirectToCheckout({
            sessionId: response.data.sessionId
          });

          if (error) {
            console.error('Stripe error:', error);
            setError(error.message);
          }
        } catch (err) {
          console.error('Payment error:', err);
          if (err.response?.data?.code === 'token_not_valid') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate("/login", { 
              state: { 
                from: '/subscription', 
                plan: plan.type,
                returnUrl: '/subscription'
              } 
            });
            return;
          }
          throw err;
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.message || 'An error occurred during subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Error notification */}
      {error && (
        <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Header section */}
      <div className="text-center pt-16 pb-8 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Ready to START?</h1>
        <p className="text-gray-600 italic">Sed eiusmod tempor incidunt ut labore et dolore magna aliqua.</p>
      </div>
      
      {/* Plans section */}
      <div className="max-w-screen-lg mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <div className="bg-white rounded shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Basic</h2>
            <div className="text-4xl font-bold mb-6">Free</div>
            
            <div className="mb-4">
              <p className="font-medium mb-2">Includes:</p>
              <ul className="space-y-2">
                {plans[0].features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <button
              onClick={() => handleSubscription(plans[0])}
              disabled={loading}
              className="w-full py-3 border border-gray-800 text-gray-800 font-semibold rounded hover:bg-gray-100 transition duration-200"
            >
              Sign Up Now
            </button>
          </div>
        </div>
        
        {/* Premium Plan - Best Choice */}
        <div className="bg-white rounded shadow-md overflow-hidden border-t-4 border-gray-700">
          <div className="bg-gray-700 text-white text-center py-2 font-semibold">
            Best Choice
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Premium</h2>
            <div className="flex items-baseline mb-6">
              <span className="text-sm mr-1">USD</span>
              <span className="text-4xl font-bold">20</span>
              <span className="text-sm">/annually</span>
            </div>
            
            <div className="mb-4">
              <p className="font-medium mb-2">Includes:</p>
              <ul className="space-y-2">
                {plans[1].features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <button
              onClick={() => handleSubscription(plans[1])}
              disabled={loading}
              className="w-full py-3 bg-gray-800 text-white font-semibold rounded hover:bg-gray-800 transition duration-200"
            >
              Sign Up Now
            </button>
          </div>
        </div>
        
        {/* Standard Plan */}
        <div className="bg-white rounded shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Standard</h2>
            <div className="flex items-baseline mb-6">
              <span className="text-sm mr-1">USD</span>
              <span className="text-4xl font-bold">10</span>
              <span className="text-sm">/annually</span>
            </div>
            
            <div className="mb-4">
              <p className="font-medium mb-2">Includes:</p>
              <ul className="space-y-2">
                {plans[2].features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <button
              onClick={() => handleSubscription(plans[2])}
              disabled={loading}
              className="w-full py-3 border border-gray-800 text-gray-800 font-semibold rounded hover:bg-gray-100 transition duration-200"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;