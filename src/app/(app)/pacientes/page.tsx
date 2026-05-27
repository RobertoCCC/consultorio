import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { dash, formatDateShort, formatNIF } from "@/lib/formatters";

type SearchParams = Promise<{ q?: string }>;

export default async function PacientesPage({
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
          { email: { contains: q, mode: "insensitive" as const } },
          { nif: { contains: q.replace(/\s+/g, "") } },
        ],
      }
    : undefined;

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      appointments: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 1,
        select: { startsAt: true },
      },
      _count: { select: { appointments: true } },
    },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Pacientes</h2>
          <p className="text-sm text-muted-foreground">
            {patients.length}{" "}
            {patients.length === 1 ? "paciente" : "pacientes"}
            {q ? ` para "${q}"` : ""}
          </p>
        </div>
        <Button render={<Link href="/pacientes/novo" />}>
          <Plus className="h-4 w-4" />
          Novo paciente
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
          placeholder="Procurar por nome, email ou NIF..."
          className="pl-9"
        />
      </form>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>NIF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Proxima marcacao</TableHead>
              <TableHead className="text-right">Marcacoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12"
                >
                  {q
                    ? `Sem resultados para "${q}"`
                    : "Sem pacientes registados."}
                </TableCell>
              </TableRow>
            ) : (
              patients.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatNIF(p.nif)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dash(p.phone)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.appointments[0]
                      ? formatDateShort(p.appointments[0].startsAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {p._count.appointments}
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
