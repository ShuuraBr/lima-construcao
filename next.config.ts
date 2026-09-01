import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Há um package.json em C:\Users\breno.vilela (home). Sem isto, o Turbopack
  // infere a raiz do workspace errada e ignora o package-lock do projeto.
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
      // Anexos do formulário de orçamento (projeto / planta).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
