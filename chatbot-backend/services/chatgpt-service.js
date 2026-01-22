/**
 * ChatGPT Service for Skin Cancer Detection App
 * 
 * This service handles all interactions with OpenAI's ChatGPT API.
 * It includes a strict system prompt and context injection for scan results.
 */

const OpenAI = require('openai');

class ChatGPTService {
  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Strict system prompt - hardcoded for security and consistency
    this.systemPrompt = `You are ChatGPT, a medical-support AI assistant for a skin cancer detection web application.

STRICT GUIDELINES:
- You ONLY answer questions related to skin cancer, AI detection, CNNs, dermatology, and app usage
- You do NOT provide medical diagnosis or treatment recommendations
- You MUST encourage professional medical consultation when risk is medium or high
- You do NOT answer questions outside of skin cancer and AI detection topics
- You maintain a professional, calm, and supportive tone
- You provide educational information only, never diagnostic conclusions

TOPICS YOU CAN DISCUSS:
✅ Skin cancer types (melanoma, basal cell carcinoma, squamous cell carcinoma)
✅ ABCDE method for mole examination
✅ How AI and CNN technology works for image analysis
✅ Risk factors and prevention strategies
✅ When to see a dermatologist
✅ Understanding confidence scores and AI predictions
✅ App usage and features
✅ General dermatological education

TOPICS YOU CANNOT DISCUSS:
❌ Other medical conditions unrelated to skin cancer
❌ Specific medical diagnoses or treatments
❌ Personal medical advice
❌ Non-medical topics (politics, entertainment, etc.)
❌ Definitive statements about whether something is cancerous

RESPONSE RULES:
- Always include medical disclaimers when discussing health
- Encourage professional medical consultation for concerning symptoms
- Explain AI limitations and the importance of human medical expertise
- Use clear, non-alarming language
- Provide actionable, educational information

If asked about topics outside your scope, politely redirect to skin cancer and AI detection topics.`;

