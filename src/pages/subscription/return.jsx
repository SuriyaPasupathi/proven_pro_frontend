import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SubscriptionReturn = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your payment...');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const sourceId = queryParams.get('source_id');
    
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setStatus('error');
          setMessage('Authentication error. Please log in again.');
          return;
        }
        
        // Get transaction details from localStorage
        const pendingTransaction = JSON.parse(localStorage.getItem('pending_transaction') || '{}');
        
        if (success === 'true' && sourceId) {
          setStatus('success');
          setMessage(`Payment successful! Your ${pendingTransaction.planName || 'subscription'} has been activated.`);
          
          // Clear pending transaction
          localStorage.removeItem('pending_transaction');
          
          // Redirect directly to profile creation
          setTimeout(() => {
            navigate('/CreateAccount', {
              state: { 
                subscription_type: pendingTransaction.subscription_type || 'premium'
              }
            });
          }, 2000);
        } else {
          setStatus('failed');
          setMessage('Payment was not completed. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment. Please contact support.');
      }
    };
    
    verifyPayment();
  }, [location, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 p-2 rounded-full inline-block mb-4">
              <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button 
              onClick={() => navigate('/CreateAccount')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
            >
              Create Profile
            </button>
          </div>
        )}
        
        {(status === 'failed' || status === 'error') && (
          <div className="text-center">
            <div className="bg-red-100 p-2 rounded-full inline-block mb-4">
              <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button 
              onClick={() => navigate('/subscription')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionReturn;


