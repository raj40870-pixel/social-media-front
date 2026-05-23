import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { getValidImageUrl } from '../utils';

const NavBar = ({ user, setUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      setDropdownOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails, clear local state and redirect to login
      setUser(null);
      setDropdownOpen(false);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Bingee
        </Link>
        
        {user && (
          <div className="navbar-user" ref={dropdownRef}>
            <div 
              className="user-profile-trigger" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img 
                src={getValidImageUrl(user.photoUrl)} 
                alt="Profile" 
                className="nav-avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
              />
              <span className="user-greeting">Welcome, {user.firstName}</span>
              <ChevronDown size={16} className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} />
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Profile
                </Link>
                <Link to="/connections" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Connections
                </Link>
                <Link to="/requests" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Requests
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
