import jsPDF from 'jspdf';
import { type ScreeningReportData } from '@/components/ScreeningReport';

export class PDFReportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 6;
  }

  /**
   * Generate PDF report from screening data
   */
  generateScreeningReportPDF(reportData: ScreeningReportData): void {
    try {
      // Reset position
      this.currentY = this.margin;

      // Header with logo area
      this.addHeader(reportData);
      
      // Risk Assessment Summary Box
      this.addRiskAssessmentBox(reportData);
      
      // Executive Summary
      this.addExecutiveSummary(reportData);
      
      // Detailed Analysis Sections
      this.addSection('IMAGE ANALYSIS SUMMARY', reportData.imageSummary, 'analysis');
      this.addSection('QUESTIONNAIRE FINDINGS', reportData.questionnaireSummary, 'findings');
      this.addSection('COMBINED RISK ASSESSMENT', reportData.combinedAssessment, 'assessment');
      
      // Risk and Protective Factors in columns
      this.addFactorsSection(reportData);
      
      // Recommendations with priority styling
      this.addRecommendationsSection(reportData);
      
      // Next Steps with timeline
      this.addNextStepsSection(reportData.nextSteps, reportData.urgencyLevel);
      
      // Medical Disclaimer Box
      this.addDisclaimerBox(reportData.disclaimer);
      
      // Footer with contact info
      this.addFooter(reportData);

      // Download the PDF
      const fileName = `SkinScreeningReport_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  /**
   * Add professional medical header
   */
  private addHeader(reportData: ScreeningReportData): void {
    // Header background
    this.doc.setFillColor(41, 98, 255); // Medical blue
    this.doc.rect(0, 0, this.pageWidth, 35, 'F');

    // Title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('SKIN CANCER SCREENING REPORT', this.pageWidth / 2, 15, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('AI-Powered Dermatological Assessment', this.pageWidth / 2, 25, { align: 'center' });

    this.currentY = 45;

    // Report metadata box
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 2, 2, 'FD');

    this.doc.setFontSize(9);
    this.doc.setTextColor(71, 85, 105);
    this.doc.setFont('helvetica', 'normal');
    
    const generatedDate = new Date(reportData.generatedAt).toLocaleString();
    this.doc.text(`Report Generated: ${generatedDate}`, this.margin + 5, this.currentY + 8);
    this.doc.text(`Report ID: SR-${Date.now().toString().slice(-8)}`, this.margin + 5, this.currentY + 15);
    
    this.currentY += 30;
    this.doc.setTextColor(0, 0, 0); // Reset text color
  }

  /**
   * Add prominent risk assessment box
   */
  private addRiskAssessmentBox(reportData: ScreeningReportData): void {
    const boxHeight = 35;
    const boxY = this.currentY;

    // Risk level box with gradient effect
    const riskColor = this.getRiskColor(reportData.riskLevel);
    this.doc.setFillColor(riskColor.r, riskColor.g, riskColor.b);
    this.doc.setDrawColor(riskColor.r - 30, riskColor.g - 30, riskColor.b - 30);
    this.doc.roundedRect(this.margin, boxY, this.pageWidth - 2 * this.margin, boxHeight, 5, 5, 'FD');

    // Risk indicator circle
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(this.margin + 20, boxY + 17, 8, 'F');
    
    // Risk level icon (simplified)
    this.doc.setFontSize(12);
    this.doc.setTextColor(riskColor.r, riskColor.g, riskColor.b);
    this.doc.setFont('helvetica', 'bold');
    const riskIcon = reportData.riskLevel === 'High' ? '!' : reportData.riskLevel === 'Medium' ? '?' : '✓';
    this.doc.text(riskIcon, this.margin + 20, boxY + 20, { align: 'center' });

    // Risk level text
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(`RISK LEVEL: ${reportData.riskLevel.toUpperCase()}`, this.margin + 35, boxY + 15);

    // Urgency message
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const urgencyMessage = this.getUrgencyMessage(reportData.urgencyLevel);
    this.doc.text(urgencyMessage, this.margin + 35, boxY + 25);

    this.currentY += boxHeight + 15;
    this.doc.setTextColor(0, 0, 0); // Reset text color
  }

  /**
   * Add executive summary
   */
  private addExecutiveSummary(reportData: ScreeningReportData): void {
    this.checkPageBreak(25);

    // Summary box
    this.doc.setFillColor(249, 250, 251);
    this.doc.setDrawColor(209, 213, 219);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 3, 3, 'FD');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(55, 65, 81);
    this.doc.text('EXECUTIVE SUMMARY', this.margin + 5, this.currentY + 8);

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    const summary = `This screening combines AI image analysis with clinical questionnaire data to assess skin cancer risk. The analysis identified a ${reportData.riskLevel.toLowerCase()} risk level requiring ${reportData.urgencyLevel} medical attention.`;
    const summaryLines = this.doc.splitTextToSize(summary, this.pageWidth - 2 * this.margin - 10);
    this.doc.text(summaryLines[0], this.margin + 5, this.currentY + 15);

    this.currentY += 30;
    this.doc.setTextColor(0, 0, 0);
  }

  /**
   * Add a section with enhanced styling
   */
  private addSection(title: string, content: string, type: string): void {
    this.checkPageBreak(35);

    // Section header with colored bar
    const headerColor = type === 'analysis' ? { r: 59, g: 130, b: 246 } : 
                       type === 'findings' ? { r: 16, g: 185, b: 129 } : 
                       { r: 139, g: 69, b: 19 };

    this.doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
    this.doc.rect(this.margin, this.currentY, 4, 12, 'F');

    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    this.doc.text(title, this.margin + 8, this.currentY + 8);
    this.currentY += 15;

    // Section content with proper formatting
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin - 5);
    
    for (const line of lines) {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(line, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    this.currentY += 10; // Extra spacing after section
  }

  /**
   * Add risk and protective factors in two columns
   */
  private addFactorsSection(reportData: ScreeningReportData): void {
    if (reportData.riskFactors.length === 0 && reportData.protectiveFactors.length === 0) {
      return;
    }

    this.checkPageBreak(50);

    // Section header
    this.doc.setFillColor(220, 38, 127);
    this.doc.rect(this.margin, this.currentY, 4, 12, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(220, 38, 127);
    this.doc.text('RISK FACTORS ANALYSIS', this.margin + 8, this.currentY + 8);
    this.currentY += 20;

    const columnWidth = (this.pageWidth - 3 * this.margin) / 2;
    const leftColumnX = this.margin;
    const rightColumnX = this.margin + columnWidth + 10;

    // Risk factors column
    if (reportData.riskFactors.length > 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(239, 68, 68);
      this.doc.text('⚠ Risk Factors', leftColumnX, this.currentY);

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      
      let factorY = this.currentY + 8;
      for (const factor of reportData.riskFactors.slice(0, 6)) { // Limit for space
        this.doc.text(`• ${factor}`, leftColumnX, factorY);
        factorY += 6;
      }
    }

    // Protective factors column
    if (reportData.protectiveFactors.length > 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(34, 197, 94);
      this.doc.text('✓ Protective Factors', rightColumnX, this.currentY);

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      
      let factorY = this.currentY + 8;
      for (const factor of reportData.protectiveFactors.slice(0, 6)) { // Limit for space
        this.doc.text(`• ${factor}`, rightColumnX, factorY);
        factorY += 6;
      }
    }

    this.currentY += Math.max(reportData.riskFactors.length, reportData.protectiveFactors.length) * 6 + 20;
  }

  /**
   * Add recommendations section with priority styling
   */
  private addRecommendationsSection(reportData: ScreeningReportData): void {
    this.checkPageBreak(40);

    // Section header
    this.doc.setFillColor(168, 85, 247);
    this.doc.rect(this.margin, this.currentY, 4, 12, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(168, 85, 247);
    this.doc.text('MEDICAL RECOMMENDATIONS', this.margin + 8, this.currentY + 8);
    this.currentY += 20;

    // Recommendations box
    this.doc.setFillColor(250, 245, 255);
    this.doc.setDrawColor(196, 181, 253);
    const recHeight = 25;
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, recHeight, 3, 3, 'FD');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(reportData.recommendation, this.pageWidth - 2 * this.margin - 10);
    let textY = this.currentY + 8;
    
    for (const line of lines.slice(0, 3)) { // Limit to fit in box
      this.doc.text(line, this.margin + 5, textY);
      textY += 6;
    }

    this.currentY += recHeight + 15;
  }

  /**
   * Add next steps with timeline and priority
   */
  private addNextStepsSection(nextSteps: string[], urgencyLevel: string): void {
    this.checkPageBreak(40);

    // Section header with urgency color
    const urgencyColor = urgencyLevel === 'urgent' ? { r: 239, g: 68, b: 68 } :
                        urgencyLevel === 'soon' ? { r: 251, g: 191, b: 36 } :
                        { r: 34, g: 197, b: 94 };

    this.doc.setFillColor(urgencyColor.r, urgencyColor.g, urgencyColor.b);
    this.doc.rect(this.margin, this.currentY, 4, 12, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(urgencyColor.r, urgencyColor.g, urgencyColor.b);
    this.doc.text('ACTION PLAN & TIMELINE', this.margin + 8, this.currentY + 8);
    this.currentY += 20;

    // Timeline indicator
    const timelineText = urgencyLevel === 'urgent' ? 'IMMEDIATE ACTION REQUIRED' :
                        urgencyLevel === 'soon' ? 'ACTION NEEDED WITHIN 2-4 WEEKS' :
                        'ROUTINE MONITORING';

    this.doc.setFillColor(urgencyColor.r, urgencyColor.g, urgencyColor.b);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 2, 2, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(timelineText, this.pageWidth / 2, this.currentY + 7, { align: 'center' });
    this.currentY += 20;

    // Steps with numbering
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    nextSteps.forEach((step, index) => {
      this.checkPageBreak(8);
      
      // Step number circle
      this.doc.setFillColor(urgencyColor.r, urgencyColor.g, urgencyColor.b);
      this.doc.circle(this.margin + 8, this.currentY - 2, 6, 'F');
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text((index + 1).toString(), this.margin + 8, this.currentY + 1, { align: 'center' });
      
      // Step text
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      
      const stepLines = this.doc.splitTextToSize(step, this.pageWidth - 2 * this.margin - 25);
      this.doc.text(stepLines[0], this.margin + 20, this.currentY);
      
      this.currentY += 10;
    });

    this.currentY += 10;
  }

  /**
   * Add prominent medical disclaimer box
   */
  private addDisclaimerBox(disclaimer: string): void {
    this.checkPageBreak(50);

    // Disclaimer box with warning styling
    const boxHeight = 40;
    this.doc.setFillColor(254, 252, 232); // Light amber background
    this.doc.setDrawColor(245, 158, 11); // Amber border
    this.doc.setLineWidth(2);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 5, 5, 'FD');

    // Warning icon area
    this.doc.setFillColor(245, 158, 11);
    this.doc.circle(this.margin + 15, this.currentY + 15, 8, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('!', this.margin + 15, this.currentY + 18, { align: 'center' });

    // Disclaimer title
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(146, 64, 14);
    this.doc.text('IMPORTANT MEDICAL DISCLAIMER', this.margin + 30, this.currentY + 12);

    // Disclaimer text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(disclaimer, this.pageWidth - 2 * this.margin - 35);
    let textY = this.currentY + 20;
    
    for (const line of lines.slice(0, 3)) { // Limit to fit in box
      this.doc.text(line, this.margin + 30, textY);
      textY += 5;
    }

    this.currentY += boxHeight + 15;
    this.doc.setLineWidth(0.2); // Reset line width
  }

  /**
   * Add professional footer
   */
  private addFooter(reportData: ScreeningReportData): void {
    const footerY = this.pageHeight - 25;
    
    // Footer background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, footerY - 5, this.pageWidth, 30, 'F');

    // Separator line
    this.doc.setDrawColor(226, 232, 240);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);

    // Footer content
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    
    // Left side - Report info
    this.doc.text('AI Skin Cancer Screening Report', this.margin, footerY);
    this.doc.text('For educational purposes only - Not a medical diagnosis', this.margin, footerY + 6);
    
    // Right side - Page and date
    this.doc.text('Page 1 of 1', this.pageWidth - this.margin, footerY, { align: 'right' });
    this.doc.text(new Date().toLocaleDateString(), this.pageWidth - this.margin, footerY + 6, { align: 'right' });
    
    // Center - Contact recommendation
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('Always consult qualified healthcare professionals for medical advice', this.pageWidth / 2, footerY + 12, { align: 'center' });
  }

  /**
   * Check if we need a page break
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Get color for risk level
   */
  private getRiskColor(riskLevel: string): { r: number; g: number; b: number } {
    switch (riskLevel) {
      case 'Low':
        return { r: 34, g: 197, b: 94 }; // Green
      case 'Medium':
        return { r: 251, g: 191, b: 36 }; // Yellow/Amber
      case 'High':
        return { r: 239, g: 68, b: 68 }; // Red
      default:
        return { r: 107, g: 114, b: 128 }; // Gray
    }
  }

  /**
   * Get urgency message
   */
  private getUrgencyMessage(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'urgent':
        return 'Schedule dermatologist appointment within 1-2 days';
      case 'soon':
        return 'Schedule dermatologist appointment within 2-4 weeks';
      default:
        return 'Continue routine monitoring and annual check-ups';
    }
  }
}

export const pdfReportService = new PDFReportService();