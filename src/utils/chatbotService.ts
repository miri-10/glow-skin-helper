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
  private readonly SYSTEM_PROMPT = `You are an AI assistant integrated into a Skin Cancer Detection web application. Your responsibilities:

- Explain skin cancer concepts in simple, non-alarming language
- Help users understand uploaded image results and confidence scores  
- Answer questions about AI, deep learning, and CNN-based detection
- Provide awareness, prevention tips, and risk factors
- Suggest when to consult a dermatologist based on risk level

Safety rules:
- Do NOT give medical diagnoses or prescriptions
- Always include a disclaimer when discussing health decisions
- Encourage professional medical consultation for high-risk cases
- Avoid fear-based or absolute statements

Tone:
- Calm, professional, supportive
- Easy to understand for non-technical users
- Technically accurate when asked by advanced users`;

  private knowledgeBase = {
    skinCancer: {
      basics: {
        "what is skin cancer": "Skin cancer occurs when skin cells grow uncontrollably due to DNA damage, often from UV radiation. The main types are melanoma (most serious), basal cell carcinoma, and squamous cell carcinoma.",
        "types of skin cancer": "There are three main types: 1) Melanoma - develops in melanocytes, most dangerous but treatable when caught early, 2) Basal Cell Carcinoma - most common, rarely spreads, 3) Squamous Cell Carcinoma - second most common, can spread if untreated.",
        "early signs": "Use the ABCDE method: Asymmetry (one half doesn't match the other), Border irregularity, Color variation, Diameter larger than 6mm, Evolving (changes in size, shape, or color)."
      },
      prevention: {
        "sun protection": "Use broad-spectrum SPF 30+ sunscreen, wear protective clothing, seek shade during peak hours (10am-4pm), avoid tanning beds, and perform regular self-examinations.",
        "risk factors": "Fair skin, history of sunburns, excessive UV exposure, family history, many moles, weakened immune system, and age over 50 increase risk."
      }
    },
    aiDetection: {
      technology: {
        "how ai works": "Our AI uses Convolutional Neural Networks (CNNs) trained on thousands of dermatological images. It analyzes patterns in color, texture, shape, and borders to identify potential malignancies.",
        "what is cnn": "A Convolutional Neural Network (CNN) is a type of deep learning model designed for image analysis. It uses layers of filters to detect features like edges, textures, and patterns, similar to how human vision works.",
        "accuracy": "AI skin cancer detection typically achieves 85-95% accuracy in clinical studies. However, it's designed to assist, not replace, professional medical diagnosis.",
        "limitations": "AI cannot replace dermatologist examination. Factors like image quality, lighting, lesion type, and skin tone can affect accuracy. Always consult healthcare professionals for definitive diagnosis."
      },
      process: {
        "image analysis": "The AI examines multiple features: asymmetry, border regularity, color distribution, diameter, and texture patterns. It compares these against learned patterns from medical training data.",
        "confidence scores": "Confidence scores indicate how certain the AI is about its prediction. Higher scores suggest clearer patterns, but even high confidence requires medical verification."
      }
    },
    medical: {
      urgency: {
        "when to see doctor": "See a dermatologist if you notice: new growths, changes in existing moles, irregular borders, color variations, bleeding, itching, or if AI suggests malignancy.",
        "emergency signs": "Seek immediate medical attention for: rapidly changing lesions, bleeding that won't stop, lesions that look infected, or multiple concerning features."
      },
      diagnosis: {
        "biopsy process": "If a dermatologist finds a suspicious lesion, they may perform a biopsy - removing a small tissue sample for laboratory analysis. This is the gold standard for diagnosis.",
        "treatment options": "Treatment depends on type and stage: surgical excision, Mohs surgery, radiation therapy, immunotherapy, or targeted therapy for advanced cases."
      }
    }
  };

  async sendMessage(message: string, scanContext?: ScanContext): Promise<ChatResponse> {
    try {
      // Simulate processing delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const response = this.generateResponse(message.toLowerCase(), scanContext);
      
      return {
        content: response,
        metadata: {
          category: this.categorizeMessage(message),
          confidence: 0.85 + Math.random() * 0.15
        }
      };
    } catch (error) {
      console.error("Chatbot service error:", error);
      throw new Error("Failed to process message");
    }
  }

  private generateResponse(message: string, scanContext?: ScanContext): string {
    // Context-aware responses based on scan results
    if (scanContext?.hasImage) {
      if (message.includes("result") || message.includes("mean")) {
        return this.explainScanResults(scanContext);
      }
      
      if (message.includes("doctor") || message.includes("see") || message.includes("should")) {
        return this.provideMedicalGuidance(scanContext);
      }
    }

    // Technical AI questions
    if (message.includes("cnn") || message.includes("neural network")) {
      return this.knowledgeBase.aiDetection.technology["what is cnn"] + 
        "\n\nIn skin cancer detection, CNNs analyze dermoscopic features like the ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolving) automatically, processing thousands of image features simultaneously to identify patterns associated with malignancy.";
    }

    if (message.includes("how") && (message.includes("ai") || message.includes("detect"))) {
      return this.knowledgeBase.aiDetection.technology["how ai works"] + 
        "\n\nThe process involves: 1) Image preprocessing and enhancement, 2) Feature extraction using convolutional layers, 3) Pattern recognition comparing to trained medical data, 4) Confidence scoring based on learned associations.";
    }

    if (message.includes("accurate") || message.includes("accuracy")) {
      return this.knowledgeBase.aiDetection.technology["accuracy"] + 
        "\n\n⚠️ **Important**: AI is a screening tool, not a diagnostic tool. Even with high accuracy, professional medical evaluation is essential for proper diagnosis and treatment planning.";
    }

    // Medical guidance questions
    if (message.includes("doctor") || message.includes("see") || message.includes("should")) {
      return this.knowledgeBase.medical.urgency["when to see doctor"] + 
        "\n\n**Urgency levels:**\n• **Immediate**: Rapidly changing, bleeding, or multiple concerning features\n• **Soon (1-2 weeks)**: New growths or changes in existing moles\n• **Routine**: Annual skin checks for prevention\n\n⚠️ **Disclaimer**: This guidance is educational only. Trust your instincts and seek professional medical advice when in doubt.";
    }

    // Skin cancer education
    if (message.includes("skin cancer") || message.includes("melanoma")) {
      return this.knowledgeBase.skinCancer.basics["what is skin cancer"] + 
        "\n\n**Key facts:**\n• Most skin cancers are highly treatable when detected early\n• Melanoma accounts for ~1% of skin cancers but causes most deaths\n• Regular self-examinations can help detect changes early\n• UV protection significantly reduces risk";
    }

    if (message.includes("signs") || message.includes("symptoms") || message.includes("abcde")) {
      return this.knowledgeBase.skinCancer.basics["early signs"] + 
        "\n\n**Remember the ABCDE method:**\n• **A**symmetry: One half doesn't match the other\n• **B**order: Irregular, scalloped, or poorly defined edges\n• **C**olor: Varied colors (brown, black, red, white, blue)\n• **D**iameter: Larger than 6mm (pencil eraser size)\n• **E**volving: Changes in size, shape, color, or symptoms\n\nPerform monthly self-exams in good lighting with a mirror.";
    }

    if (message.includes("prevent") || message.includes("protection")) {
      return this.knowledgeBase.skinCancer.prevention["sun protection"] + 
        "\n\n**Prevention checklist:**\n✓ Apply SPF 30+ sunscreen 30 minutes before sun exposure\n✓ Reapply every 2 hours and after swimming/sweating\n✓ Wear wide-brimmed hats and UV-protective clothing\n✓ Seek shade during peak UV hours (10am-4pm)\n✓ Never use tanning beds\n✓ Perform monthly self-skin examinations";
    }

    // Default helpful response
    return this.getDefaultResponse(message, scanContext);
  }

  private explainScanResults(scanContext: ScanContext): string {
    if (!scanContext.prediction) {
      return "I can see you've uploaded an image, but I don't have access to the analysis results yet. Once the AI completes its analysis, I can help explain the findings, confidence scores, and recommended next steps.\n\n⚠️ **Remember**: AI analysis is a screening tool to help identify areas of concern, but professional medical evaluation is always necessary for definitive diagnosis.";
    }

    const { prediction, confidence, explanation } = scanContext;
    
    let response = `**Your AI Analysis Results:**\n\n`;
    
    if (prediction === "benign") {
      response += `✅ **Result**: Likely Benign (${confidence}% confidence)\n\n`;
      response += `**What this means**: The AI detected features consistent with non-cancerous skin conditions. The analysis found regular patterns, uniform coloring, and symmetrical characteristics typical of benign lesions.\n\n`;
      
      if (confidence && confidence > 85) {
        response += `**High Confidence**: The strong confidence score suggests clear benign features, but continue monitoring for any changes.\n\n`;
      } else {
        response += `**Moderate Confidence**: While likely benign, the moderate confidence suggests some variability that warrants professional evaluation.\n\n`;
      }
      
      response += `**Recommended Actions**:\n• Continue monthly self-examinations\n• Monitor for any changes using the ABCDE method\n• Schedule routine dermatological check-ups\n• Document with photos for comparison`;
      
    } else if (prediction === "malignant") {
      response += `⚠️ **Result**: Requires Medical Attention (${confidence}% confidence)\n\n`;
      response += `**What this means**: The AI detected concerning features that may indicate potential malignancy. This includes characteristics like irregular borders, color variation, or asymmetrical patterns.\n\n`;
      response += `🚨 **IMPORTANT**: This requires prompt medical evaluation. Early detection and treatment are crucial for optimal outcomes.\n\n`;
      response += `**Immediate Actions**:\n• Schedule dermatologist appointment within 1-2 days\n• Do not attempt to treat or remove the lesion yourself\n• Document with clear photographs\n• Prepare questions for your medical visit`;
      
    } else {
      response += `❓ **Result**: Uncertain Analysis\n\n`;
      response += `**What this means**: The AI could not confidently classify the lesion due to image quality, lighting conditions, or complex characteristics.\n\n`;
      response += `**Recommended Actions**:\n• Retake photo with better lighting and focus\n• Schedule professional dermatological evaluation\n• Consider dermoscopy examination for detailed analysis`;
    }

    response += `\n\n⚠️ **Medical Disclaimer**: This AI analysis is for educational purposes only and does not constitute medical diagnosis. Always consult qualified healthcare professionals for medical decisions.`;

    return response;
  }

  private provideMedicalGuidance(scanContext: ScanContext): string {
    if (!scanContext.prediction) {
      return "For any skin lesion concerns, I recommend consulting with a dermatologist who can perform a thorough examination. They have specialized training and tools like dermoscopy to evaluate lesions that AI cannot replicate.\n\n**When to see a doctor:**\n• Any new or changing lesions\n• Lesions that bleed, itch, or don't heal\n• Anything that looks different from your other moles\n• If you have risk factors (family history, fair skin, many moles)\n\n⚠️ **Trust your instincts** - if something seems concerning to you, it's worth having it checked professionally.";
    }

    const { prediction, confidence } = scanContext;
    
    if (prediction === "malignant") {
      return "🚨 **Yes, you should see a doctor immediately** - ideally within 1-2 days.\n\n**Why it's urgent:**\n• Early detection significantly improves treatment outcomes\n• Melanoma can spread if left untreated\n• Professional biopsy is needed for definitive diagnosis\n\n**What to expect:**\n• Dermatologist will examine the lesion with specialized tools\n• May perform dermoscopy for detailed analysis\n• Biopsy might be recommended for laboratory confirmation\n• Treatment options will be discussed if needed\n\n**Prepare for your visit:**\n• List when you first noticed the lesion\n• Note any changes you've observed\n• Bring photos showing progression if available\n• Prepare questions about treatment options\n\n⚠️ **Don't delay** - early action is your best protection.";
    }
    
    if (prediction === "benign") {
      if (confidence && confidence > 85) {
        return "**Routine monitoring is recommended** rather than urgent medical attention.\n\n**Your situation:**\n• AI suggests likely benign characteristics\n• High confidence in the analysis\n• No immediate red flags detected\n\n**Recommended timeline:**\n• **Routine check**: Schedule within 2-4 weeks if you haven't had a recent skin exam\n• **Annual screening**: Maintain regular dermatological check-ups\n• **Self-monitoring**: Continue monthly self-examinations\n\n**Watch for changes:**\n• Any growth, color changes, or new symptoms\n• Bleeding, itching, or pain\n• Changes in texture or elevation\n\n**When to expedite:**\n• If you notice any changes before your scheduled appointment\n• If you have high-risk factors (family history, many moles)\n• If the lesion causes you ongoing concern\n\n✅ **Remember**: Even benign lesions benefit from professional confirmation.";
      } else {
        return "**Professional evaluation is recommended within 2-4 weeks** for peace of mind.\n\n**Why see a doctor:**\n• Moderate AI confidence suggests some uncertainty\n• Professional dermoscopy provides more detailed analysis\n• Establishes baseline for future monitoring\n• Rules out any subtle features AI might miss\n\n**What to expect:**\n• Visual examination with dermatoscope\n• Comparison with your other moles\n• Photography for future reference\n• Guidance on self-monitoring\n\n**Not urgent, but important** - this gives you professional confirmation and establishes proper monitoring protocols.";
      }
    }
    
    return "Given the uncertain analysis, **professional medical evaluation is recommended** to clarify the situation.\n\n**Why professional evaluation helps:**\n• Trained dermatologists can assess features AI cannot detect\n• Dermoscopy reveals subsurface patterns\n• Clinical context and medical history matter\n• Proper diagnosis guides appropriate monitoring\n\n**Timeline**: Schedule within 1-2 weeks for thorough evaluation.\n\n⚠️ **When in doubt, check it out** - professional peace of mind is always worth it.";
  }

  private getDefaultResponse(message: string, scanContext?: ScanContext): string {
    // Analyze message intent
    if (message.includes("hello") || message.includes("hi")) {
      return scanContext?.hasImage 
        ? "Hello! I can see you've uploaded an image for analysis. I'm here to help explain your results, answer questions about skin cancer detection, and guide you on next steps. What would you like to know?"
        : "Hello! I'm your AI medical assistant specializing in skin cancer awareness and detection. I can help you understand how AI diagnosis works, explain skin cancer concepts, and guide you on when to seek medical attention. How can I assist you?";
    }

    if (message.includes("help")) {
      return "I'm here to help with:\n\n🔬 **AI & Technology**\n• How skin cancer detection AI works\n• Understanding CNN and deep learning\n• Accuracy and limitations of AI analysis\n\n🩺 **Medical Information**\n• Skin cancer types and early signs\n• ABCDE method for self-examination\n• When to consult a dermatologist\n\n📊 **Result Interpretation**\n• Explaining confidence scores\n• Understanding benign vs malignant predictions\n• Next steps based on analysis\n\n🛡️ **Prevention & Awareness**\n• Sun protection strategies\n• Risk factors and prevention\n• Self-examination techniques\n\nWhat specific topic interests you?";
    }

    // Fallback response
    return "I'd be happy to help you with that! I specialize in skin cancer awareness, AI-based detection, and medical guidance. \n\nI can explain:\n• How our AI analyzes skin lesions\n• What different results mean\n• When to seek medical attention\n• Skin cancer prevention and early detection\n\nCould you be more specific about what you'd like to know? For example, you could ask about AI accuracy, skin cancer types, or how to interpret your results.\n\n⚠️ **Remember**: I provide educational information only. For medical concerns, always consult healthcare professionals.";
  }

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