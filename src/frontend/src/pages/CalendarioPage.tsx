import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent } from "../components/ui/card";
import { useActor } from "../hooks/useActor";
import { labelJob, statusColorJob } from "../lib/appUtils";

export default function CalendarioPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Date>(new Date());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => actor!.getAllJobs(),
    enabled: !!actor,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => actor!.getAllClients(),
    enabled: !!actor,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Trabajo eliminado");
    },
    onError: () => toast.error("Error al eliminar el trabajo"),
  });

  const selStr = selected.toISOString().split("T")[0];
  const dayJobs = jobs.filter((j) => j.scheduledDate === selStr);
  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.fullName ?? id;

  const daysWithJobs = new Set(jobs.map((j) => j.scheduledDate));

  return (
    <div className="p-4 space-y-4" data-ocid="calendario.page">
      <h2 className="text-xl font-bold">Calendario</h2>
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            className="w-full"
            modifiers={{
              hasjob: (date) =>
                daysWithJobs.has(date.toISOString().split("T")[0]),
            }}
            modifiersClassNames={{
              hasjob: "bg-primary/20 font-bold text-primary rounded-full",
            }}
          />
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold text-sm mb-2">
          Trabajos del {selected.toLocaleDateString("es-CR")}
        </h3>
        {dayJobs.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="calendario.empty_state"
          >
            Sin trabajos para este día
          </p>
        ) : (
          <div className="space-y-2">
            {dayJobs.map((j, i) => (
              <Card
                key={j.id}
                className="shadow-sm"
                data-ocid={`calendario.item.${i + 1}`}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Badge className={`text-xs ${statusColorJob(j.status)}`}>
                    {labelJob(j.status)}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {clientName(j.clientId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {j.serviceDescription} &bull; {j.startTime}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-red-50"
                    onClick={() => setDeleteId(j.id)}
                    data-ocid={`calendario.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="calendario.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar trabajo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar este trabajo? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="calendario.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="calendario.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
