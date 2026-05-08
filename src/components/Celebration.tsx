import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
}

export default function Celebration({ onComplete }: { onComplete: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const COLORS = ['#FFD700', '#FF4500', '#FF1493', '#00FF7F', '#1E90FF', '#9370DB'];

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      velocity: 5 + Math.random() * 10,
    }));
    setParticles(newParticles);

    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
          animate={{
            x: p.x + Math.cos(p.angle) * p.velocity * 30,
            y: p.y + Math.sin(p.angle) * p.velocity * 30 + 100, // Gravity effect
            opacity: 0,
            scale: 0.5,
            rotate: 360,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
