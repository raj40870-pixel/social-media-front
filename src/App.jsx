import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

// Components
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import Requests from './pages/Requests';
import Chat from './pages/Chat';

// Configure Axios
axios.defaults.baseURL = 'http://localhost:3456/api';
axios.defaults.withCredentials = true; // IMPORTANT for sending cookies

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if logged in on load
  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const res = await axios.get('/profile/view');
      setUser(res.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <Router>
      <div className="app-layout">
        <NavBar user={user} setUser={setUser} />
        
        <div className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/connections" 
              element={user ? <Connections /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/requests" 
              element={user ? <Requests /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chat/:userId" 
              element={user ? <Chat /> : <Navigate to="/login" />} 
            />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
