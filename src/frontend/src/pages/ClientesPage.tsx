import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import { generateId, nowTimestamp, openWhatsApp } from "../lib/appUtils";

const emptyClient = (): Client => ({
  id: "",
  fullName: "",
  phone: "",
  address: "",
  gpsLocation: "",
  notes: "",
  registrationDate: nowTimestamp(),
  isActive: true,
});

export default function ClientesPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => actor!.getAllClients(),
    enabled: !!actor,
  });

  const saveMutation = useMutation({
    mutationFn: async (c: Client) => {
      if (c.id) {
        await actor!.updateClient(c);
      } else {
        await actor!.addClient({
          ...c,
          id: generateId(),
          registrationDate: nowTimestamp(),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setSheetOpen(false);
      toast.success("Cliente guardado correctamente");
    },
    onError: () => {
      toast.error("Error al guardar el cliente. Intenta de nuevo.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar el cliente. Intenta de nuevo.");
    },
  });

  const filtered = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  const openAdd = () => {
    setEditing(emptyClient());
    setSheetOpen(true);
  };
  const openEdit = (c: Client) => {
    setEditing({ ...c });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.fullName.trim()) {
      toast.error("El nombre completo es requerido.");
      return;
    }
    saveMutation.mutate(editing);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="clientes.page">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="clientes.search.input"
          />
        </div>
        <Button
          className="h-10 w-10 p-0 rounded-xl"
          onClick={openAdd}
          disabled={!actor}
          data-ocid="clientes.add.button"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {isLoading && (
        <div
          className="text-center text-muted-foreground py-8"
          data-ocid="clientes.loading_state"
        >
          Cargando...
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12" data-ocid="clientes.empty_state">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay clientes aún</p>
          <Button className="mt-4" onClick={openAdd}>
            Agregar primer cliente
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((c, i) => (
          <Card
            key={c.id}
            className="shadow-sm"
            data-ocid={`clientes.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{c.fullName}</span>
                    <Badge
                      variant={c.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {c.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {c.phone}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.address}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(c)}
                    data-ocid={`clientes.edit_button.${i + 1}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(c.id)}
                    data-ocid={`clientes.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9"
                  asChild
                  data-ocid={`clientes.call_button.${i + 1}`}
                >
                  <a href={`tel:${c.phone}`}>
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    Llamar
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() =>
                    openWhatsApp(
                      c.phone,
                      `Hola ${c.fullName}, le contacta Hoja Verde.`,
                    )
                  }
                  data-ocid={`clientes.whatsapp_button.${i + 1}`}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  WhatsApp
                </Button>
                {c.gpsLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    asChild
                    data-ocid={`clientes.map_button.${i + 1}`}
                  >
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(c.gpsLocation)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editing?.id ? "Editar Cliente" : "Nuevo Cliente"}
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <ClientForm
              client={editing}
              onChange={setEditing}
              onSave={handleSave}
              onCancel={() => setSheetOpen(false)}
              saving={saveMutation.isPending}
              actorReady={!!actor}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="clientes.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="clientes.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="clientes.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ClientForm({
  client,
  onChange,
  onSave,
  onCancel,
  saving,
  actorReady,
}: {
  client: Client;
  onChange: (c: Client) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  actorReady: boolean;
}) {
  const f = (field: keyof Client, value: string | boolean) =>
    onChange({ ...client, [field]: value });
  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre completo *</Label>
        <Input
          className="mt-1"
          value={client.fullName}
          onChange={(e) => f("fullName", e.target.value)}
          data-ocid="clientes.form.name.input"
        />
      </div>
      <div>
        <Label>Teléfono</Label>
        <Input
          className="mt-1"
          value={client.phone}
          onChange={(e) => f("phone", e.target.value)}
          data-ocid="clientes.form.phone.input"
        />
      </div>
      <div>
        <Label>Dirección</Label>
        <Input
          className="mt-1"
          value={client.address}
          onChange={(e) => f("address", e.target.value)}
          data-ocid="clientes.form.address.input"
        />
      </div>
      <div>
        <Label>Ubicación GPS</Label>
        <Input
          className="mt-1"
          placeholder="Coordenadas o dirección exacta"
          value={client.gpsLocation ?? ""}
          onChange={(e) => f("gpsLocation", e.target.value)}
          data-ocid="clientes.form.gps.input"
        />
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea
          className="mt-1"
          value={client.notes}
          onChange={(e) => f("notes", e.target.value)}
          data-ocid="clientes.form.notes.textarea"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={client.isActive}
          onChange={(e) => f("isActive", e.target.checked)}
          data-ocid="clientes.form.active.checkbox"
        />
        <Label htmlFor="isActive">Cliente activo</Label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 h-12"
          onClick={onCancel}
          data-ocid="clientes.form.cancel_button"
        >
          Cancelar
        </Button>
        <Button
          className="flex-1 h-12"
          onClick={onSave}
          disabled={saving || !actorReady}
          data-ocid="clientes.form.save_button"
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
