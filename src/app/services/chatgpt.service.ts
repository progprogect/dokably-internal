import { 
  ChatGPTRequest, 
  ChatGPTResponse, 
  ChatGPTApiError,
  ChatGPTChatRequest,
  ChatGPTReviewRequest,
  ChatGPTCustomCommandRequest
} from '../../entities/models/ChatGPT';
import { BASE_API } from '../constants/endpoints';
import customFetch from '../utils/customFetch';

class ChatGPTService {
  private mockMode = false; // Switch to real API mode

  /**
   * Send a chat message to /chatgpt/chat endpoint
   */
  async sendChatMessage(message: string, unitId: string): Promise<ChatGPTResponse> {
    if (this.mockMode) {
      return this.mockSendMessage({ message, documentContext: { content: '' } });
    }

    try {
      const requestBody: ChatGPTChatRequest = { message, content: null };
      
      const response = await customFetch(
        `${BASE_API}/frontend/unit/${unitId}/chatgpt/chat`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );

      return await this.handleApiResponse(response, 'chat');
    } catch (error) {
      return this.handleApiError(error, 'chat');
    }
  }

  /**
   * Send a review request to /chatgpt/review endpoint
   */
  async sendReviewRequest(type: string, content: string, unitId: string): Promise<ChatGPTResponse> {
    if (this.mockMode) {
      return this.mockSendMessage({ message: type, documentContext: { content } });
    }

    try {
      const requestBody: ChatGPTReviewRequest = { type, content };
      const url = `${BASE_API}/frontend/unit/${unitId}/chatgpt/review`;
      

      
      const response = await customFetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      return await this.handleApiResponse(response, 'review');
    } catch (error) {
      return this.handleApiError(error, 'review');
    }
  }

  /**
   * Send a custom command request to /chatgpt/custom-command endpoint
   */
  async sendCustomCommand(command: string, content: string, unitId: string): Promise<ChatGPTResponse> {
    if (this.mockMode) {
      return this.mockSendMessage({ message: command, documentContext: { content } });
    }

    try {
      const requestBody: ChatGPTCustomCommandRequest = { command, content };
      
      const response = await customFetch(
        `${BASE_API}/frontend/unit/${unitId}/chatgpt/custom-command`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );

      return await this.handleApiResponse(response, 'custom-command');
    } catch (error) {
      return this.handleApiError(error, 'custom-command');
    }
  }

