import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  overallScore = 0, 
  imageCount = 0, 
  analysisData = null, 
  isAnalyzing = false,
  onAnalyzeClick 
}) => {
  const [activeCategory, setActiveCategory] = useState('trendy');

  const categories = ['trendy', 'personality', 'aesthetic'];

  const getCategoryData = (category) => {
    if (!analysisData || !analysisData.categories) return null;
    return analysisData.categories[category];
  };

  const activeCategoryData = getCategoryData(activeCategory);

  return (
    <div className="sidebar-container">
      <div className={`sidebar-panel ${!analysisData ? 'sidebar-compact' : 'sidebar-expanded'}`}>
        <div className="performeter-header">
          <h2 className="performeter-title">performeter</h2>
          <img 
            src={chrome.runtime.getURL('images/performeter.png')} 
            alt="Performeter Logo" 
            className="performeter-icon"
          />
        </div>
        
        <div className="overall-score">{overallScore}</div>
        
        <div className="image-counter">
          <span>{imageCount} photos captured</span>
        </div>

        <button 
          className={`analyze-button ${isAnalyzing ? 'analyzing' : ''}`}
          onClick={onAnalyzeClick}
          disabled={imageCount === 0 || isAnalyzing}
        >
          {isAnalyzing ? 'analyzing...' : 'run dat'}
        </button>

        {analysisData && analysisData.overall_note && (
          <div className="overall-note">
            {analysisData.overall_note}
          </div>
        )}

        {analysisData && (
          <>
            <div className="category-breakdown">
              <h3>category breakdown</h3>
              <div className="category-buttons">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-button ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                    data-category={category}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="category-details">
              {activeCategoryData ? (
                <>
                  <h4>{activeCategoryData.explanation}</h4>
                  <ul>
                    <li>Score: {activeCategoryData.score}/10</li>
                  </ul>
                </>
              ) : (
                <>
                  <h4>No data for this category</h4>
                  <ul>
                    <li>No analysis available</li>
                  </ul>
                </>
              )}
            </div>

          </>
        )}

      </div>
    </div>
  );
};

export default Sidebar;
