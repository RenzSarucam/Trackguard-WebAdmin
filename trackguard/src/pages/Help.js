import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { auth } from '../firebase'; // Import Firebase auth
import dashboard from '../assets/dashboard.png';
import logout from '../assets/logout.png';
import question from '../assets/question.png';
import report from '../assets/report.png';
import log from '../assets/log.png';


function Help() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setEmail('ADMIN');
    } else {
      setEmail('ADMIN');
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
              <h2 className="text-xl font-bold">{email}</h2> {/* Display the email */}
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
                <p>Call 911</p>
                <p>(082) 299-5406</p>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">EMERGENCY RESCUE SERVICES</h2>
                <p>(082) 296-1433</p>
              </div>
            </div>
          </div>

          {/* Logout Section */}
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
        <div className="flex flex-1 p-6 justify-center items-center">
          <div className="help-content bg-white w-full max-w-2xl p-6 rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Help Section</h1>
            <p className="text-center">
              This is the Help section. Here you can provide information about how to use the application, FAQs, and other resources that can assist the users.
            </p>

            {/* Guidelines Section */}
            <div className="mt-6">
              <h2 className="text-xl font-bold text-center">User Guidelines</h2>
              <ul className="list-disc list-inside mt-2 text-left mx-4">
                <li>Always log in to your account to access all features.</li>
                <li>Use the search bar to find registered users quickly.</li>
                <li>In case of emergencies, refer to the emergency contacts provided.</li>
              </ul>
            </div>

            {/* Authority Contact Section */}
            <div className="mt-6 p-6 bg-gray-200 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-center">Contact Authorities</h2>
              <p className="text-center text-lg mt-2">If you need to report an emergency or require assistance, please contact the appropriate authorities:</p>
              <ul className="list-disc list-inside mt-4 text-left mx-4 text-lg">
                <li><strong>Police:</strong> Call the Sta Ana Police at <span className="font-bold">233-4884</span> or <span className="font-bold">09985987055</span>.</li>
                <li><strong>Fire Station:</strong> For fire emergencies, call <span className="font-bold">911</span> or <span className="font-bold">(082) 299-5406</span>.</li>
                <li><strong>Emergency Rescue Services:</strong> Contact them at <span className="font-bold">(082) 296-1433</span>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
