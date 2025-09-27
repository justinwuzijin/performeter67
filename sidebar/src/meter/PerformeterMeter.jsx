import React, { useState, useEffect } from 'react';
import GlassIcon from '../assets/glass-icon.svg';
import MLogo from '../assets/m-logo.svg';
import './meter.css';

const PerformeterMeter = () => {
  const [activeCategory, setActiveCategory] = useState('trendy');
  const [overallScore, setOverallScore] = useState(0);
  const [extractedImages, setExtractedImages] = useState([]);
  const [geminiAnalysis, setGeminiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Listen for messages from content script
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'DATA_UPDATE') {
        setExtractedImages(event.data.extractedImages || []);
      } else if (event.data.type === 'GEMINI_ANALYSIS') {
        setGeminiAnalysis(event.data.analysis);
        setIsAnalyzing(false);
        // Parse the JSON response and update scores
        try {
          const analysisData = JSON.parse(event.data.analysis);
          if (analysisData.overall_score) {
            setOverallScore(analysisData.overall_score);
          }
        } catch (error) {
          console.log('Could not parse Gemini analysis as JSON');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data
    window.parent.postMessage({ type: 'REQUEST_DATA' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const categories = {
    trendy: {
      score: 72,
      title: 'Trendy',
      details: {
        score: 72,
        description: 'Profile reads like a curated tagline:',
        points: [
          '"Plant dad 🌿 | Gym rat"',
          '"Scorpio rising"',
          'Feels intentionally crafted to project an identity.'
        ]
      }
    },
    personality: {
      score: 58,
      title: 'Personality',
      details: {
        score: 58,
        description: 'Internet culture detected:',
        points: [
          '"Main character energy"',
          '"Delulu is the solulu"',
          'Meme energy medium — trendy but not overwhelming.'
        ]
      }
    },
    aesthetic: {
      score: 64,
      title: 'Aesthetic',
      details: {
        score: 64,
        description: 'High curation level:',
        points: [
          '4/5 photos are posed or filtered',
          'Consistent color palette',
          'Feels more like an IG feed than a casual gallery.'
        ]
      }
    },
    buzzwords: {
      score: 58,
      title: 'Buzzwords',
      details: {
        score: 58,
        description: 'Internet culture detected:',
        points: [
          '"Main character energy"',
          '"Delulu is the solulu"',
          'Meme energy medium — trendy but not overwhelming.'
        ]
      }
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setOverallScore(categories[category].score);
  };

  const currentCategory = categories[activeCategory];
  const progressPercentage = (currentCategory.score / 100) * 100;

  return (
    <>
      {/* Left Meter - Progress Bar */}
      <div className="meter-sidebar">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ height: `${progressPercentage}%` }}
          />
          <img 
            src={GlassIcon} 
            alt="Progress" 
            className="progress-icon"
          />
        </div>
      </div>

      {/* Right Sidebar Panel - Main Content */}
      <div className="sidebar-panel">
        <div className="performeter-header">
          <h2 className="performeter-title">performeter</h2>
          <img 
            src={MLogo} 
            alt="M Logo" 
            className="performeter-icon"
          />
        </div>

        <div className="overall-score">
          {overallScore}
        </div>

        {/* Image Counter */}
        <div className="image-counter">
          <span>{extractedImages.length} photos captured</span>
        </div>

        {/* Gemini Analysis Display */}
        {geminiAnalysis && (
          <div className="gemini-analysis">
            <h4>AI Analysis:</h4>
            <div className="analysis-content">
              {geminiAnalysis}
            </div>
          </div>
        )}

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="analyzing-status">
            <span>🤖 Analyzing profile...</span>
          </div>
        )}

        <div className="category-breakdown">
          <h3>category breakdown</h3>
          <div className="category-buttons">
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {categories[category].title}
              </button>
            ))}
          </div>
        </div>

        <div className="category-details">
          <h4>{currentCategory.details.description}</h4>
          <ul>
            {currentCategory.details.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default PerformeterMeter;