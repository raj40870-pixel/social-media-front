import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getValidImageUrl } from '../utils';

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    photoUrl: '',
    age: '',
    gender: 'Male',
    about: '',
    skills: '' // comma separated string for input
  });
  const [imgError, setImgError] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        photoUrl: user.photoUrl || '',
        age: user.age || '',
        gender: user.gender || 'Male',
        about: user.about || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'photoUrl') {
      setImgError(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        photoUrl: formData.photoUrl,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      
      const parsedAge = parseInt(formData.age);
      if (parsedAge) {
          updatedData.age = parsedAge;
      } else {
          delete updatedData.age;
      }
      
      const res = await axios.put('/profile/edit', updatedData);
      setUser(res.data.data); // Assuming the response contains updated user
      setSaveStatus('Profile saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus(error.response?.data?.message || 'Failed to save profile!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="page-container">
      <div className="profile-container">
        {/* Form Section */}
        <div className="form-section">
          <h2>Edit your Profile</h2>
          {saveStatus && <div className={`status-message ${saveStatus.includes('Failed') ? 'error' : 'success'}`}>{saveStatus}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Photo URL</label>
              <input type="text" name="photoUrl" className="form-control" value={formData.photoUrl} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>About</label>
              <textarea name="about" className="form-control" rows="3" value={formData.about} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input type="text" name="skills" className="form-control" value={formData.skills} onChange={handleChange} />
            </div>
            <button type="submit" className="btn-primary">Save Profile Data</button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="preview-section">
          <div className="profile-card">
            <img 
              src={(formData.photoUrl && !imgError) ? getValidImageUrl(formData.photoUrl) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="Profile" 
              className="profile-image" 
              onError={() => setImgError(true)}
            />
            <div className="profile-details">
              <div className="profile-name">{formData.firstName} {formData.lastName}</div>
              <div className="profile-subtitle">{formData.about || "No bio added yet"}</div>
              
              <div className="profile-info">
                <span>{formData.age ? `${formData.age} years` : 'Age N/A'}</span>
                <span>•</span>
                <span>{formData.gender}</span>
              </div>

              <div className="skills-container">
                {formData.skills.split(',').map((skill, index) => skill.trim() && (
                  <span key={index} className="skill-badge">{skill.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
