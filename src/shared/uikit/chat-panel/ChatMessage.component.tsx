import React from 'react';
import { ChatMessage } from '../../../entities/models/ChatGPT';
import { ReactComponent as ArrowIcon } from '../../images/icons/chat-arrow.svg';
import './ChatMessage.scss';

interface ChatMessageProps {
  message: ChatMessage;
  onCopy?: () => void;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  onCopy
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.();
  };

  const formatMessageContent = (content: string) => {
    // Парсим markdown-подобный контент
    let formattedContent = content;
    
    // Заменяем жирный текст
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Заменяем нумерованные списки  
    formattedContent = formattedContent.replace(/(\d+\.\s[^\n]*)/g, (match, item) => {
      return `<div class="chat-message__list-item">${item}</div>`;
    });
    
    // Заменяем переносы строк на <br>
    formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    // Оборачиваем в параграфы
    if (!formattedContent.includes('<p>')) {
      formattedContent = `<p>${formattedContent}</p>`;
    }
    
    return formattedContent;
  };

  return (
    <div className={`chat-message chat-message--${message.type}`}>
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
              <button 
                className="chat-message__copy-btn"
                onClick={handleCopy}
                title="Copy"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4.5" y="4.5" width="8" height="8" rx="1" stroke="#69696B" strokeWidth="1.5"/>
                  <path d="M2.5 9.5H1.5C1.22386 9.5 1 9.27614 1 9V2C1 1.72386 1.22386 1.5 1.5 1.5H8C8.27614 1.5 8.5 1.72386 8.5 2V3" stroke="#69696B" strokeWidth="1.5"/>
                </svg>
                Copy
              </button>
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