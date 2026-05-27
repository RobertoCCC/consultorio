import Link from "next/link";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatCents, formatDateShort } from "@/lib/formatters";

type SearchParams = Promise<{ status?: string }>;

const statusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  ISSUED: "Emitida",
  PAID: "Paga",
  VOID: "Anulada",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  ISSUED: "default",
  PAID: "secondary",
  VOID: "destructive",
};

const STATUSES = ["DRAFT", "ISSUED", "PAID", "VOID"];

export default async function FaturacaoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await verifySession();
  const { status: statusParam } = await searchParams;
  const status = statusParam ?? "all";

  const where =
    status !== "all" && STATUSES.includes(status)
      ? { status: status as "DRAFT" | "ISSUED" | "PAID" | "VOID" }
      : {};

  const [invoices, totals] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      include: {
        patient: { select: { id: true, name: true } },
      },
      take: 200,
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _sum: { totalCents: true },
      _count: true,
    }),
  ]);

  const totalsByStatus = new Map(
    totals.map((t) => [t.status, { count: t._count, sum: t._sum.totalCents ?? 0 }]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Faturacao</h2>
        <p className="text-sm text-muted-foreground">
          {invoices.length}{" "}
          {invoices.length === 1 ? "fatura" : "faturas"}
          {status !== "all" ? ` (${statusLabel[status] ?? status})` : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Emitidas (por receber)"
          count={totalsByStatus.get("ISSUED")?.count ?? 0}
          amount={totalsByStatus.get("ISSUED")?.sum ?? 0}
        />
        <SummaryCard
          label="Pagas"
          count={totalsByStatus.get("PAID")?.count ?? 0}
          amount={totalsByStatus.get("PAID")?.sum ?? 0}
        />
        <SummaryCard
          label="Anuladas"
          count={totalsByStatus.get("VOID")?.count ?? 0}
          amount={totalsByStatus.get("VOID")?.sum ?? 0}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wide text-muted-foreground shrink-0">
          Filtrar
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterChip active={status === "all"} href="/faturacao" label="Todas" />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={s === status}
              href={`/faturacao?status=${s}`}
              label={statusLabel[s]}
            />
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">IVA</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-12"
                >
                  Sem faturas neste filtro.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link
                      href={`/faturacao/${inv.id}`}
                      className="font-mono text-xs hover:underline"
                    >
                      {inv.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDateShort(inv.issuedAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/pacientes/${inv.patient.id}`}
                      className="hover:underline"
                    >
                      {inv.patient.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCents(inv.subtotalCents)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCents(inv.taxCents)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatCents(inv.totalCents)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inv.status]}>
                      {statusLabel[inv.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={
                        <a
                          href={`/api/faturas/${inv.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Ver PDF da fatura ${inv.number}`}
                        />
                      }
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
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

function SummaryCard({
  label,
  count,
  amount,
}: {
  label: string;
  count: number;
  amount: number;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums">{formatCents(amount)}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {count} {count === 1 ? "fatura" : "faturas"}
      </p>
    </Card>
  );
}

function FilterChip({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium"
          : "rounded-full bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground px-3 py-1 text-xs transition-colors"
      }
    >
      {label}
    </Link>
  );
}
