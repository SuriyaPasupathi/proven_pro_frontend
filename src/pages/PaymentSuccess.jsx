import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Verify payment status with backend
      const verifyPayment = async () => {
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
                navigate('/profile');
              } else {
                navigate('/CreateAccount', {
                  state: { subscription_type: response.data.subscription_type }
                });
              }
            }, 2000);
          }
        } catch (error) {
          setStatus('error');
        }
      };

      verifyPayment();
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {status === 'processing' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Processing your payment...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Payment Successful!
          </h2>
          <p>Redirecting to your account...</p>
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
  );
}

export default PaymentSuccess;