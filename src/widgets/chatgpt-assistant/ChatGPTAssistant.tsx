import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FloatingChatButton from '@shared/uikit/floating-chat-button';
import { ChatPanel } from '@shared/uikit/chat-panel';
import { useWorkspaceContext } from '@app/context/workspace/context';
import useUser from '@app/hooks/useUser';
import './ChatGPTAssistant.scss';

interface ChatGPTAssistantProps {
  className?: string;
}

const ChatGPTAssistant: React.FC<ChatGPTAssistantProps> = ({ className = '' }) => {
  const { activeWorkspace } = useWorkspaceContext();
  const { documentId } = useParams(); // Extract unitId from URL
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');

  // Определяем, является ли пользователь гостем
  const isGuest = activeWorkspace?.userRole === 'guest' || user?.email === 'anonymous';

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Extract document content from the page
  useEffect(() => {
    // Only extract content if we have an active workspace
    if (!activeWorkspace?.id) {
      return;
    }
    
    const extractDocumentContent = () => {
      // Look for the main content area
      const contentSelectors = [
        '.dokably-editor', // Dokably editor content
        '[data-document-content]', // Custom data attribute
        '.document-content', // Generic document content
        '#home-layout', // Fallback to home layout content
      ];

      let content = '';
      let title = '';

      // Try to find document content
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          // Extract text content, removing extra whitespace
          content = element.textContent?.replace(/\s+/g, ' ').trim() || '';
          break;
        }
      }

      // Try to find document title
      const titleSelectors = [
        '.document-title',
        '[data-document-title]',
        'h1',
        'title'
      ];

      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          title = element.textContent.trim();
          break;
        }
      }

      // Fallback to page title if no document title found
      if (!title) {
        title = document.title || 'Untitled Document';
      }

      setDocumentContent(content);
      setDocumentTitle(title);
    };

    // Extract content initially
    extractDocumentContent();

    // Set up observer to watch for content changes
    const observer = new MutationObserver(() => {
      extractDocumentContent();
    });

    // Observe changes in the document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [activeWorkspace?.id]);

  // Don't render if no active workspace or if user is a guest
  if (!activeWorkspace?.id || isGuest) {
    return null;
  }

  return (
    <div className={`chatgpt-assistant ${className}`}>
      <FloatingChatButton
        isOpen={isOpen}
        onClick={handleToggle}
      />
      
      <ChatPanel
        isOpen={isOpen}
        onClose={handleClose}
        workspaceId={activeWorkspace.id}
        unitId={documentId} // Pass unitId for API calls
        documentContent={documentContent}
        documentTitle={documentTitle}
      />
    </div>
  );
};

export default ChatGPTAssistant; 