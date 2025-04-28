import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  LogOut, 
  Copy, 
  Mail, 
  Phone, 
  Briefcase, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Play
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [profile, setProfile] = useState({});
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [videoIntro, setVideoIntro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const navigate = useNavigate();

  // Calculate average rating
  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  // Work excellence percentage (placeholder)
  const workExcellence = 99;
  
  // Rating count by star level for the bar chart
  const ratingCounts = [0, 0, 0, 0, 0]; // 1-star to 5-star
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });
  
  const totalRatings = reviews.length;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    
    // Fetch profile data
    axios
      .get("http://localhost:8000/api/get_profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfile(res.data);
        setFormData(res.data);
        
        // Once profile is loaded, fetch reviews for this profile
        return axios.get(`http://localhost:8000/api/get_reviews/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((reviewsRes) => {
        setReviews(reviewsRes.data);
        
        // Filter reviews to ensure each reviewer only appears once
        const uniqueReviewerMap = new Map();
        const filtered = reviewsRes.data.filter(review => {
          // If we haven't seen this reviewer before, add them to our map and keep the review
          if (!uniqueReviewerMap.has(review.reviewer_name)) {
            uniqueReviewerMap.set(review.reviewer_name, true);
            return true;
          }
          // Otherwise, skip this review since we already have one from this reviewer
          return false;
        });
        
        setFilteredReviews(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "profile_pic" && files.length > 0) setProfilePic(files[0]);
    if (name === "video_intro" && files.length > 0) setVideoIntro(files[0]);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");
    const form = new FormData();

    // Add all simple fields to the form data
    for (let key in formData) {
      if (key !== "profile_pic" && key !== "video_intro") {
        // Convert objects or arrays to JSON strings if needed
        if (typeof formData[key] === 'object' && formData[key] !== null) {
          form.append(key, JSON.stringify(formData[key]));
        } else {
          form.append(key, formData[key] || '');
        }
      }
    }

    // Only append new files if they are selected
    if (profilePic instanceof File) {
      form.append("profile_pic", profilePic);
    }
    
    if (videoIntro instanceof File) {
      form.append("video_intro", videoIntro);
    }

    try {
      const response = await axios.put("http://localhost:8000/api/update_profile/", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(response.data);
      setFormData(response.data);
      setIsEditing(false);
      setProfilePic(null);
      setVideoIntro(null);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile);
    setProfilePic(null);
    setVideoIntro(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleShareProfile = () => {
    navigate('/share-profile');
  };

  const handlePrevReview = () => {
    setCurrentReviewIndex(prev => 
      prev === 0 ? filteredReviews.length - 1 : prev - 1
    );
  };

  const handleNextReview = () => {
    setCurrentReviewIndex(prev => 
      prev === filteredReviews.length - 1 ? 0 : prev + 1
    );
  };

  const copyProfileUrl = () => {
    const formattedName = profile.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : '';
    const url = `https://www.provenpro.com/${formattedName}${profile.id ? '-' + profile.id : ''}`;
    navigator.clipboard.writeText(url);
    alert("Profile URL copied to clipboard!");
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index}
        className={`w-4 h-4 ${index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) {
    return <div className="text-center mt-10 text-lg text-gray-600">Loading profile...</div>;
  }

  // Edit form component
  const EditForm = () => (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input label="Name" name="name" value={formData.name || ""} onChange={handleChange} />
          <Input label="Job Title" name="job_title" value={formData.job_title || ""} onChange={handleChange} />
          <Input label="Job Specialization" name="job_specialization" value={formData.job_specialization || ""} onChange={handleChange} />
          <Input label="Email" name="email" value={formData.email || ""} onChange={handleChange} />
          <Input label="Mobile" name="mobile" value={formData.mobile || ""} onChange={handleChange} />
          <TextArea label="Services" name="services" value={formData.services || ""} onChange={handleChange} />
        </div>
        <div>
          <TextArea label="Experiences" name="experiences" value={formData.experiences || ""} onChange={handleChange} />
          <TextArea label="Skills" name="skills" value={formData.skills || ""} onChange={handleChange} />
          <TextArea label="Tools" name="tools" value={formData.tools || ""} onChange={handleChange} />
          <TextArea label="Education" name="education" value={formData.education || ""} onChange={handleChange} />
          <TextArea label="Certifications" name="certifications" value={formData.certifications || ""} onChange={handleChange} />
          <TextArea label="Portfolio" name="portfolio" value={formData.portfolio || ""} onChange={handleChange} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
          {profile.profile_pic && (
            <div className="mb-2">
              <img 
                src={`http://localhost:8000${profile.profile_pic}`} 
                alt="Current profile" 
                className="w-32 h-32 object-cover rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Current profile picture</p>
            </div>
          )}
          <input 
            type="file" 
            name="profile_pic" 
            onChange={handleFileChange} 
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Video Introduction</label>
          {profile.video_intro && (
            <div className="mb-2">
              <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Current video introduction</p>
            </div>
          )}
          <input 
            type="file" 
            name="video_intro" 
            onChange={handleFileChange} 
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Navigation */}
      {/* <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-blue-700 font-bold text-2xl">ProvenPro</div>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-700">Write a Review</a>
            <a href="#" className="text-gray-600 hover:text-blue-700">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-blue-700">Contact Us</a>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Log in
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Sign up
            </button>
        
          </div>
        </div>
      </header> */}

      {/* Main Profile Section */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar with profile info */}
          <div className="w-full md:w-1/4 bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={
                    profile.profile_pic
                      ? `http://localhost:8000${profile.profile_pic}`
                      : "/placeholder-profile.jpg"
                  }
                  alt="Profile"
                  className="w-48 h-48 object-cover rounded-lg shadow-md"
                />
                <div className="absolute -bottom-2 -left-2 bg-yellow-400 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold mt-4">{profile.name}</h1>
              <p className="text-gray-600">{profile.job_title}</p>
              <p className="text-gray-600">{profile.job_specialization}</p>
              
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">Work Excellence</span>
                  <span className="font-bold">{workExcellence}%</span>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            {profile.email && (
              <div className="flex items-center text-gray-700 mb-3">
                <Mail className="w-5 h-5 mr-2" />
                <span>{profile.email}</span>
              </div>
            )}
            
            {profile.mobile && (
              <div className="flex items-center text-gray-700 mb-3">
                <Phone className="w-5 h-5 mr-2" />
                <span>{profile.mobile}</span>
              </div>
            )}
            
            {/* Social Media Icons */}
            <div className="flex justify-center space-x-4 mt-6">
              <Facebook className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-700" />
              <Twitter className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-500" />
              <Instagram className="w-6 h-6 text-gray-600 cursor-pointer hover:text-pink-600" />
              <Linkedin className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-800" />
            </div>
            
            {/* Video Introduction */}
            {profile.video_intro && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Video Introduction</h3>
                <div className="relative bg-gray-200 rounded-lg h-40 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <video 
                      src={`http://localhost:8000${profile.video_intro}`} 
                      poster="/video-placeholder.jpg"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white bg-opacity-80 rounded-full p-3 cursor-pointer">
                        <Play className="w-8 h-8 text-blue-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Edit Profile Button (only visible to profile owner) */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="w-full md:w-3/4 md:pl-6 mt-6 md:mt-0">
            {isEditing ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <EditForm />
              </div>
            ) : (
              <>
                {/* Rating Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2">
                      <h2 className="text-5xl font-bold">{averageRating.toFixed(1)}</h2>
                      <div className="flex items-center mt-2">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <p className="text-gray-600 mt-1">Impressive</p>
                      <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews</p>
                    </div>
                    <div className="md:w-1/2 mt-4 md:mt-0">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = ratingCounts[star - 1];
                        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                        
                        return (
                          <div key={star} className="flex items-center mb-2">
                            <span className="text-sm w-8">{star} star</span>
                            <div className="flex-1 mx-2 h-2 bg-gray-200 rounded">
                              <div 
                                className="h-2 bg-blue-600 rounded" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Public Profile URL */}
                {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold mb-3">Public profile & URL</h2>
                  <div className="flex">
                    <input 
                      type="text" 
                      value={`https://www.provenpro.com/${profile.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : ''}${profile.id ? '-' + profile.id : ''}`}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l px-3 py-2 bg-gray-50"
                    />
                    <button 
                      onClick={copyProfileUrl}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div> */}
                
                {/* Reviews Carousel */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Write a Review</h2>
                    <button 
                      onClick={handleShareProfile}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      share
                    </button>
                  </div>
                  
                  {filteredReviews.length > 0 ? (
                    <div className="relative">
                      <div className="flex overflow-hidden">
                        {filteredReviews.length > 0 && (
                          <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                currentReviewIndex,
                                (currentReviewIndex + 1) % filteredReviews.length,
                                (currentReviewIndex + 2) % filteredReviews.length
                              ].filter((index, i, arr) => 
                                // Ensure we have enough reviews and no duplicates in small arrays
                                index < filteredReviews.length && 
                                arr.indexOf(index) === i
                              ).map((index) => {
                                const review = filteredReviews[index];
                                return (
                                  <div key={index} className="border p-4 rounded">
                                    <div className="flex items-center mb-2">
                                      <div className="flex">{renderStars(review.rating)}</div>
                                    </div>
                                    <p className="text-gray-800 mb-3">{review.comment}</p>
                                    <p className="font-medium">{review.reviewer_name}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={handlePrevReview}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-1 shadow-md"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                      </button>
                      <button 
                        onClick={handleNextReview}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-1 shadow-md"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reviews yet. Share your profile to get reviews.
                    </div>
                  )}
                </div>
                
                {/* Services Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold mb-3">Services:</h2>
                  <p className="text-gray-700">{profile.services || "No services listed."}</p>
                </div>
                
                {/* Experience Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-3">Experience:</h2>
                  <div className="space-y-4">
                    {profile.experiences ? (
                      <div className="border-l-4 border-blue-600 pl-4">
                        <p className="text-gray-700">{profile.experiences}</p>
                      </div>
                    ) : (
                      <p className="text-gray-700">No experience listed.</p>
                    )}
                  </div>
                </div>

                {/* Skills Section - Add if not already present */}
                {profile.skills && (
                  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-bold mb-3">Skills:</h2>
                    <p className="text-gray-700">{profile.skills}</p>
                  </div>
                )}

                {/* Tools Section - Add if not already present */}
                {profile.tools && (
                  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-bold mb-3">Tools:</h2>
                    <p className="text-gray-700">{profile.tools}</p>
                  </div>
                )}

                {/* Education Section - Add if not already present */}
                {profile.education && (
                  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-bold mb-3">Education:</h2>
                    <p className="text-gray-700">{profile.education}</p>
                  </div>
                )}

                {/* Certifications Section - Add if not already present */}
                {profile.certifications && (
                  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-bold mb-3">Certifications:</h2>
                    <p className="text-gray-700">{profile.certifications}</p>
                  </div>
                )}

                {/* Portfolio Section - Add if not already present */}
                {profile.portfolio && (
                  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-bold mb-3">Portfolio:</h2>
                    <p className="text-gray-700">{profile.portfolio}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Field Component
const Input = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
    />
  </div>
);

// TextArea Component
const TextArea = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
    ></textarea>
  </div>
);

export default UserProfile;