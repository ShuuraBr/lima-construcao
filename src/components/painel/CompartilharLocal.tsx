"use client";

import { useState } from "react";

/**
 * Ações de compartilhamento da localização de uma obra — para mandar aos
 * empreiteiros por WhatsApp, abrir no Google Maps / Waze, ou copiar o link.
 */
export function CompartilharLocal({
  latitude,
  longitude,
  titulo,
  endereco,
}: {
  latitude: number;
  longitude: number;
  titulo: string;
  endereco: string;
}) {
  const [copiado, setCopiado] = useState(false);

  const ll = `${latitude},${longitude}`;
  const linkMaps = `https://www.google.com/maps/search/?api=1&query=${ll}`;
  const linkWaze = `https://waze.com/ul?ll=${ll}&navigate=yes`;
  const texto = `${titulo}\n${endereco}\n${linkMaps}`;
  const linkWhats = `https://wa.me/?text=${encodeURIComponent(texto)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(`${endereco}\n${linkMaps}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  const btn =
    "border border-borda px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-texto-suave transition-colors hover:border-acento-texto hover:text-acento-texto";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a className={btn} href={linkWhats} target="_blank" rel="noopener noreferrer">
        Enviar no WhatsApp
      </a>
      <a className={btn} href={linkMaps} target="_blank" rel="noopener noreferrer">
        Google Maps
      </a>
      <a className={btn} href={linkWaze} target="_blank" rel="noopener noreferrer">
        Waze
      </a>
      <button type="button" onClick={copiar} className={btn}>
        {copiado ? "Link copiado" : "Copiar link"}
      </button>
    </div>
  );
}
