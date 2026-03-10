import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Lock,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { Transaction } from "../backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { useActor } from "../hooks/useActor";
import { formatCurrency, generateId, nowTimestamp } from "../lib/appUtils";

const emptyTx = (): Transaction => ({
  id: "",
  transactionType: "income" as Transaction["transactionType"],
  description: "",
  amount: 0,
  transactionDate: nowTimestamp(),
});

export default function FinanzasPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | "income" | "expense">("all");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor,
  });

  const { data: txs = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => actor!.getAllTransactions(),
    enabled: !!actor && isAdmin === true,
  });

  const saveMutation = useMutation({
    mutationFn: async (t: Transaction) => {
      if (t.id) {
        await actor!.updateTransaction(t);
      } else {
        await actor!.addTransaction({
          ...t,
          id: generateId(),
          transactionDate: nowTimestamp(),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setSheetOpen(false);
      toast.success("Transacción guardada");
    },
    onError: () => toast.error("Error al guardar la transacción"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transacción eliminada");
    },
    onError: () => toast.error("Error al eliminar la transacción"),
  });

  if (isAdmin === false) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
        data-ocid="finanzas.restricted.section"
      >
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-bold text-lg mb-2">Acceso Restringido</h3>
        <p className="text-muted-foreground text-sm">
          Solo el administrador puede ver las finanzas.
        </p>
      </div>
    );
  }

  const income = txs
    .filter((t) => t.transactionType === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = txs
    .filter((t) => t.transactionType === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const profit = income - expense;

  const filtered =
    tab === "all" ? txs : txs.filter((t) => t.transactionType === tab);

  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthLabel = d.toLocaleDateString("es-CR", { month: "short" });
    const monthTxs = txs.filter((t) => {
      const td = new Date(Number(t.transactionDate) / 1_000_000);
      return (
        td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
      );
    });
    return {
      month: monthLabel,
      ingresos: monthTxs
        .filter((t) => t.transactionType === "income")
        .reduce((s, t) => s + t.amount, 0),
      gastos: monthTxs
        .filter((t) => t.transactionType === "expense")
        .reduce((s, t) => s + t.amount, 0),
    };
  });

  return (
    <div className="p-4 space-y-4" data-ocid="finanzas.page">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Finanzas</h2>
        <Button
          className="h-10 w-10 p-0 rounded-xl"
          onClick={() => {
            setEditing(emptyTx());
            setSheetOpen(true);
          }}
          data-ocid="finanzas.add.button"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <TrendingUp className="h-4 w-4 text-green-600 mb-1" />
            <div className="font-bold text-sm">{formatCurrency(income)}</div>
            <div className="text-xs text-muted-foreground">Ingresos</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <TrendingDown className="h-4 w-4 text-red-500 mb-1" />
            <div className="font-bold text-sm">{formatCurrency(expense)}</div>
            <div className="text-xs text-muted-foreground">Gastos</div>
          </CardContent>
        </Card>
        <Card
          className={`shadow-sm ${profit >= 0 ? "border-green-200" : "border-red-200"}`}
        >
          <CardContent className="p-3">
            <div
              className={`font-bold text-sm ${profit >= 0 ? "text-green-700" : "text-red-600"}`}
            >
              {formatCurrency(profit)}
            </div>
            <div className="text-xs text-muted-foreground">Ganancia</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Resumen mensual</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={10}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 9 }}
                tickFormatter={(v) => `₡${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(
          [
            ["all", "Todos"],
            ["income", "Ingresos"],
            ["expense", "Gastos"],
          ] as const
        ).map(([val, lbl]) => (
          <button
            type="button"
            key={val}
            onClick={() => setTab(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === val ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
            data-ocid={`finanzas.filter.${val}.tab`}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p
            className="text-muted-foreground text-sm text-center py-6"
            data-ocid="finanzas.empty_state"
          >
            No hay transacciones
          </p>
        ) : (
          filtered.map((t, i) => (
            <Card key={t.id} data-ocid={`finanzas.item.${i + 1}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${t.transactionType === "income" ? "bg-green-50" : "bg-red-50"}`}
                >
                  {t.transactionType === "income" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      Number(t.transactionDate) / 1_000_000,
                    ).toLocaleDateString("es-CR")}
                  </p>
                </div>
                <div
                  className={`font-bold text-sm ${t.transactionType === "income" ? "text-green-700" : "text-red-600"}`}
                >
                  {t.transactionType === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditing({ ...t });
                      setSheetOpen(true);
                    }}
                    data-ocid={`finanzas.edit_button.${i + 1}`}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteId(t.id)}
                    data-ocid={`finanzas.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editing?.id ? "Editar" : "Nueva"} Transacción
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={editing.transactionType}
                  onValueChange={(v) =>
                    setEditing({
                      ...editing,
                      transactionType: v as Transaction["transactionType"],
                    })
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="finanzas.form.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  className="mt-1"
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  data-ocid="finanzas.form.description.input"
                />
              </div>
              <div>
                <Label>Monto (₡)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={editing.amount}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      amount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  data-ocid="finanzas.form.amount.input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setSheetOpen(false)}
                  data-ocid="finanzas.form.cancel_button"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={() => saveMutation.mutate(editing)}
                  disabled={saveMutation.isPending}
                  data-ocid="finanzas.form.save_button"
                >
                  {saveMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="finanzas.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar transacción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar esta transacción?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="finanzas.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="finanzas.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
