const axios = require('axios');
const polyline = require('@mapbox/polyline');

// Cache for route data
const routeCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

exports.getRoute = async (req, res) => {
    const { startLocationName, endLocationName, profile = 'driving-car' } = req.body;

    if (!startLocationName || !endLocationName) {
        return res.status(400).json({ message: 'Start and end location names are required' });
    }

    if (startLocationName.trim() === endLocationName.trim()) {
        return res.status(400).json({ message: 'Start and end locations cannot be the same' });
    }

    try {
        const cacheKey = `${startLocationName.toLowerCase()}-${endLocationName.toLowerCase()}-${profile}`;
        const cached = routeCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.status(200).json(cached.data);
        }

        const apiKey = process.env.ORS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Route API key not configured' });
        }

        const getCoords = async (locationName) => {
            const geoResponse = await axios.get(
                `https://api.openrouteservice.org/geocode/search`,
                {
                    params: {
                        api_key: apiKey,
                        text: locationName,
                        size: 1
                    },
                    timeout: 5000
                }
            );

            if (!geoResponse.data.features || geoResponse.data.features.length === 0) {
                throw new Error(`Could not find coordinates for ${locationName}`);
            }
            return geoResponse.data.features[0].geometry.coordinates;
        };

        const [startCoords, endCoords] = await Promise.all([
            getCoords(startLocationName),
            getCoords(endLocationName)
        ]);

        const response = await axios.post(
            `https://api.openrouteservice.org/v2/directions/${profile}`,
            { 
                coordinates: [startCoords, endCoords],
                format: 'json',
                instructions: true,
                geometry: true
            },
            { 
                headers: { 
                    'Authorization': apiKey, 
                    'Content-Type': 'application/json' 
                },
                timeout: 10000
            }
        );

        if (!response.data.routes || response.data.routes.length === 0) {
            return res.status(404).json({ message: 'Route could not be calculated between these points.' });
        }

        const route = response.data.routes[0];

        let decodedPolyline = [];
        try {
            decodedPolyline = polyline.decode(route.geometry);
        } catch (decodeError) {
            console.error('Polyline decode error:', decodeError);
            // Fallback to start and end coordinates
            decodedPolyline = [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]];
        }

        const processedData = {
            distance: (route.summary.distance / 1000).toFixed(2), // km
            duration: (route.summary.duration / 3600).toFixed(2), // hours
            polyline: decodedPolyline,
            instructions: route.segments?.[0]?.steps?.map(step => ({
                instruction: step.instruction,
                distance: (step.distance / 1000).toFixed(2),
                duration: (step.duration / 60).toFixed(1)
            })) || [],
            startLocation: {
                name: startLocationName,
                coordinates: startCoords
            },
            endLocation: {
                name: endLocationName,
                coordinates: endCoords
            }
        };

        // Cache the result
        routeCache.set(cacheKey, {
            data: processedData,
            timestamp: Date.now()
        });

        res.json(processedData);

    } catch (error) {
        console.error('Route Service Error:', error.response?.data || error.message);

        if (error.message.includes('Could not find coordinates')) {
            res.status(404).json({ message: error.message });
        } else if (error.code === 'ECONNABORTED') {
            res.status(408).json({ message: 'Route service timeout' });
        } else {
            res.status(500).json({ message: 'Error fetching route data' });
        }
    }
};