    // Model configuration
    this.modelConfig = {
      model: 'gpt-4o-mini',
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      max_tokens: 800,   // Reasonable response length
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    };
  }

  /**
   * Get ChatGPT response for user message
   * 
   * @param {string} userMessage - The user's message
   * @param {Object} scanResult - Optional scan result context
   * @returns {Promise<string>} - AI response
   */
  async getChatResponse(userMessage, scanResult = null) {
    try {
      // Build conversation messages
      const messages = [
        {
          role: 'system',
          content: this.systemPrompt
        }
      ];

      // Inject scan result context if provided
      if (scanResult) {
        const contextMessage = this.buildScanContext(scanResult);
        messages.push({
          role: 'system',
          content: contextMessage
        });
      }

      // Add user message
      messages.push({
        role: 'user',
        content: userMessage.trim()
      });

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        ...this.modelConfig,
        messages: messages
      });

      // Extract and validate response
      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response generated from ChatGPT');
      }

      // Log token usage for monitoring
      const usage = completion.usage;
      console.log(`[ChatGPT] Tokens used: ${usage.total_tokens} (prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens})`);

      return aiResponse.trim();

    } catch (error) {
      console.error('[ChatGPT Service] Error:', error.message);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI quota exceeded');
      }
      
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('OpenAI rate limit exceeded');
      }
      
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key');
      }

      // Generic error
      throw new Error(`ChatGPT service error: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive screening report
   * 
   * @param {string} screeningPrompt - Detailed screening analysis prompt
   * @param {Object} screeningData - Combined image and questionnaire data
   * @returns {Promise<string>} - Comprehensive screening report
   */
  async generateScreeningReport(screeningPrompt, screeningData) {
    try {
      // Enhanced system prompt for screening reports
      const screeningSystemPrompt = `You are ChatGPT, a medical-support AI assistant specialized in generating comprehensive skin cancer screening reports.

STRICT GUIDELINES FOR SCREENING REPORTS:
- You analyze combined image analysis and questionnaire data to generate structured screening reports
- You do NOT provide medical diagnosis or treatment recommendations
- You MUST encourage professional medical consultation for all concerning findings
- You provide educational risk assessment and screening guidance only
- You maintain a professional, calm, and supportive tone
- You structure your response as a comprehensive medical screening report

REPORT STRUCTURE REQUIRED:
1. IMAGE ANALYSIS SUMMARY: Summarize the AI image analysis findings
2. QUESTIONNAIRE FINDINGS: Summarize key clinical history and risk factors from questionnaire
3. COMBINED RISK ASSESSMENT: Integrate both sources to determine overall risk level (Low/Medium/High/Uncertain)
4. RISK FACTORS IDENTIFIED: List specific risk factors found
5. PROTECTIVE FACTORS: List protective factors present
6. RECOMMENDATIONS: Provide specific, actionable recommendations
7. NEXT STEPS: Timeline-based action items
8. MEDICAL DISCLAIMER: Emphasize this is screening only, not diagnosis

RISK LEVEL GUIDELINES:
- HIGH: Concerning image features + significant risk factors + symptoms
- MEDIUM: Some concerning features + moderate risk factors
- LOW: Benign-appearing features + minimal risk factors
- UNCERTAIN: Unclear image analysis + mixed risk factors

RESPONSE TONE:
- Professional and medical-appropriate
- Clear and easy to understand
- Supportive but not alarming
- Emphasizes the screening nature of the assessment
- Encourages appropriate medical follow-up

Remember: This is a SCREENING tool, not a diagnostic tool. Always emphasize the need for professional medical evaluation.`;

      // Build messages for screening report
      const messages = [
        {
          role: 'system',
          content: screeningSystemPrompt
        },
        {
          role: 'system',
          content: `SCREENING DATA CONTEXT:
Image Analysis: ${JSON.stringify(screeningData.imageAnalysis, null, 2)}
Questionnaire: ${JSON.stringify(screeningData.questionnaire, null, 2)}`
        },
        {
          role: 'user',
          content: screeningPrompt
        }
      ];

      // Use higher token limit for comprehensive reports
      const screeningConfig = {
        ...this.modelConfig,
        max_tokens: 1500, // Increased for detailed reports
        temperature: 0.2  // Lower temperature for more consistent medical reports
      };

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        ...screeningConfig,
        messages: messages
      });

      // Extract and validate response
      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No screening report generated from ChatGPT');
      }

      // Log token usage for monitoring
      const usage = completion.usage;
      console.log(`[ChatGPT Screening] Tokens used: ${usage.total_tokens} (prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens})`);

      return aiResponse.trim();

    } catch (error) {
      console.error('[ChatGPT Screening Service] Error:', error.message);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI quota exceeded');
      }
      
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('OpenAI rate limit exceeded');
      }
      
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key');
      }

      // Generic error
      throw new Error(`ChatGPT screening service error: ${error.message}`);
    }
  }

  /**
   * Build context message from scan result
   * 
   * @param {Object} scanResult - Scan result data
   * @returns {string} - Formatted context message
   */
  buildScanContext(scanResult) {
    let context = 'CURRENT SCAN CONTEXT:\n';
    
    if (scanResult.prediction) {
      context += `- AI Prediction: ${scanResult.prediction}\n`;
    }
    
    if (scanResult.confidence) {
      context += `- Confidence Level: ${scanResult.confidence}\n`;
    }
    
    if (scanResult.risk) {
      context += `- Risk Assessment: ${scanResult.risk}\n`;
    }

    // Add risk-specific guidance
    if (scanResult.risk === 'High' || scanResult.prediction === 'malignant') {
      context += '\nIMPORTANT: This scan shows concerning features. Strongly encourage immediate dermatologist consultation.\n';
    } else if (scanResult.risk === 'Medium' || scanResult.risk === 'Uncertain') {
      context += '\nNOTE: This scan shows some uncertainty. Recommend professional medical evaluation.\n';
    } else if (scanResult.risk === 'Low' || scanResult.prediction === 'benign') {
      context += '\nNOTE: This scan suggests lower risk, but still recommend routine monitoring and professional check-ups.\n';
    }

    context += '\nUse this context to provide relevant, personalized guidance while maintaining medical safety standards.';
    
    return context;
  }

  /**
   * Validate that the service is properly configured
   * 
   * @returns {boolean} - True if service is ready
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY && this.openai;
  }

  /**
   * Test the OpenAI connection
   * 
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant. Respond with exactly: "Connection successful"'
          },
          {
            role: 'user',
            content: 'Test connection'
          }
        ],
        max_tokens: 10,
        temperature: 0
      });

      return response.choices[0]?.message?.content?.includes('Connection successful');
    } catch (error) {
      console.error('[ChatGPT Service] Connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = { ChatGPTService };