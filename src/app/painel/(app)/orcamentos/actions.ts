"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirSessao, ORCAMENTO_STATUS } from "@/lib/painel";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(ORCAMENTO_STATUS),
});

export async function mudarStatusAction(formData: FormData) {
  await exigirSessao();

  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.pedidoOrcamento.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  revalidatePath(`/painel/orcamentos/${parsed.data.id}`);
  revalidatePath("/painel/orcamentos");
  revalidatePath("/painel");
}
