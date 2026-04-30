"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import * as React from "react";

interface CountUpProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

export function CountUp({
  value,
  format = (n) => n.toLocaleString(),
  duration = 1.2,
  className,
}: CountUpProps) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (n) => format(n));

  React.useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, duration, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
