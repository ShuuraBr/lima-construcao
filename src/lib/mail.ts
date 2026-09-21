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

export function smtpConfigurado() {
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
  return `<tr>
    <td style="padding: 8px 0; color: #666; font-weight: bold; width: 150px;">${rotulo}</td>
    <td style="padding: 8px 0; color: #333;">${s}</td>
  </tr>`;
}

/**
 * Notifica a equipe da Lima sobre um novo pedido de orçamento.
 * Enquanto o SMTP não estiver configurado (ambiente local), apenas registra
 * no log — o pedido já fica gravado no banco de dados.
 */
export async function enviarNotificacaoOrcamento(pedido: PedidoResumo) {
  const assunto = `Novo orçamento ${pedido.protocolo} — ${pedido.servico}`;
  
  const htmlCorpo = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #d4a017; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Nova Solicitação de Orçamento</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Protocolo: ${pedido.protocolo}</p>
      </div>
      <div style="padding: 20px;">
        <p>Olá equipe,</p>
        <p>Um novo pedido de orçamento foi recebido através do site. Confira os detalhes abaixo:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${linha("Nome", pedido.nome)}
          ${linha("Empresa", pedido.empresa)}
          ${linha("E-mail", pedido.email)}
          ${linha("Telefone", pedido.telefone)}
          ${linha("Serviço", pedido.servico)}
          ${linha("Endereço", pedido.enderecoObra)}
          ${linha("Metragem", pedido.metragemM2 ? `${pedido.metragemM2} m²` : null)}
          ${linha("Prazo", pedido.prazoDesejado)}
          ${linha("Início Previsto", pedido.dataInicio ? pedido.dataInicio.toLocaleDateString("pt-BR") : null)}
          ${linha("Anexo", pedido.anexoNome)}
        </table>

        ${pedido.mensagem ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #d4a017;">
            <strong style="display: block; margin-bottom: 5px;">Mensagem do Cliente:</strong>
            <p style="margin: 0; font-style: italic; color: #555;">${pedido.mensagem}</p>
          </div>
        ` : ""}

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
          <p>— Cotação a ser elaborada manualmente pela equipe da Lima.</p>
        </div>
      </div>
    </div>
  `;

  if (!smtpConfigurado()) {
    console.info(
      `[mail] SMTP não configurado — notificação de ${pedido.protocolo} não enviada.`,
    );
    return { enviado: false as const };
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    replyTo: pedido.email,
    subject: assunto,
    html: htmlCorpo,
    attachments: pedido.anexo
      ? [{ filename: pedido.anexo.filename, content: pedido.anexo.content }]
      : undefined,
  });

  return { enviado: true as const };
}

/**
 * Notifica a equipe da Lima sobre uma nova solicitação de visita técnica.
 * Sem SMTP, apenas registra no log — a solicitação já fica gravada no banco.
 */
export async function enviarNotificacaoVisita(v: {
  nome: string;
  empresa?: string | null;
  email: string;
  telefone: string;
  endereco: string;
  preferencia?: string | null;
  mensagem?: string | null;
}) {
  const assunto = `Nova solicitação de visita — ${v.nome}`;
  const corpo =
    `Nova solicitação de visita técnica recebida pelo site.\n\n` +
    linha("Nome", v.nome) +
    linha("Empresa", v.empresa) +
    linha("E-mail", v.email) +
    linha("Telefone", v.telefone) +
    linha("Endereço", v.endereco) +
    linha(
      "Preferência de data/horário",
      v.preferencia && !Number.isNaN(Date.parse(v.preferencia))
        ? new Date(v.preferencia).toLocaleString("pt-BR")
        : v.preferencia,
    ) +
    (v.mensagem ? `\nMensagem:\n${v.mensagem}\n` : "") +
    `\n— Confirmar data e hora manualmente no painel.`;

  if (!smtpConfigurado()) {
    console.info(`[mail] SMTP não configurado — visita de ${v.nome} não enviada.\n${corpo}`);
    return { enviado: false as const };
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    replyTo: v.email,
    subject: assunto,
    text: corpo,
  });

  return { enviado: true as const };
}

const ASSINATURA =
  "\n\nEquipe Lima Construção e Instalação\nEngenheiro responsável: Erick";

async function enviarAoCliente(
  para: string | null | undefined,
  assunto: string,
  corpo: string,
  contexto: string,
) {
  if (!para) return { enviado: false as const };
  const texto = corpo + ASSINATURA;
  if (!smtpConfigurado()) {
    console.info(`[mail] SMTP não configurado — ${contexto} não enviado.\n${texto}`);
    return { enviado: false as const };
  }
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: para,
    replyTo: process.env.MAIL_TO,
    subject: assunto,
    text: texto,
  });
  return { enviado: true as const };
}

