import Link from "next/link";
import { Simbolo } from "@/components/marca/Simbolo";
import { Container } from "@/components/ui/Container";
import { nav, servicos, site } from "@/lib/site";

const ano = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="on-dark border-t border-borda pt-16 pb-10">
      <Container className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Simbolo className="h-12 w-auto text-logo" />
          <p className="mt-4 font-display text-lg font-black tracking-[0.16em] text-branco">
            LIMA
          </p>
          <p className="tecnico mt-1 text-texto-suave">{site.descritor}</p>
          <p className="mt-4 max-w-[34ch] text-sm text-texto-suave">
            {site.descricao}
          </p>
        </div>

        <nav aria-label="Rodapé — navegação">
          <h2 className="tecnico text-texto-suave">Navegação</h2>
          <ul className="mt-4 space-y-1">
            {[{ label: "Início", href: "/" }, ...nav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-1 text-sm text-prata hover:text-branco"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/orcamento"
                className="block py-1 text-sm text-prata hover:text-branco"
              >
                Solicitar orçamento
              </Link>
            </li>
            <li>
              <Link
                href="/visita"
                className="block py-1 text-sm text-prata hover:text-branco"
              >
                Agendar visita
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="tecnico text-texto-suave">Serviços</h2>
          <ul className="mt-4 space-y-1">
            {servicos.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/servicos/${s.slug}`}
                  className="block py-1 text-sm text-prata hover:text-branco"
                >
                  {s.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container className="mt-12 flex flex-col gap-3 border-t border-borda pt-6 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-texto-suave sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {ano} {site.nome} · CREA-DF
        </span>
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <a href={site.contato.whatsappHref} className="hover:text-branco">
            {site.contato.telefone}
          </a>
          <a
            href={`mailto:${site.contato.email}`}
            className="hover:text-branco"
          >
            {site.contato.email}
          </a>
          <span>{site.regiao}</span>
        </span>
      </Container>
    </footer>
  );
}
