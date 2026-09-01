import type { MetadataRoute } from "next";
import { servicos, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const rotas = ["", "/sobre", "/servicos", "/orcamento", "/contato"];
  const agora = new Date();

  return [
    ...rotas.map((r) => ({
      url: `${base}${r}`,
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: r === "" ? 1 : 0.7,
    })),
    ...servicos.map((s) => ({
      url: `${base}/servicos/${s.slug}`,
      lastModified: agora,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
