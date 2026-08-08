import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getValidImageUrl } from '../utils';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/connections/requests');
      setRequests(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const reviewRequest = async (status, requestId) => {
    try {
      await axios.post(`/connections/review/${status}/${requestId}`);
      setRequests(requests.filter((r) => r._id !== requestId));
    } catch (error) {
      console.error('Error reviewing request:', error);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page-container" style={{ margin: '0 auto', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Connection Requests</h2>
      
      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No new requests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((request) => {
            const user = request.fromUserId;
            return (
              <div key={request._id} className="profile-card" style={{ display: 'flex', flexWrap: 'wrap', padding: '1rem', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={getValidImageUrl(user.photoUrl)} 
                  alt="Profile" 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                />
                <div style={{ flex: 1, marginLeft: '1rem' }}>
                  <div className="profile-name" style={{ fontSize: '1.1rem' }}>{user.firstName} {user.lastName}</div>
                  <div className="profile-subtitle" style={{ marginBottom: 0 }}>{user.age ? `${user.age} yrs` : ''} {user.gender}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => reviewRequest('rejected', request._id)} className="btn-secondary" style={{ padding: '0.5rem 1rem', color: '#ef4444' }}>Reject</button>
                  <button onClick={() => reviewRequest('accepted', request._id)} className="btn-primary" style={{ padding: '0.5rem 1rem', backgroundColor: '#22c55e' }}>Accept</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;
