import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import type { Client, Prospect } from "../backend.d";
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
import { generateId, labelProspect, nowTimestamp } from "../lib/appUtils";

const statusColor = (s: string) => {
  switch (s) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "quoteSent":
      return "bg-blue-100 text-blue-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ProspectosPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [convertId, setConvertId] = useState<string | null>(null);

  const { data: prospects = [] } = useQuery({
    queryKey: ["prospects"],
    queryFn: () => actor!.getAllProspects(),
    enabled: !!actor,
  });

  const saveMutation = useMutation({
    mutationFn: async (p: Prospect) => {
      if (p.id) {
        await actor!.updateProspect(p);
      } else {
        await actor!.addProspect({
          ...p,
          id: generateId(),
          quoteDate: nowTimestamp(),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
      setSheetOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteProspect(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });

  const convertMutation = useMutation({
    mutationFn: async (p: Prospect) => {
      const newClientId = generateId();
      const newClient: Client = {
        id: newClientId,
        fullName: p.name,
        phone: p.phone,
        address: p.address,
        notes: `Convertido desde prospecto. Servicio: ${p.serviceRequested}`,
        registrationDate: nowTimestamp(),
        isActive: true,
      };
      await actor!.addClient(newClient);
      await actor!.convertProspectToClient(p.id, newClientId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      setConvertId(null);
    },
  });

  const emptyProspect = (): Prospect => ({
    id: "",
    name: "",
    phone: "",
    address: "",
    serviceRequested: "",
    quoteDate: nowTimestamp(),
    status: "pending" as Prospect["status"],
  });

  return (
    <div className="p-4 space-y-4" data-ocid="prospectos.page">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Prospectos</h2>
        <Button
          className="h-10 w-10 p-0 rounded-xl"
          onClick={() => {
            setEditing(emptyProspect());
            setSheetOpen(true);
          }}
          data-ocid="prospectos.add.button"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {prospects.length === 0 && (
        <div className="text-center py-12" data-ocid="prospectos.empty_state">
          <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay prospectos</p>
        </div>
      )}

      <div className="space-y-3">
        {prospects.map((p, i) => (
          <Card
            key={p.id}
            className="shadow-sm"
            data-ocid={`prospectos.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${statusColor(p.status)}`}>
                      {labelProspect(p.status)}
                    </Badge>
                  </div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.phone}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.serviceRequested}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing({ ...p });
                      setSheetOpen(true);
                    }}
                    data-ocid={`prospectos.edit_button.${i + 1}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(p.id)}
                    data-ocid={`prospectos.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {p.status === "accepted" && (
                <Button
                  size="sm"
                  className="mt-3 h-9 w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setConvertId(p.id)}
                  data-ocid={`prospectos.convert_button.${i + 1}`}
                >
                  <UserCheck className="h-3.5 w-3.5 mr-2" />
                  Convertir a Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editing?.id ? "Editar Prospecto" : "Nuevo Prospecto"}
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  className="mt-1"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  data-ocid="prospectos.form.name.input"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  className="mt-1"
                  value={editing.phone}
                  onChange={(e) =>
                    setEditing({ ...editing, phone: e.target.value })
                  }
                  data-ocid="prospectos.form.phone.input"
                />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input
                  className="mt-1"
                  value={editing.address}
                  onChange={(e) =>
                    setEditing({ ...editing, address: e.target.value })
                  }
                  data-ocid="prospectos.form.address.input"
                />
              </div>
              <div>
                <Label>Servicio solicitado</Label>
                <Textarea
                  className="mt-1"
                  value={editing.serviceRequested}
                  onChange={(e) =>
                    setEditing({ ...editing, serviceRequested: e.target.value })
                  }
                  data-ocid="prospectos.form.service.textarea"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) =>
                    setEditing({ ...editing, status: v as Prospect["status"] })
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="prospectos.form.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="quoteSent">
                      Cotización Enviada
                    </SelectItem>
                    <SelectItem value="accepted">Aceptado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setSheetOpen(false)}
                  data-ocid="prospectos.form.cancel_button"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={() => saveMutation.mutate(editing)}
                  disabled={saveMutation.isPending}
                  data-ocid="prospectos.form.save_button"
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
        <AlertDialogContent data-ocid="prospectos.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar prospecto</AlertDialogTitle>
            <AlertDialogDescription>¿Seguro?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="prospectos.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="prospectos.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!convertId}
        onOpenChange={(open) => !open && setConvertId(null)}
      >
        <AlertDialogContent data-ocid="prospectos.convert.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir a cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas convertir este prospecto en un cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="prospectos.convert.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const p = prospects.find((p) => p.id === convertId);
                if (p) convertMutation.mutate(p);
              }}
              data-ocid="prospectos.convert.confirm_button"
            >
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
