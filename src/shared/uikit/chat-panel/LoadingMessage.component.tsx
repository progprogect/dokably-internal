import React from 'react';
import { ReactComponent as ArrowIcon } from '../../images/icons/chat-arrow.svg';
import './LoadingMessage.scss';

interface LoadingMessageProps {
  text?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ 
  text = "Thinking" 
}) => {
  return (
    <div className="chat-message chat-message--assistant chat-message--loading">
      <div className="chat-message__wrapper">
        <div className="chat-message__icon">
          <ArrowIcon />
        </div>
        <div className="chat-message__content-wrapper">
          <div className="chat-message__content chat-message__content--loading">
            <div className="loading-message">
              <span className="loading-message__text">{text}</span>
              <div className="loading-message__dots">
                <span className="loading-message__dot"></span>
                <span className="loading-message__dot"></span>
                <span className="loading-message__dot"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 