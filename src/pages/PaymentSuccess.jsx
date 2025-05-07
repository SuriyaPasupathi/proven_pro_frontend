import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const sourceId = searchParams.get('source_id');
    
    // Handle different payment methods
    if (sessionId) {
      // Legacy Stripe payment
      verifyStripePayment(sessionId);
    } else if (sourceId) {
      // GCash payment - redirect to dedicated success page
      navigate(`/subscription/success?source_id=${sourceId}`);
    } else {
      setStatus('error');
    }
  }, [searchParams, navigate]);
  
  const verifyStripePayment = async (sessionId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/api/verify-payment/',
        { session_id: sessionId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setStatus('success');
        // Redirect to profile creation or profile page
        setTimeout(() => {
          if (response.data.has_profile) {
            navigate('/Userprofile');
          } else {
            const subscriptionType = response.data.subscription_type;
            console.log("Redirecting to CreateAccount with subscription type:", subscriptionType);
            
            // Store in localStorage as a backup
            // localStorage.setItem('pending_subscription_type', subscriptionType);
            
            navigate('/CreateAccount', {
              state: { subscription_type: subscriptionType }

            
            });
          }
        }, 2000); 
      }
    } catch (error) {
      setStatus('error');
    }
    console.log(subscription_type)
    console.log(subscriptionType)
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Processing Your Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated. You will be redirected shortly.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Payment Error
            </h2>
            <p>Please contact support if the problem persists.</p>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
