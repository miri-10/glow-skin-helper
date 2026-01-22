# Skin Cancer Detection - ChatGPT Backend

A secure Node.js + Express backend service that integrates OpenAI's ChatGPT into the skin cancer detection web application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd chatbot-backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-22T10:30:00.000Z",
  "service": "skin-cancer-chatbot-backend",
  "version": "1.0.0"
}
```

### Chat with AI
```http
POST /api/chat
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "What does high risk mean?",
  "scanResult": {
    "risk": "High",
    "confidence": "89%",
    "prediction": "malignant"
  }
}
```

**Response:**
```json
{
  "reply": "A high risk result indicates that the AI has detected concerning features in your skin lesion that may suggest potential malignancy. With 89% confidence, this means the AI is quite certain about identifying patterns associated with skin cancer risk factors...",
  "timestamp": "2024-01-22T10:30:00.000Z",
  "model": "gpt-4o-mini"
}
```

## 🔒 Security Features

### API Key Protection
- OpenAI API key stored securely in environment variables
- Never exposed in responses or logs
- Validated on startup

### Rate Limiting
- 100 requests per 15 minutes per IP address
- Prevents API abuse and cost overruns
- Configurable limits

### Input Validation
- Message length limits (1-1000 characters)
- Scan result format validation
- SQL injection prevention
- XSS protection

### CORS Configuration
- Restricted to frontend domain only
- Prevents unauthorized cross-origin requests

## 🧠 AI Configuration

### System Prompt
The AI is configured with a strict system prompt that:
- Only answers skin cancer and AI detection questions
- Never provides medical diagnoses
- Encourages professional medical consultation
- Maintains educational focus

### Model Settings
- **Model**: `gpt-4o-mini` (cost-effective, fast)
- **Temperature**: `0.3` (consistent, factual responses)
- **Max Tokens**: `800` (reasonable response length)
- **Top P**: `0.9` (focused responses)

### Context Injection
When scan results are provided, the AI receives additional context:
- Current prediction and confidence
- Risk assessment level
- Appropriate urgency guidance

## 📁 Project Structure

```
chatbot-backend/
├── server.js                 # Main Express server
├── services/
│   └── chatgpt-service.js    # OpenAI API integration
├── middleware/
│   └── error-handlers.js     # Error handling middleware
├── utils/
│   └── validation.js         # Input validation utilities
├── package.json              # Dependencies and scripts
├── .env.example              # Environment template
├── .env                      # Environment variables (create this)
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key | - | ✅ |
| `PORT` | Server port | 3001 | ✅ |
| `NODE_ENV` | Environment | development | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:8080 | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | ❌ |

### OpenAI API Key Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**Important**: Keep your API key secure and never commit it to version control.

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test chat endpoint
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How does AI detect skin cancer?",
    "scanResult": {
      "risk": "Medium",
      "confidence": "75%"
    }
  }'
```

### Integration with Frontend

Update your frontend chatbot service to call this backend:

```typescript
// In your frontend chatbotService.ts
const BACKEND_URL = 'http://localhost:3001';

async sendMessage(message: string, scanContext?: ScanContext): Promise<ChatResponse> {
  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      scanResult: scanContext ? {
        risk: scanContext.prediction === 'malignant' ? 'High' : 
              scanContext.prediction === 'uncertain' ? 'Medium' : 'Low',
        confidence: `${scanContext.confidence}%`,
        prediction: scanContext.prediction
      } : undefined
    })
  });

  const data = await response.json();
  return { content: data.reply };
}
```

## 🚨 Error Handling

The backend handles various error scenarios:

- **Invalid API Key**: Returns 503 with service unavailable message
- **Rate Limit Exceeded**: Returns 429 with retry information
- **Invalid Input**: Returns 400 with validation details
- **OpenAI Quota Exceeded**: Returns 503 with quota message
- **Network Issues**: Returns 503 with service unavailable

## 📊 Monitoring

### Logs
The server logs important events:
- Request details (without sensitive data)
- Token usage for cost monitoring
- Error details for debugging
- Rate limit violations

### Health Monitoring
Use the `/health` endpoint for:
- Load balancer health checks
- Uptime monitoring
- Service discovery

## 🔄 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Set production environment
export NODE_ENV=production

# Start server
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 💰 Cost Considerations

### OpenAI Usage
- Model: `gpt-4o-mini` (~$0.00015 per 1K tokens)
- Average request: ~200-400 tokens
- Rate limiting prevents abuse
- Monitor usage in OpenAI dashboard

### Optimization Tips
- Lower temperature for consistent responses
- Reasonable max_tokens limit
- Efficient system prompts
- Rate limiting to prevent overuse

## 🛡️ Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use environment variables** for all secrets
3. **Implement rate limiting** to prevent abuse
4. **Validate all inputs** to prevent injection attacks
5. **Use HTTPS** in production
6. **Monitor API usage** for unusual patterns
7. **Keep dependencies updated** for security patches

## 📞 Support

For issues or questions:
1. Check the logs for error details
2. Verify environment variables are set correctly
3. Test the OpenAI API key independently
4. Check rate limiting if requests are failing
5. Review the system prompt if responses seem off-topic

---

**🚀 Ready to integrate ChatGPT into your skin cancer detection app!**