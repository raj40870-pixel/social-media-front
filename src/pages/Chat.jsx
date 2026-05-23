import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getValidImageUrl } from '../utils';
import './Chat.css';

const Chat = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const receiverUser = location.state?.user || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Chat and start polling
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/messages/${userId}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      }
    };
    
    // Initial fetch
    fetchHistory();

    // Vercel Serverless Polling (every 3 seconds)
    const intervalId = setInterval(() => {
        fetchHistory();
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await axios.post('/messages/send', {
        receiverId: userId,
        type: 'text',
        content: inputText.trim()
      });
      // Message is appended via socket
      setInputText('');
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowAttachmentMenu(false);

    // Validation for 2-minute video
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 120) {
          alert('Video exceeds 2 minutes limit!');
          return;
        }
        await uploadAndSend(file, 'video');
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('image/')) {
      await uploadAndSend(file, 'image');
    } else {
      await uploadAndSend(file, 'document');
    }
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAndSend = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await axios.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await axios.post('/messages/send', {
        receiverId: userId,
        type: type,
        content: uploadRes.data.data
      });
    } catch (err) {
      console.error('Error uploading/sending file', err);
    }
  };

  // Audio Recording
  let chunks = [];
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        chunks = [];
        const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
        await uploadAndSend(file, 'audio');
        // Stop tracks
        stream.getTracks().forEach(track => track.stop());
      };
      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Audio recording failed', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case 'image':
        return <img src={msg.content} alt="sent" className="chat-image" />;
      case 'video':
        return <video src={msg.content} controls className="chat-video" />;
      case 'audio':
        return <audio src={msg.content} controls className="chat-audio" />;
      case 'document':
        return <a href={msg.content} target="_blank" rel="noreferrer" className="chat-doc">View Document</a>;
      default:
        return <p>{msg.content}</p>;
    }
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/connections')}>←</button>
        <img src={getValidImageUrl(receiverUser.photoUrl)} alt="Profile" className="chat-header-img" />
        <div className="chat-header-info">
          <h3>{receiverUser.firstName} {receiverUser.lastName}</h3>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages">
        {messages.map((msg) => {
          const isMine = msg.senderId !== userId;
          return (
            <div key={msg._id} className={`chat-bubble-container ${isMine ? 'mine' : 'theirs'}`}>
              <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                {renderMessageContent(msg)}
                <span className="chat-time">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <button className="icon-btn attachment-btn" onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}>+</button>
          
          {showAttachmentMenu && (
            <div className="attachment-menu">
              <label>
                Photo
                <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleFileUpload} ref={fileInputRef} />
              </label>
              <label>
                Video
                <input type="file" accept="video/*" style={{display: 'none'}} onChange={handleFileUpload} />
              </label>
              <label>
                Document
                <input type="file" accept=".pdf,.doc,.docx" style={{display: 'none'}} onChange={handleFileUpload} />
              </label>
            </div>
          )}

          <textarea 
            className="chat-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            rows={1}
          />
        </div>

        <div className="chat-action-btn">
          {inputText.trim() ? (
            <button className="send-btn" onClick={handleSendMessage}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          ) : (
            <button 
              className={`mic-btn ${recording ? 'recording' : ''}`}
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={stopRecording}
            >
              🎤
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
