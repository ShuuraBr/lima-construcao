"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const CENTRO_DF: [number, number] = [-15.7942, -47.8822];

// Pino próprio (SVG inline) — evita depender das imagens do Leaflet, que
// quebram sob o bundler do Next.
const PINO_SVG = `
<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 41C15 41 28 25.5 28 15A13 13 0 1 0 2 15C2 25.5 15 41 15 41Z"
    fill="#7F205A" stroke="#fff" stroke-width="2"/>
  <circle cx="15" cy="15" r="5" fill="#fff"/>
</svg>`;

function temaEscuro() {
  if (typeof document === "undefined") return true;
  const t = document.documentElement.dataset.theme;
  if (t === "dark") return true;
  if (t === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

/**
 * Mini-mapa para fixar a coordenada da obra: clique ou arraste o pino.
 * `pos` guia o pino de fora (ex.: resultado de CEP/geocodificação).
 */
export function SeletorLocal({
  pos,
  onChange,
}: {
  pos: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<{ map: any; marker: any; L: any } | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!ref.current) return;
    let cancelado = false;
    const limpezas: (() => void)[] = [];

    const marcarTema = () =>
      wrapRef.current?.setAttribute("data-escuro", String(temaEscuro()));
    marcarTema();

    import("leaflet").then(({ default: L }) => {
      if (cancelado || !ref.current) return;
      const inicial = pos ?? { lat: CENTRO_DF[0], lng: CENTRO_DF[1] };
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(
        [inicial.lat, inicial.lng],
        pos ? 16 : 11,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      setTimeout(() => map.invalidateSize(), 120);

      const icone = L.divIcon({
        html: PINO_SVG,
        className: "",
        iconSize: [30, 42],
        iconAnchor: [15, 41],
      });
      const marker = L.marker([inicial.lat, inicial.lng], {
        draggable: true,
        icon: icone,
      });
      if (pos) marker.addTo(map);

      const fixar = (lat: number, lng: number) => {
        marker.setLatLng([lat, lng]);
        if (!map.hasLayer(marker)) marker.addTo(map);
        onChangeRef.current(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      };

      map.on("click", (e: { latlng: { lat: number; lng: number } }) =>
        fixar(e.latlng.lat, e.latlng.lng),
      );
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        fixar(p.lat, p.lng);
      });

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
        map.remove();
      });

      apiRef.current = { map, marker, L };
    });

    return () => {
      cancelado = true;
      limpezas.forEach((fn) => fn());
      apiRef.current = null;
    };
    // monta uma vez; posição externa é tratada no efeito abaixo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reage a mudanças de `pos` vindas de fora (CEP / geocodificação)
  useEffect(() => {
    const api = apiRef.current;
    if (!api || !pos) return;
    api.marker.setLatLng([pos.lat, pos.lng]);
    if (!api.map.hasLayer(api.marker)) api.marker.addTo(api.map);
    api.map.setView([pos.lat, pos.lng], 16);
  }, [pos]);

  return (
    <div
      ref={wrapRef}
      className="mapa-lima overflow-hidden border border-borda bg-superficie"
    >
      <div ref={ref} className="h-64 w-full" />
      <p className="border-t border-borda px-3 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-texto-suave">
        Clique no mapa ou arraste o pino para fixar a obra
      </p>
    </div>
  );
}
