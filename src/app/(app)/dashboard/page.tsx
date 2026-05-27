import { Calendar, Receipt, TrendingUp, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Marcacoes hoje",
    value: "0",
    hint: "0 ainda por confirmar",
    icon: Calendar,
  },
  {
    label: "Pacientes",
    value: "0",
    hint: "Total na ficha",
    icon: Users,
  },
  {
    label: "Receita do mes",
    value: "0 EUR",
    hint: "Faturas emitidas",
    icon: TrendingUp,
  },
  {
    label: "Faturas pendentes",
    value: "0",
    hint: "Por receber",
    icon: Receipt,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Visao geral do consultorio &mdash; dados aparecem assim que a base de dados
          estiver ligada.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proximas marcacoes</CardTitle>
          <CardDescription>
            Lista das marcacoes agendadas para as proximas horas.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Sem dados ainda. Configure a base de dados Neon para carregar marcacoes.
        </CardContent>
      </Card>
    </div>
  );
}
