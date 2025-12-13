import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

const animals = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐨'];
const hearts = ['💖', '💕', '💗', '💝', '💘'];

export function CursorFollower() {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState(animals[0]);
  const [currentHeart, setCurrentHeart] = useState(hearts[0]);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleClick = () => {
      setIsClicked(true);
      setCurrentAnimal(animals[Math.floor(Math.random() * animals.length)]);
      setCurrentHeart(hearts[Math.floor(Math.random() * hearts.length)]);
      setTimeout(() => setIsClicked(false), 300);
    };

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Change animal every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimal(animals[Math.floor(Math.random() * animals.length)]);
      setCurrentHeart(hearts[Math.floor(Math.random() * hearts.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-50 select-none"
      animate={{
        x: mousePosition.x - 2,
        y: mousePosition.y - 2,
        scale: isClicked ? 1.3 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
        mass: 0.5,
      }}
    >
      <div className="relative">
        {/* Cute animal character */}
        <motion.div 
          className="text-4xl"
          animate={{
            rotate: isClicked ? [0, -10, 10, 0] : 0,
            y: [0, -5, 0],
          }}
          transition={{
            rotate: { duration: 0.3 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {currentAnimal}
        </motion.div>
        
        {/* Floating hearts animation */}
        <motion.div
          className="absolute -top-2 -right-1 text-xs"
          animate={{
            y: [-5, -15, -5],
            opacity: [0.7, 1, 0.7],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {currentHeart}
        </motion.div>
        
        {/* Health safety trail effect */}
        <motion.div
          className="absolute top-8 left-2 text-xs opacity-60"
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.8, 1, 0.8],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.2,
          }}
        >
          ⚕️
        </motion.div>

        {/* Click effect sparkles */}
        {isClicked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xs"
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos(i * 60 * Math.PI / 180) * 30,
                  y: Math.sin(i * 60 * Math.PI / 180) * 30,
                }}
                transition={{ duration: 0.6 }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                ✨
              </motion.div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}