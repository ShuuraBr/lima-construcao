// Composição do endereço estruturado em linha única — usado por contratos e
// visitas. Puro, sem dependências.

export type PartesEndereco = {
  logradouro: string;
  enderecoNumero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
};

/** "Quadra QNO 13, 16 - Casa - Ceilândia Norte · Brasília/DF · 72255-311" */
export function comporEndereco(d: PartesEndereco): string {
  const rua = [d.logradouro, d.enderecoNumero].filter(Boolean).join(", ");
  const meio = [rua, d.complemento, d.bairro].filter(Boolean).join(" - ");
  const cidadeUf = [d.cidade, d.uf].filter(Boolean).join("/");
  return [meio, cidadeUf, d.cep].filter(Boolean).join(" · ").slice(0, 255);
}

/** Campos de endereço prontos para gravar (inclui a linha única `enderecoObra`). */
export function dadosEndereco(d: PartesEndereco) {
  return {
    cep: d.cep,
    logradouro: d.logradouro,
    enderecoNumero: d.enderecoNumero,
    complemento: d.complemento,
    bairro: d.bairro,
    cidade: d.cidade,
    uf: d.uf,
  };
}
