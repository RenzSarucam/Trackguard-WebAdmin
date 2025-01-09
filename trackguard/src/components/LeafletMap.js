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
    const userRadiusCircle = useRef(null);
    const emergencyMarker = useRef(null);
    const radiusCircle = useRef(null);
    const routingControl = useRef(null);
    const [gpsHistory, setGpsHistory] = useState([]);
    const historyMarkers = useRef([]);
    const historyRoutes = useRef([]);

    const [emergency, setEmergency] = useState({
        visible: false,
        details: '',
        location: null,
        timestamp: 0,
    });

    const alarmSound = useRef(new Audio('/assets/emergency-alarm.mp3'));

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
                userMarker.current = L.marker([latitude, longitude], { title: 'Your Location' }).addTo(mapInstance.current);
                userRadiusCircle.current = L.circle([latitude, longitude], {
                    radius: 100,
                    color: 'blue',
                    fillColor: '#007bff',
                    fillOpacity: 0.2,
                }).addTo(mapInstance.current);

                mapInstance.current.setView([latitude, longitude], 16);
            } else {
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
        const emergencyRef = ref(database, 'gps_data');

        const unsubscribe = onValue(emergencyRef, (snapshot) => {
            const data = snapshot.val();
            console.log('Fetched GPS Data:', data);

            if (data) {
                // Convert the data object to an array with timestamps
                const historyArray = Object.entries(data).map(([key, value]) => ({
                    ...value,
                    timestamp: new Date(value.timestamp).toLocaleString(),
                }));
                
                // Sort by timestamp, most recent first
                historyArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setGpsHistory(historyArray);

                // Find the latest entry for emergency handling
                const latestKey = Object.keys(data).reduce((latest, key) => {
                    const latestTimestamp = new Date(data[latest]?.timestamp || 0);
                    const currentTimestamp = new Date(data[key]?.timestamp || 0);
                    return currentTimestamp > latestTimestamp ? key : latest;
                }, Object.keys(data)[0]);

                const latestData = data[latestKey];

                if (
                    latestData &&
                    latestData.latitude &&
                    latestData.longitude &&
                    latestData.timestamp
                ) {
                    const latitude = parseFloat(latestData.latitude);
                    const longitude = parseFloat(latestData.longitude);
                    const timestamp = new Date(latestData.timestamp).getTime();

                    if (timestamp > emergency.timestamp) {
                        setEmergency({
                            visible: true,
                            details: 'Emergency reported!',
                            location: { latitude, longitude },
                            timestamp,
                        });

                        alarmSound.current.currentTime = 0;
                        alarmSound.current.play().catch((error) => {
                            console.error('Error playing alarm sound:', error);
                        });
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [emergency.timestamp]);

    const showEmergencyOnMap = () => {
        if (emergency.location && mapInstance.current) {
            const { latitude, longitude } = emergency.location;

            if (!emergencyMarker.current) {
                emergencyMarker.current = L.marker([latitude, longitude]).addTo(mapInstance.current);
            } else {
                emergencyMarker.current.setLatLng([latitude, longitude]);
            }

            if (!radiusCircle.current) {
                radiusCircle.current = L.circle([latitude, longitude], {
                    radius: 100,
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.2,
                }).addTo(mapInstance.current);
            } else {
                radiusCircle.current.setLatLng([latitude, longitude]);
            }

            if (routingControl.current) {
                mapInstance.current.removeControl(routingControl.current);
            }

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
                show: false,
                createMarker: () => null,
            }).addTo(mapInstance.current);

            setTimeout(() => {
                const routingContainers = document.querySelectorAll('.leaflet-routing-container');
                routingContainers.forEach((container) => (container.style.display = 'none'));
            }, 100);

            mapInstance.current.setView([latitude, longitude], 16);
        }
    };

    return (
        <div ref={mapContainer} style={{ height: '100vh', width: '100%', position: 'relative' }}>
            {emergency.visible && (
                <div
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'white',
                        padding: '10px',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                        borderRadius: '5px',
                        zIndex: 1000,
                        textAlign: 'center',
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

            {/* GPS History Panel */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: 'white',
                    padding: '15px',
                    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                    borderRadius: '5px',
                    zIndex: 1000,
                    maxHeight: '300px',
                    width: '300px',
                    overflowY: 'auto'
                }}
            >
                <h4 style={{ margin: '0 0 10px 0' }}>GPS History of Emergency </h4>
                {gpsHistory.map((entry, index) => (
                    <div
                        key={index}
                        style={{
                            borderBottom: '1px solid #eee',
                            padding: '8px 0',
                            fontSize: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div>
                            <div>Time: {entry.timestamp}</div>
                            <div>Lat: {entry.latitude}, Lng: {entry.longitude}</div>
                        </div>
                        <button
                            onClick={() => {
                                const lat = parseFloat(entry.latitude);
                                const lng = parseFloat(entry.longitude);
                                mapInstance.current.setView([lat, lng], 16);
                                
                                // Remove all existing history markers and routes
                                historyMarkers.current.forEach(marker => {
                                    mapInstance.current.removeLayer(marker);
                                });
                                historyRoutes.current.forEach(route => {
                                    mapInstance.current.removeControl(route);
                                });
                                historyMarkers.current = [];
                                historyRoutes.current = [];

                                // Add new marker and store it
                                const newMarker = L.marker([lat, lng]).addTo(mapInstance.current);
                                historyMarkers.current.push(newMarker);

                                // Create route from user's location to the selected point
                                if (userMarker.current) {
                                    const newRoute = L.Routing.control({
                                        waypoints: [
                                            userMarker.current.getLatLng(),
                                            L.latLng(lat, lng)
                                        ],
                                        lineOptions: {
                                            styles: [{ color: '#007bff', weight: 3, opacity: 0.7 }]
                                        },
                                        addWaypoints: false,
                                        routeWhileDragging: false,
                                        show: false,
                                        createMarker: () => null
                                    }).addTo(mapInstance.current);

                                    historyRoutes.current.push(newRoute);

                                    // Hide routing instructions
                                    setTimeout(() => {
                                        const routingContainers = document.querySelectorAll('.leaflet-routing-container');
                                        routingContainers.forEach((container) => {
                                            container.style.display = 'none';
                                        });
                                    }, 100);
                                }
                            }}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                            Locate
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeafletRealtime;
