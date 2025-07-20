import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ username: userId, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        const role = data.user.role?.toLowerCase();

        switch (role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'developer':
            navigate('/developer-dashboard');
            break;
          case 'auditor':
            navigate('/auditor-dashboard');
            break;
          case 'owner':
            navigate('/owner-dashboard');
            break;
          default:
            navigate('/application-master');
            break;
        }
      } else {
        setMessage(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md border border-gray-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/company-hero.jpg"
            alt="Company Logo"
            className="h-16 w-16 object-cover rounded-xl bg-white border border-gray-200 p-1 shadow"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-3 left-3 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full p-2 shadow"
          title="Back to Home"
        >
          <FaArrowLeft />
        </button>

        {/* Header */}
        <h1 className="text-center text-3xl font-extrabold mb-6 text-gray-900">
          AppRegistry Hub
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-800">
              User ID
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-gray-700 outline-none"
              placeholder="Enter your user ID"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-gray-700 outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gray-700 hover:bg-gray-800 rounded-lg text-white font-bold transition"
          >
            Login
          </button>

          {message && (
            <p className="text-red-500 text-sm text-center">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
