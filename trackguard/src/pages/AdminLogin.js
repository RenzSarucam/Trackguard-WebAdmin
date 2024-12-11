import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Import the auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';
import trackGuardLogo from '../assets/trackGuard.png';

function AdminLogin({ correctEmail, correctPassword, username }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in successfully
        localStorage.setItem('username', username);
        navigate('/dashboard');
      })
      .catch((error) => {
        // Handle Errors here.
        alert(`Error: ${error.message}`);
      });

    // Clear input fields
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container flex flex-col justify-center items-center h-screen bg-gray-800">
      <img src={trackGuardLogo} alt="TrackGuard Logo" className="object-contain w-full max-w-[480px] mb-8" />
      <div className="login-form bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="login-header flex justify-center mb-6">
          <h2 className="text-2xl font-bold">TrackGuard Admin Login</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email address:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div className="input-group mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
