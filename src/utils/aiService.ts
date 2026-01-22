/**
 * AI Service for Skin Cancer Detection
 * Handles communication with the backend AI analysis endpoint
 */

export interface AnalysisResult {
  prediction: "benign" | "malignant" | "uncertain";
  confidence: number;
  explanation: string;
  recommendations: string[];
  raw_predictions?: {
    benign: number;
    malignant: number;
  };
}

export interface AnalysisResponse {
  message: string;
  image_id: number;
  file_url: string;
  analysis: AnalysisResult;
}

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  /**
   * Analyze skin lesion image using AI
   */
  async analyzeImage(file: File, token?: string): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/analyze-image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to analyze image. Please try again.'
      );
    }
  }

  /**
   * Analyze image without authentication (demo mode)
   */
  async analyzeImageDemo(file: File): Promise<AnalysisResult> {
    // First try the real API
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/analyze-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          console.log('✅ Real AI analysis successful:', data.analysis);
          return data.analysis;
        }
      } else {
        console.warn('⚠️ API call failed, falling back to mock data');
      }
    } catch (error) {
      console.warn('⚠️ API connection failed, using mock data:', error);
    }

    // Fallback to mock data with realistic delay
    return new Promise((resolve, reject) => {
      // Validate file
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please upload a valid image file'));
        return;
      }

      console.log('🎭 Using mock AI analysis (backend not connected)');

      // Simulate processing time
      setTimeout(() => {
        try {
          resolve(this.getMockResult());
        } catch (error) {
          reject(error);
        }
      }, 2000 + Math.random() * 2000); // 2-4 seconds
    });
  }

  /**
   * Get mock result for demo purposes
   */
  private getMockResult(): AnalysisResult {
    const mockResults: AnalysisResult[] = [
      {
        prediction: "benign",
        confidence: 87.3,
        explanation: "The analyzed lesion shows characteristics commonly associated with benign skin conditions. The AI model detected regular borders, uniform color distribution, and symmetrical patterns typical of non-cancerous growths such as common moles or seborrheic keratoses.",
        recommendations: [
          "Continue regular self-examinations using the ABCDE method",
          "Monitor for any changes in size, shape, or color",
          "Schedule routine skin check with dermatologist annually",
          "Protect the area from excessive sun exposure with SPF 30+ sunscreen",
          "Take photos to track any changes over time"
        ],
        raw_predictions: {
          benign: 0.873,
          malignant: 0.127
        }
      },
      {
        prediction: "malignant",
        confidence: 74.2,
        explanation: "The analyzed lesion displays characteristics that may indicate potential malignancy. The AI model detected irregular borders, color variation, and asymmetrical features with 74.2% confidence. These findings warrant immediate professional medical evaluation.",
        recommendations: [
          "Schedule an appointment with a dermatologist IMMEDIATELY",
          "Do not delay - early detection is crucial for treatment success",
          "Do not attempt to remove or treat the lesion yourself",
          "Document the lesion with clear photos",
          "Prepare a list of questions for your doctor visit",
          "Consider seeking a second opinion if needed"
        ],
        raw_predictions: {
          benign: 0.258,
          malignant: 0.742
        }
      },
      {
        prediction: "uncertain",
        confidence: 58.1,
        explanation: "The image quality or lesion characteristics make it difficult to provide a confident assessment. This could be due to image clarity, lighting conditions, or the complexity of the lesion's features requiring professional evaluation.",
        recommendations: [
          "Try uploading a clearer image with better lighting",
          "Ensure the lesion is in focus and centered in the image",
          "Consider consulting a dermatologist for in-person evaluation",
          "Don't rely solely on AI tools for medical decisions",
          "Schedule a professional skin examination"
        ],
        raw_predictions: {
          benign: 0.419,
          malignant: 0.581
        }
      }
    ];

    // Return random result for demo
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }

  /**
   * Get risk level based on prediction and confidence
   */
  getRiskLevel(prediction: string, confidence: number): 'low' | 'medium' | 'high' {
    if (prediction === 'malignant') {
      return confidence > 70 ? 'high' : 'medium';
    } else if (prediction === 'benign') {
      return confidence > 80 ? 'low' : 'medium';
    } else {
      return 'medium';
    }
  }

  /**
   * Get risk level color for UI
   */
  getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get risk level message
   */
  getRiskLevelMessage(riskLevel: string): string {
    switch (riskLevel) {
      case 'low':
        return 'Low risk - Continue monitoring';
      case 'medium':
        return 'Moderate risk - Consider professional evaluation';
      case 'high':
        return 'High risk - Seek immediate medical attention';
      default:
        return 'Assessment needed';
    }
  }
}

// Export singleton instance
export const aiService = new AIService();