/** Aviso ao cliente sobre a visita técnica (confirmação ou cancelamento). */
export async function enviarAtualizacaoVisita(v: {
  email: string | null;
  nome: string;
  status: "CONFIRMADA" | "CANCELADA";
  agendadaEm: Date | null;
  endereco: string;
}) {
  if (v.status === "CONFIRMADA") {
    const quando = v.agendadaEm
      ? v.agendadaEm.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })
      : "a combinar";
    return enviarAoCliente(
      v.email,
      "Visita técnica confirmada — Lima Construção",
      `Olá, ${v.nome}.\n\n` +
        `Sua visita técnica foi confirmada.\n\n` +
        linha("Data e hora", quando) +
        linha("Endereço", v.endereco) +
        `\nSe precisar remarcar, responda este e-mail.`,
      `confirmação de visita de ${v.nome}`,
    );
  }
  return enviarAoCliente(
    v.email,
    "Sobre a sua solicitação de visita — Lima Construção",
    `Olá, ${v.nome}.\n\n` +
      `Não foi possível seguir com o agendamento da visita neste momento. ` +
      `Se ainda tiver interesse, responda este e-mail que retomamos o contato.`,
    `cancelamento de visita de ${v.nome}`,
  );
}

/** Aviso ao cliente sobre o andamento do contrato/obra. */
export async function enviarAtualizacaoContrato(c: {
  email: string | null;
  nome: string;
  numero: string;
  status: "EM_EXECUCAO" | "CONCLUIDO" | "CANCELADO";
  enderecoObra: string;
}) {
  const msg: Record<typeof c.status, { assunto: string; texto: string }> = {
    EM_EXECUCAO: {
      assunto: `Obra ${c.numero} — execução iniciada`,
      texto: "A execução da sua obra foi iniciada pela nossa equipe.",
    },
    CONCLUIDO: {
      assunto: `Obra ${c.numero} — concluída`,
      texto:
        "A sua obra foi concluída. A garantia de 5 anos passa a valer a partir desta data.",
    },
    CANCELADO: {
      assunto: `Contrato ${c.numero} — cancelado`,
      texto: "O contrato referente à sua obra foi cancelado.",
    },
  };
  const m = msg[c.status];
  return enviarAoCliente(
    c.email,
    `${m.assunto} — Lima Construção`,
    `Olá, ${c.nome}.\n\n${m.texto}\n\n` +
      linha("Contrato", c.numero) +
      linha("Endereço da obra", c.enderecoObra),
    `atualização do contrato ${c.numero}`,
  );
}

/**
 * Envia o convite de acesso ao painel. Sem SMTP, apenas registra no log — o
 * chamador ainda recebe o link para repassar manualmente.
 */
export async function enviarConviteAcesso(params: {
  email: string;
  nome: string;
  link: string;
}) {
  const corpo =
    `Olá, ${params.nome}.\n\n` +
    `Você foi convidado a acessar o painel administrativo da Lima Construção e Instalação.\n\n` +
    `Defina sua senha por este link (válido por 3 dias):\n${params.link}\n\n` +
    `Se você não esperava este convite, ignore este e-mail.`;

  if (!smtpConfigurado()) {
    console.info(
      `[mail] SMTP não configurado — convite para ${params.email} não enviado.\nLink: ${params.link}`,
    );
    return { enviado: false as const };
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: params.email,
    subject: "Acesso ao painel — Lima Construção e Instalação",
    text: corpo,
  });

  return { enviado: true as const };
}

/**
 * Envia um e-mail de confirmação para o cliente informando que o pedido foi recebido.
 */
export async function enviarConfirmacaoCliente(pedido: PedidoResumo) {
  const assunto = `Recebemos seu pedido de orçamento! — ${pedido.protocolo}`;
  
  const htmlCorpo = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Pedido Recebido!</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Protocolo: ${pedido.protocolo}</p>
      </div>
      <div style="padding: 20px;">
        <p>Olá <strong>${pedido.nome}</strong>,</p>
        <p>Confirmamos o recebimento do seu pedido de orçamento para o serviço de <strong>${pedido.servico}</strong>.</p>
        <p>Nossa equipe técnica já foi notificada e entrará em contato com você em breve para dar continuidade ao atendimento.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Se tiver urgência, você pode nos chamar agora pelo WhatsApp:</p>
          <a href="${gerarLinkWhatsApp(pedido.telefone)}" 
             style="background-color: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Chamar no WhatsApp
          </a>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 40px;">
          Atenciosamente,<br>
          <strong>Equipe Lima Construções</strong>
        </p>
      </div>
    </div>
  `;

  if (!smtpConfigurado()) return { enviado: false as const };

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: pedido.email,
    subject: assunto,
    html: htmlCorpo,
  });

  return { enviado: true as const };
}

/**
 * Gera um link de WhatsApp com mensagem personalizada para facilitar o contato.
 */
export function gerarLinkWhatsApp(telefone?: string) {
  const phone = telefone ? telefone.replace(/\D/g, "") : "";
  const message = encodeURIComponent("Olá! Gostaria de falar sobre o meu pedido de orçamento na Lima Construções.");
  return `https://wa.me/${phone}?text=${message}`;
}
