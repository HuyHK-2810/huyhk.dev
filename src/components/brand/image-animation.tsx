"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";
import { PORTRAIT_PATH } from "@/lib/portrait-paths";

type ImageAnimationProps = {
  className?: string;
  onAnimationComplete?: () => void;
};

function ImageAnimation({
  className = "",
  onAnimationComplete,
}: ImageAnimationProps) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={`h-full w-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: reduce ? 0 : 1 }}
      transition={{ duration: reduce ? 0 : 1.4, ease: "easeOut" }}
      onAnimationComplete={onAnimationComplete}
      style={{ willChange: "opacity" }}
      aria-hidden
    >
      <g
        transform="translate(0,500) scale(0.1,-0.1)"
        fill="#FF6B35"
        fillRule="evenodd"
      >
        <path d={PORTRAIT_PATH} />
      </g>
    </motion.svg>
  );
}

export default memo(ImageAnimation);
