import React, { useState } from 'react';
import { ChatMessage } from '../../../entities/models/ChatGPT';
import { ReactComponent as ArrowIcon } from '../../images/icons/chat-arrow.svg';
import './ChatMessage.scss';
import './ReviewMessage.scss';

interface ReviewMessageProps {
  message: ChatMessage;
  onCopy?: () => void;
  onDismiss?: () => void;
}

export const ReviewMessageComponent: React.FC<ReviewMessageProps> = ({
  message,
  onCopy,
  onDismiss
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      console.log('✅ Successfully copied to clipboard:', message.content.substring(0, 50) + '...');
    } catch (error) {
      console.error('❌ Failed to copy to clipboard:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    onCopy?.();
  };

  const handleDismiss = () => {
    setIsAnimating(true);
    // Add a small delay for animation before clearing all history
    setTimeout(() => {
      onDismiss?.();
    }, 200);
  };

  const formatMessageContent = (content: string) => {
    // Parse markdown-like content
    let formattedContent = content;
    
    // Replace bold text
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace numbered lists  
    formattedContent = formattedContent.replace(/(\d+\.\s[^\n]*)/g, (match, item) => {
      return `<div class="chat-message__list-item">${item}</div>`;
    });
    
    // Replace line breaks
    formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    if (!formattedContent.includes('<p>')) {
      formattedContent = `<p>${formattedContent}</p>`;
    }
    
    return formattedContent;
  };

  return (
    <div className={`chat-message chat-message--${message.type} ${isAnimating ? 'chat-message--dismissing' : ''}`}>
      {message.type === 'assistant' && (
        <div className="chat-message__wrapper">
          <div className="chat-message__icon">
            <ArrowIcon />
          </div>
          <div className="chat-message__content-wrapper">
            <div className="chat-message__content">
              <div 
                className="chat-message__text"
                dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
              />
              <div className="chat-message__actions review-message__actions">
                <button 
                  className="chat-message__copy-btn review-message__copy-btn"
                  onClick={handleCopy}
                  title="Copy"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="4.5" y="4.5" width="8" height="8" rx="1" stroke="#69696B" strokeWidth="1.5"/>
                    <path d="M2.5 9.5H1.5C1.22386 9.5 1 9.27614 1 9V2C1 1.72386 1.22386 1.5 1.5 1.5H8C8.27614 1.5 8.5 1.72386 8.5 2V3" stroke="#69696B" strokeWidth="1.5"/>
                  </svg>
                  Copy
                </button>
                <button 
                  className="chat-message__copy-btn review-message__copy-btn review-message__dismiss-offset"
                  onClick={handleDismiss}
                  title="Dismiss result"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10.5 3.5L3.5 10.5" stroke="#69696B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M3.5 3.5L10.5 10.5" stroke="#69696B" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {message.type === 'user' && (
        <div className="chat-message__content">
          {message.content}
        </div>
      )}
    </div>
  );
}; 