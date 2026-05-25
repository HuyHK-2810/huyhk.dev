"use client";

import Image from "next/image";
import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useEffect } from "react";
import ImageAnimation from "./image-animation";

export default function HeroPortrait() {
  const reduce = useReducedMotion();
  const sketchControls = useAnimationControls();
  const photoControls = useAnimationControls();

  // For reduced-motion: skip the sketch entirely, show the photo immediately.
  useEffect(() => {
    if (reduce) {
      sketchControls.set({ opacity: 0 });
      photoControls.set({ opacity: 1 });
    }
  }, [reduce, sketchControls, photoControls]);

  const handleSketchDone = () => {
    if (reduce) return;
    // Hold the sketch a beat so the viewer registers it, then swap.
    sketchControls.start({
      opacity: 0,
      transition: { duration: 0.6, delay: 0.4 },
    });
    photoControls.start({
      opacity: 1,
      transition: { duration: 0.6, delay: 0.5 },
    });
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] md:ml-auto md:mr-0">
      {/* Soft ember halo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, var(--ember-soft) 0%, transparent 70%)",
        }}
      />

      {/* Photo — invisible until the sketch finishes */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={photoControls}
      >
        <Image
          src="/brand/me.png"
          alt="Hồ Khắc Huy"
          width={500}
          height={500}
          quality={95}
          priority
          className="h-full w-full select-none object-contain"
        />
      </motion.div>

      {/* Ember sketch — fades in, holds, then fades out as the photo takes over */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={sketchControls}
      >
        <ImageAnimation onAnimationComplete={handleSketchDone} />
      </motion.div>
    </div>
  );
}
