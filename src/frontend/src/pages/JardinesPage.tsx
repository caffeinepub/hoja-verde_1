import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Leaf, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Garden } from "../backend.d";
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
import { generateId } from "../lib/appUtils";

export default function JardinesPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Garden | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: gardens = [] } = useQuery({
    queryKey: ["gardens"],
    queryFn: () => actor!.getAllGardens(),
    enabled: !!actor,
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => actor!.getAllClients(),
    enabled: !!actor,
  });

  const saveMutation = useMutation({
    mutationFn: async (g: Garden) => {
      if (g.id) {
        await actor!.updateGarden(g);
      } else {
        await actor!.addGarden({ ...g, id: generateId() });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gardens"] });
      setSheetOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteGarden(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gardens"] }),
  });

  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.fullName ?? id;
  const emptyGarden = (): Garden => ({
    id: "",
    clientId: "",
    sizeM2: 0,
    grassType: "",
    terrainType: "",
    requiredTools: "",
    avgWorkTime: BigInt(60),
    maintenanceFrequency: "monthly",
    specialObservations: "",
  });

  return (
    <div className="p-4 space-y-4" data-ocid="jardines.page">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Control de Jardines</h2>
        <Button
          className="h-10 w-10 p-0 rounded-xl"
          onClick={() => {
            setEditing(emptyGarden());
            setSheetOpen(true);
          }}
          data-ocid="jardines.add.button"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {gardens.length === 0 && (
        <div className="text-center py-12" data-ocid="jardines.empty_state">
          <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay jardines registrados</p>
        </div>
      )}

      <div className="space-y-3">
        {gardens.map((g, i) => (
          <Card
            key={g.id}
            className="shadow-sm"
            data-ocid={`jardines.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{clientName(g.clientId)}</p>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-muted-foreground">
                    <span>🌿 Grama: {g.grassType}</span>
                    <span>📍 Tamaño: {g.sizeM2} m²</span>
                    <span>⛰️ Terreno: {g.terrainType}</span>
                    <span>📅 {g.maintenanceFrequency}</span>
                  </div>
                  {g.specialObservations && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {g.specialObservations}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing({ ...g });
                      setSheetOpen(true);
                    }}
                    data-ocid={`jardines.edit_button.${i + 1}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(g.id)}
                    data-ocid={`jardines.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editing?.id ? "Editar Jardín" : "Nuevo Jardín"}
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
                    data-ocid="jardines.form.client.select"
                  >
                    <SelectValue placeholder="Seleccionar" />
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tamaño (m²)</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={editing.sizeM2}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        sizeM2: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Tipo de grama</Label>
                  <Input
                    className="mt-1"
                    value={editing.grassType}
                    onChange={(e) =>
                      setEditing({ ...editing, grassType: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Tipo de terreno</Label>
                <Input
                  className="mt-1"
                  value={editing.terrainType}
                  onChange={(e) =>
                    setEditing({ ...editing, terrainType: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Herramientas requeridas</Label>
                <Input
                  className="mt-1"
                  value={editing.requiredTools}
                  onChange={(e) =>
                    setEditing({ ...editing, requiredTools: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Frecuencia de mantenimiento</Label>
                <Select
                  value={editing.maintenanceFrequency}
                  onValueChange={(v) =>
                    setEditing({ ...editing, maintenanceFrequency: v })
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="jardines.form.frequency.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observaciones especiales</Label>
                <Textarea
                  className="mt-1"
                  value={editing.specialObservations}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      specialObservations: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setSheetOpen(false)}
                  data-ocid="jardines.form.cancel_button"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={() => saveMutation.mutate(editing)}
                  disabled={saveMutation.isPending}
                  data-ocid="jardines.form.save_button"
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
        <AlertDialogContent data-ocid="jardines.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar jardín</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar este jardín?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="jardines.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="jardines.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
