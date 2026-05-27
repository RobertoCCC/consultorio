// Formatadores PT-PT centralizados.

const eur = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const dateLong = new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" });
const dateShort = new Intl.DateTimeFormat("pt-PT", { dateStyle: "short" });
const dateTime = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "short",
  timeStyle: "short",
});
const timeOnly = new Intl.DateTimeFormat("pt-PT", { timeStyle: "short" });

/** Centimos -> "12,34 EUR" */
export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return eur.format(cents / 100);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return dateLong.format(new Date(date));
}

export function formatDateShort(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  return dateShort.format(new Date(date));
}

export function formatDateTime(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  return dateTime.format(new Date(date));
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return timeOnly.format(new Date(date));
}

/** NIF "123456789" -> "123 456 789" */
export function formatNIF(nif: string | null | undefined): string {
  if (!nif) return "—";
  const clean = nif.replace(/\D/g, "");
  if (clean.length !== 9) return nif;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  return phone;
}

/** "—" se vazio; senao a string */
export function dash(value: string | null | undefined): string {
  return value && value.trim() !== "" ? value : "—";
}

/** "Joao Silva" -> "JS" */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Idade em anos a partir da data de nascimento */
export function ageFromBirthDate(
  birthDate: Date | string | null | undefined,
): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
