"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type KoalaMascotProps = {
  streak: number;
  moods: string[];
  justSaved: boolean;
};

export default function KoalaMascot({ streak, moods, justSaved }: KoalaMascotProps) {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (justSaved) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justSaved]);

  // determine expression based on moods and streak
  const getExpression = () => {
    if (celebrating) return "celebrating";
    if (moods.includes("brave") || moods.includes("bold")) return "excited";
    if (moods.includes("calm") || moods.includes("soft")) return "peaceful";
    if (moods.includes("dreamy")) return "dreamy";
    if (streak >= 7) return "proud";
    if (streak >= 3) return "happy";
    return "neutral";
  };

  const expression = getExpression();

  // eye positions based on expression
  const getEyes = () => {
    switch (expression) {
      case "celebrating":
        return { leftY: 34, rightY: 34, size: 4 }; // wide eyes
      case "excited":
        return { leftY: 35, rightY: 35, size: 4 };
      case "peaceful":
        return { leftY: 37, rightY: 37, size: 2 }; // half-closed
      case "dreamy":
        return { leftY: 37, rightY: 37, size: 2.5 };
      case "proud":
        return { leftY: 36, rightY: 36, size: 3 };
      case "happy":
        return { leftY: 36, rightY: 36, size: 3 };
      default:
        return { leftY: 36, rightY: 36, size: 3 };
    }
  };

  // mouth path based on expression
  const getMouth = () => {
    switch (expression) {
      case "celebrating":
        return "M28 46C30.5 50 34 51.5 36 51.5C38 51.5 41.5 50 44 46"; // big smile
      case "excited":
        return "M28 47C30.5 50 34 51 36 51C38 51 41.5 50 44 47";
      case "peaceful":
        return "M30 48C32 49 34 49.5 36 49.5C38 49.5 40 49 42 48"; // gentle smile
      case "dreamy":
        return "M31 48C33 49 34.5 49.5 36 49.5C37.5 49.5 39 49 41 48";
      case "proud":
        return "M29 47C31 49.5 33.5 50.5 36 50.5C38.5 50.5 41 49.5 43 47";
      case "happy":
        return "M29 47C31 49 33.5 50 36 50C38.5 50 41 49 43 47";
      default:
        return "M30 48C32 49 34 49.5 36 49.5C38 49.5 40 49 42 48";
    }
  };

  const eyes = getEyes();
  const mouthPath = getMouth();

  return (
    <motion.div
      className="flex h-24 w-24 items-center justify-center rounded-3xl bg-rose-100/70 relative overflow-hidden"
      animate={
        celebrating
          ? {
              rotate: [0, -5, 5, -5, 5, 0],
              scale: [1, 1.05, 1, 1.05, 1],
              transition: { duration: 0.6 },
            }
          : {
              y: [0, -3, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
              },
            }
      }
    >
      {celebrating && (
        <>
          <motion.div
            className="absolute top-2 left-2 text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: [10, -10, -20] }}
            transition={{ duration: 1 }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute top-2 right-2 text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: [10, -10, -20] }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            💖
          </motion.div>
        </>
      )}

      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* head */}
        <circle cx="36" cy="38" r="20" fill="#F7DCE7" />
        
        {/* ears */}
        <circle cx="20" cy="26" r="10" fill="#F2CFE0" />
        <circle cx="52" cy="26" r="10" fill="#F2CFE0" />
        
        {/* eyes */}
        <motion.circle
          cx="30"
          cy={eyes.leftY}
          r={eyes.size}
          fill="#5C4B57"
          animate={
            celebrating
              ? { scale: [1, 1.2, 1], transition: { duration: 0.3, repeat: 2 } }
              : {}
          }
        />
        <motion.circle
          cx="42"
          cy={eyes.rightY}
          r={eyes.size}
          fill="#5C4B57"
          animate={
            celebrating
              ? { scale: [1, 1.2, 1], transition: { duration: 0.3, repeat: 2 } }
              : {}
          }
        />
        
        {/* nose */}
        <ellipse cx="36" cy="44" rx="6" ry="5" fill="#5C4B57" />
        
        {/* mouth */}
        <motion.path
          d={mouthPath}
          stroke="#5C4B57"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ d: mouthPath }}
          transition={{ duration: 0.3 }}
        />

        {/* blush marks when celebrating or excited */}
        {(celebrating || expression === "excited") && (
          <>
            <motion.ellipse
              cx="22"
              cy="42"
              rx="4"
              ry="3"
              fill="#F8B4D9"
              opacity="0.6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
            <motion.ellipse
              cx="50"
              cy="42"
              rx="4"
              ry="3"
              fill="#F8B4D9"
              opacity="0.6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
