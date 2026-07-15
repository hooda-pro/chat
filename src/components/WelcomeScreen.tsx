"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

interface WelcomeScreenProps {
  onStart: (name: string) => void;
  initialName?: string;
  siteName: string;
}

export default function WelcomeScreen({
  onStart,
  initialName = "",
  siteName,
}: WelcomeScreenProps) {
  const [name, setName] = useState(initialName);
  const [isVisible, setIsVisible] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 3,
    }));
    setParticles(generated);

    const timer = setTimeout(() => setShowInput(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsVisible(false);
      setTimeout(() => onStart(name.trim()), 500);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950"
          dir="rtl"
        >
          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-primary-500/20"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative z-10 text-center px-6 max-w-lg w-full">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-[2px] shadow-2xl glow">
                <div className="w-full h-full rounded-2xl bg-surface-950 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary-400" />
                </div>
              </div>
            </motion.div>

            {/* Site Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              <span className="gradient-text">{siteName}</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-surface-400 text-lg mb-10 leading-relaxed"
            >
              مساعدك الذكي للبرمجة، الدراسة، تحليل الصور والملفات،
              <br />
              والكتابة والإجابة عن جميع أسئلتك
            </motion.p>

            {/* Name Input */}
            <AnimatePresence>
              {showInput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ما اسمك؟"
                        maxLength={30}
                        className="w-full px-6 py-4 bg-surface-900/80 border border-surface-700/50 rounded-2xl text-surface-50 text-lg placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 transition-all duration-300 text-center"
                        autoFocus
                        dir="rtl"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!name.trim()}
                      className="w-full py-4 px-8 bg-gradient-to-l from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                    >
                      <span>ابدأ</span>
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-12 text-sm text-surface-600"
            >
              بتطوير Mahmoud Ahmed Saeed
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
