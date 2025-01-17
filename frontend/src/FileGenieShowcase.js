import React, { useState } from 'react';

const FileGenieShowcase = ({
  onFileChange,
  onUpload,
  onAsk,
  question,
  setQuestion,
  loading,
  files,
  answer,
  context,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Styles
  const containerStyle = {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px'
  };

  const titleStyle = {
    color: '#4287f5',
    fontSize: '28px',
    textAlign: 'center',
    marginBottom: '20px'
  };

  const slideStyle = {
    minHeight: '300px',
    padding: '20px',
    position: 'relative',
    marginBottom: '20px'
  };

  const navigationStyle = {
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    pointerEvents: 'none',
    zIndex: 2
  };

  const buttonStyle = {
    backgroundColor: '#4287f5',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  };

  const controlsStyle = {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const slides = [
    {
      title: "FileGenie Capabilities",
      content: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center',
          height: '100%',
          justifyContent: 'center'
        }}>
          <div>
            <h3 style={{ marginBottom: '10px' }}>Document Understanding</h3>
            <p>Upload any PDF document - financial reports, research papers, legal documents, technical manuals, and more</p>
          </div>
          <div>
            <h3 style={{ marginBottom: '10px' }}>Intelligent Analysis</h3>
            <p>Advanced RAG technology reads, understands, and connects information across all your documents</p>
          </div>
          <div>
            <h3 style={{ marginBottom: '10px' }}>Enhanced Accuracy</h3>
            <p>Get precise answers with direct references to your documents, not generic responses</p>
          </div>
        </div>
      )
    },
    {
      title: "Financial Metrics Example",
      content: (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px' }}>What are the key financial metrics for Q2 2023?</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '8px'
          }}>
            <h4 style={{ marginBottom: '10px' }}>Traditional AI</h4>
            <p>I apologize, but I don't have access to specific Q2 2023 financial metrics. I can only provide general information about financial metrics.</p>
          </div>
          <div style={{
            backgroundColor: '#f0f7ff',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #4287f5'
          }}>
            <h4 style={{ marginBottom: '10px', color: '#4287f5' }}>FileGenie</h4>
            <p>Based on the uploaded financial report, Q2 2023 showed: Revenue: $12.4M (+15% YoY), EBITDA: $3.2M (25.8% margin), Operating Cash Flow: $2.8M. Notable improvement in gross margins from 62% to 68% compared to previous quarter.</p>
          </div>
        </div>
      )
    },
    {
      title: "Risk Analysis Example",
      content: (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px' }}>Summarize the risk factors section.</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '8px'
          }}>
            <h4 style={{ marginBottom: '10px' }}>Traditional AI</h4>
            <p>Without access to the specific document, I can only provide general information about common risk factors.</p>
          </div>
          <div style={{
            backgroundColor: '#f0f7ff',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #4287f5'
          }}>
            <h4 style={{ marginBottom: '10px', color: '#4287f5' }}>FileGenie</h4>
            <p>From your document's risk factors section: Main risks include supply chain disruptions (pg 24), cybersecurity threats (pg 25), market competition in Asia (pg 26). High exposure to semiconductor industry (40% of revenue). New regulatory challenges in EU markets discussed on pages 27-28.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>FileGenie: AI-Powered Document Intelligence</h1>

      <div style={slideStyle}>
        <h2 style={{ ...titleStyle, fontSize: '24px' }}>{slides[currentSlide].title}</h2>
        {slides[currentSlide].content}

        <div style={navigationStyle}>
          <button
            style={buttonStyle}
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          >
            ←
          </button>
          <button
            style={buttonStyle}
            onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
          >
            →
          </button>
        </div>
      </div>

      <div style={controlsStyle}>
        <input
          type="file"
          multiple
          onChange={onFileChange}
          accept=".pdf"
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button
          onClick={onUpload}
          disabled={!files.length || loading}
          style={{
            backgroundColor: '#4287f5',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          Upload
        </button>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          disabled={loading}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button
          onClick={onAsk}
          disabled={!question || loading}
          style={{
            backgroundColor: '#4287f5',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            cursor: (!question || loading) ? 'not-allowed' : 'pointer',
            opacity: (!question || loading) ? 0.7 : 1
          }}
        >
          Ask Question
        </button>
      </div>

      {answer && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#4287f5', marginBottom: '10px' }}>Answer:</h3>
          <p>{answer}</p>
          {context && context.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ color: '#4287f5', marginBottom: '10px' }}>Context:</h4>
              {context.map((text, idx) => (
                <p key={idx} style={{ marginBottom: '5px', color: '#666' }}>{text}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileGenieShowcase;