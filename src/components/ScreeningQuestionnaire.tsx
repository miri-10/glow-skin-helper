import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Clock, 
  Sun, 
  Users, 
  User, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuestionnaireData {
  // Lesion changes
  lesionChanges: {
    sizeChange: "increased" | "decreased" | "no_change" | "unsure";
    colorChange: "yes" | "no" | "unsure";
    shapeChange: "yes" | "no" | "unsure";
    timeframe: "days" | "weeks" | "months" | "years" | "unsure";
  };
  
  // Symptoms
  symptoms: {
    itching: boolean;
    bleeding: boolean;
    pain: boolean;
    crusting: boolean;
    none: boolean;
  };
  
  // Sun exposure
  sunExposure: {
    dailyExposure: "minimal" | "moderate" | "high" | "extreme";
    sunburnHistory: "never" | "rarely" | "sometimes" | "frequently";
    sunProtection: "always" | "usually" | "sometimes" | "rarely" | "never";
    tanningSalon: "never" | "rarely" | "regularly" | "frequently";
  };
  
  // Medical history
  medicalHistory: {
    personalHistory: "yes" | "no" | "unsure";
    familyHistory: "yes" | "no" | "unsure";
    previousBiopsies: "yes" | "no" | "unsure";
    immunocompromised: "yes" | "no" | "unsure";
  };
  
  // Demographics
  demographics: {
    ageRange: "under_20" | "20_29" | "30_39" | "40_49" | "50_59" | "60_69" | "70_plus";
    skinType: "very_fair" | "fair" | "medium" | "olive" | "brown" | "dark";
    moleCount: "few" | "some" | "many" | "numerous";
  };
  
  // Additional notes
  additionalNotes?: string;
}

