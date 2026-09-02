"use client";

import { useState } from "react";
import { SeletorLocal } from "@/components/painel/SeletorLocal";
import { buscarCep, formatarCep, geocodificar } from "@/lib/geo";

const campo =
  "w-full border border-borda bg-superficie-2 px-3 py-2.5 text-[0.9rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto";
const rotulo =
  "font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave";

export type EnderecoValores = {
  cep?: string;
  logradouro?: string;
  enderecoNumero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  latitude?: string;
  longitude?: string;
};

function Campo({ r, children }: { r: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className={rotulo}>{r}</span>
      {children}
    </label>
  );
}

export function EnderecoObraFields({ valores }: { valores?: EnderecoValores }) {
  const [cep, setCep] = useState(valores?.cep ?? "");
  const [logradouro, setLogradouro] = useState(valores?.logradouro ?? "");
  const [numero, setNumero] = useState(valores?.enderecoNumero ?? "");
  const [complemento, setComplemento] = useState(valores?.complemento ?? "");
  const [bairro, setBairro] = useState(valores?.bairro ?? "");
  const [cidade, setCidade] = useState(valores?.cidade ?? "");
  const [uf, setUf] = useState(valores?.uf ?? "");
  const [lat, setLat] = useState(valores?.latitude ?? "");
  const [lng, setLng] = useState(valores?.longitude ?? "");

  const [ocupado, setOcupado] = useState<null | "cep" | "geo">(null);
  const [msg, setMsg] = useState<string | null>(null);

  const pos =
    lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;

  async function acharCep() {
    setMsg(null);
    setOcupado("cep");
    try {
      const e = await buscarCep(cep);
      setCep(e.cep);
      if (e.logradouro) setLogradouro(e.logradouro);
      if (e.bairro) setBairro(e.bairro);
      if (e.cidade) setCidade(e.cidade);
      if (e.uf) setUf(e.uf);
      if (e.latitude && e.longitude) {
        setLat(String(e.latitude));
        setLng(String(e.longitude));
        setMsg("Endereço e localização aproximada preenchidos. Ajuste o pino.");
      } else {
        setMsg('Endereço preenchido. Use "localizar" ou o mapa para a coordenada.');
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Falha na consulta do CEP.");
    } finally {
      setOcupado(null);
    }
  }

  async function acharCoordenada() {
    setMsg(null);
    setOcupado("geo");
    try {
      const g = await geocodificar({
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        cep,
      });
      setLat(String(g.latitude));
      setLng(String(g.longitude));
      const nota: Record<string, string> = {
        exato: "Localização encontrada. Confira o pino no mapa.",
        aproximado: "Localização aproximada (rua). Ajuste o pino no mapa.",
        bairro: "Só foi possível localizar o bairro. Ajuste o pino no mapa.",
        cidade: "Só foi possível localizar a cidade. Marque o ponto no mapa.",
      };
      setMsg(nota[g.precisao]);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível localizar.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[160px_auto]">
        <Campo r="CEP">
          <input
            value={cep}
            onChange={(e) => setCep(formatarCep(e.target.value))}
            inputMode="numeric"
            placeholder="70000-000"
            className={campo}
          />
        </Campo>
        <div className="flex items-end">
          <button
            type="button"
            onClick={acharCep}
            disabled={ocupado !== null}
            className="border border-borda px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave transition-colors hover:border-acento-texto hover:text-acento-texto disabled:opacity-50"
          >
            {ocupado === "cep" ? "Buscando…" : "Buscar CEP"}
          </button>
        </div>
      </div>

      <Campo r="Logradouro (rua / quadra) *">
        <input
          value={logradouro}
          onChange={(e) => setLogradouro(e.target.value)}
          required
          className={campo}
        />
      </Campo>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo r="Número / lote">
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className={campo}
          />
        </Campo>
        <Campo r="Complemento (bloco, sala, referência)">
          <input
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            className={campo}
          />
        </Campo>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px]">
        <Campo r="Bairro / setor">
          <input
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className={campo}
          />
        </Campo>
        <Campo r="Cidade">
          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className={campo}
          />
        </Campo>
        <Campo r="UF">
          <input
            value={uf}
            onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
            className={campo}
          />
        </Campo>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={acharCoordenada}
          disabled={ocupado !== null || !logradouro}
          className="border border-borda px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave transition-colors hover:border-acento-texto hover:text-acento-texto disabled:opacity-50"
        >
          {ocupado === "geo" ? "Localizando…" : "Localizar pelo endereço"}
        </button>
        <span className="font-mono text-[0.62rem] tabular-nums text-texto-suave">
          {pos ? `${pos.lat}, ${pos.lng}` : "sem coordenada"}
        </span>
      </div>

      {msg && (
        <p className="font-mono text-[0.62rem] leading-relaxed text-acento-texto">
          {msg}
        </p>
      )}

      <SeletorLocal
        pos={pos}
        onChange={(la, lo) => {
          setLat(String(la));
          setLng(String(lo));
        }}
      />

      {/* valores enviados no formulário */}
      <input type="hidden" name="cep" value={cep} />
      <input type="hidden" name="logradouro" value={logradouro} />
      <input type="hidden" name="enderecoNumero" value={numero} />
      <input type="hidden" name="complemento" value={complemento} />
      <input type="hidden" name="bairro" value={bairro} />
      <input type="hidden" name="cidade" value={cidade} />
      <input type="hidden" name="uf" value={uf} />
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />
    </div>
  );
}
