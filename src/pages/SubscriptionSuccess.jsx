import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function SubscriptionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const verifyPayment = async () => {
      const token = localStorage.getItem('access_token');
      const sourceId = new URLSearchParams(location.search).get('source_id');
      const subscriptionType = localStorage.getItem('pending_subscription_type') || 'standard';
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setVerifying(false);
        return;
      }
      
      if (!sourceId) {
        setError('Payment information missing. Please try again.');
        setVerifying(false);
        return;
      }
      
      try {
        const response = await axios.post(
          'http://localhost:8000/api/verify-payment/',
          { 
            source_id: sourceId,
            subscription_type: subscriptionType 
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          // Payment verified successfully
          setVerifying(false);

          const verifiedSubscriptionType = response.data.subscription_type || subscriptionType;
          console.log("Payment verified. Subscription type:", verifiedSubscriptionType);

          // Store in localStorage as a backup
          localStorage.setItem('pending_subscription_type', verifiedSubscriptionType);

          // Navigate to create account with subscription type
          navigate('/CreateAccount', { 
            state: { 
              subscription_type: verifiedSubscriptionType,
              payment_verified: true 
            } 
          });
        } else {
          setError('Payment verification failed. Please contact support.');
          setVerifying(false);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError('An error occurred during payment verification.');
        setVerifying(false);
      }
    };
    
    verifyPayment();
  }, [location, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {verifying ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Verifying Payment</h2>
            <p className="mb-4">Please wait while we verify your payment...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Error</h2>
            <p className="mb-6">{error}</p>
            <button 
              onClick={() => navigate('/subscription')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SubscriptionSuccess;

