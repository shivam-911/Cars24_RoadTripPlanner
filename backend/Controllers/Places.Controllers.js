const axios = require('axios');

// Cache for places data
const placesCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

exports.getNearbyPlaces = async (req, res) => {
    const { location, radius = 5000, limit = 6 } = req.query;

    if (!location || location.trim().length === 0) {
        return res.status(400).json({ message: 'Location is required' });
    }

    try {
        const cacheKey = `${location.toLowerCase()}-${radius}-${limit}`;
        const cached = placesCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.status(200).json(cached.data);
        }

        const apiKey = process.env.GEOAPIFY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Places API key not configured' });
        }

        // Get coordinates for location
        const geoResponse = await axios.get(
            `https://api.geoapify.com/v1/geocode/search`,
            {
                params: {
                    text: location,
                    apiKey: apiKey,
                    limit: 1
                },
                timeout: 5000
            }
        );

        if (!geoResponse.data.features || geoResponse.data.features.length === 0) {
            return res.status(404).json({ message: `Could not find location: ${location}` });
        }

        const lon = geoResponse.data.features[0].properties.lon;
        const lat = geoResponse.data.features[0].properties.lat;

        // Get nearby places
        const placesResponse = await axios.get(
            `https://api.geoapify.com/v2/places`,
            {
                params: {
                    categories: 'tourism.attraction,entertainment,catering.restaurant,accommodation',
                    filter: `circle:${lon},${lat},${radius}`,
                    bias: `proximity:${lon},${lat}`,
                    limit: limit,
                    apiKey: apiKey
                },
                timeout: 5000
            }
        );

        const places = placesResponse.data.features.map(place => ({
            id: place.properties.place_id,
            name: place.properties.name || 'Unnamed Place',
            address: place.properties.address_line2 || place.properties.address_line1 || '',
            category: place.properties.categories?.find(c => c.startsWith('tourism')) || 
                     place.properties.categories?.[0] || 'Attraction',
            coordinates: place.geometry.coordinates,
            distance: place.properties.distance,
            rating: place.properties.rating,
            opening_hours: place.properties.opening_hours
        })).filter(place => place.name !== 'Unnamed Place');

        const result = {
            location: geoResponse.data.features[0].properties.formatted,
            coordinates: [lon, lat],
            places
        };

        // Cache the result
        placesCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        res.json(result);

    } catch (error) {
        console.error('Places API Error:', error.response?.data || error.message);

        if (error.code === 'ECONNABORTED') {
            res.status(408).json({ message: 'Places service timeout' });
        } else {
            res.status(500).json({ message: 'Error fetching nearby places' });
        }
    }
};
