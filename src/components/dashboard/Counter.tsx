"use client";

import { useEffect } from "react";
import { animate, useMotionValue, useTransform, motion } from "motion/react";

/**
 * Number counter animado: anima de 0 al valor. Para saldos/montos reales.
 * El formato (decimales, prefijo) se pasa por props.
 */
export function Counter({
  value,
  prefix = "",
  decimals = 2,
}: {
  value: number;
  prefix?: string;
  decimals?: number;
}) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${v.toFixed(decimals)}`);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, value]);

  return <motion.span>{text}</motion.span>;
}
