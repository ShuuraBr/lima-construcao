import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageRails } from "@/components/layout/PageRails";
import { AtmosphereLayer } from "@/components/layout/AtmosphereLayer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.nome,
    title: `${site.nome} — ${site.tagline}`,
    description: site.descricao,
  },
  keywords: [
    "construção civil",
    "drywall",
    "steel frame",
    "gesso",
    "instalação elétrica",
    "instalação hidráulica",
    "forro",
    "Brasília",
    "Distrito Federal",
    "obra para construtora",
    "obra para incorporadora",
  ],
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-roxo focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-branco"
      >
        Pular para o conteúdo
      </a>
      <AtmosphereLayer />
      <PageRails />
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
