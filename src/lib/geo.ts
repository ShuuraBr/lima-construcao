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

export type PartesEndereco = {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
};

export type Precisao = "exato" | "aproximado" | "bairro" | "cidade";

export type ResultadoGeo = {
  latitude: number;
  longitude: number;
  rotulo: string;
  precisao: Precisao;
};

const valido = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

async function nominatimQ(q: string): Promise<[number, number, string] | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("limit", "1");
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j = await r.json();
    if (!Array.isArray(j) || j.length === 0) return null;
    return [Number(j[0].lat), Number(j[0].lon), j[0].display_name ?? ""];
  } catch {
    return null;
  }
}

async function photon(q: string): Promise<[number, number, string] | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "1");
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j = await r.json();
    const f = j?.features?.[0];
    const c = f?.geometry?.coordinates;
    if (!Array.isArray(c) || c.length < 2) return null;
    const nome = f?.properties?.name
      ? `${f.properties.name}${f.properties.city ? ", " + f.properties.city : ""}`
      : "";
    return [Number(c[1]), Number(c[0]), nome];
  } catch {
    return null;
  }
}

/**
 * Geocodifica o endereço da obra combinando Nominatim e Photon (ambos grátis,
 * sem chave). Endereços de Brasília raramente batem no ponto exato — então
 * cai para o mais preciso disponível (rua → bairro → cidade) em vez de falhar.
 */
/** "Quadra QNO 13 Conjunto K" -> "QNO 13" (formato de endereço do DF). */
function simplificarLogradouro(s: string) {
  return s
    .replace(/^\s*(quadra|qd\.?|rua|r\.?|avenida|av\.?|alameda|al\.?|travessa|tv\.?|setor)\s+/i, "")
    .replace(
      /\s+(conjunto|conj\.?|casa|lote|lt\.?|bloco|bl\.?|apto\.?|apartamento|sala|loja|módulo|modulo|chácara|chacara)\b.*$/i,
      "",
    )
    .trim();
}

export async function geocodificar(p: PartesEndereco): Promise<ResultadoGeo> {
  const rua = [p.numero, p.logradouro].filter(Boolean).join(" ").trim();
  const ruaLimpa = p.logradouro ? simplificarLogradouro(p.logradouro) : "";
  const cidadeUf = [p.cidade, p.uf].filter(Boolean).join(", ");

  if (!rua && !p.bairro && !p.cidade)
    throw new Error("Preencha ao menos o logradouro e a cidade.");

  const t = (partes: (string | undefined)[], precisao: Precisao) => ({
    q: partes.filter(Boolean).join(", "),
    precisao,
  });

  const tentativas = [
    t([rua, p.bairro, cidadeUf], "exato"),
    t([rua, cidadeUf], "exato"),
    t([p.logradouro, p.bairro, cidadeUf], "aproximado"),
    t([ruaLimpa, cidadeUf], "aproximado"),
    t([ruaLimpa, p.bairro, cidadeUf], "aproximado"),
    t([p.bairro, cidadeUf], "bairro"),
    t([cidadeUf], "cidade"),
  ].filter((x, i, arr) => x.q.length > 3 && arr.findIndex((y) => y.q === x.q) === i);

  for (const tent of tentativas) {
    const hit = await nominatimQ(tent.q);
    if (hit && valido(hit[0]) && valido(hit[1])) {
      return { latitude: hit[0], longitude: hit[1], rotulo: hit[2], precisao: tent.precisao };
    }
  }

  // último recurso: Photon com o endereço mais completo
  const alvo = [ruaLimpa || p.logradouro, p.bairro, cidadeUf].filter(Boolean).join(" ");
  const ph = alvo ? await photon(alvo) : null;
  if (ph && valido(ph[0]) && valido(ph[1])) {
    return { latitude: ph[0], longitude: ph[1], rotulo: ph[2], precisao: "aproximado" };
  }

  throw new Error("Não foi possível localizar. Marque o ponto no mapa.");
}
