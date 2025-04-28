import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    if (location.state?.subscription_type) {
      setSubscriptionType(location.state.subscription_type);
    }
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

    const accessToken = localStorage.getItem('access_token'); // Using access_token

    if (!accessToken) {
      alert('Please log in first.');
      navigate('/login');
      return;
    }

    const form = new FormData();
    form.append('subscription_type', subscriptionType);
    form.append('name', formData.name);
    form.append('job_title', formData.job_title);
    form.append('job_specialization', formData.job_specialization);
    if (formData.profile_pic) form.append('profile_pic', formData.profile_pic);

    if (subscriptionType === 'standard' || subscriptionType === 'premium') {
      form.append('email', formData.email);
      form.append('mobile', formData.mobile);
      form.append('services', formData.services);
      form.append('experiences', formData.experiences);
      form.append('skills', formData.skills);
      form.append('tools', formData.tools);
    }

    if (subscriptionType === 'premium') {
      form.append('education', formData.education);
      form.append('certifications', formData.certifications);
      form.append('portfolio', formData.portfolio);
      if (formData.video_intro) form.append('video_intro', formData.video_intro);
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/createaccount/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`
        }
      });

      console.log('Account Created:', response.data);
      alert('Profile created successfully!');
      navigate('/Userprofile');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === 'token_not_valid'
      ) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert('Failed to create profile. Check console for details.');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-center capitalize text-blue-700">
        {subscriptionType} Plan - Create Your Profile
      </h2>

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
        >
          Submit
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
