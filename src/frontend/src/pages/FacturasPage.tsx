import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MessageCircle, Plus, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Invoice } from "../backend.d";
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
import {
  formatCurrency,
  formatDate,
  generateId,
  nowTimestamp,
  openWhatsApp,
} from "../lib/appUtils";

export default function FacturasPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => actor!.getAllInvoices(),
    enabled: !!actor,
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => actor!.getAllClients(),
    enabled: !!actor,
  });

  const nextInvoiceId = () =>
    `HV-${String(invoices.length + 1).padStart(3, "0")}`;

  const saveMutation = useMutation({
    mutationFn: async (inv: Invoice) => {
      if (inv.id.startsWith("HV-") && invoices.find((i) => i.id === inv.id)) {
        await actor!.updateInvoice(inv);
      } else {
        await actor!.addInvoice({
          ...inv,
          id: nextInvoiceId(),
          invoiceDate: nowTimestamp(),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setSheetOpen(false);
      toast.success("Factura guardada correctamente");
    },
    onError: () => {
      toast.error("Error al guardar la factura. Intenta de nuevo.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura eliminada correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar la factura. Intenta de nuevo.");
    },
  });

  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.fullName ?? id;
  const clientPhone = (id: string) =>
    clients.find((c) => c.id === id)?.phone ?? "";

  const emptyInvoice = (): Invoice => ({
    id: nextInvoiceId(),
    clientId: "",
    invoiceDate: nowTimestamp(),
    servicesPerformed: "",
    totalAmount: 0,
    nextMaintenanceDate: nowTimestamp(),
  });

  const handleSave = () => {
    if (!editing) return;
    if (!editing.clientId) {
      toast.error("Por favor selecciona un cliente.");
      return;
    }
    if (editing.totalAmount <= 0) {
      toast.error("El monto total debe ser mayor a cero.");
      return;
    }
    saveMutation.mutate(editing);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="facturas.page">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Facturas</h2>
        <Button
          className="h-10 w-10 p-0 rounded-xl"
          onClick={() => {
            setEditing(emptyInvoice());
            setSheetOpen(true);
          }}
          disabled={!actor}
          data-ocid="facturas.add.button"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {invoices.length === 0 && (
        <div className="text-center py-12" data-ocid="facturas.empty_state">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay facturas</p>
        </div>
      )}

      <div className="space-y-3">
        {invoices.map((inv, i) => (
          <Card
            key={inv.id}
            className="shadow-sm"
            data-ocid={`facturas.item.${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{inv.id}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(inv.invoiceDate)}
                    </span>
                  </div>
                  <p className="font-semibold">{clientName(inv.clientId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.servicesPerformed}
                  </p>
                  <p className="font-bold text-lg mt-1">
                    {formatCurrency(inv.totalAmount)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing({ ...inv });
                      setSheetOpen(true);
                    }}
                    data-ocid={`facturas.edit_button.${i + 1}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(inv.id)}
                    data-ocid={`facturas.delete_button.${i + 1}`}
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
                    clientPhone(inv.clientId),
                    `Estimado/a ${clientName(inv.clientId)},\n\nFactura ${inv.id} - Hoja Verde\nServicios: ${inv.servicesPerformed}\nTotal: ${formatCurrency(inv.totalAmount)}\nFecha: ${formatDate(inv.invoiceDate)}\n\nGracias por su preferencia.`,
                  )
                }
                data-ocid={`facturas.whatsapp_button.${i + 1}`}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-2" />
                Compartir por WhatsApp
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Factura {editing?.id}</SheetTitle>
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
                    data-ocid="facturas.form.client.select"
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
                <Label>Servicios realizados</Label>
                <Textarea
                  className="mt-1"
                  value={editing.servicesPerformed}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      servicesPerformed: e.target.value,
                    })
                  }
                  data-ocid="facturas.form.services.textarea"
                />
              </div>
              <div>
                <Label>Total (₡) *</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={editing.totalAmount}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      totalAmount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  data-ocid="facturas.form.amount.input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setSheetOpen(false)}
                  data-ocid="facturas.form.cancel_button"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={handleSave}
                  disabled={saveMutation.isPending || !actor}
                  data-ocid="facturas.form.save_button"
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
        <AlertDialogContent data-ocid="facturas.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar factura</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar esta factura?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="facturas.delete.cancel_button">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              data-ocid="facturas.delete.confirm_button"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
