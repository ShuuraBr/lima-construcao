// Consultas de endereço/coordenada — serviços públicos e gratuitos, sem chave.
// Usado no formulário de contrato (client). Rate limits são leves; uso pontual.

export type EnderecoCep = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number | null;
  longitude: number | null;
};

export const soDigitos = (s: string) => s.replace(/\D/g, "");

export const formatarCep = (s: string) => {
  const d = soDigitos(s).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

/** BrasilAPI CEP v2 — devolve o endereço e, quando disponível, a coordenada. */
export async function buscarCep(cep: string): Promise<EnderecoCep> {
  const limpo = soDigitos(cep);
  if (limpo.length !== 8) throw new Error("CEP deve ter 8 dígitos.");

  const r = await fetch(`https://brasilapi.com.br/api/cep/v2/${limpo}`, {
    headers: { Accept: "application/json" },
  });
  if (!r.ok) throw new Error("CEP não encontrado.");
  const j = await r.json();

  const coords = j?.location?.coordinates ?? {};
  return {
    cep: formatarCep(limpo),
    logradouro: j.street ?? "",
    bairro: j.neighborhood ?? "",
    cidade: j.city ?? "",
    uf: j.state ?? "",
    latitude: coords.latitude ? Number(coords.latitude) : null,
    longitude: coords.longitude ? Number(coords.longitude) : null,
  };
}

/** Nominatim (OpenStreetMap) — geocodifica um endereço em texto livre. */
export async function geocodificar(
  endereco: string,
): Promise<{ latitude: number; longitude: number; rotulo: string }> {
  const q = endereco.trim();
  if (q.length < 5) throw new Error("Informe um endereço mais completo.");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error("Falha ao consultar o endereço.");
  const j = await r.json();
  if (!Array.isArray(j) || j.length === 0)
    throw new Error("Endereço não localizado. Ajuste o pino no mapa.");

  return {
    latitude: Number(j[0].lat),
    longitude: Number(j[0].lon),
    rotulo: j[0].display_name ?? "",
  };
}
