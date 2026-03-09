import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { JobStatus } from "../backend.d";
import type { JobEntry } from "../backend.d";
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
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import {
  generateId,
  labelJob,
  statusColorJob,
  todayStr,
} from "../lib/appUtils";

const emptyJob = (): JobEntry => ({
  id: "",
  clientId: "",
  serviceDescription: "",
  assignedWorker: "",
  scheduledDate: todayStr(),
  startTime: "08:00",
  endTime: "10:00",
  status: "pending" as JobEntry["status"],
});

const STATUSES = ["pending", "inProgress", "completed", "cancelled"] as const;

export default function TrabajosPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<JobEntry | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => actor!.getAllJobs(),
    enabled: !!actor,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => actor!.getAllClients(),
    enabled: !!actor,
  });

  const saveMutation = useMutation({
    mutationFn: async (j: JobEntry) => {
      if (j.id) {
        await actor!.updateJob(j);
      } else {
        await actor!.addJob({ ...j, id: generateId() });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      setSheetOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.fullName ?? id;

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const openAdd = () => {
    setEditing(emptyJob());
    setSheetOpen(true);
  };
  const openEdit = (j: JobEntry) => {
    setEditing({ ...j });
    setSheetOpen(true);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="trabajos.page">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Trabajos</h2>
        <Button
          className="h-10 w-10 p-0 rounded-xl"
          onClick={openAdd}
          data-ocid="trabajos.add.button"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[["all", "Todos"], ...STATUSES.map((s) => [s, labelJob(s)])].map(
          ([val, lbl]) => (
            <button
              type="button"
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === val
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
              data-ocid={`trabajos.filter.${val}.tab`}
            >
              {lbl}
            </button>
          ),
        )}
      </div>

      {isLoading && (
        <div
          className="text-center text-muted-foreground py-8"
          data-ocid="trabajos.loading_state"
        >
          Cargando...
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12" data-ocid="trabajos.empty_state">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay trabajos</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((j, i) => (
          <Card
            key={j.id}
            className="shadow-sm"
            data-ocid={`trabajos.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${statusColorJob(j.status)}`}>
                      {labelJob(j.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {j.scheduledDate}
                    </span>
                  </div>
                  <p className="font-semibold text-sm">
                    {clientName(j.clientId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {j.serviceDescription}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {j.startTime} - {j.endTime} &bull; {j.assignedWorker}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(j)}
                    data-ocid={`trabajos.edit_button.${i + 1}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(j.id)}
                    data-ocid={`trabajos.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {j.status !== "completed" && j.status !== "cancelled" && (
                <div className="flex gap-2 mt-3">
                  {j.status === "pending" && (
                    <Button
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() =>
                        saveMutation.mutate({
                          ...j,
                          status: JobStatus.inProgress,
                        })
                      }
                      data-ocid={`trabajos.start_button.${i + 1}`}
                    >
                      Iniciar
                    </Button>
                  )}
                  {j.status === "inProgress" && (
                    <Button
                      size="sm"
                      className="flex-1 h-9 bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        saveMutation.mutate({
                          ...j,
                          status: JobStatus.completed,
                        })
                      }
                      data-ocid={`trabajos.complete_button.${i + 1}`}
                    >
                      Completar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() =>
                      saveMutation.mutate({ ...j, status: JobStatus.cancelled })
                    }
                    data-ocid={`trabajos.cancel_button.${i + 1}`}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editing?.id ? "Editar Trabajo" : "Nuevo Trabajo"}
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select
                  value={editing.clientId}
                  onValueChange={(v) => setEditing({ ...editing, clientId: v })}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="trabajos.form.client.select"
                  >
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descripción del servicio</Label>
                <Textarea
                  className="mt-1"
                  value={editing.serviceDescription}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      serviceDescription: e.target.value,
                    })
                  }
                  data-ocid="trabajos.form.description.textarea"
                />
              </div>
              <div>
                <Label>Trabajador asignado</Label>
                <Input
                  className="mt-1"
                  value={editing.assignedWorker}
                  onChange={(e) =>
                    setEditing({ ...editing, assignedWorker: e.target.value })
                  }
                  data-ocid="trabajos.form.worker.input"
                />
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={editing.scheduledDate}
                  onChange={(e) =>
                    setEditing({ ...editing, scheduledDate: e.target.value })
                  }
                  data-ocid="trabajos.form.date.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Hora inicio</Label>
                  <Input
                    type="time"
                    className="mt-1"
                    value={editing.startTime}
                    onChange={(e) =>
                      setEditing({ ...editing, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Hora fin</Label>
                  <Input
                    type="time"
                    className="mt-1"
                    value={editing.endTime}
                    onChange={(e) =>
                      setEditing({ ...editing, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) =>
                    setEditing({ ...editing, status: v as JobEntry["status"] })
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="trabajos.form.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {labelJob(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setSheetOpen(false)}
                  data-ocid="trabajos.form.cancel_button"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={() => saveMutation.mutate(editing)}
                  disabled={saveMutation.isPending}
                  data-ocid="trabajos.form.save_button"
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
        <AlertDialogContent data-ocid="trabajos.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar trabajo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar este trabajo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="trabajos.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="trabajos.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
