"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createService,
  updateService,
  type ServiceFormState,
} from "@/lib/actions/service";

type ServiceLite = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
};

const initialState: ServiceFormState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {messages[0]}
    </p>
  );
}

export function ServiceForm({ service }: { service?: ServiceLite | null }) {
  const isEdit = !!service;
  const action = isEdit
    ? updateService.bind(null, service.id)
    : createService;

  const [state, formAction, isPending] = useActionState(action, initialState);

  const v = (key: keyof NonNullable<ServiceFormState["values"]>) => {
    if (state.values && state.values[key] !== undefined) {
      return state.values[key] ?? "";
    }
    if (!service) {
      if (key === "durationMinutes") return "30";
      if (key === "priceEur") return "";
      if (key === "active") return "on";
      return "";
    }
    if (key === "durationMinutes") return String(service.durationMinutes);
    if (key === "priceEur") return (service.priceCents / 100).toFixed(2);
    if (key === "active") return service.active ? "on" : "";
    if (key === "description") return service.description ?? "";
    return service.name;
  };

  const activeDefault = isEdit ? service.active : true;
  const activeFromState = state.values?.active;
  const activeChecked =
    activeFromState !== undefined ? activeFromState === "on" : activeDefault;

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
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={v("name")}
            required
            autoFocus
            placeholder="Consulta de clinica geral"
            aria-invalid={!!state.errors?.name}
          />
          <FieldError messages={state.errors?.name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="durationMinutes">
            Duracao (minutos) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={5}
            max={480}
            step={5}
            defaultValue={v("durationMinutes")}
            required
            aria-invalid={!!state.errors?.durationMinutes}
          />
          <FieldError messages={state.errors?.durationMinutes} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="priceEur">
            Preco (EUR) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="priceEur"
            name="priceEur"
            type="number"
            min={0}
            step={0.01}
            defaultValue={v("priceEur")}
            required
            placeholder="45.00"
            aria-invalid={!!state.errors?.priceEur}
          />
          <FieldError messages={state.errors?.priceEur} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="description">Descricao</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={v("description")}
            rows={3}
            placeholder="Detalhes do servico..."
            aria-invalid={!!state.errors?.description}
          />
          <FieldError messages={state.errors?.description} />
        </div>

        <div className="flex items-center gap-3 md:col-span-2 rounded-md border p-4">
          <Switch
            id="active"
            name="active"
            defaultChecked={activeChecked}
          />
          <div className="flex flex-col">
            <Label htmlFor="active" className="cursor-pointer">
              Servico ativo
            </Label>
            <span className="text-xs text-muted-foreground">
              Servicos inativos nao aparecem ao criar novas marcacoes.
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          type="button"
          render={
            <Link href={isEdit ? `/servicos/${service.id}` : "/servicos"} />
          }
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "A guardar..."
            : isEdit
              ? "Guardar alteracoes"
              : "Criar servico"}
        </Button>
      </div>
    </form>
  );
}
