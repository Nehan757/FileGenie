import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import './App.css';
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
  const handleFileChange = e => {
    setFiles(Array.from(e.target.files));
  };
  const handleUpload = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    try {
      await axios.post('http://localhost:5000/upload', formData);
      setLoading(false);
    } catch (err) {
      setError('Error uploading files');
      setLoading(false);
    }
  };
  const handleQuery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/query', {
        question
      });
      setAnswer(response.data.answer);
      setContext(response.data.context);
      setLoading(false);
    } catch (err) {
      setError('Error querying documents');
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "App"
  }, /*#__PURE__*/React.createElement(Particles, {
    id: "tsparticles",
    init: particlesInit,
    options: {
      background: {
        color: {
          value: "#f0f0f0"
        }
      },
      fpsLimit: 120,
      particles: {
        color: {
          value: "#3a86ff"
        },
        links: {
          color: "#3a86ff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1
        },
        move: {
          enable: true,
          speed: 2
        },
        number: {
          density: {
            enable: true,
            area: 800
          },
          value: 80
        },
        opacity: {
          value: 0.5
        },
        shape: {
          type: "circle"
        },
        size: {
          value: {
            min: 1,
            max: 3
          }
        }
      },
      detectRetina: true
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, /*#__PURE__*/React.createElement("h1", null, "Gemma Model Document Q&A"), /*#__PURE__*/React.createElement("div", {
    className: "upload-section"
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    multiple: true,
    onChange: handleFileChange
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleUpload
  }, "Upload")), /*#__PURE__*/React.createElement("div", {
    className: "query-section"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: question,
    onChange: e => setQuestion(e.target.value),
    placeholder: "Enter your question"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleQuery
  }, "Ask")), loading && /*#__PURE__*/React.createElement("p", null, "Loading..."), error && /*#__PURE__*/React.createElement("p", {
    className: "error"
  }, error), answer && /*#__PURE__*/React.createElement("div", {
    className: "answer-section"
  }, /*#__PURE__*/React.createElement("h2", null, "Answer:"), /*#__PURE__*/React.createElement("p", null, answer)), context.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "context-section"
  }, /*#__PURE__*/React.createElement("h2", null, "Context:"), context.map((text, index) => /*#__PURE__*/React.createElement("p", {
    key: index
  }, text)))));
}
export default App;