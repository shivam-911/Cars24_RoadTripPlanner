import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../api';

const CreateTripPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDestination: '',
        finalDestination: '',
        duration: '',
        difficulty: 'Medium',
        tags: ''
    });
    const [images, setImages] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const { title, description, startDestination, finalDestination, duration, difficulty, tags } = formData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleImageChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 5) {
            setError('You can upload a maximum of 5 images');
            return;
        }
        setImages(files);
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.isAuthenticated || !auth.user) {
            alert("You must be logged in to create a trip.");
            return navigate('/login');
        }

        if (!title.trim() || !description.trim() || !startDestination.trim() || !finalDestination.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        const formDataToSend = new FormData();
        formDataToSend.append('title', title.trim());
        formDataToSend.append('description', description.trim());
        formDataToSend.append('createdBy', auth.user.id);

        const route = [
            { locationName: startDestination.trim(), description: "Starting Point" },
            { locationName: finalDestination.trim(), description: "Final Destination" }
        ];
        formDataToSend.append('route', JSON.stringify(route));

        // Add optional fields
        if (duration.trim()) formDataToSend.append('duration', duration.trim());
        if (difficulty) formDataToSend.append('difficulty', difficulty);
        if (tags.trim()) {
            const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            formDataToSend.append('tags', JSON.stringify(tagArray));
        }

        if (images) {
            for (let i = 0; i < images.length; i++) {
                formDataToSend.append('images', images[i]);
            }
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            };

            await axios.post(`${BASE_URL}/api/roadtrips`, formDataToSend, config);
            setIsSuccess(true);
        } catch (error) {
            console.error('Error creating trip:', error);
            setError(error.response?.data?.message || 'Failed to create trip. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
                <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Trip Created Successfully!</h2>
                    <p className="text-gray-600 mb-8">Your amazing road trip has been published and is now visible to other travelers.</p>
                    <div className="space-y-4">
                        <Link 
                            to="/trips" 
                            className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                        >
                            Explore All Trips
                        </Link>
                        <Link 
                            to="/mytrips" 
                            className="block text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                        >
                            View My Trips
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Create Your 
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Road Trip</span>
                    </h1>
                    <p className="text-lg text-gray-600">Share your adventure with fellow travelers</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                Trip Title *
                            </label>
                            <input 
                                id="title"
                                type="text" 
                                name="title"
                                value={title} 
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter an exciting title for your trip"
                            />
                        </div>

                        {/* Destinations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startDestination" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Starting Point *
                                </label>
                                <input 
                                    id="startDestination"
                                    type="text" 
                                    name="startDestination"
                                    value={startDestination} 
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="e.g., New York City"
                                />
                            </div>
                            <div>
                                <label htmlFor="finalDestination" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Destination *
                                </label>
                                <input 
                                    id="finalDestination"
                                    type="text" 
                                    name="finalDestination"
                                    value={finalDestination} 
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="e.g., Los Angeles"
                                />
                            </div>
                        </div>

                        {/* Duration and Difficulty */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Duration
                                </label>
                                <input 
                                    id="duration"
                                    type="text" 
                                    name="duration"
                                    value={duration} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="e.g., 5-7 days"
                                />
                            </div>
                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Difficulty Level
                                </label>
                                <select 
                                    id="difficulty"
                                    name="difficulty"
                                    value={difficulty} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                                Tags
                            </label>
                            <input 
                                id="tags"
                                type="text" 
                                name="tags"
                                value={tags} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="e.g., scenic, mountains, photography (comma-separated)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate tags with commas to help others find your trip</p>
                        </div>

                        {/* Images */}
                        <div>
                            <label htmlFor="images" className="block text-sm font-semibold text-gray-700 mb-2">
                                Trip Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                                <input 
                                    id="images"
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleImageChange} 
                                    className="hidden"
                                />
                                <label htmlFor="images" className="cursor-pointer">
                                    <div className="space-y-2">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-gray-600">Click to upload images</p>
                                            <p className="text-xs text-gray-500">Up to 5 images, max 10MB each</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {images && images.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                    {images.length} image{images.length > 1 ? 's' : ''} selected
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Trip Description *
                            </label>
                            <textarea 
                                id="description"
                                name="description"
                                rows="4" 
                                value={description} 
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                placeholder="Describe your amazing road trip adventure..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-center pt-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Your Trip...
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Publish Trip
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTripPage;
