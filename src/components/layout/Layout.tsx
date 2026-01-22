import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatDrawer } from "@/components/ChatDrawer";
import heroLandscape from "@/assets/hero-landscape.jpg";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isDetect = location.pathname === "/detect";
  const isLogin = location.pathname === "/login";
  const isSignUp = location.pathname === "/signup";
  
  const isMedicalHelp = location.pathname === "/medical-help";
  const isAbout = location.pathname === "/about";
  const isPrevention = location.pathname === "/prevention";
  
  const hasSharedBackground = isHome || isDetect || isMedicalHelp || isAbout || isPrevention;

  // Login and signup pages get full screen without navbar/footer
  if (isLogin || isSignUp) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Shared Background for Home and Detect pages */}
      {hasSharedBackground && (
        <div className="fixed inset-0 -z-10">
          <img 
            src={heroLandscape} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background" />
        </div>
      )}
      
      <Navbar />
      <main className={hasSharedBackground ? "flex-1 relative z-10" : "flex-1 pt-16 relative z-10"}>
        {children}
      </main>
      <Footer />
      
      {/* Floating AI Chat Assistant */}
      <ChatDrawer />
    </div>
  );
}
