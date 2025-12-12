import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Eye,
  Clock,
  Stethoscope,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const cancerTypes = [
  {
    name: "Basal Cell Carcinoma",
    description: "The most common type of skin cancer. It begins in the basal cells, which are found at the bottom of the epidermis. BCCs rarely spread to other parts of the body but can cause local damage if left untreated.",
    characteristics: [
      "Pearly or waxy bump",
      "Flat, flesh-colored lesion",
      "Bleeding or scabbing sore that heals and returns",
      "Usually appears on sun-exposed areas"
    ],
    risk: "Low",
    color: "bg-success/10 border-success/30 text-success"
  },
  {
    name: "Squamous Cell Carcinoma",
    description: "The second most common type of skin cancer. It develops in the squamous cells that make up the middle and outer layers of the skin. While usually treatable, SCC can spread to other parts of the body if not treated.",
    characteristics: [
      "Firm, red nodule",
      "Flat lesion with scaly, crusted surface",
      "May appear as a sore that doesn't heal",
      "Common on sun-exposed areas"
    ],
    risk: "Medium",
    color: "bg-warning/10 border-warning/30 text-warning"
  },
  {
    name: "Melanoma",
    description: "The most serious type of skin cancer. It develops in melanocytes, the cells that give skin its color. Melanoma can spread rapidly to other organs and is potentially fatal if not caught early.",
    characteristics: [
      "Large brownish spot with darker speckles",
      "Mole that changes in color, size, or feel",
      "Small lesion with irregular border and multiple colors",
      "Dark lesions on palms, soles, or mucous membranes"
    ],
    risk: "High",
    color: "bg-destructive/10 border-destructive/30 text-destructive"
  }
];

const symptoms = [
  {
    icon: Eye,
    title: "Changes in Appearance",
    description: "Any mole or spot that changes in size, shape, color, or texture should be evaluated."
  },
  {
    icon: AlertCircle,
    title: "New Growths",
    description: "New moles, growths, or spots that appear after age 30 should be monitored closely."
  },
  {
    icon: AlertTriangle,
    title: "Non-Healing Sores",
    description: "Sores that don't heal within a few weeks or repeatedly bleed and scab over."
  },
  {
    icon: Clock,
    title: "Rapid Changes",
    description: "Any lesion that grows rapidly or changes appearance over weeks to months."
  }
];

const whenToSeeDoctor = [
  "A mole that's changed in size, shape, color, or feel",
  "A new skin growth that doesn't go away",
  "A sore that doesn't heal or heals and comes back",
  "Any spot that itches, hurts, crusts, scabs, or bleeds",
  "A shiny, waxy, scar-like growth",
  "A dark band under a nail"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function About() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
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
            className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm font-medium text-secondary-foreground mb-6"
          >
            <Heart className="w-4 h-4" />
            Educational Resource
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            About Skin Cancer
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Skin cancer is the most common form of cancer, with millions of cases diagnosed each year. 
            Understanding the types, symptoms, and warning signs can help save lives through early detection.
          </p>
        </motion.div>

        {/* What is Skin Cancer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-soft hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              What is Skin Cancer?
            </h2>
            <div className="prose prose-lg text-muted-foreground max-w-none">
              <p className="mb-4">
                Skin cancer is the abnormal growth of skin cells. It most often develops on skin exposed 
                to the sun, but can also occur on areas of your skin not ordinarily exposed to sunlight.
              </p>
              <p className="mb-4">
                There are three major types of skin cancer: basal cell carcinoma, squamous cell carcinoma, 
                and melanoma. The first two are sometimes called non-melanoma skin cancers.
              </p>
              <p>
                While skin cancer is the most common type of cancer, it's also one of the most preventable. 
                Limiting your exposure to ultraviolet (UV) radiation and regular skin checks can help detect 
                skin cancer early when it's most treatable.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Types of Skin Cancer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Common Types of Skin Cancer
          </h2>
          <div className="space-y-6">
            {cancerTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-soft hover:shadow-lg transition-all cursor-default"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-foreground">{type.name}</h3>
                      <motion.span 
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${type.color}`}
                      >
                        {type.risk} Risk
                      </motion.span>
                    </div>
                    <p className="text-muted-foreground mb-4">{type.description}</p>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Common Characteristics:</h4>
                      <motion.ul 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 gap-2"
                      >
                        {type.characteristics.map((char, i) => (
                          <motion.li 
                            key={i} 
                            variants={itemVariants}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {char}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Symptoms to Watch */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Symptoms to Watch
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {symptoms.map((symptom, index) => (
              <motion.div
                key={symptom.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft hover:shadow-lg hover:border-primary/30 transition-all cursor-default"
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4"
                >
                  <symptom.icon className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{symptom.title}</h3>
                <p className="text-muted-foreground">{symptom.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ABCDE Rule */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-primary/10 via-secondary to-secondary rounded-2xl p-8 md:p-12 border border-border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              The ABCDE Rule
            </h2>
            <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              Use this simple guide to help identify potential melanomas. If you notice any of these signs, 
              consult a dermatologist.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { letter: "A", word: "Asymmetry", desc: "One half doesn't match the other" },
                { letter: "B", word: "Border", desc: "Irregular, ragged, or blurred edges" },
                { letter: "C", word: "Color", desc: "Not uniform; shades of tan, brown, black" },
                { letter: "D", word: "Diameter", desc: "Larger than 6mm (size of a pencil eraser)" },
                { letter: "E", word: "Evolving", desc: "Size, shape, or color is changing" },
              ].map((item, index) => (
                <motion.div
                  key={item.letter}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="bg-card rounded-xl p-4 text-center border border-border hover:border-primary/30 transition-all cursor-default"
                >
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mx-auto mb-3"
                  >
                    <span className="text-xl font-bold text-primary-foreground">{item.letter}</span>
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-1">{item.word}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* When to See a Doctor */}
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
            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center"
              >
                <Stethoscope className="w-6 h-6 text-destructive" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                When to See a Doctor
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Make an appointment with your doctor if you notice any of the following:
            </p>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-4"
            >
              {whenToSeeDoctor.map((item, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="flex items-start gap-3 bg-background rounded-lg p-4 border border-border hover:border-destructive/30 transition-all cursor-default"
                >
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Importance of Early Detection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-success/5 border border-success/20 rounded-2xl p-8 md:p-12 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <CheckCircle2 className="w-8 h-8 text-success" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                The Importance of Early Detection
              </h2>
            </div>
            <div className="prose prose-lg text-muted-foreground max-w-none">
              <p className="mb-4">
                Early detection of skin cancer gives you the greatest chance for successful treatment. 
                When found early, the 5-year survival rate for melanoma is 99%.
              </p>
              <p className="mb-4">
                Regular self-examinations and annual visits to a dermatologist can help catch skin cancer 
                in its earliest stages. The key is to know your skin and notice any changes.
              </p>
              <p>
                Remember: You know your skin best. If you notice something that concerns you, don't wait – 
                schedule an appointment with a healthcare provider right away.
              </p>
            </div>
          </motion.div>
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
    </div>
  );
}
