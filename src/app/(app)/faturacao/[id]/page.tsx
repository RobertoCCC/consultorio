import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusActions } from "@/components/invoice-status-actions";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  dash,
  formatCents,
  formatDate,
  formatNIF,
} from "@/lib/formatters";

type Params = Promise<{ id: string }>;

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

export default async function FaturaDetailPage({
  params,
}: {
  params: Params;
}) {
  await verifySession();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          nif: true,
          address: true,
          email: true,
        },
      },
      lines: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/faturacao" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Faturação
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={
            <a
              href={`/api/faturas/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <Download className="h-4 w-4" />
          Ver PDF
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Fatura
          </p>
          <h2 className="text-2xl font-semibold tracking-tight font-mono">
            {invoice.number}
          </h2>
          <p className="text-sm text-muted-foreground">
            Emitida em {formatDate(invoice.issuedAt)}
            {invoice.dueDate ? ` • Vence em ${formatDate(invoice.dueDate)}` : ""}
          </p>
        </div>
        <Badge variant={statusVariant[invoice.status]}>
          {statusLabel[invoice.status]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accoes</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceStatusActions
            invoiceId={invoice.id}
            status={invoice.status}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm">
          <Link
            href={`/pacientes/${invoice.patient.id}`}
            className="font-medium hover:underline w-fit"
          >
            {invoice.patient.name}
          </Link>
          <p className="text-muted-foreground font-mono text-xs">
            NIF {formatNIF(invoice.patient.nif)}
          </p>
          <p className="text-muted-foreground">
            {dash(invoice.patient.address)}
          </p>
          {invoice.patient.email ? (
            <p className="text-muted-foreground">{invoice.patient.email}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descricao</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Preço unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.description}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {line.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCents(line.unitPriceCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatCents(line.lineTotalCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-end">
        <Card className="w-full max-w-xs">
          <CardContent className="grid gap-2 pt-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">
                {formatCents(invoice.subtotalCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">IVA (23%)</span>
              <span className="tabular-nums">
                {formatCents(invoice.taxCents)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCents(invoice.totalCents)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
