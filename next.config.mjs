// Config em .mjs (não .ts): carrega direto como ES module, sem transpilar,
// sem gerar arquivos temporários "<hash>.next.config.*".

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build self-contido em .next/standalone — formato esperado pela hospedagem
  // Next.js da Hostinger e por qualquer deploy Node/VPS.
  output: "standalone",

  // Garante que o engine do Prisma e o schema entrem no bundle standalone
  // (o rastreamento automático às vezes não pega o binário do engine).
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.prisma/client/**",
      "./node_modules/@prisma/client/**",
      "./prisma/schema.prisma",
    ],
  },

  experimental: {
    serverActions: {
      // Anexos do formulário de orçamento (projeto / planta).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
