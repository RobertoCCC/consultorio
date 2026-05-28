import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Data Access Layer entry point.
 *
 * Centraliza a verificacao de sessao para que todas as queries / server
 * actions chamem esta funcao antes de tocar na BD. Os layouts não fazem
 * auth guard fiavel em Next.js 16 (nao re-renderizam em navegacao
 * intra-segmento), portanto cada page e cada action deve chamar
 * verifySession antes de ler dados.
 *
 * Marcado com React `cache` para não chamar `auth()` mais que uma vez
 * dentro do mesmo render.
 */
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return { user: session.user };
});
