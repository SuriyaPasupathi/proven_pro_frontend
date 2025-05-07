import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


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
    }
  ];

  const handleSubscribe = (plan) => {
    if (plan.type === 'free') {
      // If Free plan, navigate directly to the profile page
      console.log("Subscribing to free plan, navigating to CreateAccount with type:", plan.type);
      
      // Store in localStorage as a backup
      localStorage.setItem('pending_subscription_type', plan.type);
      
      // Log what we're storing and passing
      console.log("Storing in localStorage:", plan.type);
      console.log("Passing to CreateAccount state:", { subscription_type: plan.type });
      
      // Navigate with state
      navigate("/CreateAccount", { 
        state: { subscription_type: plan.type } 
      });
    } else {
      // For paid plans, initiate payment
      setLoading(true);
      
      // Store the subscription type in localStorage before initiating payment
      localStorage.setItem('pending_subscription_type', plan.type);
      
      initiatePayment(plan);
    }
  };

  const initiatePayment = async (plan) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('You must be logged in to subscribe');
      navigate('/login');
      return;
    }
    
    try {
      // Handle paid subscription with GCash via PayMongo
      console.log(`Initiating GCash payment for: ${plan.type} plan ($${plan.price})`);
      
      const response = await axios.post(
        'http://localhost:8000/api/create-gcash-payment/',
        { subscription_type: plan.type },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Store subscription type in localStorage for later use
      localStorage.setItem('pending_subscription_type', plan.type);
      
      // Redirect to checkout URL
      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      alert('Failed to initiate payment. Please try again.');
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
        <p className="text-gray-600 italic">Choose the plan that's right for you</p>
      </div>
      
      {/* Plans section */}
      <div className="max-w-screen-lg mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow-md overflow-hidden ${
              plan.popular ? 'border-2 border-blue-500 relative' : ''
            }`}
          >
            {plan.popular && (
              <div className="bg-blue-500 text-white text-xs font-bold uppercase py-1 px-2 absolute top-0 right-0">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="text-4xl font-bold mb-6">
                {plan.price === "Free" ? "Free" : `$${plan.price}`}
                {plan.price !== "Free" && <span className="text-base font-normal text-gray-600">/month</span>}
              </div>
              
              <div className="mb-6">
                <p className="font-medium mb-2">Includes:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon />
                      <span className="ml-2">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                  plan.type === 'free'
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {plan.type === 'free' ? 'Sign Up Now' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionPage;
