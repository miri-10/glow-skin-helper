import { type QuestionnaireData } from "@/components/ScreeningQuestionnaire";
import { type ScreeningReportData } from "@/components/ScreeningReport";

export interface ImageAnalysisData {
  prediction: "benign" | "malignant" | "uncertain";
  confidence: number;
  explanation: string;
  recommendations: string[];
}

export interface ScreeningRequest {
  imageAnalysis: ImageAnalysisData;
  questionnaire: QuestionnaireData;
}

class ScreeningService {
  private readonly BACKEND_URL = 'http://localhost:3001';

  /**
   * Generate comprehensive screening report using ChatGPT
   */
  async generateScreeningReport(request: ScreeningRequest): Promise<ScreeningReportData> {
    try {
      // Prepare the comprehensive prompt for ChatGPT
      const screeningPrompt = this.buildScreeningPrompt(request);

      // Call ChatGPT backend with screening-specific prompt
      const response = await fetch(`${this.BACKEND_URL}/api/screening-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: screeningPrompt,
          imageAnalysis: request.imageAnalysis,
          questionnaire: request.questionnaire
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse the structured response from ChatGPT
      return this.parseScreeningResponse(data.reply, request);

    } catch (error) {
      console.error("Screening service error:", error);
      
      // Fallback to local processing if backend fails
      return this.generateFallbackReport(request);
    }
  }

  /**
   * Build comprehensive prompt for ChatGPT screening analysis
   */
  private buildScreeningPrompt(request: ScreeningRequest): string {
    const { imageAnalysis, questionnaire } = request;

    return `Please generate a comprehensive skin cancer screening report based on the following data:

IMAGE ANALYSIS RESULTS:
- AI Prediction: ${imageAnalysis.prediction}
- Confidence: ${imageAnalysis.confidence}%
- Analysis: ${imageAnalysis.explanation}

QUESTIONNAIRE RESPONSES:

Lesion Changes:
- Size change: ${questionnaire.lesionChanges.sizeChange}
- Color change: ${questionnaire.lesionChanges.colorChange}
- Shape change: ${questionnaire.lesionChanges.shapeChange}
- Timeframe: ${questionnaire.lesionChanges.timeframe}

Symptoms:
- Itching: ${questionnaire.symptoms.itching}
- Bleeding: ${questionnaire.symptoms.bleeding}
- Pain: ${questionnaire.symptoms.pain}
- Crusting: ${questionnaire.symptoms.crusting}
- None: ${questionnaire.symptoms.none}

Sun Exposure:
- Daily exposure: ${questionnaire.sunExposure.dailyExposure}
- Sunburn history: ${questionnaire.sunExposure.sunburnHistory}
- Sun protection: ${questionnaire.sunExposure.sunProtection}
- Tanning salon use: ${questionnaire.sunExposure.tanningSalon}

Medical History:
- Personal skin cancer history: ${questionnaire.medicalHistory.personalHistory}
- Family history: ${questionnaire.medicalHistory.familyHistory}
- Previous biopsies: ${questionnaire.medicalHistory.previousBiopsies}
- Immunocompromised: ${questionnaire.medicalHistory.immunocompromised}

Demographics:
- Age range: ${questionnaire.demographics.ageRange}
- Skin type: ${questionnaire.demographics.skinType}
- Mole count: ${questionnaire.demographics.moleCount}

Additional Notes: ${questionnaire.additionalNotes || 'None provided'}

Please provide a structured analysis that includes:
1. Image analysis summary
2. Questionnaire findings summary
3. Combined risk assessment (Low/Medium/High/Uncertain)
4. Risk factors identified
5. Protective factors
6. Specific recommendations
7. Next steps with timeline
8. Medical disclaimer

Format your response as a comprehensive medical screening report while maintaining that this is educational screening only, not diagnosis.`;
  }

  /**
   * Parse ChatGPT response into structured report data
   */
  private parseScreeningResponse(aiResponse: string, request: ScreeningRequest): ScreeningReportData {
    // Extract structured information from AI response
    // This is a simplified parser - in production, you might use more sophisticated NLP
    
    const riskLevel = this.extractRiskLevel(aiResponse, request);
    const urgencyLevel = this.determineUrgencyLevel(riskLevel, request);
    
    return {
      riskLevel,
      imageSummary: this.extractImageSummary(aiResponse, request.imageAnalysis),
      questionnaireSummary: this.extractQuestionnaireSummary(aiResponse, request.questionnaire),
      combinedAssessment: this.extractCombinedAssessment(aiResponse),
      recommendation: this.extractRecommendations(aiResponse),
      disclaimer: this.getStandardDisclaimer(),
      riskFactors: this.identifyRiskFactors(request),
      protectiveFactors: this.identifyProtectiveFactors(request),
      nextSteps: this.generateNextSteps(riskLevel, urgencyLevel),
      urgencyLevel,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Extract risk level from AI response
   */
  private extractRiskLevel(aiResponse: string, request: ScreeningRequest): "Low" | "Medium" | "High" | "Uncertain" {
    const response = aiResponse.toLowerCase();
    
    // Check for explicit risk level mentions
    if (response.includes('high risk') || response.includes('concerning') || 
        request.imageAnalysis.prediction === 'malignant') {
      return 'High';
    }
    
    if (response.includes('medium risk') || response.includes('moderate') || 
        request.imageAnalysis.prediction === 'uncertain') {
      return 'Medium';
    }
    
    if (response.includes('low risk') || response.includes('minimal') || 
        request.imageAnalysis.prediction === 'benign') {
      return 'Low';
    }
    
    return 'Uncertain';
  }

  /**
   * Determine urgency level based on risk and factors
   */
  private determineUrgencyLevel(riskLevel: string, request: ScreeningRequest): "routine" | "soon" | "urgent" {
    const { imageAnalysis, questionnaire } = request;
    
    // High urgency factors
    const highUrgencyFactors = [
      riskLevel === 'High',
      imageAnalysis.prediction === 'malignant',
      questionnaire.symptoms.bleeding,
      questionnaire.lesionChanges.sizeChange === 'increased' && 
        (questionnaire.lesionChanges.timeframe === 'days' || questionnaire.lesionChanges.timeframe === 'weeks'),
      questionnaire.medicalHistory.personalHistory === 'yes'
    ];

    // Medium urgency factors
    const mediumUrgencyFactors = [
      riskLevel === 'Medium',
      imageAnalysis.prediction === 'uncertain',
      questionnaire.symptoms.itching || questionnaire.symptoms.pain,
      questionnaire.lesionChanges.colorChange === 'yes' || questionnaire.lesionChanges.shapeChange === 'yes',
      questionnaire.medicalHistory.familyHistory === 'yes'
    ];

    if (highUrgencyFactors.some(factor => factor)) {
      return 'urgent';
    }
    
    if (mediumUrgencyFactors.some(factor => factor)) {
      return 'soon';
    }
    
    return 'routine';
  }

  /**
   * Extract image summary from AI response
   */
  private extractImageSummary(aiResponse: string, imageAnalysis: ImageAnalysisData): string {
    // Look for image analysis section in AI response
    const imageSection = this.extractSection(aiResponse, ['image analysis', 'ai analysis', 'cnn analysis']);
    
    if (imageSection) {
      return imageSection;
    }
    
    // Fallback to original analysis with enhancement
    return `The AI image analysis identified the lesion as likely ${imageAnalysis.prediction} with ${imageAnalysis.confidence}% confidence. ${imageAnalysis.explanation}`;
  }

  /**
   * Extract questionnaire summary from AI response
   */
  private extractQuestionnaireSummary(aiResponse: string, questionnaire: QuestionnaireData): string {
    const questionnaireSection = this.extractSection(aiResponse, ['questionnaire', 'clinical history', 'patient history']);
    
    if (questionnaireSection) {
      return questionnaireSection;
    }
    
    // Generate summary from questionnaire data
    const summaryParts = [];
    
    // Lesion changes
    if (questionnaire.lesionChanges.sizeChange === 'increased') {
      summaryParts.push('lesion has increased in size');
    }
    if (questionnaire.lesionChanges.colorChange === 'yes') {
      summaryParts.push('color changes noted');
    }
    if (questionnaire.lesionChanges.shapeChange === 'yes') {
      summaryParts.push('shape changes observed');
    }
    
    // Symptoms
    const symptoms = Object.entries(questionnaire.symptoms)
      .filter(([key, value]) => value && key !== 'none')
      .map(([key]) => key);
    if (symptoms.length > 0) {
      summaryParts.push(`symptoms include ${symptoms.join(', ')}`);
    }
    
    // Risk factors
    if (questionnaire.medicalHistory.personalHistory === 'yes') {
      summaryParts.push('personal history of skin cancer');
    }
    if (questionnaire.medicalHistory.familyHistory === 'yes') {
      summaryParts.push('family history of skin cancer');
    }
    
    return summaryParts.length > 0 
      ? `Patient reports: ${summaryParts.join('; ')}.`
      : 'No significant changes or symptoms reported in questionnaire.';
  }

  /**
   * Extract combined assessment from AI response
   */
  private extractCombinedAssessment(aiResponse: string): string {
    const assessmentSection = this.extractSection(aiResponse, ['combined', 'overall', 'assessment', 'conclusion']);
    
    return assessmentSection || 
      'The combined analysis of image features and clinical history provides a comprehensive risk assessment for screening purposes.';
  }

  /**
   * Extract recommendations from AI response
   */
  private extractRecommendations(aiResponse: string): string {
    const recommendationSection = this.extractSection(aiResponse, ['recommend', 'suggest', 'advice', 'guidance']);
    
    return recommendationSection || 
      'Based on the analysis, professional medical evaluation is recommended to confirm findings and determine appropriate next steps.';
  }

  /**
   * Extract section from AI response based on keywords
   */
  private extractSection(text: string, keywords: string[]): string | null {
    const lines = text.split('\n');
    let sectionStart = -1;
    let sectionEnd = -1;
    
    // Find section start
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (keywords.some(keyword => line.includes(keyword))) {
        sectionStart = i;
        break;
      }
    }
    
    if (sectionStart === -1) return null;
    
    // Find section end (next header or end of text)
    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^[A-Z][A-Z\s]+:/) || line.match(/^\d+\./)) {
        sectionEnd = i;
        break;
      }
    }
    
    if (sectionEnd === -1) sectionEnd = lines.length;
    
    return lines.slice(sectionStart, sectionEnd)
      .join('\n')
      .replace(/^[^:]*:/, '') // Remove header
      .trim();
  }

  /**
   * Identify risk factors from questionnaire
   */
  private identifyRiskFactors(request: ScreeningRequest): string[] {
    const factors = [];
    const { questionnaire, imageAnalysis } = request;
    
    if (imageAnalysis.prediction === 'malignant') {
      factors.push('AI analysis suggests concerning features');
    }
    
    if (questionnaire.lesionChanges.sizeChange === 'increased') {
      factors.push('Lesion has increased in size');
    }
    
    if (questionnaire.lesionChanges.colorChange === 'yes') {
      factors.push('Color changes in lesion');
    }
    
    if (questionnaire.symptoms.bleeding) {
      factors.push('Bleeding from lesion');
    }
    
    if (questionnaire.sunExposure.sunburnHistory === 'frequently') {
      factors.push('History of frequent sunburns');
    }
    
    if (questionnaire.medicalHistory.personalHistory === 'yes') {
      factors.push('Personal history of skin cancer');
    }
    
    if (questionnaire.medicalHistory.familyHistory === 'yes') {
      factors.push('Family history of skin cancer');
    }
    
    if (questionnaire.demographics.skinType === 'very_fair' || questionnaire.demographics.skinType === 'fair') {
      factors.push('Fair skin type (higher UV sensitivity)');
    }
    
    if (questionnaire.demographics.moleCount === 'numerous') {
      factors.push('Numerous moles (>50)');
    }
    
    return factors;
  }

  /**
   * Identify protective factors from questionnaire
   */
  private identifyProtectiveFactors(request: ScreeningRequest): string[] {
    const factors = [];
    const { questionnaire, imageAnalysis } = request;
    
    if (imageAnalysis.prediction === 'benign') {
      factors.push('AI analysis suggests benign characteristics');
    }
    
    if (questionnaire.sunExposure.sunProtection === 'always' || questionnaire.sunExposure.sunProtection === 'usually') {
      factors.push('Regular use of sun protection');
    }
    
    if (questionnaire.sunExposure.sunburnHistory === 'never' || questionnaire.sunExposure.sunburnHistory === 'rarely') {
      factors.push('Minimal history of sunburns');
    }
    
    if (questionnaire.sunExposure.tanningSalon === 'never') {
      factors.push('No tanning salon use');
    }
    
    if (questionnaire.medicalHistory.personalHistory === 'no' && questionnaire.medicalHistory.familyHistory === 'no') {
      factors.push('No personal or family history of skin cancer');
    }
    
    if (questionnaire.symptoms.none) {
      factors.push('No concerning symptoms reported');
    }
    
    return factors;
  }

  /**
   * Generate next steps based on risk level
   */
  private generateNextSteps(riskLevel: string, urgencyLevel: string): string[] {
    const steps = [];
    
    if (urgencyLevel === 'urgent') {
      steps.push('Schedule dermatologist appointment within 1-2 days');
      steps.push('Do not attempt to treat or remove the lesion yourself');
      steps.push('Document the lesion with clear photographs');
      steps.push('Prepare a list of questions for your dermatologist');
    } else if (urgencyLevel === 'soon') {
      steps.push('Schedule dermatologist appointment within 2-4 weeks');
      steps.push('Monitor the lesion for any changes');
      steps.push('Take monthly photos to track changes');
      steps.push('Continue sun protection measures');
    } else {
      steps.push('Continue routine self-examinations monthly');
      steps.push('Schedule annual dermatological check-up');
      steps.push('Maintain consistent sun protection');
      steps.push('Monitor for any new or changing lesions');
    }
    
    steps.push('Keep this screening report for your medical records');
    
    return steps;
  }

  /**
   * Get standard medical disclaimer
   */
  private getStandardDisclaimer(): string {
    return 'This AI-powered screening tool is designed for educational and awareness purposes only. It does not provide medical diagnosis, treatment recommendations, or replace professional medical evaluation. The analysis combines artificial intelligence image assessment with self-reported information to generate risk estimates. All findings should be discussed with qualified healthcare professionals. For concerning symptoms or high-risk results, seek immediate medical attention from a dermatologist or healthcare provider.';
  }

  /**
   * Generate fallback report if backend fails
   */
  private generateFallbackReport(request: ScreeningRequest): ScreeningReportData {
    const riskLevel = request.imageAnalysis.prediction === 'malignant' ? 'High' :
                     request.imageAnalysis.prediction === 'uncertain' ? 'Medium' : 'Low';
    
    const urgencyLevel = riskLevel === 'High' ? 'urgent' :
                        riskLevel === 'Medium' ? 'soon' : 'routine';

    return {
      riskLevel,
      imageSummary: `AI analysis identified the lesion as ${request.imageAnalysis.prediction} with ${request.imageAnalysis.confidence}% confidence. ${request.imageAnalysis.explanation}`,
      questionnaireSummary: 'Questionnaire responses have been recorded and will be included in the assessment.',
      combinedAssessment: 'The screening combines AI image analysis with clinical questionnaire data to provide a comprehensive risk assessment.',
      recommendation: 'Professional medical evaluation is recommended to confirm findings and determine appropriate care.',
      disclaimer: this.getStandardDisclaimer(),
      riskFactors: this.identifyRiskFactors(request),
      protectiveFactors: this.identifyProtectiveFactors(request),
      nextSteps: this.generateNextSteps(riskLevel, urgencyLevel),
      urgencyLevel,
      generatedAt: new Date().toISOString()
    };
  }
}

export const screeningService = new ScreeningService();