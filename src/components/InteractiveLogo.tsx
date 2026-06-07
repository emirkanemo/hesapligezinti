import { motion } from "motion/react";
import { Compass, Sparkles } from "lucide-react";
import { Language } from "../translations";

interface InteractiveLogoProps {
  language: Language;
  isDarkMode: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function InteractiveLogo({
  language,
  isDarkMode,
  className = "",
  size = "md",
}: InteractiveLogoProps) {
  const isTr = language === "tr";
  const word1 = isTr ? "Hesaplı" : "Budget";
  const word2 = isTr ? "Gezinti" : "Breeze";

  // Split words into letter arrays for staggered wave text animation
  const word1Letters = word1.split("");
  const word2Letters = word2.split("");

  // Letter transition presets
  const letterContainerVariants = {
    initial: {},
    hover: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const letterVariants = {
    initial: { y: 0, color: "inherit" },
    hover: {
      y: -4,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  };

  const pSize = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-5.5 h-5.5";
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
      id="interactive-logo-wrapper"
    >
      {/* High-tech vector icon with layers */}
      <div className="relative shrink-0 flex items-center justify-center" id="logo-icon-layer">
        {/* Layer 1: Glowing Backdoor Wave Ring */}
        <motion.div
          variants={{
            initial: { scale: 0.9, opacity: 0.4 },
            hover: {
              scale: [1, 1.35, 1],
              opacity: [0.4, 0.75, 0.4],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            },
          }}
          className={`absolute inset-0 rounded-xl blur-md ${
            isDarkMode ? "bg-indigo-500/35" : "bg-indigo-300/40"
          }`}
        />

        {/* Layer 2: Main Outer container box */}
        <motion.div
          variants={{
            initial: { rotate: 0, scale: 1 },
            hover: {
              rotate: [0, -6, 6, -3, 3, 0],
              scale: 1.05,
              transition: {
                duration: 0.5,
                ease: "easeInOut",
              },
            },
          }}
          className={`relative ${pSize} rounded-xl shadow-md border flex items-center justify-center transition-colors duration-300 ${
            isDarkMode
              ? "bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 text-white"
              : "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400 text-white"
          }`}
        >
          {/* Subtle inside shine effect */}
          <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-[10px]" />

          {/* Layer 3: Rotating inner compass */}
          <motion.div
            variants={{
              initial: { rotate: 0 },
              hover: {
                rotate: 360,
                transition: {
                  duration: 0.8,
                  ease: "backOut",
                },
              },
            }}
            className="flex items-center justify-center"
          >
            <Compass className={`${iconSize} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]`} />
          </motion.div>

          {/* Floating tiny spark */}
          <motion.div
            variants={{
              initial: { scale: 0, opacity: 0, x: 0, y: 0 },
              hover: {
                scale: [0, 1.1, 0.9, 0],
                opacity: [0, 1, 1, 0],
                x: [0, 8, 12, 14],
                y: [0, -8, -12, -14],
                transition: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                },
              },
            }}
            className="absolute top-0 right-0 pointer-events-none text-emerald-400"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Staggered Text Title */}
      <div className="flex flex-col text-left">
        <motion.div
          variants={letterContainerVariants}
          className={`${textSize} font-extrabold tracking-tight font-display flex items-center transition-colors duration-300 ${
            isDarkMode ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {/* Word 1 - Default color */}
          <span className="flex mr-[2px]" id="logo-word1">
            {word1Letters.map((char, index) => (
              <motion.span
                key={`w1-${index}`}
                variants={letterVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>

          {/* Word 2 - Colored Accent branding */}
          <span className="flex text-indigo-500 font-black group-hover:text-indigo-400 transition-colors" id="logo-word2">
            {word2Letters.map((char, index) => (
              <motion.span
                key={`w2-${index}`}
                variants={{
                  initial: { y: 0 },
                  hover: {
                    y: -4,
                    color: isDarkMode ? "#a5b4fc" : "#4338ca",
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 8,
                    },
                  },
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>
        </motion.div>
        
        {/* Subtle secondary animation hint detail line */}
        <div className="overflow-hidden h-[2px] w-full mt-0.5 relative rounded-full">
          <div className={`absolute inset-0 transition-colors duration-300 ${
            isDarkMode ? "bg-slate-800" : "bg-slate-200"
          }`} />
          <motion.div
            variants={{
              initial: { x: "-100%" },
              hover: {
                x: "100%",
                transition: {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              },
            }}
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}
