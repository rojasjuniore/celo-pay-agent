import type { Variants } from "motion/react";

/** Variantes compartidas de entrada al hacer scroll (fade + slide up). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/** Contenedor que escalona la entrada de sus hijos. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
