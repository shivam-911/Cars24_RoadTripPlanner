import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget'; 
import { BASE_URL } from '../api';

const MyTripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchMyTrips = async () => {
            if (auth.isAuthenticated) {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { 'x-auth-token': token } };
                    const response = await axios.get(`${BASE_URL}/api/roadtrips/user/mytrips`, config);
                    setTrips(response.data);
                } catch (error) {
                    console.error("Error fetching my trips:", error);
                    setError("Failed to load your trips. Please try again.");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchMyTrips();
    }, [auth.isAuthenticated]);

    const handleDelete = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${BASE_URL}/api/roadtrips/${id}`, { 
                    headers: { 'x-auth-token': token } 
                });
                setTrips(trips.filter(trip => trip._id !== id));
            } catch (error) {
                console.error("Error deleting trip:", error);
                alert("Failed to delete trip. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg text-gray-700">
                            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading your trips...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                My Road Trips
                            </h1>
                            <p className="text-lg text-gray-600">
                                Manage and track your amazing journeys
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link
                                to="/create-trip"
                                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Trip
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Trips Grid */}
                {trips.length > 0 ? (
                    <>
                        {/* Stats */}
                        <div className="mb-8">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-blue-600 mb-1">
                                            {trips.length}
                                        </div>
                                        <div className="text-gray-600">Total Trips</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-green-600 mb-1">
                                            {trips.reduce((sum, trip) => sum + (trip.likes?.length || 0), 0)}
                                        </div>
                                        <div className="text-gray-600">Total Likes</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-purple-600 mb-1">
                                            {trips.reduce((sum, trip) => sum + (trip.views || 0), 0)}
                                        </div>
                                        <div className="text-gray-600">Total Views</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trips List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {trips.map(trip => (
                                <div key={trip._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                                    {/* Trip Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img 
                                            src={trip.coverImage || '/default_cover_image.jpg'} 
                                            alt={trip.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                trip.isPublic 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {trip.isPublic ? 'Published' : 'Draft'}
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
                                            <div className="flex items-center text-gray-700">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                                </svg>
                                                {trip.likes?.length || 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                                            {trip.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                            {trip.description}
                                        </p>

                                        {/* Weather Widget */}
                                        <div className="mb-4">
                                            <WeatherWidget location={trip.route?.[0]?.locationName} />
                                        </div>

                                        {/* Trip Info */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h12l-2 10H8l-2-10z" />
                                                </svg>
                                                {trip.route?.length || 0} stops
                                            </div>
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(trip.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between">
                                            <Link
                                                to={`/trips/${trip._id}`}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                            >
                                                View Details
                                            </Link>

                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    to={`/edit-trip/${trip._id}`}
                                                    className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(trip._id, trip.title)}
                                                    className="flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Trips Yet</h3>
                            <p className="text-gray-600 mb-8">
                                You haven't created any road trips yet. Start planning your first amazing adventure!
                            </p>
                            <Link
                                to="/create-trip"
                                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Trip
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTripsPage;
