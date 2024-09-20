import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import './App.css';

// Update the backend URL
const BACKEND_URL = 'https://filegenie.onrender.com';

function App() {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [context, setContext] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await axios.post(`${BACKEND_URL}/upload`, formData);
      console.log('Upload response:', response.data);
      setLoading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Error uploading files: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${BACKEND_URL}/query`, { question });
      setAnswer(response.data.answer);
      setContext(response.data.context);
      setLoading(false);
    } catch (err) {
      console.error('Query error:', err);
      setError(`Error querying documents: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "#f0f0f0",
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: "#3a86ff",
            },
            links: {
              color: "#3a86ff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              enable: true,
              speed: 2,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
      />
      <div className="content">
        <h1>FileGenie</h1>
        <div className="upload-section">
          <input type="file" multiple onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
        <div className="query-section">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
          />
          <button onClick={handleQuery}>Ask</button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {answer && (
          <div className="answer-section">
            <h2>Answer:</h2>
            <p>{answer}</p>
          </div>
        )}
        {context.length > 0 && (
          <div className="context-section">
            <h2>Context:</h2>
            {context.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;