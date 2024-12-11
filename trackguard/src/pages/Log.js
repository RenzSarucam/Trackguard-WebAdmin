import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import Firestore db and auth
import { collection, getDocs } from 'firebase/firestore'; // Firestore methods
import { getDatabase, ref, onValue } from 'firebase/database'; // Realtime Database methods
import dashboard from '../assets/dashboard.png';
import logout from '../assets/logout.png';
import question from '../assets/question.png';
import report from '../assets/report.png';
import log from '../assets/log.png';

function Log() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [, setFeedbacks] = useState([]); // State to hold feedback data

  useEffect(() => {
    const currentUser = auth.currentUser;

    // Fetch user's email properly
    setEmail(currentUser ? currentUser.email : 'ADMIN'); // Safely check and assign email

    // Fetch logs from Firestore
    const fetchLogs = async () => {
      try {
        const logCollection = collection(db, 'logs'); // Firestore collection name
        const logSnapshot = await getDocs(logCollection);
        const logData = logSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogs(logData);
      } catch (error) {
        console.error('Error fetching logs: ', error);
      }
    };

    // Fetch reports from Realtime Database
    const fetchReports = () => {
      const db = getDatabase();
      const reportsRef = ref(db, 'reports'); // Realtime Database node name
      onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        const reportsArray = data
          ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
          : [];
        setReports(reportsArray);
      });
    };

    // Fetch feedbacks from Firestore
    const fetchFeedbacks = async () => {
      try {
        const feedbackCollection = collection(db, 'feedback'); // Firestore feedback collection name
        const feedbackSnapshot = await getDocs(feedbackCollection);

        const feedbackData = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeedbacks(feedbackData);
      } catch (error) {
        console.error('Error fetching feedbacks: ', error);
      }
    };

    fetchLogs();
    fetchReports();
    fetchFeedbacks(); // Fetch feedback data
  }, []);

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="w-64 bg-gray-500 text-gray-200 flex flex-col">
          <div className="p-4 flex justify-center items-center"></div>
          <div className="flex items-center justify-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">ADMIN</h2> {/* Display user's email */}
          </div>

          <div className="flex-1 p-4">
            <ul>
              <li className="mb-2 flex items-center">
                <img src={dashboard} alt="Dashboard" className="mr-2 w-8 h-8" />
                <button className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
                  <NavLink
                    to="/dashboard"
                    activeClassName="bg-blue-500"
                    className="w-full text-left"
                  >
                    Dashboard
                  </NavLink>
                </button>
              </li>
              <li className="mb-2 flex items-center">
                <img src={report} alt="Reports" className="mr-2 w-8 h-8" />
                <button className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
                  <NavLink
                    to="/register"
                    activeClassName="bg-blue-500"
                    className="w-full text-left"
                  >
                    Registered
                  </NavLink>
                </button>
              </li>
              <li className="mb-2 flex items-center">
                <img src={question} alt="Help" className="mr-2 w-8 h-8" />
                <button className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
                  <NavLink
                    to="/help"
                    activeClassName="bg-blue-500"
                    className="w-full text-left"
                  >
                    Help
                  </NavLink>
                </button>
              </li>
              <li className="mb-2 flex items-center">
                <img src={log} alt="Log" className="mr-2 w-8 h-8" />
                <button className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
                  <NavLink
                    to="/log"
                    activeClassName="bg-blue-500"
                    className="w-full text-left"
                  >
                    Log
                  </NavLink>
                </button>
              </li>
            </ul>

            {/* Emergency Contact Section */}
            <div className="mt-4 bg-gray-600 text-gray-200 p-4 rounded">
              <h1 className="text-xl font-bold mb-4">Emergency Contact</h1>
              <div>
                <h2 className="text-lg font-bold">STA ANA POLICE</h2>
                <p>233-4884</p>
                <p>09985987055</p>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">FIRE STATION</h2>
                <p>Call 911</p>
                <p>(082) 299-5406</p>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">EMERGENCY RESCUE SERVICES</h2>
                <p>(082) 296-1433</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-700">
            <Link to="/" className="text-gray-300 hover:text-red-300 flex items-center">
              <img src={logout} alt="Logout" className="mr-2 w-8 h-8" />
              Logout
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden p-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white bg-gray-800 p-2 rounded">
            {isSidebarOpen ? 'Close Menu' : 'Open Menu'}
          </button>
        </div>

        <div className="flex flex-1 p-6">
          {/* History Section */}
          <div className="w-full bg-gray-400 p-6 flex justify-center items-center">
            <div className="help-content bg-white w-full h-full p-6 rounded shadow-md">
              <h1 className="text-2xl font-bold mb-6">History</h1>
              <div className="notification-list">
                {[...logs, ...reports].map((item) => (
                  <div key={item.id} className="notification-item flex justify-between items-center border-b border-gray-200 py-3">
                    <p className="text-gray-800 flex-grow">{item.message}</p>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-4">{item.time}</span>
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-1/3 p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Details</h2>
            <div className="text-left">
              <p className="mb-2"><strong>ID:</strong> {selectedItem?.id}</p>
              <p className="mb-2"><strong>Message:</strong> {selectedItem?.message}</p>
              {selectedItem?.location && (
                <>
                  <p className="mb-2"><strong>Latitude:</strong> {selectedItem.location.latitude}</p>
                  <p className="mb-2"><strong>Longitude:</strong> {selectedItem.location.longitude}</p>
                  <p className="mb-2"><strong>Location Timestamp:</strong> {selectedItem.location.timestamp}</p>
                </>
              )}
              <p className="mb-2"><strong>Timestamp:</strong> {selectedItem?.timestamp}</p>
            </div>
            <button onClick={closeModal} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Log;
