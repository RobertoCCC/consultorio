import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type InvoiceLineLite = {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type InvoicePDFData = {
  number: string;
  issuedAt: Date;
  dueDate: Date | null;
  status: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes: string | null;
  patient: {
    name: string;
    nif: string | null;
    address: string | null;
    email: string | null;
  };
  lines: InvoiceLineLite[];
};

// Dados ficticios do emissor -- em producao viriam de uma tabela Organization.
const ISSUER = {
  name: "Consultório Demo, Lda.",
  nif: "500000000",
  address: "Rua Exemplo, 123, 1100-000 Lisboa",
  email: "geral@consultorio.pt",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111",
  },
  brandSub: {
    fontSize: 9,
    color: "#666",
    marginTop: 4,
    lineHeight: 1.4,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "right",
  },
  docMeta: {
    fontSize: 9,
    color: "#666",
    textAlign: "right",
    marginTop: 6,
    lineHeight: 1.5,
  },
  statusPill: {
    alignSelf: "flex-end",
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 9,
    color: "#374151",
    marginTop: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 1,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 3,
  },
  partyLine: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
  },
  partiesRow: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 24,
  },
  partyBox: {
    flex: 1,
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  th: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 0.5,
    fontWeight: 700,
  },
  cellDesc: { flex: 4 },
  cellQty: { flex: 1, textAlign: "right" },
  cellPrice: { flex: 1.5, textAlign: "right" },
  cellTotal: { flex: 1.5, textAlign: "right" },
  totalsBox: {
    marginTop: 8,
    marginLeft: "auto",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: "#374151",
  },
  totalValue: {
    fontSize: 10,
    color: "#111",
  },
  grandTotal: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#111",
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  notes: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#9ca3af",
  },
});

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  ISSUED: "Emitida",
  PAID: "Paga",
  VOID: "Anulada",
};

function formatEur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`;
}

function formatNif(nif: string | null): string {
  if (!nif) return "-";
  return nif.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function InvoicePDF({ invoice }: { invoice: InvoicePDFData }) {
  return (
    <Document
      title={invoice.number}
      author={ISSUER.name}
      subject={`Fatura ${invoice.number}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>{ISSUER.name}</Text>
            <Text style={styles.brandSub}>
              NIF: {formatNif(ISSUER.nif)}
              {"\n"}
              {ISSUER.address}
              {"\n"}
              {ISSUER.email}
            </Text>
          </View>
          <View>
            <Text style={styles.docTitle}>FATURA</Text>
            <Text style={styles.docMeta}>
              {invoice.number}
              {"\n"}
              Emitida em {formatDate(invoice.issuedAt)}
              {invoice.dueDate
                ? `\nVence em ${formatDate(invoice.dueDate)}`
                : ""}
            </Text>
            <Text style={styles.statusPill}>{statusLabels[invoice.status] ?? invoice.status}</Text>
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.sectionLabel}>Cliente</Text>
            <Text style={styles.partyName}>{invoice.patient.name}</Text>
            <Text style={styles.partyLine}>
              {invoice.patient.nif ? `NIF: ${formatNif(invoice.patient.nif)}\n` : ""}
              {invoice.patient.address ?? ""}
              {invoice.patient.email ? `\n${invoice.patient.email}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.cellDesc]}>Descricao</Text>
            <Text style={[styles.th, styles.cellQty]}>Qtd</Text>
            <Text style={[styles.th, styles.cellPrice]}>Preço unit.</Text>
            <Text style={[styles.th, styles.cellTotal]}>Total</Text>
          </View>
          {invoice.lines.map((line) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={styles.cellDesc}>{line.description}</Text>
              <Text style={styles.cellQty}>{line.quantity}</Text>
              <Text style={styles.cellPrice}>{formatEur(line.unitPriceCents)}</Text>
              <Text style={styles.cellTotal}>{formatEur(line.lineTotalCents)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatEur(invoice.subtotalCents)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (23%)</Text>
            <Text style={styles.totalValue}>{formatEur(invoice.taxCents)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total a pagar</Text>
            <Text style={styles.grandTotalValue}>{formatEur(invoice.totalCents)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          Documento emitido por software de demonstracao. Sem valor fiscal.
        </Text>
      </Page>
    </Document>
  );
}
