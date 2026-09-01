import { Sidebar } from "@/components/painel/Sidebar";
import { exigirSessao } from "@/lib/painel";

export default async function AppPainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sessao = await exigirSessao();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar nome={sessao.nome} cargo={sessao.cargo} />
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
