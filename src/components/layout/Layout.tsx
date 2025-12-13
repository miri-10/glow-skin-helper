import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const isSignUp = location.pathname === "/signup";

  // Login and signup pages get full screen without navbar/footer
  if (isLogin || isSignUp) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={isHome ? "flex-1" : "flex-1 pt-16"}>{children}</main>
      <Footer />
    </div>
  );
}