interface ScreeningQuestionnaireProps {
  onSubmit: (data: QuestionnaireData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STEPS = [
  { id: 'lesion', title: 'Lesion Changes', icon: Clock },
  { id: 'symptoms', title: 'Symptoms', icon: AlertCircle },
  { id: 'sun', title: 'Sun Exposure', icon: Sun },
  { id: 'history', title: 'Medical History', icon: Users },
  { id: 'demographics', title: 'About You', icon: User },
  { id: 'notes', title: 'Additional Notes', icon: FileText }
];

export function ScreeningQuestionnaire({ onSubmit, onCancel, isSubmitting = false }: ScreeningQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>({
    lesionChanges: {
      sizeChange: "unsure",
      colorChange: "unsure",
      shapeChange: "unsure",
      timeframe: "unsure"
    },
    symptoms: {
      itching: false,
      bleeding: false,
      pain: false,
      crusting: false,
      none: false
    },
    sunExposure: {
      dailyExposure: "moderate",
      sunburnHistory: "sometimes",
      sunProtection: "sometimes",
      tanningSalon: "never"
    },
    medicalHistory: {
      personalHistory: "no",
      familyHistory: "no",
      previousBiopsies: "no",
      immunocompromised: "no"
    },
    demographics: {
      ageRange: "30_39",
      skinType: "fair",
      moleCount: "some"
    },
    additionalNotes: ""
  });

  const updateFormData = (section: keyof QuestionnaireData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null 
        ? { ...prev[section], ...data }
        : data
    }));
  };

  const handleSymptomChange = (symptom: keyof QuestionnaireData['symptoms'], checked: boolean) => {
    if (symptom === 'none' && checked) {
      // If "none" is selected, uncheck all others
      setFormData(prev => ({
        ...prev,
        symptoms: {
          itching: false,
          bleeding: false,
          pain: false,
          crusting: false,
          none: true
        }
      }));
    } else if (symptom !== 'none' && checked) {
      // If any symptom is selected, uncheck "none"
      setFormData(prev => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          [symptom]: checked,
          none: false
        }
      }));
    } else {
      // Normal toggle
      setFormData(prev => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          [symptom]: checked
        }
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isStepValid = () => {
    // Basic validation - can be enhanced
    return true;
  };

  const renderStep = () => {
    const step = STEPS[currentStep];
    
    switch (step.id) {
      case 'lesion':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Has the lesion changed in size?</Label>
              <RadioGroup
                value={formData.lesionChanges.sizeChange}
                onValueChange={(value) => updateFormData('lesionChanges', { sizeChange: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="increased" id="size-increased" />
                  <Label htmlFor="size-increased">Increased in size</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decreased" id="size-decreased" />
                  <Label htmlFor="size-decreased">Decreased in size</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_change" id="size-no-change" />
                  <Label htmlFor="size-no-change">No change</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="size-unsure" />
                  <Label htmlFor="size-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Has the color changed?</Label>
              <RadioGroup
                value={formData.lesionChanges.colorChange}
                onValueChange={(value) => updateFormData('lesionChanges', { colorChange: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="color-yes" />
                  <Label htmlFor="color-yes">Yes, the color has changed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="color-no" />
                  <Label htmlFor="color-no">No change in color</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="color-unsure" />
                  <Label htmlFor="color-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Has the shape or border changed?</Label>
              <RadioGroup
                value={formData.lesionChanges.shapeChange}
                onValueChange={(value) => updateFormData('lesionChanges', { shapeChange: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="shape-yes" />
                  <Label htmlFor="shape-yes">Yes, shape or border has changed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="shape-no" />
                  <Label htmlFor="shape-no">No change in shape</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="shape-unsure" />
                  <Label htmlFor="shape-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Over what timeframe have you noticed changes?</Label>
              <RadioGroup
                value={formData.lesionChanges.timeframe}
                onValueChange={(value) => updateFormData('lesionChanges', { timeframe: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="days" id="time-days" />
                  <Label htmlFor="time-days">Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weeks" id="time-weeks" />
                  <Label htmlFor="time-weeks">Weeks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="months" id="time-months" />
                  <Label htmlFor="time-months">Months</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="years" id="time-years" />
                  <Label htmlFor="time-years">Years</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="time-unsure" />
                  <Label htmlFor="time-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'symptoms':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">
                Are you experiencing any of these symptoms with the lesion?
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="itching"
                    checked={formData.symptoms.itching}
                    onCheckedChange={(checked) => handleSymptomChange('itching', checked as boolean)}
                  />
                  <Label htmlFor="itching">Itching or irritation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bleeding"
                    checked={formData.symptoms.bleeding}
                    onCheckedChange={(checked) => handleSymptomChange('bleeding', checked as boolean)}
                  />
                  <Label htmlFor="bleeding">Bleeding or oozing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pain"
                    checked={formData.symptoms.pain}
                    onCheckedChange={(checked) => handleSymptomChange('pain', checked as boolean)}
                  />
                  <Label htmlFor="pain">Pain or tenderness</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="crusting"
                    checked={formData.symptoms.crusting}
                    onCheckedChange={(checked) => handleSymptomChange('crusting', checked as boolean)}
                  />
                  <Label htmlFor="crusting">Crusting or scabbing</Label>
                </div>
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Checkbox
                    id="none"
                    checked={formData.symptoms.none}
                    onCheckedChange={(checked) => handleSymptomChange('none', checked as boolean)}
                  />
                  <Label htmlFor="none" className="font-medium">None of the above</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sun':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">How much daily sun exposure do you typically get?</Label>
              <RadioGroup
                value={formData.sunExposure.dailyExposure}
                onValueChange={(value) => updateFormData('sunExposure', { dailyExposure: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="sun-minimal" />
                  <Label htmlFor="sun-minimal">Minimal (mostly indoors)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="sun-moderate" />
                  <Label htmlFor="sun-moderate">Moderate (some outdoor activities)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="sun-high" />
                  <Label htmlFor="sun-high">High (frequent outdoor activities)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extreme" id="sun-extreme" />
                  <Label htmlFor="sun-extreme">Extreme (outdoor work/sports)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">How often have you had sunburns?</Label>
              <RadioGroup
                value={formData.sunExposure.sunburnHistory}
                onValueChange={(value) => updateFormData('sunExposure', { sunburnHistory: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="burn-never" />
                  <Label htmlFor="burn-never">Never</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="burn-rarely" />
                  <Label htmlFor="burn-rarely">Rarely (1-2 times)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="burn-sometimes" />
                  <Label htmlFor="burn-sometimes">Sometimes (3-10 times)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="frequently" id="burn-frequently" />
                  <Label htmlFor="burn-frequently">Frequently (more than 10 times)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">How often do you use sun protection?</Label>
              <RadioGroup
                value={formData.sunExposure.sunProtection}
                onValueChange={(value) => updateFormData('sunExposure', { sunProtection: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="always" id="protection-always" />
                  <Label htmlFor="protection-always">Always</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="usually" id="protection-usually" />
                  <Label htmlFor="protection-usually">Usually</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="protection-sometimes" />
                  <Label htmlFor="protection-sometimes">Sometimes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="protection-rarely" />
                  <Label htmlFor="protection-rarely">Rarely</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="protection-never" />
                  <Label htmlFor="protection-never">Never</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Have you used tanning salons?</Label>
              <RadioGroup
                value={formData.sunExposure.tanningSalon}
                onValueChange={(value) => updateFormData('sunExposure', { tanningSalon: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="tanning-never" />
                  <Label htmlFor="tanning-never">Never</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="tanning-rarely" />
                  <Label htmlFor="tanning-rarely">Rarely (1-5 times)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regularly" id="tanning-regularly" />
                  <Label htmlFor="tanning-regularly">Regularly (monthly)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="frequently" id="tanning-frequently" />
                  <Label htmlFor="tanning-frequently">Frequently (weekly or more)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Have you personally had skin cancer before?</Label>
              <RadioGroup
                value={formData.medicalHistory.personalHistory}
                onValueChange={(value) => updateFormData('medicalHistory', { personalHistory: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="personal-yes" />
                  <Label htmlFor="personal-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="personal-no" />
                  <Label htmlFor="personal-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="personal-unsure" />
                  <Label htmlFor="personal-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Does anyone in your family have a history of skin cancer?</Label>
              <RadioGroup
                value={formData.medicalHistory.familyHistory}
                onValueChange={(value) => updateFormData('medicalHistory', { familyHistory: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="family-yes" />
                  <Label htmlFor="family-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="family-no" />
                  <Label htmlFor="family-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="family-unsure" />
                  <Label htmlFor="family-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Have you had skin biopsies before?</Label>
              <RadioGroup
                value={formData.medicalHistory.previousBiopsies}
                onValueChange={(value) => updateFormData('medicalHistory', { previousBiopsies: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="biopsy-yes" />
                  <Label htmlFor="biopsy-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="biopsy-no" />
                  <Label htmlFor="biopsy-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="biopsy-unsure" />
                  <Label htmlFor="biopsy-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Do you have a compromised immune system?</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (Due to medication, medical condition, or organ transplant)
              </p>
              <RadioGroup
                value={formData.medicalHistory.immunocompromised}
                onValueChange={(value) => updateFormData('medicalHistory', { immunocompromised: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="immune-yes" />
                  <Label htmlFor="immune-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="immune-no" />
                  <Label htmlFor="immune-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="immune-unsure" />
                  <Label htmlFor="immune-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'demographics':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">What is your age range?</Label>
              <RadioGroup
                value={formData.demographics.ageRange}
                onValueChange={(value) => updateFormData('demographics', { ageRange: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="under_20" id="age-under-20" />
                  <Label htmlFor="age-under-20">Under 20</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="20_29" id="age-20-29" />
                  <Label htmlFor="age-20-29">20-29</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30_39" id="age-30-39" />
                  <Label htmlFor="age-30-39">30-39</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="40_49" id="age-40-49" />
                  <Label htmlFor="age-40-49">40-49</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50_59" id="age-50-59" />
                  <Label htmlFor="age-50-59">50-59</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="60_69" id="age-60-69" />
                  <Label htmlFor="age-60-69">60-69</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="70_plus" id="age-70-plus" />
                  <Label htmlFor="age-70-plus">70+</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">What is your skin type?</Label>
              <RadioGroup
                value={formData.demographics.skinType}
                onValueChange={(value) => updateFormData('demographics', { skinType: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_fair" id="skin-very-fair" />
                  <Label htmlFor="skin-very-fair">Very fair (always burns, never tans)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="skin-fair" />
                  <Label htmlFor="skin-fair">Fair (usually burns, tans minimally)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="skin-medium" />
                  <Label htmlFor="skin-medium">Medium (sometimes burns, tans gradually)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="olive" id="skin-olive" />
                  <Label htmlFor="skin-olive">Olive (rarely burns, tans easily)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="brown" id="skin-brown" />
                  <Label htmlFor="skin-brown">Brown (very rarely burns, tans very easily)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="skin-dark" />
                  <Label htmlFor="skin-dark">Dark (never burns, deeply pigmented)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">How many moles do you have on your body?</Label>
              <RadioGroup
                value={formData.demographics.moleCount}
                onValueChange={(value) => updateFormData('demographics', { moleCount: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="few" id="moles-few" />
                  <Label htmlFor="moles-few">Few (less than 10)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="some" id="moles-some" />
                  <Label htmlFor="moles-some">Some (10-25)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="many" id="moles-many" />
                  <Label htmlFor="moles-many">Many (25-50)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="numerous" id="moles-numerous" />
                  <Label htmlFor="moles-numerous">Numerous (more than 50)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="additional-notes" className="text-base font-medium">
                Additional Notes (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Please share any additional information about the lesion, your concerns, or relevant medical history.
              </p>
              <Textarea
                id="additional-notes"
                placeholder="Enter any additional information here..."
                value={formData.additionalNotes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                className="min-h-[120px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Screening Questionnaire
          </CardTitle>
          <CardDescription>
            Please answer these questions to help us provide a more comprehensive assessment.
            This information will be combined with your image analysis.
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    isActive ? "border-primary bg-primary text-primary-foreground" :
                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                    "border-muted-foreground bg-background text-muted-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-12 h-0.5 mx-2 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid() || isSubmitting}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    'Generate Screening Report'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}