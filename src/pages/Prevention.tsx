import { motion } from "framer-motion";
import { 
  Sun, 
  Clock, 
  Shirt, 
  Eye,
  Calendar,
  Shield,
  Droplets,
  Umbrella,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const preventionTips = [
  {
    icon: Droplets,
    title: "Use Sunscreen Daily",
    description: "Apply broad-spectrum SPF 30+ sunscreen 15-30 minutes before going outside.",
    details: [
      "Reapply every 2 hours or after swimming/sweating",
      "Use about 1 ounce (shot glass full) for full body coverage",
      "Don't forget ears, neck, tops of feet, and scalp",
      "Use water-resistant formulas for outdoor activities"
    ],
    color: "from-primary/20 to-primary/5"
  },
  {
    icon: Clock,
    title: "Avoid Peak Sun Hours",
    description: "The sun's rays are strongest between 10 AM and 4 PM.",
    details: [
      "Plan outdoor activities for early morning or late afternoon",
      "Seek shade during midday hours",
      "Check the UV index before going outside",
      "Remember UV rays can penetrate clouds"
    ],
    color: "from-warning/20 to-warning/5"
  },
  {
    icon: Shirt,
    title: "Wear Protective Clothing",
    description: "Cover up with long sleeves, pants, and wide-brimmed hats.",
    details: [
      "Dark, tightly woven fabrics offer more protection",
      "Look for UPF (Ultraviolet Protection Factor) labeled clothing",
      "Wear sunglasses with UV protection",
      "Consider sun-protective swimwear"
    ],
    color: "from-secondary to-secondary/50"
  },
  {
    icon: Umbrella,
    title: "Seek Shade",
    description: "Stay in the shade whenever possible, especially during peak hours.",
    details: [
      "Use umbrellas at the beach or pool",
      "Sit under trees or covered areas",
      "Create your own shade with portable canopies",
      "Remember that water, sand, and snow reflect UV rays"
    ],
    color: "from-accent to-accent/50"
  },
  {
    icon: Eye,
    title: "Regular Self-Checks",
    description: "Examine your skin monthly to spot any new or changing spots.",
    details: [
      "Use a full-length mirror and hand mirror",
      "Check all areas including between toes and fingers",
      "Take photos to track changes over time",
      "Use the ABCDE rule for moles"
    ],
    color: "from-success/20 to-success/5"
  },
  {
    icon: Calendar,
    title: "Annual Dermatologist Visits",
    description: "Schedule yearly skin exams with a dermatologist.",
    details: [
      "Professional exams can catch what you might miss",
      "Those with risk factors may need more frequent visits",
      "Bring photos of any spots that concern you",
      "Ask about dermoscopy for suspicious lesions"
    ],
    color: "from-destructive/20 to-destructive/5"
  }
];

const riskFactors = [
  "Fair skin, light hair, and light-colored eyes",
  "History of sunburns, especially blistering sunburns",
  "Excessive sun exposure or tanning bed use",
  "Living in sunny or high-altitude climates",
  "Having many moles or unusual moles",
  "Family history of skin cancer",
  "Weakened immune system",
  "Previous skin cancer diagnosis"
];

const mythsAndFacts = [
  {
    myth: "I don't need sunscreen on cloudy days",
    fact: "Up to 80% of UV rays can penetrate clouds. Always wear sunscreen outdoors."
  },
  {
    myth: "A base tan protects me from burning",
    fact: "A tan is actually a sign of skin damage. There's no such thing as a safe tan."
  },
  {
    myth: "People with dark skin don't get skin cancer",
    fact: "While less common, people of all skin tones can develop skin cancer."
  },
  {
    myth: "Sunscreen is only for summer",
    fact: "UV rays are present year-round. Wear sunscreen daily, even in winter."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function Prevention() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen py-6 md:py-8 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-5xl relative z-10 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-card/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-foreground mb-6 border border-border shadow-lg"
          >
            <Shield className="w-4 h-4" />
            Prevention Guide
          </motion.div>
          <h1 
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ 
              color: "hsl(220 20% 20%)",
              textShadow: "0 2px 20px rgba(255,255,255,0.5)"
            }}
          >
            Prevention Tips
          </h1>
          <p 
            className="text-lg max-w-3xl mx-auto"
            style={{ 
              color: "hsl(220 15% 30%)",
              textShadow: "0 1px 10px rgba(255,255,255,0.8)"
            }}
          >
            The best way to fight skin cancer is to prevent it. Follow these evidence-based 
            tips to protect your skin and reduce your risk.
          </p>
        </motion.div>

        {/* Key Prevention Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Six Essential Prevention Steps
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {preventionTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-gradient-to-br ${tip.color} rounded-2xl p-6 md:p-8 border border-border hover:shadow-lg transition-all cursor-default`}
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4"
                >
                  <tip.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-2">{tip.title}</h3>
                <p className="text-muted-foreground mb-4">{tip.description}</p>
                <motion.ul 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  {tip.details.map((detail, i) => (
                    <motion.li 
                      key={i} 
                      variants={itemVariants}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {detail}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Sun Protection Infographic */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-soft hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center"
              >
                <Sun className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Understanding UV Index</h2>
                <p className="text-muted-foreground">Know when to take extra precautions</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { range: "0-2", level: "Low", color: "bg-success", action: "Minimal protection needed" },
                { range: "3-5", level: "Moderate", color: "bg-success/70", action: "Stay in shade midday" },
                { range: "6-7", level: "High", color: "bg-warning", action: "Reduce sun exposure" },
                { range: "8-10", level: "Very High", color: "bg-warning/70", action: "Extra protection needed" },
                { range: "11+", level: "Extreme", color: "bg-destructive", action: "Avoid sun if possible" },
              ].map((uv, index) => (
                <motion.div
                  key={uv.range}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="text-center cursor-default"
                >
                  <motion.div 
                    className={`w-full h-3 ${uv.color} rounded-full mb-3`}
                    whileHover={{ scaleY: 1.5 }}
                  />
                  <div className="text-2xl font-bold text-foreground">{uv.range}</div>
                  <div className="text-sm font-medium text-foreground">{uv.level}</div>
                  <div className="text-xs text-muted-foreground mt-1">{uv.action}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Risk Factors */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-warning/5 border border-warning/20 rounded-2xl p-8 md:p-12 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="w-8 h-8 text-warning" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Know Your Risk Factors
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Some factors can increase your risk of developing skin cancer. If any of these apply to you, 
              take extra precautions and consider more frequent skin checks:
            </p>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-4"
            >
              {riskFactors.map((factor, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border hover:border-warning/30 transition-all cursor-default"
                >
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center shrink-0"
                  >
                    <span className="text-warning text-sm font-bold">{index + 1}</span>
                  </motion.div>
                  <span className="text-muted-foreground">{factor}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Myths vs Facts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Myths vs. Facts
          </h2>
          <div className="space-y-4">
            {mythsAndFacts.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft hover:shadow-lg transition-all cursor-default"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ x: -5 }}
                    className="bg-destructive/5 rounded-xl p-4 border border-destructive/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground text-xs font-medium">
                        MYTH
                      </span>
                    </div>
                    <p className="text-foreground">{item.myth}</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="bg-success/5 rounded-xl p-4 border border-success/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-success text-success-foreground text-xs font-medium">
                        FACT
                      </span>
                    </div>
                    <p className="text-foreground">{item.fact}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Daily Checklist */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-primary/10 via-secondary to-secondary rounded-2xl p-8 md:p-12 border border-border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              Daily Sun Protection Checklist
            </h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto"
            >
              {[
                "Applied SPF 30+ sunscreen before going out",
                "Wearing protective clothing (hat, sunglasses)",
                "Checked UV index for the day",
                "Planned activities around peak sun hours",
                "Packed sunscreen for reapplication",
                "Staying hydrated",
                "Seeking shade when possible",
                "Protecting children with extra care"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="flex items-center gap-3 bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-all cursor-default"
                >
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className="w-6 h-6 rounded-md border-2 border-primary flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">Ready to check your skin?</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild variant="hero" size="xl">
              <Link to="/detect">Start Detection Now</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
