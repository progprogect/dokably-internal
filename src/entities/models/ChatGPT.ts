export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isSuggestion?: boolean;
}

export interface ReviewQuestion {
  id: string;
  question: string;
  category?: string;
  apiType?: string; // For mapping to API request
}

export interface ChatPanelState {
  isOpen: boolean;
  activeTab: 'chat' | 'review';
  chatMessages: ChatMessage[];
  reviewMessages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}

export interface DocumentContext {
  content: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface ChatGPTRequest {
  message: string;
  documentContext: DocumentContext;
  conversationHistory?: ChatMessage[];
}

export interface ChatGPTChatRequest {
  message: string;
  content: null;
}

export interface ChatGPTReviewRequest {
  type: string;
  content: string;
}

export interface ChatGPTCustomCommandRequest {
  command: string;
  content: string;
}

export interface ChatGPTResponse {
  message: string;
  isSuggestion: boolean;
  confidence?: number;
  suggestions?: string[];
}

export interface ChatGPTError {
  code: string;
  message: string;
  details?: any;
}

export class ChatGPTApiError extends Error {
  constructor(public error: ChatGPTError) {
    super(error.message);
    this.name = 'ChatGPTApiError';
  }
}

export const PREDEFINED_REVIEW_QUESTIONS: ReviewQuestion[] = [
  {
    id: 'summarize',
    question: 'Summarise this doc',
    category: 'analysis',
    apiType: 'summarize'
  },
  {
    id: 'grammar-check',
    question: 'Fix grammar and spelling errors',
    category: 'correction',
    apiType: 'grammar'
  },
  {
    id: 'improve-writing',
    question: 'Improve writing',
    category: 'improvement', 
    apiType: 'improve'
  },
  {
    id: 'make-shorter',
    question: 'Make shorter',
    category: 'editing',
    apiType: 'shorten'
  },
  {
    id: 'make-longer',
    question: 'Make longer',
    category: 'editing',
    apiType: 'expand'
  },
  {
    id: 'custom-instruction',
    question: 'Run your custom instruction',
    category: 'custom',
    apiType: 'custom'
  }
];

export interface ChatGPTComponentProps {
  documentContent: string;
  documentTitle?: string;
  className?: string;
  onError?: (error: ChatGPTError) => void;
} 