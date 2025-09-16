import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../api';

const EditTripPage = () => {
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/roadtrips/${id}`);
                const { title, description, route, duration, difficulty, tags } = response.data;

                setFormData({
                    title: title || '',
                    description: description || '',
                    startDestination: route?.[0]?.locationName || '',
                    finalDestination: route?.[1]?.locationName || '',
                    duration: duration || '',
                    difficulty: difficulty || 'Medium',
                    tags: tags?.join(', ') || ''
                });
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch trip data:", error);
                setError("Failed to load trip data. Please try again.");
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

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

        if (!formData.title.trim() || !formData.description.trim() || 
            !formData.startDestination.trim() || !formData.finalDestination.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setSaving(true);
        setError('');

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title.trim());
        formDataToSend.append('description', formData.description.trim());

        const route = [
            { locationName: formData.startDestination.trim(), description: "Starting Point" },
            { locationName: formData.finalDestination.trim(), description: "Final Destination" }
        ];
        formDataToSend.append('route', JSON.stringify(route));

        if (formData.duration.trim()) formDataToSend.append('duration', formData.duration.trim());
        if (formData.difficulty) formDataToSend.append('difficulty', formData.difficulty);
        if (formData.tags.trim()) {
            const tagArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
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

            await axios.put(`${BASE_URL}/api/roadtrips/${id}`, formDataToSend, config);
            navigate('/mytrips');
        } catch (error) {
            console.error('Error updating trip:', error);
            setError(error.response?.data?.message || 'Failed to update trip. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg text-gray-700">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading trip details...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to My Trips
                    </button>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Edit Your 
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Road Trip</span>
                    </h1>
                    <p className="text-lg text-gray-600">Update your trip details and share your adventure</p>
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
                                value={formData.title} 
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
                                    value={formData.startDestination} 
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
                                    value={formData.finalDestination} 
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
                                    value={formData.duration} 
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
                                    value={formData.difficulty} 
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
                                value={formData.tags} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="e.g., scenic, mountains, photography (comma-separated)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                        </div>

                        {/* Images */}
                        <div>
                            <label htmlFor="images" className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload New Images (Optional)
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
                                            <p className="text-gray-600">Click to replace images</p>
                                            <p className="text-xs text-gray-500">Up to 5 images, max 10MB each</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {images && images.length > 0 && (
                                <div className="mt-2 text-sm text-green-600">
                                    {images.length} new image{images.length > 1 ? 's' : ''} selected
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
                                value={formData.description} 
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
                                disabled={saving}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                                    saving 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating Trip...
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Update Trip
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

export default EditTripPage;
