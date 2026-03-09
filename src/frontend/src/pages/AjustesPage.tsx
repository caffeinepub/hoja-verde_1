import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
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

      <div className="text-center text-xs text-muted-foreground py-4">
        Hoja Verde v1.0 &bull; Jardinería Profesional
      </div>
    </div>
  );
}
