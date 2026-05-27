import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  issueInvoice,
  markInvoicePaid,
  voidInvoice,
} from "@/lib/actions/invoice";

export function InvoiceStatusActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: string;
}) {
  if (status === "PAID" || status === "VOID") {
    return (
      <p className="text-sm text-muted-foreground">
        Sem accoes disponiveis (estado final).
      </p>
    );
  }

  if (status === "DRAFT") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <form action={issueInvoice.bind(null, invoiceId)}>
          <Button type="submit" size="sm">
            <FileText className="h-4 w-4" />
            Emitir fatura
          </Button>
        </form>
        <form action={voidInvoice.bind(null, invoiceId)}>
          <Button type="submit" variant="outline" size="sm">
            <XCircle className="h-4 w-4" />
            Anular
          </Button>
        </form>
      </div>
    );
  }

  // status === ISSUED
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <form action={markInvoicePaid.bind(null, invoiceId)}>
        <Button type="submit" size="sm">
          <CheckCircle2 className="h-4 w-4" />
          Marcar como paga
        </Button>
      </form>
      <form action={voidInvoice.bind(null, invoiceId)}>
        <Button type="submit" variant="outline" size="sm">
          <XCircle className="h-4 w-4" />
          Anular
        </Button>
      </form>
    </div>
  );
}
