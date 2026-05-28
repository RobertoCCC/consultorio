"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAppointment,
  updateAppointment,
  type AppointmentFormState,
} from "@/lib/actions/appointment";

type AppointmentLite = {
  id: string;
  patientId: string;
  serviceId: string;
  staffId: string;
  startsAt: Date;
  durationMinutes: number;
  notes: string | null;
};

type PatientOption = { id: string; name: string };
type StaffOption = { id: string; name: string };
type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
};

const initialState: AppointmentFormState = {};

function toDateTimeLocal(date: Date): string {
  // toISOString -> "2026-06-01T09:00:00.000Z"; corta para "2026-06-01T09:00".
  // (Trade-off: ignora timezone -- aceitavel para demo.)
  return date.toISOString().slice(0, 16);
}

function defaultStartsAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return toDateTimeLocal(d);
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {messages[0]}
    </p>
  );
}

export function AppointmentForm({
  appointment,
  patients,
  services,
  staff,
  presetPatientId,
  presetStartsAt,
}: {
  appointment?: AppointmentLite | null;
  patients: PatientOption[];
  services: ServiceOption[];
  staff: StaffOption[];
  presetPatientId?: string;
  presetStartsAt?: string;
}) {
  const isEdit = !!appointment;
  const action = isEdit
    ? updateAppointment.bind(null, appointment.id)
    : createAppointment;

  const [state, formAction, isPending] = useActionState(action, initialState);

  // Valores controlados (Selects + duration auto-fill).
  const [patientId, setPatientId] = useState<string>(
    state.values?.patientId ?? appointment?.patientId ?? presetPatientId ?? "",
  );
  const [serviceId, setServiceId] = useState<string>(
    state.values?.serviceId ?? appointment?.serviceId ?? "",
  );
  const [staffId, setStaffId] = useState<string>(
    state.values?.staffId ?? appointment?.staffId ?? "",
  );
  const [duration, setDuration] = useState<string>(
    state.values?.durationMinutes ??
      (appointment ? String(appointment.durationMinutes) : "30"),
  );

  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const svc = services.find((s) => s.id === id);
    if (svc && !isEdit) {
      setDuration(String(svc.durationMinutes));
    }
  };

  const startsAtDefault =
    state.values?.startsAt ??
    (appointment
      ? toDateTimeLocal(appointment.startsAt)
      : presetStartsAt ?? defaultStartsAt());

  const notesDefault = state.values?.notes ?? appointment?.notes ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="patientId">
            Paciente <span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="patientId" value={patientId} />
          <Select value={patientId} onValueChange={(v) => setPatientId(v ?? "")}>
            <SelectTrigger id="patientId" aria-invalid={!!state.errors?.patientId}>
              <SelectValue placeholder="Selecionar paciente..." />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError messages={state.errors?.patientId} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="serviceId">
            Serviço <span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="serviceId" value={serviceId} />
          <Select
            value={serviceId}
            onValueChange={(v) => handleServiceChange(v ?? "")}
          >
            <SelectTrigger id="serviceId" aria-invalid={!!state.errors?.serviceId}>
              <SelectValue placeholder="Selecionar serviço..." />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError messages={state.errors?.serviceId} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="staffId">
            Staff <span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="staffId" value={staffId} />
          <Select value={staffId} onValueChange={(v) => setStaffId(v ?? "")}>
            <SelectTrigger id="staffId" aria-invalid={!!state.errors?.staffId}>
              <SelectValue placeholder="Selecionar staff..." />
            </SelectTrigger>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError messages={state.errors?.staffId} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="startsAt">
            Data e hora <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={startsAtDefault}
            required
            aria-invalid={!!state.errors?.startsAt}
          />
          <FieldError messages={state.errors?.startsAt} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="durationMinutes">
            Duração (min) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={5}
            max={480}
            step={5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            aria-invalid={!!state.errors?.durationMinutes}
          />
          <FieldError messages={state.errors?.durationMinutes} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={notesDefault}
            rows={3}
            placeholder="Observações sobre a marcação..."
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
            <Link
              href={isEdit ? `/marcacoes/${appointment.id}` : "/marcacoes"}
            />
          }
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "A guardar..."
            : isEdit
              ? "Guardar alterações"
              : "Criar marcação"}
        </Button>
      </div>
    </form>
  );
}
