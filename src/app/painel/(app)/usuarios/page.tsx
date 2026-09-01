import { prisma } from "@/lib/db";
import { exigirSessao, fmtData } from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";
import { ConviteForm } from "./ConviteForm";
import { AcoesUsuario } from "./AcoesUsuario";

export default async function UsuariosPage() {
  const sessao = await exigirSessao();
  const usuarios = await prisma.usuario.findMany({
    orderBy: [{ ativo: "desc" }, { criadoEm: "asc" }],
  });

  return (
    <div className="mx-auto max-w-[880px]">
      <header className="mb-6">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-texto-suave">
          Administração
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
          Usuários do painel
        </h1>
        <p className="mt-2 text-sm text-texto-suave">
          Todos têm o mesmo nível de acesso — sem hierarquia. Nenhuma senha
          trafega em texto.
        </p>
      </header>

      <ConviteForm />

      <div className="mt-6 border border-borda bg-superficie">
        <div className="border-b border-borda px-4 py-3">
          <h2 className="font-display text-sm font-bold text-texto-forte">
            {usuarios.length} {usuarios.length === 1 ? "usuário" : "usuários"}
          </h2>
        </div>
        <ul>
          {usuarios.map((u) => {
            const ehVoce = u.id === sessao.id;
            const estado = !u.ativo
              ? { label: "Inativo", tom: "recusado" as const }
              : u.senhaHash
                ? { label: "Ativo", tom: "ok" as const }
                : { label: "Convite pendente", tom: "novo" as const };
            return (
              <li
                key={u.id}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-borda px-4 py-3.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-texto-forte">
                    {u.nome}
                    {ehVoce && (
                      <span className="ml-2 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-texto-suave">
                        você
                      </span>
                    )}
                  </p>
                  <p className="truncate font-mono text-[0.68rem] text-texto-suave">
                    {u.email} · {u.cargo}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-texto-suave">
                    {u.ultimoAcesso
                      ? `último acesso ${fmtData(u.ultimoAcesso)}`
                      : `criado ${fmtData(u.criadoEm)}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusPill label={estado.label} tom={estado.tom} />
                  <AcoesUsuario
                    id={u.id}
                    ativo={u.ativo}
                    temSenha={Boolean(u.senhaHash)}
                    ehVoce={ehVoce}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
