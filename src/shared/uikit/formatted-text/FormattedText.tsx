import React from 'react';
import './FormattedText.scss';

interface FormattedTextProps {
  text: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  // Function to process bold text **text**
  const formatText = (text: string) => {
    // Split into paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      // Process bold text
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={partIndex}>{boldText}</strong>;
        }
        return part;
      });
      
      return (
        <p key={index} className="formatted-text__paragraph">
          {formattedParts}
        </p>
      );
    }).filter(Boolean);
  };

  return (
    <div className={`formatted-text ${className}`}>
      {formatText(text)}
    </div>
  );
};

export default FormattedText; 