import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Shield, 
  Upload, 
  Zap, 
  BookOpen, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Heart
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Simply drag & drop or tap to upload your skin lesion image",
  },
  {
    icon: Zap,
    title: "Fast Analysis",
    description: "Get AI-powered insights in seconds with our advanced model",
  },
  {
    icon: BookOpen,
    title: "Educational Content",
    description: "Learn about skin cancer types, symptoms, and prevention",
  },
];

const stats = [
  { value: "5M+", label: "Cases detected yearly" },
  { value: "99%", label: "Curable if caught early" },
  { value: "#1", label: "Most common cancer" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-background" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm font-medium text-secondary-foreground mb-6">
              <Shield className="w-4 h-4" />
              AI-Powered Skin Analysis
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Detect Skin Cancer{" "}
              <span className="text-primary">Early</span>, Save Lives
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload a photo of your skin lesion and receive instant AI-powered analysis. 
              Early detection is key to successful treatment.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/detect">
                  Start Detection
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our simple 3-step process makes skin analysis accessible to everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Warning Signs Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium mb-4">
                <AlertTriangle className="w-4 h-4" />
                Know the Signs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                ABCDE Rule for Melanoma
              </h2>
              <p className="text-muted-foreground mb-8">
                Use the ABCDE rule to identify potential warning signs. If you notice any of these, 
                consult a dermatologist immediately.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link to="/about">
                  Learn More About Symptoms
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { letter: "A", title: "Asymmetry", desc: "One half doesn't match the other" },
                { letter: "B", title: "Border", desc: "Edges are irregular or blurred" },
                { letter: "C", title: "Color", desc: "Multiple colors or uneven distribution" },
                { letter: "D", title: "Diameter", desc: "Larger than 6mm (pencil eraser)" },
                { letter: "E", title: "Evolving", desc: "Changes in size, shape, or color" },
              ].map((item, index) => (
                <motion.div
                  key={item.letter}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 bg-background rounded-xl p-4 border border-border"
                >
                  <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary-foreground">{item.letter}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-secondary to-secondary rounded-3xl p-12 md:p-16 border border-border"
          >
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Health Matters
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Don't wait for symptoms to worsen. Early detection can save lives. 
              Start your skin analysis today.
            </p>
            <Button asChild variant="hero" size="xl">
              <Link to="/detect">
                Analyze Your Skin Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
