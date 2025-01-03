import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Fix for missing default icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBn9m8VH43GFrlIHN1dgBmlY-3BgdwjCDs",
    authDomain: "track-guard.firebaseapp.com",
    databaseURL: "https://track-guard-default-rtdb.firebaseio.com",
    projectId: "track-guard",
    storageBucket: "track-guard.appspot.com",
    messagingSenderId: "1024269638309",
    appId: "1:1024269638309:web:6aea15e6899d7ea5388b4c",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const LeafletRealtime = () => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const userMarker = useRef(null);
    const userRadiusCircle = useRef(null); // Blue circle for user's location
    const emergencyMarker = useRef(null);
    const radiusCircle = useRef(null); // Red circle for emergency location
    const routingControl = useRef(null); // For the route

    const [emergency, setEmergency] = useState({
        visible: false,
        details: '',
        location: null, // { latitude, longitude }
    });

    // Preload emergency alarm sound
    const alarmSound = useRef(new Audio('../assets/emergency-alarm.mp3')); // Replace with the path to your alarm sound

    useEffect(() => {
        if (!mapContainer.current) return;

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapContainer.current).setView([0, 0], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);
        }

        const updateLocation = (position) => {
            const { latitude, longitude } = position.coords;

            if (!userMarker.current) {
                // Create user marker
                userMarker.current = L.marker([latitude, longitude], { title: 'Your Location' }).addTo(mapInstance.current);

                // Add blue radius circle around user's location
                userRadiusCircle.current = L.circle([latitude, longitude], {
                    radius: 100, // 100 meters
                    color: 'blue',
                    fillColor: '#007bff',
                    fillOpacity: 0.2,
                }).addTo(mapInstance.current);

                mapInstance.current.setView([latitude, longitude], 16);
            } else {
                // Update marker and circle position
                userMarker.current.setLatLng([latitude, longitude]);
                if (userRadiusCircle.current) {
                    userRadiusCircle.current.setLatLng([latitude, longitude]);
                }
            }
        };

        const watchId = navigator.geolocation.watchPosition(updateLocation, () => {
            console.error('Unable to fetch location');
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        const emergencyRef = ref(database, 'gps_data'); // Reference to gps_data in Realtime Database

        // Listen for changes in the gps_data node
        const unsubscribe = onValue(emergencyRef, (snapshot) => {
            const data = snapshot.val();
            console.log('Fetched GPS Data:', data); // Debugging log

            if (data && data.latitude && data.longitude) {
                setEmergency({
                    visible: true,
                    details: 'Emergency reported!', // Add custom details if needed
                    location: { latitude: data.latitude, longitude: data.longitude },
                });

                // Play the alarm sound
                alarmSound.current.play().catch((error) => {
                    console.error('Error playing alarm sound:', error);
                });
            }
        });

        // Cleanup listener when the component unmounts
        return () => unsubscribe();
    }, []);

    const showEmergencyOnMap = () => {
        if (emergency.location && mapInstance.current) {
            const { latitude, longitude } = emergency.location;

            // Add emergency marker
            if (!emergencyMarker.current) {
                emergencyMarker.current = L.marker([latitude, longitude]).addTo(mapInstance.current);
            } else {
                emergencyMarker.current.setLatLng([latitude, longitude]);
            }

            // Add a 100-meter red radius circle around the emergency location
            if (!radiusCircle.current) {
                radiusCircle.current = L.circle([latitude, longitude], {
                    radius: 100, // 100 meters
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.2,
                }).addTo(mapInstance.current);
            } else {
                radiusCircle.current.setLatLng([latitude, longitude]);
            }

            // Remove existing route
            if (routingControl.current) {
                mapInstance.current.removeControl(routingControl.current);
            }

            // Add route without itinerary panel
            routingControl.current = L.Routing.control({
                waypoints: [
                    userMarker.current.getLatLng(),
                    L.latLng(latitude, longitude),
                ],
                lineOptions: {
                    styles: [{ color: 'blue', weight: 5, opacity: 0.7 }],
                },
                addWaypoints: false,
                routeWhileDragging: false,
                show: false, // Hide the default itinerary panel
                createMarker: () => null, // Hide default markers
            }).addTo(mapInstance.current);

            // Hide leftover route container DOM manually (just in case)
            setTimeout(() => {
                const routingContainers = document.querySelectorAll('.leaflet-routing-container');
                routingContainers.forEach((container) => (container.style.display = 'none'));
            }, 100);

            // Center the map on the emergency location
            mapInstance.current.setView([latitude, longitude], 16);
        }
    };

    return (
        <div ref={mapContainer} style={{ height: '100vh', width: '100%', position: 'relative' }}>
            {emergency.visible && (
                <div
                    style={{
                        position: 'absolute',
                        top: '20px', // 20px from the top edge
                        left: '50%', // Center horizontally
                        transform: 'translateX(-50%)', // Adjust for centering
                        backgroundColor: 'white',
                        padding: '10px',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                        borderRadius: '5px',
                        zIndex: 1000,
                        textAlign: 'center', // Center align content
                        width: '250px',
                    }}
                >
                    <h4 style={{ margin: '0 0 10px 0' }}>Emergency Alert</h4>
                    <p style={{ margin: '0 0 10px 0' }}>{emergency.details}</p>
                    <button
                        onClick={showEmergencyOnMap}
                        style={{
                            display: 'block',
                            margin: '0 auto',
                            padding: '10px 20px',
                            backgroundColor: '#ff4d4d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Show on Map
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeafletRealtime;
