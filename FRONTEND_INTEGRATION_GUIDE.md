# Frontend Integration Guide - ChatGPT Backend

This guide shows how to integrate your existing frontend chatbot with the new ChatGPT backend.

## 🔄 Update Frontend Chatbot Service

Replace your existing `src/utils/chatbotService.ts` with this updated version that calls the ChatGPT backend:

```typescript
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  metadata?: {
    confidence?: number;
    category?: string;
    sources?: string[];
  };
}

export interface ScanContext {
  hasImage: boolean;
  prediction?: "benign" | "malignant" | "uncertain";
  confidence?: number;
  explanation?: string;
  recommendations?: string[];
}

export interface ChatResponse {
  content: string;
  metadata?: {
    confidence?: number;
    category?: string;
    sources?: string[];
  };
}

class ChatbotService {
  private readonly BACKEND_URL = 'http://localhost:3001';

  async sendMessage(message: string, scanContext?: ScanContext): Promise<ChatResponse> {
    try {
      // Prepare request body
      const requestBody: any = {
        message: message.trim()
      };

      // Add scan result context if available
      if (scanContext?.hasImage && (scanContext.prediction || scanContext.confidence)) {
        requestBody.scanResult = {
          prediction: scanContext.prediction,
          confidence: scanContext.confidence ? `${scanContext.confidence}%` : undefined,
          risk: this.mapPredictionToRisk(scanContext.prediction, scanContext.confidence)
        };
      }

      // Call ChatGPT backend
      const response = await fetch(`${this.BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.reply,
        metadata: {
          confidence: 0.95, // ChatGPT responses are generally high confidence
          category: this.categorizeMessage(message),
          sources: ['ChatGPT-4o-mini']
        }
      };

    } catch (error) {
      console.error("ChatGPT service error:", error);
      
      // Provide helpful error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Unable to connect to AI service. Please check if the backend is running.");
      }
      
      if (error.message.includes('429')) {
        throw new Error("Too many requests. Please wait a moment before trying again.");
      }
      
      if (error.message.includes('503')) {
        throw new Error("AI service is temporarily unavailable. Please try again later.");
      }

      throw new Error("Failed to get AI response. Please try again.");
    }
  }

  /**
   * Map prediction and confidence to risk level
   */
  private mapPredictionToRisk(prediction?: string, confidence?: number): string {
    if (prediction === 'malignant') {
      return 'High';
    }
    
    if (prediction === 'uncertain' || (confidence && confidence < 70)) {
      return 'Medium';
    }
    
    if (prediction === 'benign' && confidence && confidence > 85) {
      return 'Low';
    }
    
    return 'Medium'; // Default to medium for safety
  }

  /**
   * Categorize message for metadata
   */
  private categorizeMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("ai") || lowerMessage.includes("cnn") || lowerMessage.includes("accuracy")) {
      return "technology";
    }
    if (lowerMessage.includes("doctor") || lowerMessage.includes("medical") || lowerMessage.includes("treatment")) {
      return "medical_guidance";
    }
    if (lowerMessage.includes("result") || lowerMessage.includes("confidence") || lowerMessage.includes("mean")) {
      return "result_interpretation";
    }
    if (lowerMessage.includes("prevent") || lowerMessage.includes("protection") || lowerMessage.includes("signs")) {
      return "prevention_education";
    }
    
    return "general";
  }
}

export const chatbotService = new ChatbotService();
```

## 🚀 Setup Instructions

### 1. Start the ChatGPT Backend

```bash
# Navigate to backend directory
cd chatbot-backend

# Install dependencies (first time only)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Update Frontend Environment (Optional)

If you want to make the backend URL configurable, add to your frontend `.env`:

```env
VITE_CHATBOT_BACKEND_URL=http://localhost:3001
```

Then update the service:

```typescript
private readonly BACKEND_URL = import.meta.env.VITE_CHATBOT_BACKEND_URL || 'http://localhost:3001';
```

### 3. Test the Integration

1. Start both servers:
   - Frontend: `npm run dev` (port 8080)
   - Backend: `cd chatbot-backend && npm run dev` (port 3001)

