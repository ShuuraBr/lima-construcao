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

/* ---- estilos do mapa na paleta Lima ---- */

type EstiloMapa = { featureType?: string; elementType?: string; stylers: Record<string, string>[] }[];

// Escuro: base Roxo profundo, água mais escura, vias em prata apagada.
const ESTILO_ESCURO: EstiloMapa = [
  { elementType: "geometry", stylers: [{ color: "#2a0a1e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#C9C9C9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a0512" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#7F205A" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#331224" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#4a2a3e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#7F205A" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9a8a92" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#3D0029" }] },
];

// Claro: base Cinza-claro, água em roxo pálido, acento Roxo Lima.
const ESTILO_CLARO: EstiloMapa = [
  { elementType: "geometry", stylers: [{ color: "#f1f0f2" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#2B2B2B" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9a6bb" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#e8e6ea" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e2cdd9" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#B5548C" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e6d7e1" }] },
];

function temaEscuro() {
  if (typeof document === "undefined") return true;
  const t = document.documentElement.dataset.theme;
  if (t === "dark") return true;
  if (t === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

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

    const limpezas: (() => void)[] = [];

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
          styles: temaEscuro() ? ESTILO_ESCURO : ESTILO_CLARO,
        });

        const aplicarTema = () =>
          mapa.setOptions({
            styles: temaEscuro() ? ESTILO_ESCURO : ESTILO_CLARO,
          });
        const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
        mq?.addEventListener?.("change", aplicarTema);
        const obs = new MutationObserver(aplicarTema);
        obs.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
        limpezas.push(() => {
          mq?.removeEventListener?.("change", aplicarTema);
          obs.disconnect();
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
              scale: o.status === "EM_EXECUCAO" ? 10 : 8,
              fillColor: CORES[o.status] ?? "#7F205A",
              fillOpacity: 1,
              strokeColor: temaEscuro() ? "#f1f0f2" : "#ffffff",
              strokeWeight: 2.5,
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
      limpezas.forEach((fn) => fn());
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
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {(["ORCAMENTO_APROVADO", "EM_EXECUCAO", "CONCLUIDO"] as const).map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-texto-suave"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-borda"
              style={{ backgroundColor: CORES[s] }}
            />
            {contratoStatusMeta[s].label}
          </span>
        ))}
      </div>
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
