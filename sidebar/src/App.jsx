import React, { useState, useEffect } from 'react'
import Meter from './components/Meter'
import Sidebar from './components/Sidebar'

function App() {
  const [overallScore, setOverallScore] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentView, setCurrentView] = useState('meter');

  // Listen for messages from content script
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'PERFORMETER_UPDATE') {
        const { overallScore, imageCount, analysisData, isAnalyzing } = event.data;
        setOverallScore(overallScore || 0);
        setImageCount(imageCount || 0);
        setAnalysisData(analysisData || null);
        setIsAnalyzing(isAnalyzing || false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Check URL hash to determine which component to render
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#meter') {
      setCurrentView('meter');
    } else if (hash === '#sidebar') {
      setCurrentView('sidebar');
    } else {
      // Default to showing both if no hash
      setCurrentView('both');
    }
  }, []);

  const handleAnalyzeClick = () => {
    console.log('🔘 Analyze button clicked in React app');
    // Send message to parent window (content script)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'PERFORMETER_ANALYZE' }, '*');
      console.log('📤 Message sent to parent window');
    } else {
      window.postMessage({ type: 'PERFORMETER_ANALYZE' }, '*');
      console.log('📤 Message sent to same window');
    }
  };

  if (currentView === 'meter') {
    return <Meter score={overallScore} isAnalyzing={isAnalyzing} />;
  } else if (currentView === 'sidebar') {
    return (
      <Sidebar 
        overallScore={overallScore}
        imageCount={imageCount}
        analysisData={analysisData}
        isAnalyzing={isAnalyzing}
        onAnalyzeClick={handleAnalyzeClick}
      />
    );
  } else {
    // Show both components (for development/testing)
    return (
      <>
        <Meter score={overallScore} isAnalyzing={isAnalyzing} />
        <Sidebar 
          overallScore={overallScore}
          imageCount={imageCount}
          analysisData={analysisData}
          isAnalyzing={isAnalyzing}
          onAnalyzeClick={handleAnalyzeClick}
        />
      </>
    );
  }
}

export default App