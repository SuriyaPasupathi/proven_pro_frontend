import React, { useState } from 'react';
import axios from 'axios';

const ShareProfile = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://localhost:8000/api/share-profile/',
        { email },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage('Share link sent successfully!');
      setEmail('');
      setError('');
    } catch (err) {
      setError('Failed to share profile. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Share Your Profile</h2>
      <form onSubmit={handleShare}>
        <div className="mb-4">
          <label className="block mb-2">Recipient Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Share Profile
        </button>
      </form>
      {message && <div className="mt-4 text-green-600">{message}</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
};

export default ShareProfile;