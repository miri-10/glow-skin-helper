import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Info,
  Sparkles,
  Users,
  Navigation,
  Brain,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { MedicalRecommendations } from "@/components/MedicalRecommendations";
import { aiService, type AnalysisResult } from "@/utils/aiService";

export default function Detect() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Use real AI service for analysis
      const analysisResult = await aiService.analyzeImageDemo(selectedImage);
      
      setResult(analysisResult);
      
      toast({
        title: "Analysis Complete",
        description: `AI analysis completed with ${analysisResult.confidence}% confidence`,
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
      
      // Set uncertain result on error
      setResult({
        prediction: "uncertain",
        confidence: 0,
        explanation: "Analysis failed due to technical issues. Please try again with a clearer image or consult a healthcare professional.",
        recommendations: [
          "Try uploading the image again",
          "Ensure good lighting and image quality",
          "Consider consulting a dermatologist for professional evaluation",
          "Don't rely solely on AI tools for medical decisions"
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const getResultStyles = (prediction: string) => {
    switch (prediction) {
      case "benign":
        return {
          bg: "bg-success/10",
          border: "border-success/30",
          icon: CheckCircle2,
          iconColor: "text-success",
          label: "Likely Benign",
        };
      case "malignant":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          icon: AlertCircle,
          iconColor: "text-destructive",
          label: "Requires Attention",
        };
      default:
        return {
          bg: "bg-warning/10",
          border: "border-warning/30",
          icon: AlertTriangle,
          iconColor: "text-warning",
          label: "Uncertain",
        };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen py-6 md:py-8 relative overflow-hidden"
    >

      
      <div className="container mx-auto px-4 max-w-4xl relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-card/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-foreground mb-6 border border-border shadow-lg"
          >
            <Brain className="w-4 h-4" />
            <Zap className="w-3 h-3" />
            Real AI-Powered Analysis
          </motion.div>
          <h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              color: "hsl(220 20% 20%)",
              textShadow: "0 2px 20px rgba(255,255,255,0.5)"
            }}
          >
            Skin Lesion Analysis
          </h1>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ 
              color: "hsl(220 15% 30%)",
              textShadow: "0 1px 10px rgba(255,255,255,0.8)"
            }}
          >
            Upload a clear photo of your skin lesion for real AI-powered analysis using advanced deep learning models. 
            Ensure good lighting and focus for accurate results.
          </p>
        </motion.div>

        <div className={cn(
          result ? "grid md:grid-cols-[1fr_0.8fr] gap-4 max-w-6xl mx-auto" : "max-w-lg mx-auto"
        )}>
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 w-full"
          >
            {/* Upload Box */}
            <motion.div
              whileHover={{ scale: previewUrl ? 1 : 1.02 }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center",
                isDragging
                  ? "border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 shadow-lg"
                  : previewUrl
                  ? "border-border bg-gradient-to-br from-card/90 via-primary/5 to-card/90 backdrop-blur-md min-h-[400px]"
                  : "border-border hover:border-primary/50 bg-gradient-to-br from-card/90 via-primary/5 to-card/90 backdrop-blur-md hover:shadow-lg min-h-[400px]"
              )}
            >
              <AnimatePresence mode="wait">
                {previewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full"
                  >
                    <img
                      src={previewUrl}
                      alt="Selected skin lesion"
                      className="w-full h-80 object-cover rounded-xl"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="w-full h-1 bg-primary/30 absolute top-0 rounded-t-xl overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            style={{ width: "50%" }}
                          />
                        </div>
                        <div className="text-center">
                          <Loader2 className="w-6 h-6 text-primary-foreground animate-spin mx-auto mb-1" />
                          <p className="text-primary-foreground font-medium text-sm">Analyzing...</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                      <ImageIcon className="w-8 h-8 text-primary-foreground" />
                    </motion.div>
                    <p className="text-foreground font-medium mb-2">
                      Drop your image here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Analyze Button (appears below upload after image is uploaded) */}
            <AnimatePresence>
              {selectedImage && !result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleAnalyze}
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>


          </motion.div>

          {/* Right Side - Results or Placeholder */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {(() => {
                  const styles = getResultStyles(result.prediction);
                  const Icon = styles.icon;
                  return (
                    <>
                      {/* Analysis Result */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "rounded-2xl p-4 border transition-all bg-white shadow-lg",
                          styles.border
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Icon className={cn("w-6 h-6", styles.iconColor)} />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {styles.label}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Confidence: {result.confidence}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Confidence Bar */}
                        <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn("h-full rounded-full", 
                              result.prediction === "benign" ? "bg-success" :
                              result.prediction === "malignant" ? "bg-destructive" : "bg-warning"
                            )}
                          />
                        </div>

                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {result.explanation}
                        </p>
                      </motion.div>

                      {/* Recommendations */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl p-4 border border-border shadow-lg hover:shadow-xl transition-all"
                      >
                        <h4 className="font-semibold text-foreground mb-3 text-sm">
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <motion.li 
                              key={index} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-xs text-muted-foreground">{rec}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Action Buttons */}
                      <div className="flex justify-center">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full max-w-xs">
                          <Button
                            onClick={clearImage}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Analyze Another
                          </Button>
                        </motion.div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {/* Empty placeholder - content will appear after analysis */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          <div className="max-w-md mx-auto">
            {/* Find Medical Help Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:shadow-lg hover:bg-white/30 transition-all flex flex-col justify-center">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 
                    className="font-medium mb-2"
                    style={{ 
                      color: "hsl(220 20% 20%)",
                      textShadow: "0 1px 10px rgba(255,255,255,0.5)"
                    }}
                  >
                    Find Medical Help
                  </h4>
                  <p 
                    className="text-sm mb-4"
                    style={{ 
                      color: "hsl(220 15% 30%)",
                      textShadow: "0 1px 5px rgba(255,255,255,0.7)"
                    }}
                  >
                    Locate nearby dermatologists and hospitals
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    <a href="/medical-help">Find Medical Help</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>



        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="mt-12 bg-warning/10 backdrop-blur-md border border-warning/20 rounded-xl p-4 text-center hover:shadow-md transition-all"
        >
          <p 
            className="text-sm"
            style={{ 
              color: "hsl(220 15% 30%)",
              textShadow: "0 1px 5px rgba(255,255,255,0.8)"
            }}
          >
            <strong 
              style={{ 
                color: "hsl(220 20% 20%)",
                textShadow: "0 1px 5px rgba(255,255,255,0.5)"
              }}
            >
              Important:
            </strong> This tool is for educational purposes only 
            and does not provide medical diagnosis. Always consult a qualified healthcare professional for 
            medical advice and diagnosis.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
