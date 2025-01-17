import React, { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { FileText, Brain, Sparkles, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

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

  const pageStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f5f7fb'
  };

  const containerStyle = {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const titleStyle = {
    color: '#4287f5',
    fontSize: '32px',
    textAlign: 'center',
    width: '100%',
    marginBottom: '30px',
    fontWeight: 'bold'
  };

  const slideContainerStyle = {
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '400px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px'
  };

  const navigationStyle = {
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'none',
    zIndex: 2
  };

  const leftButtonStyle = {
    backgroundColor: '#4287f5',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    pointerEvents: 'auto',
    transition: 'background-color 0.2s',
    marginLeft: '-40px'
  };

  const rightButtonStyle = {
    ...leftButtonStyle,
    marginLeft: 0,
    marginRight: '-40px'
  };

  const controlsStyle = {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '30px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    textAlign: 'center'
  };

  const actionButtonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4287f5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
    fontWeight: '500'
  };

  const slides = [
    {
      title: "FileGenie Capabilities",
      content: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center',
          width: '100%'
        }}>
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '24px', color: '#4287f5', marginBottom: '10px' }}>Document Understanding</h3>
            <p>Upload any PDF document - financial reports, research papers, legal documents, technical manuals, and more</p>
          </div>
          <div style={{
            width: '100%',
            alignSelf: 'flex-end',
            paddingRight: '0%',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '24px', color: '#4287f5', marginBottom: '10px' }}>Intelligent Analysis</h3>
            <p>Advanced RAG technology reads, understands, and connects information across all your documents</p>
          </div>
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '24px', color: '#4287f5', marginBottom: '10px' }}>Enhanced Accuracy</h3>
            <p>Get precise answers with direct references to your documents, not generic responses</p>
          </div>
        </div>
      )
    },
    {
      title: "Financial Metrics Example",
      content: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>What are the key financial metrics for Q2 2023?</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            marginBottom: '20px',
            borderRadius: '8px'
          }}>
            <h4 style={{ marginBottom: '10px', color: '#666' }}>Traditional AI</h4>
            <p>I apologize, but I don't have access to specific Q2 2023 financial metrics. I can only provide general information about financial metrics.</p>
          </div>
          <div style={{
            backgroundColor: '#f0f7ff',
            padding: '20px',
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Summarize the risk factors section.</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            marginBottom: '20px',
            borderRadius: '8px'
          }}>
            <h4 style={{ marginBottom: '10px', color: '#666' }}>Traditional AI</h4>
            <p>Without access to the specific document, I can only provide general information about common risk factors.</p>
          </div>
          <div style={{
            backgroundColor: '#f0f7ff',
            padding: '20px',
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
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>FileGenie: AI-Powered Document Intelligence</h1>

        <div style={slideContainerStyle}>
          <h2 style={{
            fontSize: '28px',
            color: '#4287f5',
            marginBottom: '30px',
            textAlign: 'center',
            width: '100%'
          }}>
            {slides[currentSlide].title}
          </h2>

          {slides[currentSlide].content}

          <div style={navigationStyle}>
            <button
              style={leftButtonStyle}
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            >
              ←
            </button>
            <button
              style={rightButtonStyle}
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
            style={inputStyle}
          />
          <button
            onClick={onUpload}
            disabled={!files.length || loading}
            style={{
              ...actionButtonStyle,
              opacity: (!files.length || loading) ? 0.7 : 1
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
            style={inputStyle}
          />
          <button
            onClick={onAsk}
            disabled={!question || loading}
            style={{
              ...actionButtonStyle,
              opacity: (!question || loading) ? 0.7 : 1
            }}
          >
            Ask Question
          </button>
        </div>

        {answer && (
          <div style={{
            width: '100%',
            maxWidth: '600px',
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#4287f5', marginBottom: '15px' }}>Answer:</h3>
            <p style={{ marginBottom: '20px' }}>{answer}</p>
            {context && context.length > 0 && (
              <div>
                <h4 style={{ color: '#4287f5', marginBottom: '15px' }}>Context:</h4>
                {context.map((text, idx) => (
                  <p key={idx} style={{ marginBottom: '10px', color: '#666' }}>{text}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileGenieShowcase;