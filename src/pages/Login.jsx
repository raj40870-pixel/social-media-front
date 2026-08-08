import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/login', {
        email: email,
        password: password
      });
      const profileRes = await axios.get('/profile/view');
      setUser(profileRes.data.data);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          // Attempt to auto-signup if user doesn't exist using part of email as name
          const namePrefix = email.split('@')[0];
          const firstName = namePrefix ? namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1) : 'New';
          
          await axios.post('/auth/signup', {
            firstName: firstName,
            lastName: 'User',
            email: email,
            password: password
          });
          // If signup succeeds, log them in
          await axios.post('/auth/login', {
            email: email,
            password: password
          });
          const profileRes = await axios.get('/profile/view');
          setUser(profileRes.data.data);
          navigate('/');
        } catch (signupErr) {
          // If signup fails (e.g., user exists but wrong password), show normal login error
          setError('Invalid email or password. Please try again.');
        }
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span className="auth-badge" style={{ backgroundColor: '#f97316', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>devTinder</span>
        </div>
        <h2 className="auth-title">Bingee</h2>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Email Id</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
