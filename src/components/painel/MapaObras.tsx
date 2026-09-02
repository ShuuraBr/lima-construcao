"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import {
  contratoStatusMeta,
  visitaStatusMeta,
  fmtBRL,
  fmtDataHora,
} from "@/lib/painel-shared";

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

export type VisitaNoMapa = {
  id: string;
  nome: string;
  endereco: string;
  status: keyof typeof visitaStatusMeta;
  agendadaEm: string | null;
  latitude: number;
  longitude: number;
};

const CORES: Record<string, string> = {
  ORCAMENTO_APROVADO: "#B5548C",
  EM_EXECUCAO: "#7F205A",
  CONCLUIDO: "#3D0029",
  CANCELADO: "#8a8a8a",
};

const CORES_VISITA: Record<string, string> = {
  SOLICITADA: "#B5548C",
  CONFIRMADA: "#7F205A",
  REALIZADA: "#3D0029",
  CANCELADA: "#8a8a8a",
};

// Losango (SVG) para as visitas — forma diferente da obra (círculo).
const losango = (cor: string) =>
  `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
     <path d="M11 1L21 11L11 21L1 11Z" fill="${cor}" stroke="#fff" stroke-width="2"/>
   </svg>`;

// Brasília como centro padrão
const CENTRO: [number, number] = [-15.7942, -47.8822];

