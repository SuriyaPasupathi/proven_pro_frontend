import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const SubscriptionSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Finalizing your subscription...');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setMessage('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }
        
        // Get source ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sourceId = urlParams.get('source_id');
        
        if (!sourceId) {
          setMessage('Payment information missing. Please try again.');
          setLoading(false);
          return;
        }
        
        // Get transaction details from localStorage
        const pendingTransaction = JSON.parse(localStorage.getItem('pending_transaction') || '{}');
        
        // Check if user has a profile
        try {
          await axios.get('http://localhost:8000/api/profile_status/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // If we get here, the profile exists
          setMessage(`Your ${pendingTransaction.planName || 'subscription'} has been activated successfully!`);
          
          // Clear pending transaction
          localStorage.removeItem('pending_transaction');
          
          // Redirect to profile page
          setTimeout(() => {
            navigate('/Userprofile');
          }, 2000);
          
        } catch (profileError) {
          // Profile doesn't exist or there was an error
          console.log('Profile check error:', profileError);
          
          // Redirect to create account page
          setMessage('Your payment was successful! Setting up your profile...');
          
          // Clear pending transaction
          localStorage.removeItem('pending_transaction');
          
          // Redirect to profile creation
          setTimeout(() => {
            // Make sure we're passing the subscription type correctly
            const subscriptionType = pendingTransaction.subscription_type || 'premium';
            console.log("Redirecting to CreateAccount with subscription type:", subscriptionType);
            
            // Store in localStorage as a backup
            localStorage.setItem('pending_subscription_type', subscriptionType);
            
            // Use navigate with state to pass the subscription type
            navigate('/CreateAccount', {
              state: { 
                subscription_type: subscriptionType
              }
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setMessage('An error occurred while verifying your subscription. Please contact support.');
      } finally {
        setLoading(false);
      }
    };
    
    verifySubscription();
  }, [navigate, location]);
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        ) : (
          <div className="bg-green-100 p-2 rounded-full inline-block mb-4">
            <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        <h2 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        
        <button 
          onClick={() => navigate('/CreateAccount')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
        >
          Create Profile
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;




