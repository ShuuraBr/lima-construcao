# Lima Construção e Instalação — site

Site institucional da Lima Construção e Instalação. Next.js (App Router) +
PostgreSQL. O painel administrativo (contratos, prestação de serviço, agenda,
mapa de obras, usuários) entra em etapas seguintes, no mesmo projeto.

## Stack

| Camada        | Tecnologia                                    |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack)            |
| Linguagem     | TypeScript                                    |
| Estilo        | Tailwind CSS v4 + design system da marca      |
| Banco         | PostgreSQL + Prisma                           |
| E-mail        | SMTP (Nodemailer) — conta Hostinger em prod   |
| Deploy        | VPS Hostinger (Node + Postgres)               |

## Rodar localmente

Pré-requisitos: Node 20.9+, Docker.

```bash
cp .env.example .env      # ajuste se necessário
npm install
npm run db:up             # sobe o Postgres via docker compose
npm run db:migrate        # aplica as migrações
npm run dev               # http://localhost:3000
```

Sem SMTP configurado, os pedidos de orçamento são gravados no banco e o conteúdo
da notificação é registrado no log do servidor (nada é enviado).

## Scripts

| Comando            | O que faz                                  |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Servidor de desenvolvimento                |
| `npm run build`    | `prisma generate` + build de produção      |
| `npm run start`    | Servidor de produção (após build)          |
| `npm run lint`     | ESLint                                     |
| `npm run db:up`    | Sobe o Postgres local (docker compose)     |
| `npm run db:down`  | Derruba o Postgres local                   |
| `npm run db:migrate` | `prisma migrate dev`                     |
| `npm run db:studio` | Prisma Studio (inspeção do banco)         |

## Estrutura

```
src/
  app/                 rotas (App Router)
    page.tsx           Home
    sobre/             A empresa
    servicos/          Lista + página por serviço ([slug])
    orcamento/         Formulário + Server Action
    contato/
    sitemap.ts robots.ts
  components/
    marca/             Símbolo e lockup oficiais (SVG do pacote de marca)
    layout/            Header, Footer
    site/              Hero, StatStrip, ServiceCard, ProofCard, QuoteForm, CtaBand
    ui/                Container, Section, Button
  lib/
    site.ts            conteúdo e configuração central
    db.ts              cliente Prisma
    mail.ts            notificação de orçamento por e-mail
    validation.ts      schema Zod do formulário
prisma/schema.prisma   modelo de dados
public/marca/          SVGs oficiais da marca
```

## Design system

Tokens em `src/app/globals.css` (`@theme`), medidos no Manual de Identidade
de Marca v2.0: paleta (Preto/Roxo/Prata Lima), tipografia (Montserrat / Inter /
JetBrains Mono) e vocabulário gráfico (corte diagonal, blocos facetados, linha
estrutural). Tema escuro único — preto é a base de ~90% das aplicações da marca.

## Variáveis de ambiente

Ver `.env.example`. Em produção, definir `DATABASE_URL`, o bloco `SMTP_*`,
`MAIL_FROM`, `MAIL_TO` e `NEXT_PUBLIC_SITE_URL`.

## Pendências desta etapa

- Conta SMTP da Hostinger para envio real das notificações.
- Persistência do arquivo anexado (hoje vai só como anexo do e-mail; limite ~9 MB).
- Textos e fotos reais das obras (produção a cargo da equipe do projeto).
- Notificação por WhatsApp Business API (depende de aprovação da Meta).
