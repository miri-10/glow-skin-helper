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
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AnalysisResult {
  prediction: "benign" | "malignant" | "uncertain";
  confidence: number;
  explanation: string;
  recommendations: string[];
}

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

    // Simulate AI analysis (in production, this would call the backend)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock result for demonstration
    const mockResults: AnalysisResult[] = [
      {
        prediction: "benign",
        confidence: 87,
        explanation: "The analyzed lesion shows characteristics commonly associated with benign skin conditions. The borders appear regular, color distribution is relatively uniform, and the overall pattern suggests a non-cancerous growth such as a common mole or seborrheic keratosis.",
        recommendations: [
          "Continue regular self-examinations",
          "Monitor for any changes in size, shape, or color",
          "Schedule routine skin check with dermatologist",
          "Protect the area from excessive sun exposure"
        ]
      },
      {
        prediction: "malignant",
        confidence: 72,
        explanation: "The analyzed lesion displays some characteristics that warrant further medical evaluation. Features such as irregular borders, color variation, or asymmetry may indicate potential concerns that should be assessed by a healthcare professional.",
        recommendations: [
          "Schedule an appointment with a dermatologist immediately",
          "Do not attempt to remove or treat the lesion yourself",
          "Document any changes with photos",
          "Prepare questions for your doctor visit"
        ]
      },
      {
        prediction: "uncertain",
        confidence: 55,
        explanation: "The image quality or lesion characteristics make it difficult to provide a confident assessment. This could be due to image clarity, lighting conditions, or the complexity of the lesion's features.",
        recommendations: [
          "Try uploading a clearer image with better lighting",
          "Ensure the lesion is in focus and centered",
          "Consider consulting a dermatologist for in-person evaluation",
          "Don't rely solely on this tool for medical decisions"
        ]
      }
    ];

    // Randomly select a result for demonstration
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    setResult(randomResult);
    setIsAnalyzing(false);
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
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Skin Lesion Analysis
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a clear photo of your skin lesion for AI-powered analysis. 
            Ensure good lighting and focus for best results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 min-h-[320px] flex flex-col items-center justify-center",
                isDragging
                  ? "border-primary bg-primary/5"
                  : previewUrl
                  ? "border-border bg-card"
                  : "border-border hover:border-primary/50 bg-card"
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
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
                          <Loader2 className="w-10 h-10 text-primary-foreground animate-spin mx-auto mb-2" />
                          <p className="text-primary-foreground font-medium">Analyzing...</p>
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
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
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
            </div>

            {selectedImage && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Button
                  onClick={handleAnalyze}
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  <Upload className="w-5 h-5" />
                  Analyze Image
                </Button>
              </motion.div>
            )}

            {/* Tips */}
            <div className="mt-6 bg-secondary/50 rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Tips for best results</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use natural lighting or bright indoor light</li>
                    <li>• Keep the camera steady and focused</li>
                    <li>• Capture the entire lesion with some surrounding skin</li>
                    <li>• Avoid shadows on the lesion</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {(() => {
                    const styles = getResultStyles(result.prediction);
                    const Icon = styles.icon;
                    return (
                      <>
                        <div className={cn(
                          "rounded-2xl p-6 border",
                          styles.bg,
                          styles.border
                        )}>
                          <div className="flex items-center gap-3 mb-4">
                            <Icon className={cn("w-8 h-8", styles.iconColor)} />
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">
                                {styles.label}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {result.confidence}%
                              </p>
                            </div>
                          </div>
                          
                          {/* Confidence Bar */}
                          <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden mb-4">
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

                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {result.explanation}
                          </p>
                        </div>

                        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                          <h4 className="font-semibold text-foreground mb-4">
                            Recommendations
                          </h4>
                          <ul className="space-y-3">
                            {result.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="text-sm text-muted-foreground">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          onClick={clearImage}
                          variant="outline"
                          className="w-full"
                        >
                          Analyze Another Image
                        </Button>
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex items-center justify-center bg-card rounded-2xl border border-border"
                >
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      No Analysis Yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Upload an image and click "Analyze Image" to receive AI-powered insights
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-warning/5 border border-warning/20 rounded-xl p-4 text-center"
        >
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Important:</strong> This tool is for educational purposes only 
            and does not provide medical diagnosis. Always consult a qualified healthcare professional for 
            medical advice and diagnosis.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
