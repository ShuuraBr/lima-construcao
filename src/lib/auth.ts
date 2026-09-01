import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE = "lima_sessao";
const DIAS = 7;

function segredo() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "AUTH_SECRET ausente ou curto demais. Defina uma string longa e aleatória.",
    );
  }
  return new TextEncoder().encode(s);
}

export type Sessao = {
  id: string;
  nome: string;
  cargo: string;
};

// ---------- senha ----------

export function hashSenha(senha: string) {
  return bcrypt.hash(senha, 12);
}

export function conferirSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

// ---------- tokens de convite / recuperação ----------

/** Gera o token em claro (vai no link) e o hash (vai no banco). */
export function gerarToken() {
  const bruto = randomBytes(32).toString("hex");
  return { bruto, hash: hashToken(bruto) };
}

export function hashToken(bruto: string) {
  return createHash("sha256").update(bruto).digest("hex");
}

// ---------- sessão (JWT em cookie httpOnly) ----------

export async function criarSessao(sessao: Sessao) {
  const token = await new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DIAS}d`)
    .sign(segredo());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessao(): Promise<Sessao | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    if (
      typeof payload.id === "string" &&
      typeof payload.nome === "string" &&
      typeof payload.cargo === "string"
    ) {
      return { id: payload.id, nome: payload.nome, cargo: payload.cargo };
    }
    return null;
  } catch {
    return null;
  }
}