  /**
   * Get chat history for a specific unit from API
   */
  async getChatHistory(unitId: string): Promise<any[]> {
    if (this.mockMode) {
      // Return mock data for development
      return [
        {
          id: '1',
          question: 'Test question',
          response: 'Test response',
          createdAt: new Date().toISOString()
        }
      ];
    }

    try {
      const url = `${BASE_API}/frontend/unit/${unitId}/chatgpt/history`;
      

      
      const response = await customFetch(url, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        

        
        throw new ChatGPTApiError({
          code: `HTTP_${response.status}`,
          message: errorData.message || `Failed to fetch chat history: ${response.status}`,
          details: { endpoint: 'history', url: response.url, ...errorData }
        });
      }

      const data = await response.json();
      

      
      // Handle array response format according to API spec
      if (Array.isArray(data)) {
        return data;
      } else if (data.history && Array.isArray(data.history)) {
        return data.history;
      } else {
        throw new ChatGPTApiError({
          code: 'INVALID_RESPONSE',
          message: 'Received unexpected response format from chat history API',
          details: { endpoint: 'history', data }
        });
      }
    } catch (error) {
      if (error instanceof ChatGPTApiError) {
        throw error;
      }
      

      throw new ChatGPTApiError({
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch chat history due to network error',
        details: { endpoint: 'history', error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Legacy method for backward compatibility - will route to appropriate endpoint
   * @deprecated Use specific methods instead
   */
  async sendMessage(request: ChatGPTRequest, unitId: string): Promise<ChatGPTResponse> {
    // For backward compatibility, route to chat endpoint
    return this.sendChatMessage(request.message, unitId);
  }

  /**
   * Handle API response uniformly across all endpoints
   */
  private async handleApiResponse(response: Response, endpoint: string): Promise<ChatGPTResponse> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      

      
      throw new ChatGPTApiError({
        code: `HTTP_${response.status}`,
        message: errorData.message || `HTTP error! status: ${response.status}`,
        details: { endpoint, url: response.url, ...errorData }
      });
    }

    const data = await response.json();
    
    // Handle different response formats
    if (data.message) {
      return {
        message: data.message,
        isSuggestion: endpoint === 'review',
        confidence: 0.9
      };
    } else if (data.user && data.role) {
      // Handle legacy chat response format
      return {
        message: `Response from ${data.user.name || 'AI'}: ${data.role || 'Processing your request...'}`,
        isSuggestion: false,
        confidence: 0.7
      };
    } else {
      throw new ChatGPTApiError({
        code: 'INVALID_RESPONSE',
        message: 'Received unexpected response format from API',
        details: { endpoint, data }
      });
    }
  }

  /**
   * Enhanced error handling for common API scenarios
   */
  private handleApiError(error: any, endpoint: string): Promise<ChatGPTResponse> {
    if (error instanceof ChatGPTApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ChatGPTApiError({
        code: 'REQUEST_TIMEOUT',
        message: 'Request timed out. Please try again.',
        details: { endpoint }
      });
    }
    
    if (error.status === 401) {
      throw new ChatGPTApiError({
        code: 'UNAUTHORIZED',
        message: 'Authentication failed. Please refresh the page and try again.',
        details: { endpoint }
      });
    }
    
    if (error.status === 403) {
      throw new ChatGPTApiError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to use ChatGPT features.',
        details: { endpoint }
      });
    }
    
    if (error.status === 429) {
      throw new ChatGPTApiError({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait a moment before trying again.',
        details: { endpoint }
      });
    }
    
    if (error.status >= 500) {
      throw new ChatGPTApiError({
        code: 'SERVER_ERROR',
        message: 'ChatGPT service is temporarily unavailable. Please try again later.',
        details: { endpoint }
      });
    }
    
    // Default error
    throw new ChatGPTApiError({
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to ChatGPT service. Please check your internet connection.',
      details: { endpoint, originalError: error }
    });
  }

  /**
   * Mock implementation for development
   */
  private async mockSendMessage(request: ChatGPTRequest): Promise<ChatGPTResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    const message = request.message.toLowerCase();
    const documentLength = request.documentContext.content.length;
    
    // Simulate different types of responses based on the question
    if (message.includes('summarize') || message.includes('summary')) {
      return {
        message: this.generateSummaryResponse(request.documentContext.content),
        isSuggestion: false,
        confidence: 0.9
      };
    }
    
    if (message.includes('improve') || message.includes('better') || message.includes('enhance')) {
      return {
        message: this.generateImprovementResponse(),
        isSuggestion: true,
        confidence: 0.85,
        suggestions: [
          'Use more active voice',
          'Add specific examples',
          'Improve paragraph transitions'
        ]
      };
    }
    
    if (message.includes('grammar') || message.includes('spelling') || message.includes('errors')) {
      return {
        message: this.generateGrammarResponse(),
        isSuggestion: true,
        confidence: 0.95
      };
    }
    
    if (message.includes('structure') || message.includes('organize') || message.includes('format')) {
      return {
        message: this.generateStructureResponse(),
        isSuggestion: true,
        confidence: 0.8
      };
    }
    
    if (message.includes('insights') || message.includes('takeaways') || message.includes('key points')) {
      return {
        message: this.generateInsightsResponse(request.documentContext.content),
        isSuggestion: false,
        confidence: 0.87
      };
    }

    // Handle empty document
    if (documentLength === 0) {
      return {
        message: "I notice the document appears to be empty. Please add some content to the document so I can provide meaningful analysis and suggestions.",
        isSuggestion: false,
        confidence: 1.0
      };
    }

    // Handle questions not related to document
    if (this.isOffTopicQuestion(message)) {
      return {
        message: "I'm designed to help with document analysis and improvement. Please ask questions related to the content of this document, such as requesting summaries, improvements, or feedback on the text.",
        isSuggestion: false,
        confidence: 0.95
      };
    }

    // Default response for general questions
    return {
      message: this.generateGeneralResponse(request.documentContext.content, request.message),
      isSuggestion: false,
      confidence: 0.75
    };
  }

  private generateSummaryResponse(content: string): string {
    const wordCount = content.split(' ').length;
    if (wordCount < 50) {
      return "This document is quite brief. The main content discusses system changes and innovation strategies for sustainable food systems, emphasizing the role of public innovation in addressing societal challenges.";
    }
    
    return `Based on the document content, here are the key points:

1. **Strategic Innovation Focus**: The document emphasizes working with strategic innovation in food systems to address major societal challenges.

2. **Systems Change Approach**: It presents a fundamental proposal for systems change, specifically targeting Nordic innovation strategies for sustainable food systems.

3. **Public Innovation Role**: The content highlights the important role that strong public innovation plays in driving towards sustainable food systems.

The document appears to be part of a larger strategy or cookbook demonstrating practical approaches to food system transformation.`;
  }