// OpenStreetMap padrão — gratuito, sem chave. O visual claro/escuro e o
// tingimento na paleta Lima são feitos por CSS (ver .mapa-lima em globals.css).
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATRIBUICAO =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function temaEscuro() {
  if (typeof document === "undefined") return true;
  const t = document.documentElement.dataset.theme;
  if (t === "dark") return true;
  if (t === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

export function MapaObras({
  obras,
  visitas = [],
}: {
  obras: ObraNoMapa[];
  visitas?: VisitaNoMapa[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelado = false;
    const limpezas: (() => void)[] = [];

    const marcarTema = () => {
      wrapRef.current?.setAttribute("data-escuro", String(temaEscuro()));
    };
    marcarTema();

    import("leaflet")
      .then(({ default: L }) => {
        if (cancelado || !ref.current) return;

        const mapa = L.map(ref.current, { scrollWheelZoom: true }).setView(
          CENTRO,
          11,
        );

        L.tileLayer(TILE_URL, {
          attribution: ATRIBUICAO,
          maxZoom: 19,
        }).addTo(mapa);

        const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
        mq?.addEventListener?.("change", marcarTema);
        const obs = new MutationObserver(marcarTema);
        obs.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
        limpezas.push(() => {
          mq?.removeEventListener?.("change", marcarTema);
          obs.disconnect();
          mapa.remove();
        });

        const pontos: [number, number][] = [];
        obras.forEach((o) => {
          const pos: [number, number] = [o.latitude, o.longitude];
          pontos.push(pos);
          L.circleMarker(pos, {
            radius: o.status === "EM_EXECUCAO" ? 9 : 7,
            fillColor: CORES[o.status] ?? "#7F205A",
            fillOpacity: 1,
            color: "#ffffff",
            weight: 2,
          })
            .addTo(mapa)
            .bindPopup(
              `<div style="font-size:13px;line-height:1.5">
                <strong>${o.numero}</strong> · ${contratoStatusMeta[o.status].label}<br/>
                ${o.clienteNome}<br/>
                <span style="opacity:.7">${o.enderecoObra}</span><br/>
                ${o.progresso}% · ${fmtBRL(o.valor)}<br/>
                <a href="/painel/contratos/${o.id}">abrir contrato &rarr;</a>
                &nbsp;·&nbsp;
                <a href="https://www.google.com/maps/search/?api=1&query=${o.latitude},${o.longitude}" target="_blank" rel="noopener">Google Maps</a>
              </div>`,
            );
        });

        visitas.forEach((vi) => {
          const pos: [number, number] = [vi.latitude, vi.longitude];
          pontos.push(pos);
          L.marker(pos, {
            icon: L.divIcon({
              html: losango(CORES_VISITA[vi.status] ?? "#7F205A"),
              className: "",
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
          })
            .addTo(mapa)
            .bindPopup(
              `<div style="font-size:13px;line-height:1.5">
                <strong>Visita</strong> · ${visitaStatusMeta[vi.status].label}<br/>
                ${vi.nome}<br/>
                <span style="opacity:.7">${vi.endereco}</span><br/>
                ${vi.agendadaEm ? "Agendada: " + fmtDataHora(new Date(vi.agendadaEm)) + "<br/>" : ""}
                <a href="/painel/visitas/${vi.id}">abrir visita &rarr;</a>
                &nbsp;·&nbsp;
                <a href="https://www.google.com/maps/search/?api=1&query=${vi.latitude},${vi.longitude}" target="_blank" rel="noopener">Google Maps</a>
              </div>`,
            );
        });

        if (pontos.length === 1) mapa.setView(pontos[0], 14);
        else if (pontos.length > 1)
          mapa.fitBounds(pontos, { padding: [48, 48] });
      })
      .catch((e) => setErro(e?.message ?? "Erro ao carregar o mapa."));

    return () => {
      cancelado = true;
      limpezas.forEach((fn) => fn());
    };
  }, [obras, visitas]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 border border-borda bg-superficie p-3 sm:grid-cols-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-texto-forte">
            ● Obras
          </span>
          {(["ORCAMENTO_APROVADO", "EM_EXECUCAO", "CONCLUIDO"] as const).map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 font-mono text-[0.56rem] uppercase tracking-[0.06em] text-texto-suave"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-borda"
                style={{ backgroundColor: CORES[s] }}
              />
              {contratoStatusMeta[s].label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-texto-forte">
            ◆ Visitas
          </span>
          {(["SOLICITADA", "CONFIRMADA", "REALIZADA"] as const).map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 font-mono text-[0.56rem] uppercase tracking-[0.06em] text-texto-suave"
            >
              <span
                className="inline-block h-2.5 w-2.5 rotate-45 ring-1 ring-borda"
                style={{ backgroundColor: CORES_VISITA[s] }}
              />
              {visitaStatusMeta[s].label}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={wrapRef}
        className="mapa-lima relative overflow-hidden border border-borda bg-superficie"
      >
        <div ref={ref} className="h-[62vh] min-h-[420px] w-full" />
        {erro && (
          <p className="absolute inset-0 z-[500] flex items-center justify-center px-6 text-center font-mono text-[0.7rem] text-acento-texto">
            {erro}
          </p>
        )}
      </div>

      <ListaObras obras={obras} visitas={visitas} />
    </div>
  );
}

function ListaObras({
  obras,
  visitas,
}: {
  obras: ObraNoMapa[];
  visitas: VisitaNoMapa[];
}) {
  if (obras.length === 0 && visitas.length === 0) {
    return (
      <p className="text-sm text-texto-suave">
        Nada com coordenadas ainda. Preencha o endereço e fixe o ponto no mapa na
        tela do contrato ou da visita.
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
            ● {o.numero}
          </Link>
          <p className="text-sm text-texto-forte">{o.clienteNome}</p>
          <p className="text-[0.72rem] text-texto-suave">{o.enderecoObra}</p>
          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.05em] text-texto-suave">
            {contratoStatusMeta[o.status].label} · {o.progresso}%
          </p>
        </li>
      ))}
      {visitas.map((vi) => (
        <li key={vi.id} className="bg-superficie p-3">
          <Link
            href={`/painel/visitas/${vi.id}`}
            className="font-mono text-[0.72rem] text-acento-texto hover:underline"
          >
            ◆ Visita
          </Link>
          <p className="text-sm text-texto-forte">{vi.nome}</p>
          <p className="text-[0.72rem] text-texto-suave">{vi.endereco}</p>
          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.05em] text-texto-suave">
            {visitaStatusMeta[vi.status].label}
          </p>
        </li>
      ))}
    </ul>
  );
}
