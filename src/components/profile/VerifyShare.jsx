import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, Star, User } from "lucide-react";

const VerifyShare = () => {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '', reviewer_name: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/verify-share/${token}/`);
        setProfile(response.data.profile);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired link');
      }
    };

    fetchProfile();
  }, [token]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/submit-review/${token}/`, review);
      setMessage('Review submitted successfully!');
      setReview({ rating: 5, comment: '', reviewer_name: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const renderProfileDetails = () => {
    if (!profile) return null;

    // Free subscription (3 details)
    const freeDetails = (
      <div className="space-y-4">
        <div className="flex flex-col items-center md:items-start">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-green-500 mb-4 shadow-md">
            <img
              src={profile.profile_pic ? `http://localhost:8000${profile.profile_pic}` : "https://i.pravatar.cc/150"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
          <p className="text-gray-600">{profile.job_title || "No title provided"}</p>
        </div>
      </div>
    );

    // Basic subscription
    const basicDetails = (profile.subscription_type === 'basic' || profile.subscription_type === 'standard' || profile.subscription_type === 'PREMIUM') && (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Professional Details</h3>
          <div className="flex items-center gap-3 mb-2 text-gray-700">
            <Briefcase className="w-5 h-5 text-green-600" />
            <span className="font-medium">Job Title:</span>
            <span>{profile.job_title || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">Specialization:</span>
            <span>{profile.job_specialization || "Not specified"}</span>
          </div>
        </div>
      </div>
    );

    // Standard subscription
    const standardDetails = (profile.subscription_type === 'standard' || profile.subscription_type === 'premium') && (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Contact Information</h3>
          <p><strong>Email:</strong> {profile.email || "Not provided"}</p>
          <p><strong>Mobile:</strong> {profile.mobile || "Not provided"}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Professional Background</h3>
          <p><strong>Services:</strong> {profile.services || "Not provided"}</p>
          <p><strong>Experiences:</strong> {profile.experiences || "Not provided"}</p>
          <p><strong>Skills:</strong> {profile.skills || "Not provided"}</p>
          <p><strong>Tools:</strong> {profile.tools || "Not provided"}</p>
        </div>
      </div>
    );

    // Premium subscription
    const premiumDetails = profile.subscription_type === 'premium' && (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Education & Credentials</h3>
          <p><strong>Education:</strong> {profile.education || "Not provided"}</p>
          <p><strong>Certifications:</strong> {profile.certifications || "Not provided"}</p>
          <p><strong>Portfolio:</strong> {profile.portfolio || "Not provided"}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Additional Features</h3>
          {profile.video_intro && (
            <div className="mt-3">
              <strong>Video Introduction:</strong>
              <video 
                src={`http://localhost:8000${profile.video_intro}`} 
                controls 
                className="w-full mt-2 rounded" 
              />
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="bg-white rounded-xl shadow-lg p-10">
        {freeDetails}
        {basicDetails}
        {standardDetails}
        {premiumDetails}
        
        <div className={`mt-6 inline-block px-3 py-1 rounded-full text-sm font-semibold
          ${profile.subscription_type === 'PREMIUM' ? 'bg-purple-100 text-purple-800' : 
            profile.subscription_type === 'STANDARD' ? 'bg-green-100 text-green-800' :
            profile.subscription_type === 'BASIC' ? 'bg-blue-100 text-blue-800' : 
            'bg-gray-100 text-gray-800'}`}>
          {profile.subscription_type || 'free'} Profile
        </div>
      </div>
    );
  };

  const renderReviewForm = () => (
    <form onSubmit={handleSubmitReview} className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
      <div className="mb-4">
        <label className="block mb-2">Your Name:</label>
        <input
          type="text"
          value={review.reviewer_name}
          onChange={(e) => setReview({...review, reviewer_name: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Rating:</label>
        <select
          value={review.rating}
          onChange={(e) => setReview({...review, rating: parseInt(e.target.value)})}
          className="w-full p-2 border rounded"
        >
          {[5,4,3,2,1].map(num => (
            <option key={num} value={num}>{num} Stars</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Comment:</label>
        <textarea
          value={review.comment}
          onChange={(e) => setReview({...review, comment: e.target.value})}
          className="w-full p-2 border rounded"
          rows="4"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit Review
      </button>
    </form>
  );

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Professional Profile</h2>
        {renderProfileDetails()}
        {renderReviewForm()}
        {message && <div className="mt-4 text-green-600">{message}</div>}
      </div>
    </div>
  );
};

export default VerifyShare;
