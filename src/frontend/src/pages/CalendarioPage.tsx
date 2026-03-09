import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent } from "../components/ui/card";
import { useActor } from "../hooks/useActor";
import { labelJob, statusColorJob } from "../lib/appUtils";

export default function CalendarioPage() {
  const { actor } = useActor();
  const [selected, setSelected] = useState<Date>(new Date());

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

  const selStr = selected.toISOString().split("T")[0];
  const dayJobs = jobs.filter((j) => j.scheduledDate === selStr);
  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.fullName ?? id;

  // Days with jobs
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
                  <div>
                    <p className="font-medium text-sm">
                      {clientName(j.clientId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {j.serviceDescription} &bull; {j.startTime}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
