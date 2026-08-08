import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getValidImageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';

const Connections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchConnections = async () => {
    try {
      const res = await axios.get('/connections/list');
      setConnections(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    setModalMessage('');

    try {
      // 1. Check if user exists
      const checkRes = await axios.get(`/users/check?email=${encodeURIComponent(email)}`);
      const user = checkRes.data.data;

      // 2. Send request
      const sendRes = await axios.post('/connections/send-request', {
        toUserId: user._id
      });
      
      setModalMessage(sendRes.data.message || 'Request sent successfully!');
      setTimeout(() => {
        setShowModal(false);
        setEmail('');
        setModalMessage('');
      }, 2000);

    } catch (err) {
      if (err.response?.status === 404) {
        setModalMessage('User not found');
      } else {
        setModalMessage(err.response?.data?.message || 'Failed to send request');
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page-container" style={{ margin: '0 auto', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Your Connections</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ padding: '0.4rem 1rem', width: 'auto', fontSize: '0.9rem', margin: 0 }}
        >
          New User
        </button>
      </div>
      
      {connections.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center' }}>
          <p>No connections yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {connections.map((user) => (
            <div key={user._id} className="profile-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '300px', gap: '0.5rem' }}>
              <img 
                src={getValidImageUrl(user.photoUrl)} 
                alt="Profile" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
              />
              <div className="profile-name" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {user.firstName} {user.lastName}
              </div>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.4rem 1.5rem', marginTop: '0.5rem', borderRadius: '20px' }}
                onClick={() => navigate(`/chat/${user._id}`, { state: { user } })}
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Send Connection Request</h3>
            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label>User Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email} 
                  onChange={(e) => { setEmail(e.target.value); setModalMessage(''); }} 
                  placeholder="Enter user's email"
                  required 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              {modalMessage && <div style={{ margin: '1rem 0', color: modalMessage.includes('sent') ? 'green' : 'red' }}>{modalMessage}</div>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setModalMessage(''); setEmail(''); }} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={sending} style={{ flex: 1 }}>{sending ? 'Sending...' : 'Send Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
