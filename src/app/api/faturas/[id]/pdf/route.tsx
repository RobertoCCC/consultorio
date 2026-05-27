import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: Request,
  { params }: { params: Params },
) {
  await verifySession();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          name: true,
          nif: true,
          address: true,
          email: true,
        },
      },
      lines: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          description: true,
          quantity: true,
          unitPriceCents: true,
          lineTotalCents: true,
        },
      },
    },
  });

  if (!invoice) {
    return new Response("Fatura nao encontrada", { status: 404 });
  }

  const buffer = await renderToBuffer(<InvoicePDF invoice={invoice} />);

  const safeNumber = invoice.number.replace(/[^a-zA-Z0-9-]/g, "_");

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeNumber}.pdf"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
