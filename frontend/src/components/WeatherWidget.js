import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../api';

const WeatherWidget = ({ location, className = "" }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location) {
            const fetchWeather = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const response = await axios.get(`${BASE_URL}/api/weather?location=${encodeURIComponent(location)}`);
                    setWeather(response.data);
                } catch (error) {
                    console.error("Error fetching weather:", error);
                    setError("Could not fetch weather data");
                } finally {
                    setLoading(false);
                }
            };
            fetchWeather();
        }
    }, [location]);

    if (!location) return null;

    if (loading) {
        return (
            <div className={`bg-white rounded-xl p-4 shadow-md border border-gray-100 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className={`bg-gray-50 rounded-xl p-4 border border-gray-100 ${className}`}>
                <div className="flex items-center text-gray-500">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Weather unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-md border border-blue-100 ${className}`}>
            <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                    <img 
                        src={`https:${weather.icon}`} 
                        alt={weather.condition} 
                        className="w-12 h-12" 
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{weather.location}</p>
                    <div className="flex items-center space-x-2">
                        <p className="text-2xl font-bold text-blue-600">{weather.temp_c}°C</p>
                        <span className="text-xs text-gray-500">/ {weather.temp_f}°F</span>
                    </div>
                    <p className="text-xs text-gray-600">{weather.condition}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                    <p>Humidity: {weather.humidity}%</p>
                    <p>Wind: {weather.wind_kph} km/h</p>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
