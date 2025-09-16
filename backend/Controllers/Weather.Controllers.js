const axios = require('axios');

// Cache for weather data (simple in-memory cache)
const weatherCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

exports.getWeatherByLocation = async (req, res) => {
    try {
        const location = req.query.location;
        if (!location || location.trim().length === 0) {
            return res.status(400).json({ message: 'Location query parameter is required' });
        }

        const cacheKey = location.toLowerCase().trim();
        const cached = weatherCache.get(cacheKey);

        // Return cached data if still valid
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.status(200).json(cached.data);
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Weather API key not configured' });
        }

        const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;

        const response = await axios.get(apiUrl, { timeout: 5000 });

        const weatherData = {
            location: response.data.location.name,
            region: response.data.location.region,
            country: response.data.location.country,
            temp_c: response.data.current.temp_c,
            temp_f: response.data.current.temp_f,
            condition: response.data.current.condition.text,
            icon: response.data.current.condition.icon,
            humidity: response.data.current.humidity,
            wind_kph: response.data.current.wind_kph,
            feels_like_c: response.data.current.feelslike_c,
            last_updated: response.data.current.last_updated
        };

        // Cache the result
        weatherCache.set(cacheKey, {
            data: weatherData,
            timestamp: Date.now()
        });

        res.status(200).json(weatherData);

    } catch (error) {
        console.error("Weather API error:", error.response?.data || error.message);

        if (error.response?.status === 400) {
            res.status(404).json({ message: 'Location not found' });
        } else if (error.code === 'ECONNABORTED') {
            res.status(408).json({ message: 'Weather service timeout' });
        } else {
            res.status(500).json({ message: 'Failed to fetch weather data' });
        }
    }
};

// Get weather forecast (premium feature)
exports.getWeatherForecast = async (req, res) => {
    try {
        const location = req.query.location;
        const days = parseInt(req.query.days) || 3;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        if (days > 7) {
            return res.status(400).json({ message: 'Forecast limited to 7 days' });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no&alerts=no`;

        const response = await axios.get(apiUrl, { timeout: 5000 });

        const forecastData = {
            location: response.data.location.name,
            current: response.data.current,
            forecast: response.data.forecast.forecastday.map(day => ({
                date: day.date,
                day: {
                    maxtemp_c: day.day.maxtemp_c,
                    mintemp_c: day.day.mintemp_c,
                    condition: day.day.condition,
                    chance_of_rain: day.day.daily_chance_of_rain
                }
            }))
        };

        res.status(200).json(forecastData);
    } catch (error) {
        console.error("Weather forecast error:", error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch weather forecast' });
    }
};
