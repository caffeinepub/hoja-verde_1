import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Navigation } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useActor } from "../hooks/useActor";
import { labelJob, statusColorJob, todayStr } from "../lib/appUtils";

export default function RutasPage() {
  const { actor } = useActor();

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

  const today = todayStr();
  const todayJobs = jobs
    .filter((j) => j.scheduledDate === today && j.status !== "cancelled")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const clientFor = (id: string) => clients.find((c) => c.id === id);

  return (
    <div className="p-4 space-y-4" data-ocid="rutas.page">
      <div>
        <h2 className="text-xl font-bold">Planificador de Rutas</h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("es-CR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <Card className="bg-primary text-primary-foreground shadow-md">
        <CardContent className="p-4 flex items-center gap-3">
          <Navigation className="h-8 w-8" />
          <div>
            <div className="text-2xl font-bold">{todayJobs.length}</div>
            <div className="text-sm opacity-90">trabajos programados hoy</div>
          </div>
        </CardContent>
      </Card>

      {todayJobs.length === 0 && (
        <div className="text-center py-12" data-ocid="rutas.empty_state">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Sin trabajos programados para hoy
          </p>
        </div>
      )}

      <div className="space-y-3">
        {todayJobs.map((j, i) => {
          const client = clientFor(j.clientId);
          return (
            <Card
              key={j.id}
              className="shadow-sm"
              data-ocid={`rutas.item.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {j.startTime} - {j.endTime}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColorJob(j.status)}`}
                      >
                        {labelJob(j.status)}
                      </span>
                    </div>
                    <p className="font-semibold mt-1">
                      {client?.fullName ?? j.clientId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {j.serviceDescription}
                    </p>
                    {client?.address && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 inline mr-0.5" />
                        {client.address}
                      </p>
                    )}
                  </div>
                </div>
                {(client?.gpsLocation || client?.address) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-9 w-full"
                    onClick={() =>
                      window.open(
                        `https://maps.google.com/?q=${encodeURIComponent(client?.gpsLocation || client?.address || "")}`,
                        "_blank",
                      )
                    }
                    data-ocid={`rutas.maps_button.${i + 1}`}
                  >
                    <MapPin className="h-3.5 w-3.5 mr-2" />
                    Abrir en Google Maps
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
