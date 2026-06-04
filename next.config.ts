import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Fija la raíz del workspace a este proyecto: evita que Next tome el
  // package-lock.json del home y resuelva React desde el árbol equivocado
  // (causa del fallo de prerender en /_global-error).
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
