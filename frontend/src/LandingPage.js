import React from 'react';

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      <h1>FileGenie: Your Personal Document Assistant</h1>
      <p>Upload your documents and get instant answers to your questions!</p>

      <div className="demo-animation">
        {/* Add an animated illustration here */}
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <ol>
          <li>Upload your PDF document</li>
          <li>Ask a question about your document</li>
          <li>Get instant, accurate answers</li>
        </ol>
      </div>

      <button className="get-started-btn" onClick={onGetStarted}>Get Started</button>
    </div>
  );
}

export default LandingPage;