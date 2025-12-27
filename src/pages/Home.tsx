import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import FloatingCell from "@/components/FloatingCell";
import { 
  Shield, 
  Upload, 
  Zap, 
  BookOpen, 
  ArrowRight,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen overflow-hidden"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* 3D Floating Cells */}
        <FloatingCell />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-card/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-foreground mb-6 border border-border shadow-lg"
            >
              <Shield className="w-4 h-4 text-primary" />
              AI-Powered Skin Analysis
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance"
              style={{ 
                color: "hsl(220 20% 20%)",
                textShadow: "0 2px 20px rgba(255,255,255,0.5)"
              }}
            >
              Detect Skin Cancer{" "}
              <span className="text-primary relative">
                Early
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/50 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </span>
              , Save Lives
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium"
              style={{ 
                color: "hsl(220 15% 30%)",
                textShadow: "0 1px 10px rgba(255,255,255,0.8)"
              }}
            >
              Upload a photo of your skin lesion and receive instant AI-powered analysis. 
              Early detection is key to successful treatment.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild variant="hero" size="xl" className="shadow-xl">
                  <Link to="/detect">
                    Start Detection
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild variant="outline" size="xl" className="bg-card/90 backdrop-blur-md shadow-lg border-border">
                  <Link to="/about">Learn More</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>


        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/10 backdrop-blur-md border-y border-white/20 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
        />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center cursor-default"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold text-primary mb-2"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.15 + 0.2, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                  style={{ textShadow: "0 2px 10px rgba(255,255,255,0.3)" }}
                >
                  {stat.value}
                </motion.div>
                <div 
                  className="text-slate-700 font-medium"
                  style={{ textShadow: "0 1px 5px rgba(255,255,255,0.5)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ 
                color: "hsl(220 20% 20%)",
                textShadow: "0 2px 20px rgba(255,255,255,0.5)"
              }}
            >
              How It Works
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ 
                color: "hsl(220 15% 30%)",
                textShadow: "0 1px 10px rgba(255,255,255,0.8)"
              }}
            >
              Our simple 3-step process makes skin analysis accessible to everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30 hover:shadow-xl hover:border-primary/30 hover:bg-white/30 transition-all duration-300 cursor-default"
              >
                <motion.div 
                  className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ 
                    color: "hsl(220 20% 20%)",
                    textShadow: "0 1px 10px rgba(255,255,255,0.5)"
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  style={{ 
                    color: "hsl(220 15% 35%)",
                    textShadow: "0 1px 5px rgba(255,255,255,0.7)"
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Warning Signs Section */}
      <section className="py-20 bg-white/10 backdrop-blur-md border-y border-white/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium mb-4">
                <AlertTriangle className="w-4 h-4" />
                Know the Signs
              </div>
              <h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ 
                  color: "hsl(220 20% 20%)",
                  textShadow: "0 2px 20px rgba(255,255,255,0.5)"
                }}
              >
                ABCDE Rule for Melanoma
              </h2>
              <p 
                className="mb-8"
                style={{ 
                  color: "hsl(220 15% 30%)",
                  textShadow: "0 1px 10px rgba(255,255,255,0.8)"
                }}
              >
                Use the ABCDE rule to identify potential warning signs. If you notice any of these, 
                consult a dermatologist immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild variant="secondary" size="lg">
                    <Link to="/about">
                      Learn More About Symptoms
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/medical-help">
                      Find Medical Help
                      <Heart className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {[
                { letter: "A", title: "Asymmetry", desc: "One half doesn't match the other" },
                { letter: "B", title: "Border", desc: "Edges are irregular or blurred" },
                { letter: "C", title: "Color", desc: "Multiple colors or uneven distribution" },
                { letter: "D", title: "Diameter", desc: "Larger than 6mm (pencil eraser)" },
                { letter: "E", title: "Evolving", desc: "Changes in size, shape, or color" },
              ].map((item, index) => (
                <motion.div
                  key={item.letter}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 8, scale: 1.02, transition: { duration: 0.2 } }}
                  className="flex items-start gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:border-primary/30 hover:shadow-md hover:bg-white/30 transition-all cursor-default"
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="font-bold text-primary-foreground">{item.letter}</span>
                  </motion.div>
                  <div>
                    <h4 
                      className="font-semibold"
                      style={{ 
                        color: "hsl(220 20% 20%)",
                        textShadow: "0 1px 5px rgba(255,255,255,0.5)"
                      }}
                    >
                      {item.title}
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ 
                        color: "hsl(220 15% 35%)",
                        textShadow: "0 1px 3px rgba(255,255,255,0.7)"
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
            className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/20 via-white/20 to-primary/10 backdrop-blur-md rounded-3xl p-12 md:p-16 border border-white/30 relative overflow-hidden shadow-xl"
          >
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6 relative"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4 relative"
              style={{ 
                color: "hsl(220 20% 20%)",
                textShadow: "0 2px 20px rgba(255,255,255,0.5)"
              }}
            >
              Your Health Matters
            </h2>
            <p 
              className="text-lg mb-8 max-w-2xl mx-auto relative"
              style={{ 
                color: "hsl(220 15% 30%)",
                textShadow: "0 1px 10px rgba(255,255,255,0.8)"
              }}
            >
              Don't wait for symptoms to worsen. Early detection can save lives. 
              Start your skin analysis today.
            </p>
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Button asChild variant="hero" size="xl" className="shadow-xl">
                <Link to="/detect">
                  Analyze Your Skin Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
