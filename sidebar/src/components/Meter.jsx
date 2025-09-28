import React from 'react';
import './Meter.css';

const Meter = ({ score = 0, isAnalyzing = false }) => {
  const percentage = (score / 10) * 100;

  return (
    <div className="meter-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ height: `${percentage}%` }}
        />
        <div className="progress-icon">🍵</div>
      </div>
    </div>
  );
};

export default Meter;
