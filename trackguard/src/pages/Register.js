import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { auth, firestoreDb } from '../firebase'; // Import Firebase auth and Firestore
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import dashboard from '../assets/dashboard.png';
import logout from '../assets/logout.png';
import question from '../assets/question.png';
import report from '../assets/report.png';
import log from '../assets/log.png';

function Register() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setEmail] = useState('');
  const [registeredPeople, setRegisteredPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Updated Fetch data from Firestore
  const fetchPeople = async () => {
    try {
      console.log("Fetching data...");
      console.log("Current user:", auth.currentUser); // Debug log

      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const usersCollection = collection(firestoreDb, 'users'); // Try 'users' instead of 'registrations'
      console.log("Attempting to fetch from collection:", usersCollection); // Debug log
      
      const usersSnapshot = await getDocs(usersCollection);
      console.log("Data received:", usersSnapshot.docs.length, "documents"); // Debug log
      
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Document data:", data); // Debug log
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log("Processed data:", usersList); // Debug log
      setRegisteredPeople(usersList);
    } catch (error) {
      console.error('Detailed error:', error); // More detailed error logging
      if (error.code === 'permission-denied') {
        alert('Access denied. Please check your permissions.');
      } else {
        alert('Error fetching data: ' + error.message);
      }
    }
  };

  // Add a debug useEffect to monitor registeredPeople
  useEffect(() => {
    console.log("registeredPeople updated:", registeredPeople);
  }, [registeredPeople]);

  // UseEffect to authenticate and fetch data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email || 'ADMIN');
        fetchPeople();
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter people based on the search query
  const filteredPeople = registeredPeople.filter((person) =>
    `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {isSidebarOpen && (
        <aside className="w-64 bg-gray-500 text-gray-200 flex flex-col">
          {/* Logo */}
          <div className="p-4 flex justify-center items-center">
            {/* Add the logo here */}
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-center p-4 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold">ADMIN</h2> {/* Display the email */}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex-1 p-4">
            <ul>
              <li className="mb-2 flex items-center">
                <img src={dashboard} alt="Dashboard" className="mr-2 w-8 h-8" />
                <NavLink
                  to="/dashboard"
                  className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded flex justify-center items-center"
                >
                  Dashboard
                </NavLink>
              </li>
              <li className="mb-2 flex items-center">
                <img src={report} alt="Reports" className="mr-2 w-8 h-8" />
                <NavLink
                  to="/register"
                  className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded flex justify-center items-center"
                >
                  Registered
                </NavLink>
              </li>
              <li className="mb-2 flex items-center">
                <img src={question} alt="Help" className="mr-2 w-8 h-8" />
                <NavLink
                  to="/help"
                  className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded flex justify-center items-center"
                >
                  Help
                </NavLink>
              </li>
              <li className="mb-2 flex items-center">
                <img src={log} alt="Log" className="mr-2 w-8 h-8" />
                <NavLink
                  to="/log"
                  className="flex-grow bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded flex justify-center items-center"
                >
                  Log
                </NavLink>
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

          {/* Logout Section with Feedback */}
          <div className="p-4 border-t border-gray-700 flex justify-between items-center">
            <Link to="/" className="flex items-center text-gray-300 hover:text-red-300">
              <img src={logout} alt="Logout" className="mr-2 w-8 h-8" />
              Logout
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content and Sidebar Toggle Button */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden p-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white bg-gray-800 p-2 rounded">
            {isSidebarOpen ? 'Close Menu' : 'Open Menu'}
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="home-container flex flex-col justify-center items-center h-full bg-gray-300">
            <h1 className="text-4xl font-bold mb-8">Registered</h1>
            <div className="mb-6 w-full max-w-md">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-400"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg h-[500px] w-full max-w-6xl overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Registered Sign-Ups</h2>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                      Phone Number
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                      Email
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                      Address
                    </th>
                    
                  </tr>
                </thead>
                <tbody>
                  {filteredPeople.map((user, index) => (
                    <tr key={user.id || index}>
                      <td className="py-2 px-4 border-b border-gray-200">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{user.contactNumber}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{user.email}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{user.address}</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Register;
