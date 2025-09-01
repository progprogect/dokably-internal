import React, { useState, useCallback, useEffect } from 'react';
import cn from 'classnames';
import { ChatMessage, ChatPanelState } from '../../../entities/models/ChatGPT';
import { generateDocumentId, loadChatHistory, saveChatHistory } from '../../../app/utils/chatHistory';
import ChatTab from './ChatTab';
import ReviewTab from './ReviewTab';
import { ReactComponent as ArrowIcon } from '../../images/arrow.svg';
import './ChatPanel.scss';
import { chatGPTService } from '@app/services/chatgpt.service';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  unitId?: string; // Current unit/document ID for API calls
  documentContent: string;
  documentTitle?: string;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  workspaceId,
  unitId,
  documentContent,
  documentTitle,
  className = ''
}) => {
  const documentId = generateDocumentId(workspaceId);
  
  const [chatState, setChatState] = useState<ChatPanelState>({
    isOpen,
    activeTab: 'chat',
    chatMessages: [],
    reviewMessages: [],
    isLoading: false
  });

  // Convert API history items to chat messages
  const convertHistoryToMessages = (historyItems: any[]): { chat: ChatMessage[], review: ChatMessage[] } => {
    const chatMessages: ChatMessage[] = [];
    const reviewMessages: ChatMessage[] = []; // Review messages are not part of this history API

    historyItems.forEach(item => {
      chatMessages.push({
        id: `${item.id}-question`,
        type: 'user',
        content: item.question,
        timestamp: new Date(item.createdAt)
      });
      chatMessages.push({
        id: `${item.id}-response`,
        type: 'assistant',
        content: item.response,
        timestamp: new Date(item.createdAt),
        isSuggestion: false
      });
    });
    return { chat: chatMessages, review: reviewMessages };
  };

  // Load chat history when component mounts or unitId changes
  useEffect(() => {
    const loadHistoryFromAPI = async () => {
      // Try to load from API using unitId (specific document/unit)
      if (unitId) {
        try {
          console.log('Loading chat history from API for unitId:', unitId);
          const historyItems = await chatGPTService.getChatHistory(unitId);
          const { chat, review } = convertHistoryToMessages(historyItems);
          
          setChatState(prev => ({
            ...prev,
            chatMessages: chat,
            reviewMessages: review
          }));
          
          console.log('Successfully loaded chat history from API:', { 
            chatCount: chat.length, 
            reviewCount: review.length 
          });
          return;
        } catch (error) {
          console.warn('Failed to load chat history from API, falling back to localStorage:', error);
        }
      }
      
      // Fallback to localStorage if API fails or unitId not available
      console.log('Loading chat history from localStorage for documentId:', documentId);
      const savedChatMessages = loadChatHistory(documentId, 'chat');
      const savedReviewMessages = loadChatHistory(documentId, 'review');
      
      setChatState(prev => ({
        ...prev,
        chatMessages: savedChatMessages,
        reviewMessages: savedReviewMessages
      }));
    };

    loadHistoryFromAPI();
  }, [unitId, documentId]);



  // Save chat history whenever messages change
  useEffect(() => {
    if (chatState.chatMessages.length > 0 || chatState.reviewMessages.length > 0) {
      saveChatHistory(documentId, chatState.chatMessages, chatState.reviewMessages, documentTitle);
    }
  }, [documentId, chatState.chatMessages, chatState.reviewMessages, documentTitle]);

  const handleTabSwitch = useCallback((tab: 'chat' | 'review') => {
    setChatState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, []);

  const handleMinimize = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSwitchToChatTab = useCallback(() => {
    handleTabSwitch('chat');
  }, [handleTabSwitch]);

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div 
      className={cn(
        'chat-panel',
        { 'chat-panel--open': isOpen },
        className
      )}
    >
      <div className="chat-panel__overlay" onClick={handleOverlayClick} />
      <div className="chat-panel__content" onClick={handleContentClick}>
        <div className="chat-panel__header">
          <div className="chat-panel__toolbar">
            <div className="chat-panel__toolbar-left">
              {/* Logo or title could go here */}
              <button
                className="chat-panel__toolbar-button"
                onClick={handleMinimize}
                type="button"
                aria-label="Minimize chat"
                title="Minimize chat"
              >
                <ArrowIcon className="chat-panel__icon" />
              </button>
            </div>

          </div>
          
          <div className="chat-panel__tabs">
            <button
              className={cn(
                'chat-panel__tab',
                { 'chat-panel__tab--active': chatState.activeTab === 'chat' }
              )}
              onClick={() => handleTabSwitch('chat')}
              type="button"
            >
              <span className="chat-panel__tab-text">Chat</span>
              {chatState.activeTab === 'chat' && (
                <div className="chat-panel__tab-indicator" />
              )}
            </button>
            
            <button
              className={cn(
                'chat-panel__tab',
                { 'chat-panel__tab--active': chatState.activeTab === 'review' }
              )}
              onClick={() => handleTabSwitch('review')}
              type="button"
            >
              <span className="chat-panel__tab-text">Review</span>
              {chatState.activeTab === 'review' && (
                <div className="chat-panel__tab-indicator" />
              )}
            </button>
          </div>
        </div>
        
        <div className="chat-panel__body">
          {chatState.activeTab === 'chat' && (
            <ChatTab
              chatState={chatState}
              setChatState={setChatState}
              documentContent={documentContent}
              documentTitle={documentTitle}
              workspaceId={workspaceId}
              unitId={unitId}
            />
          )}
          
          {chatState.activeTab === 'review' && (
            <ReviewTab
              chatState={chatState}
              setChatState={setChatState}
              documentContent={documentContent}
              documentTitle={documentTitle}
              workspaceId={workspaceId}
              unitId={unitId}
              onSwitchToChatTab={handleSwitchToChatTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 