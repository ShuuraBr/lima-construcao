import nodemailer from "nodemailer";

type PedidoResumo = {
  protocolo: string;
  nome: string;
  empresa?: string | null;
  email: string;
  telefone: string;
  servico: string;
  enderecoObra: string;
  metragemM2?: number | null;
  prazoDesejado?: string | null;
  dataInicio?: Date | null;
  mensagem?: string | null;
  anexoNome?: string | null;
  anexo?: { filename: string; content: Buffer } | null;
};

function smtpConfigurado() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

function linha(rotulo: string, valor?: string | number | null) {
  if (valor === undefined || valor === null || valor === "") return "";
  const s = String(valor).trim();
  if (s === "" || s === "undefined" || s === "null") return "";
  return `${rotulo}: ${s}\n`;
}

/**
 * Notifica a equipe da Lima sobre um novo pedido de orçamento.
 * Enquanto o SMTP não estiver configurado (ambiente local), apenas registra
 * no log — o pedido já fica gravado no banco de dados.
 */
export async function enviarNotificacaoOrcamento(pedido: PedidoResumo) {
  const assunto = `Novo orçamento ${pedido.protocolo} — ${pedido.servico}`;
  const corpo =
    `Novo pedido de orçamento recebido pelo site.\n\n` +
    linha("Protocolo", pedido.protocolo) +
    linha("Nome", pedido.nome) +
    linha("Empresa", pedido.empresa) +
    linha("E-mail", pedido.email) +
    linha("Telefone", pedido.telefone) +
    `\n` +
    linha("Serviço", pedido.servico) +
    linha("Endereço da obra", pedido.enderecoObra) +
    linha("Metragem", pedido.metragemM2 ? `${pedido.metragemM2} m²` : null) +
    linha("Prazo desejado", pedido.prazoDesejado) +
    linha(
      "Início previsto",
      pedido.dataInicio
        ? pedido.dataInicio.toLocaleDateString("pt-BR")
        : null,
    ) +
    linha("Anexo", pedido.anexoNome) +
    (pedido.mensagem ? `\nMensagem:\n${pedido.mensagem}\n` : "") +
    `\n— Cotação a ser elaborada manualmente pela equipe da Lima.`;

  if (!smtpConfigurado()) {
    console.info(
      `[mail] SMTP não configurado — notificação de ${pedido.protocolo} não enviada.\n${corpo}`,
    );
    return { enviado: false as const };
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    replyTo: pedido.email,
    subject: assunto,
    text: corpo,
    attachments: pedido.anexo
      ? [{ filename: pedido.anexo.filename, content: pedido.anexo.content }]
      : undefined,
  });

  return { enviado: true as const };
}
