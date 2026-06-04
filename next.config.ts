import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fija la raíz del workspace a este proyecto: evita que Next tome el
  // package-lock.json del home y resuelva React desde el árbol equivocado.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
