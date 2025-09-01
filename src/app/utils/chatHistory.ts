import { ChatMessage } from '../../entities/models/ChatGPT';

export interface DocumentChatHistory {
  documentId: string;
  chatMessages: ChatMessage[];
  reviewMessages: ChatMessage[];
  lastUpdated: Date;
  documentTitle?: string;
}

const CHAT_HISTORY_KEY = 'dokably_chat_history';
const MAX_HISTORY_ENTRIES = 50; // Limit the number of documents stored

/**
 * Generate a unique document ID based on current URL and workspace
 */
export const generateDocumentId = (workspaceId: string): string => {
  const url = window.location.pathname + window.location.search;
  return `${workspaceId}-${url}`;
};

/**
 * Load all chat histories from localStorage
 */
const loadAllHistories = (): Record<string, DocumentChatHistory> => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    
    // Convert date strings back to Date objects
    Object.keys(parsed).forEach(key => {
      const history = parsed[key];
      history.lastUpdated = new Date(history.lastUpdated);
      
      // Support both old and new format
      if (history.messages && !history.chatMessages) {
        // Migrate old format to new format
        history.chatMessages = history.messages;
        history.reviewMessages = [];
        delete history.messages;
      }
      
      if (history.chatMessages) {
        history.chatMessages.forEach((message: ChatMessage) => {
          message.timestamp = new Date(message.timestamp);
        });
      }
      
      if (history.reviewMessages) {
        history.reviewMessages.forEach((message: ChatMessage) => {
          message.timestamp = new Date(message.timestamp);
        });
      }
    });
    
    return parsed;
  } catch (error) {
    console.warn('Failed to load chat histories from localStorage:', error);
    return {};
  }
};

/**
 * Save all chat histories to localStorage
 */
const saveAllHistories = (histories: Record<string, DocumentChatHistory>): void => {
  try {
    // Clean up old entries if we have too many
    const entries = Object.entries(histories);
    if (entries.length > MAX_HISTORY_ENTRIES) {
      // Sort by lastUpdated and keep only the most recent entries
      const sortedEntries = entries.sort((a, b) => 
        new Date(b[1].lastUpdated).getTime() - new Date(a[1].lastUpdated).getTime()
      );
      
      const limitedHistories: Record<string, DocumentChatHistory> = {};
      sortedEntries.slice(0, MAX_HISTORY_ENTRIES).forEach(([key, value]) => {
        limitedHistories[key] = value;
      });
      
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(limitedHistories));
    } else {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(histories));
    }
  } catch (error) {
    console.warn('Failed to save chat histories to localStorage:', error);
  }
};

/**
 * Load chat history for a specific document and tab
 */
export const loadChatHistory = (documentId: string, tab: 'chat' | 'review'): ChatMessage[] => {
  const histories = loadAllHistories();
  const history = histories[documentId];
  
  if (!history) return [];
  
  return tab === 'chat' ? (history.chatMessages || []) : (history.reviewMessages || []);
};

/**
 * Save chat history for a specific document and tab
 */
export const saveChatHistory = (
  documentId: string, 
  chatMessages: ChatMessage[],
  reviewMessages: ChatMessage[],
  documentTitle?: string
): void => {
  const histories = loadAllHistories();
  
  histories[documentId] = {
    documentId,
    chatMessages,
    reviewMessages,
    lastUpdated: new Date(),
    documentTitle
  };
  
  saveAllHistories(histories);
};

/**
 * Clear chat history for a specific document
 */
export const clearChatHistory = (documentId: string): void => {
  const histories = loadAllHistories();
  delete histories[documentId];
  saveAllHistories(histories);
};

/**
 * Clear all chat histories
 */
export const clearAllChatHistories = (): void => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.warn('Failed to clear chat histories:', error);
  }
};

/**
 * Get all document IDs that have chat history
 */
export const getStoredDocumentIds = (): string[] => {
  const histories = loadAllHistories();
  return Object.keys(histories);
}; 