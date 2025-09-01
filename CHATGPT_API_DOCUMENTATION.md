# ChatGPT Integration API Documentation

This document describes the API endpoints required for the ChatGPT integration feature in the Dokably document platform.

## Overview

The ChatGPT integration allows users to interact with AI to analyze, review, and get suggestions about their document content. The frontend sends document context along with user questions to get relevant AI responses.

## Base URL

```
/api/chatgpt
```

## Authentication

All requests should include appropriate authentication headers based on the existing Dokably authentication system.

```
Authorization: Bearer <user_token>
```

## Endpoints

### 1. Send Chat Message

**Endpoint:** `POST /api/chatgpt/chat`

**Description:** Send a user message along with document context to ChatGPT and receive an AI response.

**Request Body:**

```typescript
interface ChatGPTRequest {
  message: string;                    // User's question or request
  documentContext: {
    content: string;                  // Full document text content
    title?: string;                   // Document title (optional)
    metadata?: Record<string, any>;   // Additional document metadata (optional)
  };
  conversationHistory?: Array<{       // Previous conversation messages (optional)
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isSuggestion?: boolean;
  }>;
}
```

**Example Request:**

```json
{
  "message": "Please summarize this document in 2-3 key points",
  "documentContext": {
    "content": "We can and must work with the strategic innovation of food systems to meet the greatest societal challenges. This is the fundamental proposal of the approach for systems change: Nordic innovation strategies for sustainable food systems. This cookbook of strategies demonstrates the role that a strong public innovation plays in the drive towards sustainable food systems.",
    "title": "System Change",
    "metadata": {
      "wordCount": 456,
      "lastModified": "2024-01-15T10:30:00Z"
    }
  },
  "conversationHistory": []
}
```

**Response:**

```typescript
interface ChatGPTResponse {
  message: string;          // AI response text
  isSuggestion: boolean;    // Whether this is a suggestion for document changes
  confidence?: number;      // Confidence score (0-1)
  suggestions?: string[];   // Additional suggestions if applicable
}
```

**Example Response:**

```json
{
  "message": "Based on the document content, here are the key points:\n\n1. **Strategic Innovation Focus**: The document emphasizes working with strategic innovation in food systems to address major societal challenges.\n\n2. **Systems Change Approach**: It presents a fundamental proposal for systems change, specifically targeting Nordic innovation strategies for sustainable food systems.\n\n3. **Public Innovation Role**: The content highlights the important role that strong public innovation plays in driving towards sustainable food systems.",
  "isSuggestion": false,
  "confidence": 0.9
}
```

**Error Responses:**

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

**Common Error Codes:**

- `VALIDATION_ERROR` - Invalid request parameters
- `DOCUMENT_TOO_LARGE` - Document content exceeds maximum size limit
- `RATE_LIMIT_EXCEEDED` - Too many requests from user
- `AI_SERVICE_UNAVAILABLE` - ChatGPT service is temporarily unavailable
- `AUTHORIZATION_FAILED` - Invalid or expired authentication token

## Request/Response Examples

### Summarization Request

```json
{
  "message": "Please summarize this document in 2-3 key points",
  "documentContext": {
    "content": "Document content here...",
    "title": "My Document"
  }
}
```

### Improvement Suggestion Request

```json
{
  "message": "How can I improve the clarity and readability of this text?",
  "documentContext": {
    "content": "Document content here...",
    "title": "My Document"
  }
}
```

**Expected Response for Improvements:**

```json
{
  "message": "Here are several ways to enhance this document's clarity and impact:\n\n**Structure & Flow:**\n- Consider adding a clear executive summary\n- Break down complex sentences\n- Add transition sentences between paragraphs",
  "isSuggestion": true,
  "confidence": 0.85,
  "suggestions": [
    "Use more active voice",
    "Add specific examples", 
    "Improve paragraph transitions"
  ]
}
```

## Implementation Requirements

### Document Processing

1. **Content Extraction**: The backend should be able to extract plain text content from documents
2. **Size Limits**: Implement reasonable limits on document size (recommended: 50KB max)
3. **Content Sanitization**: Remove any sensitive information before sending to AI service

### AI Integration

1. **ChatGPT API**: Integration with OpenAI's ChatGPT API or similar service
2. **Context Management**: Maintain conversation context for follow-up questions
3. **Response Processing**: Parse and format AI responses appropriately

### Performance Considerations

1. **Async Processing**: Implement async handling for AI requests
2. **Caching**: Consider caching responses for identical document content + question combinations
3. **Rate Limiting**: Implement user-level rate limiting to prevent abuse
4. **Timeouts**: Set appropriate timeouts for AI service calls (recommended: 30 seconds)

### Security

1. **Input Validation**: Validate all input parameters
2. **Content Filtering**: Filter out potentially harmful content
3. **Privacy**: Ensure document content is handled securely and not stored by AI service
4. **Authentication**: Verify user permissions for document access

## Error Handling

The API should handle various error scenarios gracefully:

1. **Network Issues**: Retry logic for temporary failures
2. **AI Service Errors**: Fallback responses when AI service is unavailable  
3. **Invalid Input**: Clear validation error messages
4. **Rate Limiting**: Informative messages about request limits

## Frontend Integration

The frontend expects the following behavior:

1. **Loading States**: API should support reasonable response times with loading indicators
2. **Error Messages**: User-friendly error messages for different failure scenarios
3. **Conversation History**: Support for maintaining chat history within a session
4. **Suggestion Handling**: Distinguish between regular responses and improvement suggestions

## Testing

Recommended test scenarios:

1. **Basic Chat**: Simple question about document content
2. **Summarization**: Request for document summary
3. **Improvements**: Request for writing suggestions
4. **Empty Document**: Handling of empty or minimal content
5. **Large Documents**: Testing with maximum size documents
6. **Rate Limiting**: Testing rate limit enforcement
7. **Error Scenarios**: Various error conditions

## Environment Configuration

Recommended environment variables:

```
OPENAI_API_KEY=your_openai_api_key
CHATGPT_MODEL=gpt-3.5-turbo
MAX_DOCUMENT_SIZE=51200
RATE_LIMIT_PER_USER=100
RATE_LIMIT_WINDOW=3600
```

## Monitoring and Analytics

Consider implementing:

1. **Usage Metrics**: Track API usage per user/document
2. **Performance Metrics**: Response times and error rates
3. **Cost Tracking**: Monitor AI service usage costs
4. **User Feedback**: Track user satisfaction with AI responses 