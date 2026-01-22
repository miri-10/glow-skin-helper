import { pdfReportService } from './pdfService';
import { type ScreeningReportData } from '@/components/ScreeningReport';

/**
 * Test PDF generation with sample data
 */
export function testPDFGeneration(): void {
  const sampleReportData: ScreeningReportData = {
    riskLevel: "High",
    imageSummary: "AI analysis identified concerning asymmetrical features with irregular borders and color variation, suggesting potential malignancy with 87% confidence. The lesion displays characteristics consistent with melanoma risk factors including irregular pigmentation and border irregularity.",
    questionnaireSummary: "Patient reports recent size increase over the past 2 weeks, bleeding symptoms, history of frequent sunburns, fair skin type, and family history of melanoma. No regular sun protection use reported.",
    combinedAssessment: "The combination of concerning AI image features and significant clinical risk factors indicates high priority for immediate professional evaluation. Multiple risk factors align with melanoma warning signs.",
    recommendation: "Immediate dermatologist consultation recommended within 1-2 days due to concerning AI features combined with rapid lesion changes and bleeding symptoms. Do not delay professional evaluation.",
    disclaimer: "This AI-powered screening tool is designed for educational and awareness purposes only. It does not provide medical diagnosis, treatment recommendations, or replace professional medical evaluation. The analysis combines artificial intelligence image assessment with self-reported information to generate risk estimates. All findings should be discussed with qualified healthcare professionals. For concerning symptoms or high-risk results, seek immediate medical attention from a dermatologist or healthcare provider.",
    riskFactors: [
      "AI analysis suggests concerning features",
      "Lesion has increased in size recently",
      "Bleeding from lesion reported",
      "History of frequent sunburns",
      "Fair skin type (higher UV sensitivity)",
      "Family history of skin cancer",
      "Irregular borders detected by AI",
      "Color variation in lesion"
    ],
    protectiveFactors: [
      "No personal history of skin cancer",
      "Lesion noticed and monitored by patient",
      "Seeking professional evaluation promptly"
    ],
    nextSteps: [
      "Schedule dermatologist appointment within 1-2 days",
      "Do not attempt to treat or remove the lesion yourself",
      "Document the lesion with clear photographs from multiple angles",
      "Prepare a comprehensive list of questions for your dermatologist visit",
      "Inform your primary care physician about the concerning findings",
      "Consider seeking a second opinion from another dermatologist if needed",
      "Keep this screening report for your medical records"
    ],
    urgencyLevel: "urgent",
    generatedAt: new Date().toISOString()
  };

  try {
    console.log('🔍 Testing PDF generation...');
    pdfReportService.generateScreeningReportPDF(sampleReportData);
    console.log('✅ PDF generation test completed successfully!');
    console.log('📄 Check your downloads folder for: SkinScreeningReport_[date].pdf');
  } catch (error) {
    console.error('❌ PDF generation test failed:', error);
  }
}

/**
 * Test different risk levels
 */
export function testAllRiskLevels(): void {
  const baseData: Omit<ScreeningReportData, 'riskLevel' | 'urgencyLevel'> = {
    imageSummary: "AI analysis completed with detailed feature extraction and pattern recognition.",
    questionnaireSummary: "Comprehensive questionnaire data collected covering lesion changes, symptoms, and risk factors.",
    combinedAssessment: "Combined analysis of image features and clinical history provides comprehensive risk assessment.",
    recommendation: "Professional medical evaluation recommended based on screening results.",
    disclaimer: "This AI screening tool is for educational purposes only. Always consult healthcare professionals.",
    riskFactors: ["Sample risk factor 1", "Sample risk factor 2"],
    protectiveFactors: ["Sample protective factor 1", "Sample protective factor 2"],
    nextSteps: [
      "Follow recommended timeline for medical consultation",
      "Continue monitoring lesion for changes",
      "Maintain sun protection practices"
    ],
    generatedAt: new Date().toISOString()
  };

  const riskLevels: Array<{ risk: "Low" | "Medium" | "High" | "Uncertain", urgency: "routine" | "soon" | "urgent" }> = [
    { risk: "Low", urgency: "routine" },
    { risk: "Medium", urgency: "soon" },
    { risk: "High", urgency: "urgent" },
    { risk: "Uncertain", urgency: "soon" }
  ];

  riskLevels.forEach(({ risk, urgency }) => {
    try {
      console.log(`🔍 Testing ${risk} risk PDF generation...`);
      
      const testData: ScreeningReportData = {
        ...baseData,
        riskLevel: risk,
        urgencyLevel: urgency
      };

      // Temporarily modify the service to use different filename
      const originalService = pdfReportService.generateScreeningReportPDF;
      pdfReportService.generateScreeningReportPDF = function(reportData: ScreeningReportData) {
        // Call original method but with modified filename logic
        return originalService.call(this, reportData);
      };

      pdfReportService.generateScreeningReportPDF(testData);
      console.log(`✅ ${risk} risk PDF generated successfully!`);
      
    } catch (error) {
      console.error(`❌ ${risk} risk PDF generation failed:`, error);
    }
  });
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testPDFGeneration = testPDFGeneration;
  (window as any).testAllRiskLevels = testAllRiskLevels;
}