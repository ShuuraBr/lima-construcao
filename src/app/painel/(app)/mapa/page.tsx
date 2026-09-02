import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import { MapaObras, type ObraNoMapa } from "@/components/painel/MapaObras";

export const metadata = { title: "Mapa de obras" };

export default async function MapaPage() {
  await exigirSessao();

  const contratos = await prisma.contrato.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      status: { not: "CANCELADO" },
    },
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      numero: true,
      clienteNome: true,
      enderecoObra: true,
      status: true,
      progresso: true,
      valor: true,
      latitude: true,
      longitude: true,
    },
  });

  const obras: ObraNoMapa[] = contratos.map((c) => ({
    id: c.id,
    numero: c.numero,
    clienteNome: c.clienteNome,
    enderecoObra: c.enderecoObra,
    status: c.status,
    progresso: c.progresso,
    valor: Number(c.valor),
    latitude: c.latitude as number,
    longitude: c.longitude as number,
  }));

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null;

  const semCoord = await prisma.contrato.count({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
      status: { not: "CANCELADO" },
    },
  });

  return (
    <div className="w-full">
      <header className="mb-6">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-texto-suave">
          Operação
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
          Mapa de obras
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          {obras.length} obra(s) no mapa
          {semCoord > 0 && ` · ${semCoord} sem coordenadas`}.
        </p>
      </header>

      <MapaObras obras={obras} apiKey={apiKey} />
    </div>
  );
}
