import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Receipt,
  UserPlus,
  Users,
} from "lucide-react";
import type { PageId } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useActor } from "../hooks/useActor";
import { formatCurrency } from "../lib/appUtils";

export default function DashboardPage({
  navigate,
}: { navigate: (p: PageId) => void }) {
  const { actor } = useActor();

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => actor!.getBusinessStats(),
    enabled: !!actor,
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => actor!.getAllTransactions(),
    enabled: !!actor,
  });

  const monthlyIncome =
    transactions
      ?.filter((t) => t.transactionType === "income")
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const statCards = [
    {
      label: "Trabajos este mes",
      value: stats?.totalJobsThisMonth?.toString() ?? "0",
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Clientes activos",
      value: stats?.activeClientsCount?.toString() ?? "0",
      icon: Users,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(monthlyIncome),
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Cotizaciones enviadas",
      value: stats?.quotesSentCount?.toString() ?? "0",
      icon: FileText,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const quickActions: {
    label: string;
    icon: React.ElementType;
    page: PageId;
    ocid: string;
  }[] = [
    {
      label: "Agregar Cliente",
      icon: UserPlus,
      page: "clientes",
      ocid: "dashboard.add_client.button",
    },
    {
      label: "Crear Cotización",
      icon: FileText,
      page: "cotizaciones",
      ocid: "dashboard.create_quote.button",
    },
    {
      label: "Crear Factura",
      icon: Receipt,
      page: "facturas",
      ocid: "dashboard.create_invoice.button",
    },
    {
      label: "Agregar Trabajo",
      icon: Plus,
      page: "trabajos",
      ocid: "dashboard.add_job.button",
    },
  ];

  return (
    <div className="p-4 space-y-5" data-ocid="dashboard.page">
      <div>
        <h2 className="text-xl font-bold text-foreground">Buenos días 🌱</h2>
        <p className="text-muted-foreground text-sm">Resumen de tu negocio</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, icon: Icon, page, ocid }) => (
            <Button
              key={page}
              variant="outline"
              className="h-16 flex-col gap-1.5 rounded-xl border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => navigate(page)}
              data-ocid={ocid}
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Trabajos de Hoy</span>
          </div>
          <Button
            variant="ghost"
            className="w-full text-primary text-sm"
            onClick={() => navigate("trabajos")}
            data-ocid="dashboard.view_jobs.button"
          >
            Ver todos los trabajos →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
