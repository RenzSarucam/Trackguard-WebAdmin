import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing default icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletRealtime = () => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const userMarker = useRef(null);
    const radiusCircle = useRef(null);

    useEffect(() => {
        if (!mapContainer.current) {
            console.error('Map container not found!');
            return;
        }

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapContainer.current).setView([0, 0], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);
        }

        const updateLocation = (position) => {
            const { latitude, longitude } = position.coords;

            if (!userMarker.current) {
                userMarker.current = L.marker([latitude, longitude], { title: 'Your Location' }).addTo(mapInstance.current);

                radiusCircle.current = L.circle([latitude, longitude], {
                    color: 'blue',
                    fillColor: '#4a90e2',
                    fillOpacity: 0.5,
                    radius: 100,
                }).addTo(mapInstance.current);

                mapInstance.current.setView([latitude, longitude], 16);
            } else {
                userMarker.current.setLatLng([latitude, longitude]);
                radiusCircle.current.setLatLng([latitude, longitude]);
            }
        };

        const handleError = (error) => {
            console.error('Error fetching location:', error);
        };

        const watchId = navigator.geolocation.watchPosition(updateLocation, handleError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);

            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return <div ref={mapContainer} style={{ height: '100vh', width: '100%' }} />;
};

export default LeafletRealtime;
