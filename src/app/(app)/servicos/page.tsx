import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatCents } from "@/lib/formatters";

type SearchParams = Promise<{ q?: string }>;

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await verifySession();
  const { q } = await searchParams;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { appointments: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Servicos</h2>
          <p className="text-sm text-muted-foreground">
            {services.length}{" "}
            {services.length === 1 ? "servico" : "servicos"}
            {q ? ` para "${q}"` : ""}
          </p>
        </div>
        <Button render={<Link href="/servicos/novo" />}>
          <Plus className="h-4 w-4" />
          Novo servico
        </Button>
      </div>

      <form className="relative max-w-md">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Procurar por nome ou descricao..."
          className="pl-9"
        />
      </form>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Duracao</TableHead>
              <TableHead className="text-right">Preco</TableHead>
              <TableHead className="text-right">Marcacoes</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12"
                >
                  {q
                    ? `Sem resultados para "${q}"`
                    : "Sem servicos no catalogo."}
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link
                      href={`/servicos/${s.id}`}
                      className="hover:underline"
                    >
                      {s.name}
                    </Link>
                    {s.description ? (
                      <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
                        {s.description}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {s.durationMinutes} min
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatCents(s.priceCents)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {s._count.appointments}
                  </TableCell>
                  <TableCell>
                    {s.active ? (
                      <Badge variant="secondary">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
