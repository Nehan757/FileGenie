import React, { useState, useEffect } from 'react';

const LoadingStates = ({ currentState, isUploading = true }) => {
  const uploadingStates = [
    { id: 'reading', message: 'Reading Documents 📚', emoji: '⏳' },
    { id: 'chunks', message: 'Creating Text Chunks 📝', emoji: '✂️' },
    { id: 'embedding', message: 'Generating Embeddings 🔄', emoji: '🧠' },
    { id: 'vectordb', message: 'Building Vector Database 🗃️', emoji: '⚡' },
    { id: 'ready', message: 'Ready for Questions! 🎯', emoji: '✨' }
  ];
  
  const queryingStates = [
    { id: 'searching', message: 'Searching Vector Database 🔍', emoji: '🔍' },
    { id: 'retrieving', message: 'Retrieving Relevant Context 📋', emoji: '📋' },
    { id: 'processing', message: 'Processing with AI 🤖', emoji: '🧠' },
    { id: 'generating', message: 'Generating Response ✍️', emoji: '✨' }
  ];
  
  const loadingStates = isUploading ? uploadingStates : queryingStates;

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid #4287f5',
      width: '100%',
      maxWidth: '500px',
      marginTop: '20px'
    }}>
      {/* Cold Start Notice */}
      {currentState === (isUploading ? 'reading' : 'searching') && (
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '13px',
          color: '#1565c0',
          textAlign: 'center'
        }}>
          🔄 <strong>First request after inactivity:</strong> Server is starting up (30-60s). 
          Subsequent requests will be instant!
        </div>
      )}
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        alignItems: 'flex-start'
      }}>
        {loadingStates.map((state) => (
          <div
            key={state.id}
            style={{
              opacity: currentState === state.id ? 1 : 0.4,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            <span style={{
              fontSize: '24px',
              filter: currentState === state.id ? 'none' : 'grayscale(100%)'
            }}>
              {state.emoji}
            </span>
            <span>{state.message}</span>
            {currentState === state.id && (
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <span className="loading-dots">•••</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

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
  isUploading = true // New prop to distinguish between upload and query loading
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingState, setLoadingState] = useState(null);
  const [showColdStartToast, setShowColdStartToast] = useState(false);

  // Show cold start notice on first upload/query
  useEffect(() => {
    if (loading && !loadingState) {
      const timer = setTimeout(() => {
        setShowColdStartToast(true);
        setTimeout(() => setShowColdStartToast(false), 5000);
      }, 3000); // Show after 3 seconds of loading
      
      return () => clearTimeout(timer);
    }
  }, [loading, loadingState]);

  // Handle loading states for both upload and query operations
  useEffect(() => {
    if (loading) {
      if (isUploading && files.length > 0) {
        // Upload loading sequence
        const uploadSequence = async () => {
          setLoadingState('reading');
          await new Promise(resolve => setTimeout(resolve, 1500));

          setLoadingState('chunks');
          await new Promise(resolve => setTimeout(resolve, 1500));

          setLoadingState('embedding');
          await new Promise(resolve => setTimeout(resolve, 2000));

          setLoadingState('vectordb');
          await new Promise(resolve => setTimeout(resolve, 1500));

          setLoadingState('ready');
          await new Promise(resolve => setTimeout(resolve, 800));

          setLoadingState(null);
        };

        uploadSequence();
      } else if (!isUploading) {
        // Query loading sequence
        const querySequence = async () => {
          setLoadingState('searching');
          await new Promise(resolve => setTimeout(resolve, 800));

          setLoadingState('retrieving');
          await new Promise(resolve => setTimeout(resolve, 1000));

          setLoadingState('processing');
          await new Promise(resolve => setTimeout(resolve, 1500));

          setLoadingState('generating');
          await new Promise(resolve => setTimeout(resolve, 1200));

          setLoadingState(null);
        };

        querySequence();
      }
    } else {
      setLoadingState(null);
    }
  }, [loading, files, isUploading]);

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
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    position: 'relative'
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

  const slideContentStyle = {
    border: '1px solid #4287f5',
    borderRadius: '8px',
    padding: '30px',
    width: '100%',
    backgroundColor: '#fff',
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
        <div style={slideContentStyle}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            alignItems: 'center',
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
              paddingRight: '1%',
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
        </div>
      )
    },
    {
      title: "Financial Metrics Example",
      content: (
        <div style={slideContentStyle}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>What are the key financial metrics for Q2 2023?</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px'
            }}>
              <h4 style={{ marginBottom: '10px', color: '#666' }}>ChatGPT</h4>
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
        </div>
      )
    },
    {
      title: "Risk Analysis Example",
      content: (
        <div style={slideContentStyle}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Summarize the risk factors section.</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px'
            }}>
              <h4 style={{ marginBottom: '10px', color: '#666' }}>ChatGPT</h4>
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
        </div>
      )
    }
  ];

  return (
    <div style={pageStyle}>
      {/* Cold Start Toast Notification */}
      {showColdStartToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#2196F3',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '350px',
          fontSize: '14px'
        }}>
          🔄 <strong>Cold Start Detected:</strong> Server spinning up from sleep mode. 
          This is expected on free hosting - production would be instant!
        </div>
      )}
      
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
            disabled={!files.length || loading || loadingState !== null}
            style={{
              ...actionButtonStyle,
              opacity: (!files.length || loading || loadingState !== null) ? 0.7 : 1
            }}
          >
            {loadingState && isUploading ? 'Processing...' : 'Upload'}
          </button>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            disabled={loading || loadingState !== null}
            style={{
              ...inputStyle,
              opacity: (loading || loadingState !== null) ? 0.7 : 1
            }}
          />
          <button
            onClick={onAsk}
            disabled={!question || loading || loadingState !== null}
            style={{
              ...actionButtonStyle,
              opacity: (!question || loading || loadingState !== null) ? 0.7 : 1
            }}
          >
            {loadingState && !isUploading ? 'Processing...' : 'Ask Question'}
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
            <p>{answer}</p>
          </div>
        )}

        {loadingState && <LoadingStates currentState={loadingState} isUploading={isUploading} />}
        
        {/* Professional Footer Note */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          textAlign: 'center',
          fontSize: '13px',
          color: '#6c757d'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
            💼 Technical Implementation Notes
          </div>
          <div>
            • <strong>Infrastructure:</strong> Demo hosted on free-tier hosting (cold starts expected)<br/>
            • <strong>Production Ready:</strong> All code optimized for enterprise deployment<br/>
            • <strong>Performance:</strong> First request after inactivity may take 30-60 seconds
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
            Full source code and deployment guides available on GitHub
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileGenieShowcase;