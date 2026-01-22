/**
 * Chat Service for Skin Cancer Detection App
 * 
 * Handles communication with the ChatGPT backend API
 * All AI requests go through the secure backend endpoint
 */

export interface ScanResult {
  risk?: string;
  confidence?: string;
  prediction?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export interface ChatError {
  error: string;
}

class ChatService {
  private baseUrl: string;

  constructor() {
    // Use Supabase URL for edge functions
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
  }

  /**
   * Send a message to the ChatGPT backend
   * 
   * @param message - User's question/message
   * @param scanResult - Optional: Latest skin scan result for context
   * @returns Promise<string> - AI's response
   */
  async sendMessage(message: string, scanResult?: ScanResult): Promise<string> {
    if (!this.baseUrl) {
      throw new Error("Backend service is not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Optional: Add auth token if user is logged in
          ...(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY && {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          }),
        },
        body: JSON.stringify({
          message,
          scanResult,
        }),
      });

      // Handle specific error cases
      if (response.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }

      if (response.status === 402) {
        throw new Error("AI service temporarily unavailable. Please try again later.");
      }

      if (!response.ok) {
        const errorData: ChatError = await response.json().catch(() => ({
          error: "Failed to process your request",
        }));
        throw new Error(errorData.error);
      }

      const data: ChatResponse = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Chat service error:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred");
    }
  }

  /**
   * Format scan result for context
   * Converts app's analysis result to chat context format
   */
  formatScanResultForChat(analysisResult: {
    prediction: string;
    confidence: number;
  }): ScanResult {
    // Map prediction to risk level
    let risk = "Low";
    if (analysisResult.prediction === "malignant") {
      risk = analysisResult.confidence > 70 ? "High" : "Medium";
    } else if (analysisResult.prediction === "uncertain") {
      risk = "Medium";
    }

    return {
      risk,
      confidence: `${analysisResult.confidence}%`,
      prediction: analysisResult.prediction,
    };
  }
}

// Export singleton instance
export const chatService = new ChatService();
