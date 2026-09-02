"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { contratoStatusMeta, fmtBRL } from "@/lib/painel-shared";

export type ObraNoMapa = {
  id: string;
  numero: string;
  clienteNome: string;
  enderecoObra: string;
  status: keyof typeof contratoStatusMeta;
  progresso: number;
  valor: number;
  latitude: number;
  longitude: number;
};

const CORES: Record<string, string> = {
  ORCAMENTO_APROVADO: "#B5548C",
  EM_EXECUCAO: "#7F205A",
  CONCLUIDO: "#3D0029",
  CANCELADO: "#8a8a8a",
};

// Brasília como centro padrão
const CENTRO = { lat: -15.7942, lng: -47.8822 };

let promessaScript: Promise<void> | null = null;
function carregarMaps(key: string) {
  if (typeof window !== "undefined" && (window as { google?: unknown }).google) {
    return Promise.resolve();
  }
  if (!promessaScript) {
    promessaScript = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&language=pt-BR&region=BR`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Falha ao carregar o Google Maps."));
      document.head.appendChild(s);
    });
  }
  return promessaScript;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function MapaObras({
  obras,
  apiKey,
}: {
  obras: ObraNoMapa[];
  apiKey: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!apiKey || !ref.current) return;
    let cancelado = false;

    carregarMaps(apiKey)
      .then(() => {
        if (cancelado || !ref.current) return;
        const g = (window as any).google;
        const mapa = new g.maps.Map(ref.current, {
          center: CENTRO,
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const bounds = new g.maps.LatLngBounds();
        const info = new g.maps.InfoWindow();

        obras.forEach((o) => {
          const pos = { lat: o.latitude, lng: o.longitude };
          bounds.extend(pos);
          const marcador = new g.maps.Marker({
            position: pos,
            map: mapa,
            title: `${o.numero} — ${o.clienteNome}`,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: CORES[o.status] ?? "#7F205A",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            },
          });
          marcador.addListener("click", () => {
            info.setContent(
              `<div style="font-family:system-ui;font-size:13px;line-height:1.5;color:#1c1c1c">
                <strong>${o.numero}</strong> · ${contratoStatusMeta[o.status].label}<br/>
                ${o.clienteNome}<br/>
                <span style="color:#666">${o.enderecoObra}</span><br/>
                ${o.progresso}% · ${fmtBRL(o.valor)}<br/>
                <a href="/painel/contratos/${o.id}" style="color:#7F205A">abrir contrato →</a>
              </div>`,
            );
            info.open(mapa, marcador);
          });
        });

        if (obras.length === 1) mapa.setCenter(bounds.getCenter());
        else if (obras.length > 1) mapa.fitBounds(bounds, 64);

        setPronto(true);
      })
      .catch((e) => setErro(e.message ?? "Erro ao carregar o mapa."));

    return () => {
      cancelado = true;
    };
  }, [apiKey, obras]);

  if (!apiKey) {
    return (
      <div className="border border-borda bg-superficie p-6">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-acento-texto">
          Mapa não configurado
        </p>
        <p className="mt-2 max-w-[60ch] text-sm text-texto-suave">
          Defina a variável <code className="text-acento-texto">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          no painel da Hostinger para exibir o mapa. Enquanto isso, as obras com
          coordenadas aparecem na lista abaixo.
        </p>
        <ListaObras obras={obras} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="relative border border-borda bg-superficie">
        <div ref={ref} className="h-[62vh] min-h-[420px] w-full" />
        {!pronto && !erro && (
          <p className="absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] uppercase tracking-[0.1em] text-texto-suave">
            Carregando mapa…
          </p>
        )}
        {erro && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-[0.7rem] text-acento-texto">
            {erro}
          </p>
        )}
      </div>
      <ListaObras obras={obras} />
    </div>
  );
}

function ListaObras({ obras }: { obras: ObraNoMapa[] }) {
  if (obras.length === 0) {
    return (
      <p className="mt-3 text-sm text-texto-suave">
        Nenhuma obra com coordenadas cadastradas. Preencha latitude e longitude na
        tela do contrato.
      </p>
    );
  }
  return (
    <ul className="grid gap-px border border-borda bg-borda sm:grid-cols-2 lg:grid-cols-3">
      {obras.map((o) => (
        <li key={o.id} className="bg-superficie p-3">
          <Link
            href={`/painel/contratos/${o.id}`}
            className="font-mono text-[0.72rem] text-acento-texto hover:underline"
          >
            {o.numero}
          </Link>
          <p className="text-sm text-texto-forte">{o.clienteNome}</p>
          <p className="text-[0.72rem] text-texto-suave">{o.enderecoObra}</p>
          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.05em] text-texto-suave">
            {contratoStatusMeta[o.status].label} · {o.progresso}%
          </p>
        </li>
      ))}
    </ul>
  );
}
