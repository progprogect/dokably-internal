import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatPanelState, ChatMessage } from '../../../entities/models/ChatGPT';
import { chatGPTService } from '../../../app/services/chatgpt.service';
import { ChatMessageComponent } from './ChatMessage.component';
import { LoadingMessage } from './LoadingMessage.component';
import { ReactComponent as SendMessageIcon } from '../../images/icons/send-message-icon.svg';
import './ChatTab.scss';

interface ChatTabProps {
  chatState: ChatPanelState;
  setChatState: React.Dispatch<React.SetStateAction<ChatPanelState>>;
  documentContent: string;
  documentTitle?: string;
  workspaceId: string;
  unitId?: string;
}

interface SuggestionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="suggestion-btn"
  >
    {children}
  </button>
);

const ChatTab: React.FC<ChatTabProps> = ({
  chatState,
  setChatState,
  documentContent,
  documentTitle,
  workspaceId,
  unitId
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Максимум ~5 строк
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Обновляем высоту при изменении inputValue
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      type: 'user',
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newUserMessage],
      isLoading: true
    }));

    try {
      // Call ChatGPT service - use chat endpoint for general conversation
      const response = await chatGPTService.sendChatMessage(userMessage, unitId || workspaceId);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        type: 'assistant',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'assistant',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, errorMessage],
        isLoading: false
      }));
    }
  }, [inputValue, setChatState, unitId, workspaceId, documentContent, documentTitle]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    // Сразу отправляем suggestion как сообщение
    const userMessage = suggestion.trim();

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      type: 'user',
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newUserMessage],
      isLoading: true
    }));

    try {
      // Call ChatGPT service - use chat endpoint for general conversation
      const response = await chatGPTService.sendChatMessage(userMessage, unitId || workspaceId);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        type: 'assistant',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending suggestion:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'assistant',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, errorMessage],
        isLoading: false
      }));
    }
  }, [setChatState, workspaceId]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="chat-tab-content">
      {/* Messages Area - показываем только если есть сообщения */}
      {chatState.chatMessages.length > 0 && (
        <div className="messages-container">
          {chatState.chatMessages.map((message) => (
            <ChatMessageComponent 
              key={message.id} 
              message={message}
              onCopy={() => {
                console.log('Message copied:', message.id);
              }}
            />
          ))}
          {chatState.isLoading && (
            <LoadingMessage text="Thinking" />
          )}
        </div>
      )}

      {/* Spacer для пустого пространства */}
      {chatState.chatMessages.length === 0 && <div className="chat-tab__spacer" />}

      {/* Content Area - показываем когда нет сообщений */}
      {chatState.chatMessages.length === 0 && (
        <div className="chat-tab__content">
          <div className="chat-tab__intro">
            <p className="chat-tab__title">
              <span className="chat-tab__title-normal">What can I</span>
              <span className="chat-tab__title-space">&nbsp;</span>
              <span className="chat-tab__title-highlight">help you</span>
              <span className="chat-tab__title-space">&nbsp;</span>
              <span className="chat-tab__title-normal">with?</span>
            </p>
            <p className="chat-tab__description">
              <span className="chat-tab__desc-normal">You can </span>
              <span className="chat-tab__desc-highlight">write</span>
              <span className="chat-tab__desc-normal"> and </span>
              <span className="chat-tab__desc-highlight">ask</span>
              <span className="chat-tab__desc-normal"> something new and/or </span>
              <span className="chat-tab__desc-highlight">edit</span>
              <span className="chat-tab__desc-normal"> your current writing</span>
            </p>
          </div>
          <div className="chat-tab__suggestions">
            <div className="chat-tab__suggestions-container">
              <div className="chat-tab__suggestions-title">Suggestions</div>
              <div className="chat-tab__suggestions-grid">
                <div 
                  className="chat-tab__suggestion-item chat-tab__suggestion-item--primary"
                  onClick={() => handleSuggestionClick('Edit my writing')}
                >
                  <div className="chat-tab__suggestion-content">
                    <div className="chat-tab__suggestion-text">
                      <div className="chat-tab__suggestion-label">Edit my writing</div>
                    </div>
                  </div>
                </div>
                <div 
                  className="chat-tab__suggestion-item chat-tab__suggestion-item--secondary"
                  onClick={() => handleSuggestionClick('Write something new')}
                >
                  <div className="chat-tab__suggestion-content">
                    <div className="chat-tab__suggestion-text">
                      <div className="chat-tab__suggestion-label">Write something new</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area - всегда внизу */}
      <div className="chat-tab__input-area">
        <div className="chat-tab__input-wrapper">
          <div className="chat-tab__input-container">
            <textarea 
              ref={textareaRef}
              className="chat-tab__input" 
              placeholder="Ask, write or search for anything..." 
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button 
              className="chat-tab__send-button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <SendMessageIcon className="chat-tab__send-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTab; 