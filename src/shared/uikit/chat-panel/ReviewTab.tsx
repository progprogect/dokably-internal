import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatPanelState, ChatMessage, PREDEFINED_REVIEW_QUESTIONS, ChatGPTApiError } from '../../../entities/models/ChatGPT';
import { chatGPTService } from '../../../app/services/chatgpt.service';
import { ReviewMessageComponent } from './ReviewMessage.component';
import { LoadingMessage } from './LoadingMessage.component';
import { ReactComponent as SendMessageIcon } from '../../images/icons/send-message-icon.svg';
import './ReviewTab.scss';

interface ReviewTabProps {
  chatState: ChatPanelState;
  setChatState: React.Dispatch<React.SetStateAction<ChatPanelState>>;
  documentContent: string;
  documentTitle?: string;
  workspaceId: string;
  unitId?: string;
  onSwitchToChatTab: () => void;
}

const ReviewTab: React.FC<ReviewTabProps> = ({
  chatState,
  setChatState,
  documentContent,
  documentTitle,
  workspaceId,
  unitId,
  onSwitchToChatTab
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showInputArea, setShowInputArea] = useState(false);
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

  // Reset input area when switching tabs
  useEffect(() => {
    if (chatState.activeTab !== 'review') {
      setShowInputArea(false);
      setInputValue('');
    }
  }, [chatState.activeTab]);

  // Helper function to check if response is empty
  const isEmptyResponse = (message: string): boolean => {
    return !message || message.trim().length === 0;
  };

  const handleQuestionClick = useCallback(async (questionId: string) => {
    const reviewQuestion = PREDEFINED_REVIEW_QUESTIONS.find(q => q.id === questionId);
    if (!reviewQuestion) return;

    if (reviewQuestion.apiType === 'custom') {
      // For custom instruction, show input area in Review tab
      setShowInputArea(true);
      return;
    }

    // Валидация: проверяем что есть контент для анализа
    if (!documentContent || documentContent.trim().length === 0) {
      setChatState(prev => ({
        ...prev,
        error: 'No document content available to analyze. Please ensure the document has content before using review suggestions.'
      }));
      return;
    }

    // No additional validation needed - we send the question text directly

    setIsLoading(true);

    // Add user question to chat
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: reviewQuestion.question,
      type: 'user',
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      reviewMessages: [...prev.reviewMessages, newUserMessage],
      isLoading: true
    }));

    try {
      // Use review endpoint for predefined suggestions
      let response = await chatGPTService.sendReviewRequest(
        reviewQuestion.question,
        documentContent,
        unitId || workspaceId
      );

      // Fallback: if review response is empty, try custom command with same text
      if (isEmptyResponse(response.message)) {
        console.log('Review response is empty, trying custom command fallback for:', reviewQuestion.question);
        response = await chatGPTService.sendCustomCommand(
          reviewQuestion.question,
          documentContent,
          unitId || workspaceId
        );
        // Ensure isSuggestion is true for consistent UI display
        response.isSuggestion = true;
      }

      // Add AI response to chat - handle empty responses
      const responseContent = isEmptyResponse(response.message) 
        ? 'No response received from the AI service. Please try again or use a different approach.'
        : response.message;

      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        type: 'assistant',
        timestamp: new Date(),
        isSuggestion: response.isSuggestion
      };

      setChatState(prev => ({
        ...prev,
        reviewMessages: [...prev.reviewMessages, newAiMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending review question:', error);
      
      // Fallback: if error is 422 (Unprocessable Entity), try custom command
      if (error instanceof ChatGPTApiError && error.error.code === 'HTTP_422') {
        console.log('Received 422 error, trying custom command fallback for:', reviewQuestion.question);
        try {
          const fallbackResponse = await chatGPTService.sendCustomCommand(
            reviewQuestion.question,
            documentContent,
            unitId || workspaceId
          );
          // Ensure isSuggestion is true for consistent UI display
          fallbackResponse.isSuggestion = true;

          // Add fallback response to chat - handle empty responses
          const fallbackContent = isEmptyResponse(fallbackResponse.message) 
            ? 'No response received from the AI service. Please try again or use a different approach.'
            : fallbackResponse.message;

          const newAiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: fallbackContent,
            type: 'assistant',
            timestamp: new Date(),
            isSuggestion: fallbackResponse.isSuggestion
          };

          setChatState(prev => ({
            ...prev,
            reviewMessages: [...prev.reviewMessages, newAiMessage],
            isLoading: false
          }));
        } catch (fallbackError) {
          console.error('Fallback custom command also failed:', fallbackError);
          
          // Add fallback error message to chat for dismiss functionality
          const fallbackErrorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: fallbackError instanceof Error ? fallbackError.message : 'Failed to send question. Please try again.',
            type: 'assistant',
            timestamp: new Date(),
            isSuggestion: false
          };

          setChatState(prev => ({
            ...prev,
            reviewMessages: [...prev.reviewMessages, fallbackErrorMessage],
            isLoading: false,
            error: fallbackError instanceof Error ? fallbackError.message : 'Failed to send question'
          }));
        }
      } else {
        // Handle other errors normally - add error message to chat for dismiss functionality
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: error instanceof Error ? error.message : 'Failed to send question. Please try again.',
          type: 'assistant',
          timestamp: new Date(),
          isSuggestion: false
        };

        setChatState(prev => ({
          ...prev,
          reviewMessages: [...prev.reviewMessages, errorMessage],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to send question'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [documentContent, documentTitle, workspaceId, chatState.reviewMessages, setChatState, onSwitchToChatTab]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    // Валидация: проверяем что есть контент для анализа
    if (!documentContent || documentContent.trim().length === 0) {
      setChatState(prev => ({
        ...prev,
        error: 'No document content available to analyze. Please ensure the document has content before sending custom messages.'
      }));
      return;
    }

    const messageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      reviewMessages: [...prev.reviewMessages, newUserMessage],
      isLoading: true
    }));

    try {
      // For custom user messages in Review tab, use custom-command endpoint
      const response = await chatGPTService.sendCustomCommand(
        messageText,
        documentContent,
        unitId || workspaceId
      );

      // Handle empty responses in custom messages too
      const messageContent = isEmptyResponse(response.message) 
        ? 'No response received from the AI service. Please try again or use a different approach.'
        : response.message;

      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: messageContent,
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        reviewMessages: [...prev.reviewMessages, newAiMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat for dismiss functionality
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        type: 'assistant',
        timestamp: new Date(),
        isSuggestion: false
      };

      setChatState(prev => ({
        ...prev,
        reviewMessages: [...prev.reviewMessages, errorMessage],
        error: error instanceof Error ? error.message : 'Failed to send message',
        isLoading: false
      }));
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, documentContent, documentTitle, workspaceId, chatState.reviewMessages, setChatState]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleDismissMessage = useCallback(() => {
    // Clear ALL chat history (like Clear button)
    setChatState(prev => ({
      ...prev,
      chatMessages: [],
      reviewMessages: []
    }));
    // Hide input area when clearing history
    setShowInputArea(false);
    // Reset input value
    setInputValue('');
  }, [setChatState]);

  return (
    <div className="review-tab">
      {/* Spacer для пустого пространства */}
      {chatState.reviewMessages.length === 0 && <div className="review-tab__spacer" />}
      
      {/* Content Area - показываем когда нет сообщений */}
      {chatState.reviewMessages.length === 0 && (
        <div className="review-tab__content">
          <div className="review-tab__intro">
            {/* Пустая intro секция для выравнивания layout с ChatTab */}
          </div>
          <div className="review-tab__suggestions">
            <div className="review-tab__suggestions-container">
              <div className="review-tab__suggestions-title">Suggestions</div>
              <div className="review-tab__suggestions-grid">
                {PREDEFINED_REVIEW_QUESTIONS.map((question, index) => (
                  <div 
                    key={question.id}
                    className={`review-tab__suggestion-item review-tab__suggestion-item--${
                      ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][index]
                    }`}
                    onClick={() => handleQuestionClick(question.id)}
                  >
                    <div className="review-tab__suggestion-content">
                      <div className="review-tab__suggestion-text">
                        <div className="review-tab__suggestion-label">{question.question}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      {chatState.reviewMessages.length > 0 && (
        <div className="review-messages">
          {chatState.reviewMessages.map((message) => (
            <ReviewMessageComponent 
              key={message.id} 
              message={message}
              onCopy={() => {
                console.log('Review message copied:', message.id);
                // Additional feedback can be added here if needed
              }}
              onDismiss={handleDismissMessage}
            />
          ))}
          {(chatState.isLoading || isLoading) && (
            <LoadingMessage text="Analyzing document" />
          )}
        </div>
      )}

      {/* Loading State */}
      {(chatState.isLoading || isLoading) && chatState.reviewMessages.length === 0 && (
        <div className="review-loading">
          <LoadingMessage text="Analyzing your document" />
        </div>
      )}

      {/* Input Area - показываем только для custom request */}
      {showInputArea && (
        <div className="review-tab__input-area">
        <div className="review-tab__input-wrapper">
          <div className="review-tab__input-container">
            <textarea 
              ref={textareaRef}
              className="review-tab__input" 
              placeholder="Ask, write or search for anything..." 
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading || chatState.isLoading}
              rows={1}
            />
            <button 
              className="review-tab__send-button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || chatState.isLoading}
              type="button"
            >
              <SendMessageIcon className="review-tab__send-icon" />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ReviewTab; 