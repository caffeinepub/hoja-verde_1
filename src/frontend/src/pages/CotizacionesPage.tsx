import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, FileText, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Quote } from "../backend.d";
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
  formatCurrency,
  generateId,
  labelQuote,
  nowTimestamp,
  openWhatsApp,
} from "../lib/appUtils";

const statusColor = (s: string) => {
  switch (s) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function CotizacionesPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Quote | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => actor!.getAllQuotes(),
    enabled: !!actor,
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => actor!.getAllClients(),
    enabled: !!actor,
  });

  const saveMutation = useMutation({
    mutationFn: async (q: Quote) => {
      if (q.id) {
        await actor!.updateQuote(q);
      } else {
        await actor!.addQuote({
          ...q,
          id: generateId(),
          creationDate: nowTimestamp(),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      setSheetOpen(false);
      toast.success("Cotización guardada correctamente");
    },
    onError: () => {
      toast.error("Error al guardar la cotización. Intenta de nuevo.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteQuote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Cotización eliminada correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar la cotización. Intenta de nuevo.");
    },
  });

  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.fullName ?? id;
  const clientPhone = (id: string) =>
    clients.find((c) => c.id === id)?.phone ?? "";

  const emptyQuote = (): Quote => ({
    id: "",
    clientId: "",
    serviceDescription: "",
    price: 0,
    creationDate: nowTimestamp(),
    expirationDate: nowTimestamp(),
    status: "pending" as Quote["status"],
  });

  const handleSave = () => {
    if (!editing) return;
    if (!editing.clientId) {
      toast.error("Por favor selecciona un cliente.");
      return;
    }
    if (editing.price < 0) {
      toast.error("El precio no puede ser negativo.");
      return;
    }
    saveMutation.mutate(editing);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="cotizaciones.page">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Cotizaciones</h2>
        <Button
          className="h-10 w-10 p-0 rounded-xl"
          onClick={() => {
            setEditing(emptyQuote());
            setSheetOpen(true);
          }}
          disabled={!actor}
          data-ocid="cotizaciones.add.button"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {quotes.length === 0 && (
        <div className="text-center py-12" data-ocid="cotizaciones.empty_state">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay cotizaciones</p>
        </div>
      )}

      <div className="space-y-3">
        {quotes.map((q, i) => (
          <Card
            key={q.id}
            className="shadow-sm"
            data-ocid={`cotizaciones.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${statusColor(q.status)}`}>
                      {labelQuote(q.status)}
                    </Badge>
                  </div>
                  <p className="font-semibold">{clientName(q.clientId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.serviceDescription}
                  </p>
                  <p className="font-bold text-primary mt-1">
                    {formatCurrency(q.price)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing({ ...q });
                      setSheetOpen(true);
                    }}
                    data-ocid={`cotizaciones.edit_button.${i + 1}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(q.id)}
                    data-ocid={`cotizaciones.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-9 w-full"
                onClick={() =>
                  openWhatsApp(
                    clientPhone(q.clientId),
                    `Estimado/a ${clientName(q.clientId)}, le enviamos su cotización de Hoja Verde:\n\nServicio: ${q.serviceDescription}\nMonto: ${formatCurrency(q.price)}\n\nGracias por confiar en nosotros.`,
                  )
                }
                data-ocid={`cotizaciones.whatsapp_button.${i + 1}`}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-2" />
                Enviar por WhatsApp
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editing?.id ? "Editar Cotización" : "Nueva Cotización"}
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Cliente *</Label>
                <Select
                  value={editing.clientId}
                  onValueChange={(v) => setEditing({ ...editing, clientId: v })}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="cotizaciones.form.client.select"
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
              <div>
                <Label>Descripción</Label>
                <Textarea
                  className="mt-1"
                  value={editing.serviceDescription}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      serviceDescription: e.target.value,
                    })
                  }
                  data-ocid="cotizaciones.form.description.textarea"
                />
              </div>
              <div>
                <Label>Precio (₡)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      price: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  data-ocid="cotizaciones.form.price.input"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) =>
                    setEditing({ ...editing, status: v as Quote["status"] })
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="cotizaciones.form.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="accepted">Aceptada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setSheetOpen(false)}
                  data-ocid="cotizaciones.form.cancel_button"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={handleSave}
                  disabled={saveMutation.isPending || !actor}
                  data-ocid="cotizaciones.form.save_button"
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
        <AlertDialogContent data-ocid="cotizaciones.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cotización</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminarla?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="cotizaciones.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="cotizaciones.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
