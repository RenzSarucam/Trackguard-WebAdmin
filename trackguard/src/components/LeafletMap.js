import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

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
    const emergencyMarker = useRef(null);
    const routingControl = useRef(null); // For the route

    // State for emergency details and popup visibility
    const [emergency, setEmergency] = useState({
        visible: false,
        details: '',
        location: null, // { latitude, longitude }
    });

    const [popupPosition, setPopupPosition] = useState('start'); // start -> center

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

    const showEmergencyOnMap = () => {
        if (emergency.location && mapInstance.current) {
            const { latitude, longitude } = emergency.location;

            // Add emergency marker
            if (!emergencyMarker.current) {
                emergencyMarker.current = L.marker([latitude, longitude], {
                    title: 'Emergency Location',
                }).addTo(mapInstance.current);
            } else {
                emergencyMarker.current.setLatLng([latitude, longitude]);
            }

            // Center the map on the emergency location
            mapInstance.current.setView([latitude, longitude], 16);

            // Add route from user location to the emergency
            if (userMarker.current && emergency.location) {
                const userLatLng = userMarker.current.getLatLng();

                // Remove existing route
                if (routingControl.current) {
                    mapInstance.current.removeControl(routingControl.current);
                }

                // Add a new route without instructions
                routingControl.current = L.Routing.control({
                    waypoints: [
                        L.latLng(userLatLng.lat, userLatLng.lng),
                        L.latLng(latitude, longitude),
                    ],
                    routeWhileDragging: true,
                    lineOptions: {
                        styles: [
                            { color: 'blue', opacity: 0.7, weight: 5 }, // Blue line style
                        ],
                    },
                    addWaypoints: false, // Disable adding intermediate waypoints
                    createMarker: () => null, // Do not show markers
                    show: false, // Disable route summary UI
                    itinerary: {
                        container: null, // Suppress the default itinerary container
                    },
                }).addTo(mapInstance.current);

                // Manually remove any existing itinerary DOM elements
                if (routingControl.current._container) {
                    const itineraryContainer = routingControl.current._container.querySelector(
                        '.leaflet-routing-container'
                    );
                    if (itineraryContainer) {
                        itineraryContainer.style.display = 'none'; // Hide itinerary pane
                    }
                }
            }
        }
    };

    // Simulate triggering an emergency (this would be replaced with real data/events)
    useEffect(() => {
        const timer = setTimeout(() => {
            setEmergency({
                visible: true,
                details: 'Fire reported near Main Street!',
                location: { latitude: 7.0780, longitude: 125.6137 }, // Example coordinates
            });

            // Start transition after the popup appears
            setTimeout(() => setPopupPosition('center'), 500);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{
                height: '100vh',
                width: '100%',
                position: 'relative',
            }}
        >
            {emergency.visible && (
                <div
                    style={{
                        position: 'absolute',
                        top: popupPosition === 'start' ? '50%' : '20px',
                        right: popupPosition === 'start' ? '20px' : '50%',
                        transform: popupPosition === 'start' ? 'translateY(-50%)' : 'translateX(50%)',
                        backgroundColor: 'white',
                        padding: '10px',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                        borderRadius: '5px',
                        zIndex: 1000,
                        transition: 'top 0.5s ease, right 0.5s ease, transform 0.5s ease',
                    }}
                >
                    <h4>Emergency Alert</h4>
                    <p>{emergency.details}</p>
                    <button
                        onClick={showEmergencyOnMap}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ff4d4d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Click here to show on map
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeafletRealtime;
