import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  MapaObras,
  type ObraNoMapa,
  type VisitaNoMapa,
} from "@/components/painel/MapaObras";

export const metadata = { title: "Mapa de obras" };

export default async function MapaPage() {
  await exigirSessao();

  const [contratos, visitasRaw, semCoord] = await Promise.all([
    prisma.contrato.findMany({
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
    }),
    prisma.visita.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        status: { not: "CANCELADA" },
      },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        nome: true,
        endereco: true,
        status: true,
        agendadaEm: true,
        latitude: true,
        longitude: true,
      },
    }),
    prisma.contrato.count({
      where: {
        OR: [{ latitude: null }, { longitude: null }],
        status: { not: "CANCELADO" },
      },
    }),
  ]);

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

  const visitas: VisitaNoMapa[] = visitasRaw.map((v) => ({
    id: v.id,
    nome: v.nome,
    endereco: v.endereco,
    status: v.status,
    agendadaEm: v.agendadaEm ? v.agendadaEm.toISOString() : null,
    latitude: v.latitude as number,
    longitude: v.longitude as number,
  }));

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
          {obras.length} obra(s) e {visitas.length} visita(s) no mapa
          {semCoord > 0 && ` · ${semCoord} obra(s) sem coordenadas`}.
        </p>
      </header>

      <MapaObras obras={obras} visitas={visitas} />
    </div>
  );
}