  private generateImprovementResponse(): string {
    return `Looking at your opening, I can see you're making a strong, clear argument! Here are a few key ways to polish to make it even more impactful:

**1. We could strengthen the opening hook** - Right now it jumps straight into "We can and must..." without setting up why food systems innovation is urgent. A brief sentence about the challenges we're facing could draw readers in more powerfully.

**2. We could smooth out the flow between sentences** - The transition from your opening statement to introducing the book feels a bit abrupt. We could create a more natural bridge that connects your big-picture argument to this specific resource.

**3. We could clarify what makes these strategies distinctly "Nordic"** - You mention Nordic innovation strategies, but we could hint at what makes their approach unique or worth highlighting, which would help readers understand why this particular cookbook matters.

Your core message is compelling and your voice comes through clearly! Would you like me to take a shot at editing any of these elements? I'm happy to work on whichever feels most useful to you.`;
  }

  private generateGrammarResponse(): string {
    return `I've reviewed the document for grammar and spelling issues. Here are my findings:

**Grammar Analysis:**
- The text appears to be well-written overall
- Consider reviewing some complex sentence structures for clarity
- Ensure consistent tense usage throughout the document

**Style Recommendations:**
- Watch for passive voice usage - consider converting to active voice where appropriate
- Check for comma usage in complex sentences
- Ensure parallel structure in lists and series

**Overall Assessment:**
The document maintains a professional tone and appears to be largely error-free. Minor refinements to sentence structure could enhance readability.`;
  }

  private generateStructureResponse(): string {
    return `Here are suggestions for improving the document's structure and organization:

**Document Architecture:**
1. **Introduction** - Clearly state the purpose and scope
2. **Main Sections** - Organize content into logical, themed sections
3. **Supporting Evidence** - Include data, examples, or case studies
4. **Conclusion** - Summarize key points and next steps

**Formatting Improvements:**
- Use consistent heading styles (H1, H2, H3)
- Add clear section breaks
- Consider using visual elements like bullet points or tables
- Ensure logical flow from one section to the next

**Content Organization:**
- Group related concepts together
- Present information in order of importance
- Add clear topic sentences to each paragraph

This structure would make the document more scannable and easier to navigate for readers.`;
  }

  private generateInsightsResponse(content: string): string {
    return `Key insights and takeaways from this document:

**Primary Themes:**
1. **Innovation as a Driver**: The document positions strategic innovation as crucial for addressing food system challenges
2. **Systems Thinking**: Emphasizes the need for comprehensive, systemic approaches rather than isolated solutions
3. **Public Sector Role**: Highlights the importance of public innovation in sustainable transformation

**Strategic Implications:**
- Food system transformation requires coordinated innovation strategies
- Nordic approaches may offer replicable models for other regions
- Strong public sector involvement is essential for sustainable outcomes

**Actionable Insights:**
- Organizations should adopt systems-thinking approaches to food innovation
- Public-private partnerships may be key to successful implementation
- Sustainable food systems require both strategic planning and practical execution

These insights suggest a comprehensive approach to food system innovation that balances strategic vision with practical execution.`;
  }

  private generateGeneralResponse(content: string, question: string): string {
    const responses = [
      `Based on the document content, I can help answer your question about "${question}". The document discusses strategic innovation in food systems and sustainable transformation approaches.`,
      
      `Looking at the document, I notice it focuses on system change and innovation strategies. Could you be more specific about what aspect you'd like me to analyze or expand upon?`,
      
      `The document covers important topics related to food system innovation. To provide the most helpful response, could you clarify what specific information you're seeking about this content?`,
      
      `This document presents interesting perspectives on sustainable food systems. I'd be happy to dive deeper into any specific section or concept you'd like to explore further.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private isOffTopicQuestion(message: string): boolean {
    const offTopicKeywords = [
      'weather', 'sports', 'movies', 'music', 'politics', 'celebrities',
      'cooking recipe', 'travel', 'shopping', 'games', 'joke', 'story'
    ];
    
    return offTopicKeywords.some(keyword => message.includes(keyword));
  }
}

// Create and export a singleton instance
export const chatGPTService = new ChatGPTService(); 