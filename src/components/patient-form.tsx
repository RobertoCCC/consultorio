"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPatient,
  updatePatient,
  type PatientFormState,
} from "@/lib/actions/patient";

type PatientLite = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  nif: string | null;
  address: string | null;
  notes: string | null;
};

const initialState: PatientFormState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {messages[0]}
    </p>
  );
}

export function PatientForm({ patient }: { patient?: PatientLite | null }) {
  const isEdit = !!patient;
  const action = isEdit
    ? updatePatient.bind(null, patient.id)
    : createPatient;

  const [state, formAction, isPending] = useActionState(action, initialState);

  // Preferir valores submetidos no ultimo POST (em caso de erro de validacao);
  // senao fallback ao patient (edit) ou string vazia (create).
  const v = (key: keyof NonNullable<PatientFormState["values"]>) => {
    if (state.values && state.values[key] !== undefined) {
      return state.values[key] ?? "";
    }
    if (!patient) return "";
    if (key === "birthDate") {
      return patient.birthDate
        ? patient.birthDate.toISOString().slice(0, 10)
        : "";
    }
    return (patient[key as keyof PatientLite] as string | null) ?? "";
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="name">
            Nome completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={v("name")}
            required
            autoFocus
            placeholder="João Silva"
            aria-invalid={!!state.errors?.name}
          />
          <FieldError messages={state.errors?.name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nif">NIF</Label>
          <Input
            id="nif"
            name="nif"
            defaultValue={v("nif")}
            placeholder="123456789"
            inputMode="numeric"
            maxLength={11}
            aria-invalid={!!state.errors?.nif}
          />
          <FieldError messages={state.errors?.nif} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="birthDate">Data de nascimento</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={v("birthDate")}
            aria-invalid={!!state.errors?.birthDate}
          />
          <FieldError messages={state.errors?.birthDate} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={v("email")}
            placeholder="joao@exemplo.pt"
            aria-invalid={!!state.errors?.email}
          />
          <FieldError messages={state.errors?.email} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={v("phone")}
            placeholder="+351 912 345 678"
            aria-invalid={!!state.errors?.phone}
          />
          <FieldError messages={state.errors?.phone} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="address">Morada</Label>
          <Input
            id="address"
            name="address"
            defaultValue={v("address")}
            placeholder="Rua das Flores, 1234, 1100-000 Lisboa"
            aria-invalid={!!state.errors?.address}
          />
          <FieldError messages={state.errors?.address} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={v("notes")}
            rows={4}
            placeholder="Observações clínicas, alergias, histórico..."
            aria-invalid={!!state.errors?.notes}
          />
          <FieldError messages={state.errors?.notes} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          type="button"
          render={
            <Link href={isEdit ? `/pacientes/${patient.id}` : "/pacientes"} />
          }
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "A guardar..."
            : isEdit
              ? "Guardar alterações"
              : "Criar paciente"}
        </Button>
      </div>
    </form>
  );
}