2. Open your app at `http://localhost:8080`

3. Test the chatbot:
   - Ask general questions: "How does AI detect skin cancer?"
   - Upload an image and ask: "What does my result mean?"
   - Try off-topic questions to see AI redirect

## 🔧 Configuration Options

### Backend URL Configuration

For different environments:

```typescript
class ChatbotService {
  private getBackendUrl(): string {
    if (import.meta.env.PROD) {
      return 'https://your-production-backend.com';
    }
    return import.meta.env.VITE_CHATBOT_BACKEND_URL || 'http://localhost:3001';
  }
}
```

### Error Handling Enhancement

Add more specific error handling:

```typescript
async sendMessage(message: string, scanContext?: ScanContext): Promise<ChatResponse> {
  try {
    // ... existing code ...
  } catch (error) {
    // Log error for debugging
    console.error("ChatGPT service error:", error);
    
    // Handle specific error cases
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error("Backend server is not running. Please start the ChatGPT backend service.");
    }
    
    if (error.message.includes('401')) {
      throw new Error("Authentication failed. Please check the API configuration.");
    }
    
    // ... other error cases ...
  }
}
```

## 🧪 Testing the Integration

### Manual Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend can connect to backend
- [ ] General questions work (no scan context)
- [ ] Scan-aware questions work (with scan context)
- [ ] Error handling works (stop backend, try chatbot)
- [ ] Rate limiting works (make many requests quickly)
- [ ] Off-topic questions are handled appropriately

### Test Commands

```bash
# Test backend directly
cd chatbot-backend
node test-backend.js

# Test frontend integration
# 1. Start backend: npm run dev
# 2. Start frontend: npm run dev
# 3. Open browser and test chatbot
```

## 🚨 Troubleshooting

### Common Issues

**1. "Unable to connect to AI service"**
- Check if backend server is running on port 3001
- Verify CORS settings allow frontend domain
- Check browser console for network errors

**2. "OpenAI API key invalid"**
- Verify API key is set in `chatbot-backend/.env`
- Check API key format (should start with `sk-`)
- Ensure you have OpenAI credits available

**3. "Rate limit exceeded"**
- Wait 15 minutes for rate limit to reset
- Adjust rate limits in backend configuration
- Check if multiple users are testing simultaneously

**4. AI gives off-topic responses**
- Check system prompt in `chatgpt-service.js`
- Verify message is being sent correctly
- Review OpenAI model configuration

### Debug Mode

Enable debug logging in the backend:

```javascript
// In server.js, add:
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

## 🌐 Production Deployment

### Backend Deployment

1. **Environment Variables**:
   ```env
   NODE_ENV=production
   OPENAI_API_KEY=your_production_key
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Security Considerations**:
   - Use HTTPS in production
   - Set up proper CORS for your domain
   - Monitor API usage and costs
   - Implement proper logging and monitoring

3. **Deployment Options**:
   - **Heroku**: `git push heroku main`
   - **Vercel**: Deploy as serverless functions
   - **AWS/GCP**: Use container services
   - **VPS**: Use PM2 for process management

### Frontend Updates

Update the backend URL for production:

```typescript
private readonly BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com'
  : 'http://localhost:3001';
```

## 📊 Monitoring

### Cost Monitoring

Monitor OpenAI usage:
- Check OpenAI dashboard for token usage
- Set up billing alerts
- Monitor rate limits and quotas

### Performance Monitoring

Track backend performance:
- Response times
- Error rates
- Request volumes
- Token usage per request

### Logging

Important events to log:
- Chat requests and responses
- Error occurrences
- Rate limit hits
- API key issues

---

## 🎉 You're Ready!

Your ChatGPT integration is now complete! The chatbot will provide:

- **Real AI responses** from ChatGPT-4o-mini
- **Context-aware guidance** based on scan results
- **Medical safety** with appropriate disclaimers
- **Professional responses** focused on skin cancer topics

The integration maintains the same UI/UX while providing much more intelligent and helpful responses powered by OpenAI's ChatGPT.