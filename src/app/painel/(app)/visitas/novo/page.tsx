import Link from "next/link";
import { exigirSessao } from "@/lib/painel";
import { VisitaFormPainel } from "../VisitaFormPainel";

export default async function NovaVisitaPage() {
  await exigirSessao();

  return (
    <div className="mx-auto max-w-[720px]">
      <Link
        href="/painel/visitas"
        className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
      >
        ← Agenda de visitas
      </Link>
      <h1 className="m-0 mt-3 text-2xl font-extrabold text-texto-forte">
        Nova visita
      </h1>
      <p className="mt-1 text-sm text-texto-suave">
        Cadastro manual — solicitação recebida por telefone, WhatsApp ou e-mail.
      </p>

      <div className="mt-5">
        <VisitaFormPainel modo="novo" />
      </div>
    </div>
  );
}
