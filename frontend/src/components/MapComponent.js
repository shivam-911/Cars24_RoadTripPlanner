import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapComponent = ({ routeData, className = "" }) => {
    if (!routeData || !routeData.polyline || routeData.polyline.length === 0) {
        return (
            <div className={`bg-gray-100 rounded-xl flex items-center justify-center h-96 ${className}`}>
                <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p>Loading map...</p>
                </div>
            </div>
        );
    }

    const startPosition = routeData.polyline[0];
    const endPosition = routeData.polyline[routeData.polyline.length - 1];

    return (
        <div className={`rounded-xl overflow-hidden shadow-lg border border-gray-200 ${className}`}>
            <MapContainer 
                center={startPosition} 
                zoom={7} 
                style={{ height: '400px', width: '100%' }} 
                className="z-10"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Start Marker */}
                <Marker position={startPosition} icon={startIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-semibold text-green-600">Starting Point</p>
                            {routeData.startLocation && (
                                <p className="text-sm">{routeData.startLocation.name}</p>
                            )}
                        </div>
                    </Popup>
                </Marker>

                {/* End Marker */}
                <Marker position={endPosition} icon={endIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-semibold text-red-600">Destination</p>
                            {routeData.endLocation && (
                                <p className="text-sm">{routeData.endLocation.name}</p>
                            )}
                        </div>
                    </Popup>
                </Marker>

                {/* Route Line */}
                <Polyline 
                    pathOptions={{ 
                        color: '#3B82F6', 
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 5'
                    }} 
                    positions={routeData.polyline} 
                />
            </MapContainer>

            {/* Route Info */}
            <div className="bg-white p-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{routeData.distance} km</p>
                        <p className="text-sm text-gray-600">Distance</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-purple-600">{routeData.duration} hrs</p>
                        <p className="text-sm text-gray-600">Duration</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
