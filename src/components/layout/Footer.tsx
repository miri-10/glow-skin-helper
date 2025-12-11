import { Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SkinGuard</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/detect" className="hover:text-foreground transition-colors">
              Detect
            </Link>
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/prevention" className="hover:text-foreground transition-colors">
              Prevention
            </Link>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for health
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> This tool is for educational purposes only and is not a medical diagnosis. 
            The analysis provided should not replace professional medical advice. Always consult a dermatologist 
            or healthcare provider for professional evaluation of any skin concerns.
          </p>
        </div>
      </div>
    </footer>
  );
}
