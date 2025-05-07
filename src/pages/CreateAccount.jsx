import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Add loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [subscriptionType, setSubscriptionType] = useState('free');
  const [formData, setFormData] = useState({
    name: '',
    job_title: '',
    job_specialization: '',
    profile_pic: null,
    email: '',
    mobile: '',
    services: '',
    experiences: '',
    skills: '',
    tools: '',
    education: '',
    certifications: '',
    portfolio: '',
    video_intro: null
  });

  useEffect(() => {
    // Log all possible sources of subscription type
    console.log("Component mounted. Checking subscription type sources:");
    console.log("1. Location state:", location.state);
    console.log("2. localStorage pending_subscription_type:", localStorage.getItem('pending_subscription_type'));
    
    let type = 'free'; // Default to free
    
    // Check if we have subscription type from location state
    if (location.state && location.state.subscription_type) {
      console.log("Using subscription type from location state:", location.state.subscription_type);
      type = location.state.subscription_type;
    } else {
      // If no subscription type in location state, check localStorage
      const pendingType = localStorage.getItem('pending_subscription_type');
      if (pendingType) {
        console.log("Using subscription type from localStorage:", pendingType);
        type = pendingType;
      } else {
        console.log("No subscription type found, using default 'free'");
      }
    }
    
    // Set the subscription type in state
    setSubscriptionType(type);
    
    // Also set it in the form data
    setFormData(prev => ({
      ...prev,
      subscription_type: type
    }));
    
    // Try to pre-fill email from localStorage if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
    
    // Don't clear localStorage here, we'll do it after successful form submission
  }, [location]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('You must be logged in to create a profile');
      setLoading(false);
      navigate('/login');
      return;
    }

    // Create a new FormData object
    const form = new FormData();
    
    // Add all form data fields
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '') {
        form.append(key, formData[key]);
      }
    }
    
    // Explicitly add the subscription type
    form.append('subscription_type', subscriptionType);

    // Log what we're sending to the server
    console.log("Submitting form with subscription_type:", subscriptionType);
    console.log("Form data subscription_type:", form.get('subscription_type'));

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/createaccount/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`
        }
      });

      console.log('Account Created:', response.data);
      
      // Clear localStorage only after successful submission
      localStorage.removeItem('pending_subscription_type');
      
      setLoading(false);
      alert('Profile created successfully!');
      navigate('/Userprofile');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setLoading(false);
      
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === 'token_not_valid'
      ) {
        alert ('Your session has expired. Please log in again.');
        // setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to create profile. Please try again.');
      }
    }
  };

  // Determine which subscription plan the user has based on subscriptionType
  const isPremium = subscriptionType === 'premium';
  const isStandard = subscriptionType === 'standard' || isPremium;

  // Add console logs to debug subscription type
  // console.log("Current subscription type:", subscriptionType);
  // console.log("isPremium:", isPremium);
  // console.log("isStandard:", isStandard);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-center capitalize text-blue-700">
        {subscriptionType} Plan - Create Your Profile
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-md">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <p className="text-blue-800 font-medium">
          <span className="font-bold">Subscription Type:</span> {subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)} Plan
        </p>
        {isPremium && (
          <p className="text-green-700 mt-2">You have access to all premium features!</p>
        )}
        {isStandard && !isPremium && (
          <p className="text-green-700 mt-2">You have access to all standard features!</p>
        )}
        {!isStandard && !isPremium && (
          <p className="text-gray-700 mt-2">You are using the free plan. Upgrade anytime for more features!</p>
        )}
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-2 p-2 bg-gray-100 text-xs">
            <p>Debug: subscription_type = {subscriptionType}</p>
            <p>Location state: {JSON.stringify(location.state)}</p>
            <p>localStorage: {localStorage.getItem('pending_subscription_type')}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
        <Input label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} />
        <Input label="Job Specialization" name="job_specialization" value={formData.job_specialization} onChange={handleChange} />
        <FileInput label="Profile Picture" name="profile_pic" onChange={handleChange} />

        {(subscriptionType === 'standard' || subscriptionType === 'premium') && (
          <>
            <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
            <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
            <TextArea label="Services" name="services" value={formData.services} onChange={handleChange} />
            <TextArea label="Experiences" name="experiences" value={formData.experiences} onChange={handleChange} />
            <TextArea label="Skills" name="skills" value={formData.skills} onChange={handleChange} />
            <TextArea label="Tools" name="tools" value={formData.tools} onChange={handleChange} />
          </>
        )}

        {subscriptionType === 'premium' && (
          <>
            <TextArea label="Education" name="education" value={formData.education} onChange={handleChange} />
            <TextArea label="Certifications" name="certifications" value={formData.certifications} onChange={handleChange} />
            <TextArea label="Portfolio" name="portfolio" value={formData.portfolio} onChange={handleChange} />
            <FileInput label="Video Introduction" name="video_intro" onChange={handleChange} />
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
      required
    />
  </div>
);

const FileInput = ({ label, name, onChange }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <input
      type="file"
      name={name}
      onChange={onChange}
      className="w-full"
    />
  </div>
);

const TextArea = ({ label, name, value, onChange }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows="3"
      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

export default CreateAccount;
