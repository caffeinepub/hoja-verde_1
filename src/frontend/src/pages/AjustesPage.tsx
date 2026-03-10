import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AjustesPage() {
  const { actor } = useActor();
  const { clear } = useInternetIdentity();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor,
  });

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () => actor!.saveCallerUserProfile({ name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil guardado");
    },
    onError: () => toast.error("Error al guardar el perfil"),
  });

  const resetAllMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;

      const [
        clients,
        jobs,
        transactions,
        invoices,
        gardens,
        prospects,
        quotes,
        schedules,
      ] = await Promise.all([
        actor.getAllClients(),
        actor.getAllJobs(),
        actor.getAllTransactions(),
        actor.getAllInvoices(),
        actor.getAllGardens(),
        actor.getAllProspects(),
        actor.getAllQuotes(),
        actor.getAllMaintenanceSchedules(),
      ]);

      await Promise.all([
        ...clients.map((c) => actor.deleteClient(c.id)),
        ...jobs.map((j) => actor.deleteJob(j.id)),
        ...transactions.map((t) => actor.deleteTransaction(t.id)),
        ...invoices.map((inv) => actor.deleteInvoice(inv.id)),
        ...gardens.map((g) => actor.deleteGarden(g.id)),
        ...prospects.map((p) => actor.deleteProspect(p.id)),
        ...quotes.map((q) => actor.deleteQuote(q.id)),
        ...schedules.map((s) => actor.deleteMaintenanceSchedule(s.id)),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["gardens"] });
      qc.invalidateQueries({ queryKey: ["prospects"] });
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Todos los datos han sido eliminados");
      setResetDialogOpen(false);
    },
    onError: () => toast.error("Error al limpiar los datos"),
  });

  return (
    <div className="p-4 space-y-4" data-ocid="ajustes.page">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Ajustes</h2>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">
                {profile?.name || "Mi perfil"}
              </div>
              <div className="text-xs text-muted-foreground">Hoja Verde</div>
            </div>
          </div>
          <div>
            <Label>Nombre</Label>
            <Input
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="ajustes.name.input"
            />
          </div>
          <Button
            className="w-full h-12"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-ocid="ajustes.save.button"
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar perfil"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-red-100">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-sm">Sesión</h3>
          <Button
            variant="outline"
            className="w-full h-12 text-destructive border-destructive/30 hover:bg-red-50"
            onClick={clear}
            data-ocid="ajustes.logout.button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-sm border-red-300">
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm text-red-700">
              Zona de Peligro
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Estas acciones son permanentes y no se pueden deshacer.
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full h-12"
            onClick={() => setResetDialogOpen(true)}
            disabled={resetAllMutation.isPending}
            data-ocid="ajustes.reset.button"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {resetAllMutation.isPending
              ? "Limpiando datos..."
              : "Limpiar todos los datos"}
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground py-4">
        Hoja Verde v1.0 &bull; Jardinería Profesional
      </div>

      <AlertDialog
        open={resetDialogOpen}
        onOpenChange={(open) =>
          !resetAllMutation.isPending && setResetDialogOpen(open)
        }
      >
        <AlertDialogContent data-ocid="ajustes.reset.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Limpiar todos los datos?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Esta acción eliminará TODOS los datos del sistema:
              clientes, trabajos, transacciones, facturas, jardines, prospectos
              y cotizaciones. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={resetAllMutation.isPending}
              data-ocid="ajustes.reset.cancel_button"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={resetAllMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                resetAllMutation.mutate();
              }}
              data-ocid="ajustes.reset.confirm_button"
            >
              {resetAllMutation.isPending ? "Limpiando..." : "Sí, limpiar todo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
