import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { auth } from '../firebase'; // Import Firebase auth
import dashboard from '../assets/dashboard.png';
import logout from '../assets/logout.png';
import question from '../assets/question.png';
import report from '../assets/report.png';
import log from '../assets/log.png';
import LeafletMap from '../components/LeafletMap'; // Import the map component

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setEmail] = useState(''); // Define `email` state

  useEffect(() => {
    // Fetch the current user from Firebase
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Set the email to the user's email if they are logged in
      setEmail(currentUser.email); // Update to show actual logged-in user's email
    } else {
      // Handle the case where there's no user logged in
      setEmail('ADMIN'); // Default to ADMIN if no user
    }
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="w-64 bg-gray-500 text-gray-200 flex flex-col">
          {/* Logo */}
          <div className="p-4 flex justify-center items-center">
            {/* Add the logo here */}
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-center p-4 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold">{"ADMIN"}</h2> {/* Display the email */}
            </div>
          </div>

          {/* Navigation Buttons */}
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
                <p>call 911</p>
                <p>(082) 299-5406</p>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">EMERGENCY RESCUE SERVICES</h2>
                <p>(082) 296-1433</p>
              </div>
            </div>
          </div>

          {/* Logout Section with Feedback */}
          <div className="p-4 border-t border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <img src={logout} alt="Logout" className="mr-2 w-8 h-8" />
              <Link to="/" className="text-gray-300 hover:text-red-300">Logout</Link>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content and Sidebar Toggle Button */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white bg-gray-800 p-2 rounded"
          >
            {isSidebarOpen ? 'Close Menu' : 'Open Menu'}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 p-6">
          {/* Map Section - Now takes full width */}
          <div className="w-full bg-gray-400 p-4 flex justify-center items-center">
            <div className="map-container bg-white w-full h-full flex justify-center items-center">
              <LeafletMap /> {/* Integrate MapContainer here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
