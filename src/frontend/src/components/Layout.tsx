import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Receipt,
  Settings,
  TreePine,
  UserPlus,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { PageId } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const bottomNav: { id: PageId; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Inicio" },
  { id: "clientes", icon: Users, label: "Clientes" },
  { id: "calendario", icon: Calendar, label: "Calendario" },
  { id: "trabajos", icon: Briefcase, label: "Trabajos" },
  { id: "finanzas", icon: DollarSign, label: "Finanzas" },
];

const sideNav: { id: PageId; icon: React.ElementType; label: string }[] = [
  { id: "cotizaciones", icon: FileText, label: "Cotizaciones" },
  { id: "facturas", icon: Receipt, label: "Facturas" },
  { id: "prospectos", icon: UserPlus, label: "Prospectos" },
  { id: "jardines", icon: Leaf, label: "Control de Jardines" },
  { id: "rutas", icon: MapPin, label: "Planificador de Rutas" },
  { id: "ajustes", icon: Settings, label: "Ajustes" },
];

interface LayoutProps {
  children: ReactNode;
  page: PageId;
  setPage: (p: PageId) => void;
}

export default function Layout({ children, page, setPage }: LayoutProps) {
  const { clear } = useInternetIdentity();
  const [open, setOpen] = useState(false);

  const navigate = (id: PageId) => {
    setPage(id);
    setOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <TreePine className="h-6 w-6" />
          <span className="font-bold text-lg">Hoja Verde</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20"
              data-ocid="nav.menu.button"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <div className="bg-primary text-primary-foreground px-4 py-5 flex items-center gap-3">
              <TreePine className="h-7 w-7" />
              <div>
                <div className="font-bold text-lg">Hoja Verde</div>
                <div className="text-xs opacity-75">Menú</div>
              </div>
            </div>
            <nav className="p-3 flex flex-col gap-1">
              {sideNav.map(({ id, icon: Icon, label }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => navigate(id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left transition-colors ${
                    page === id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                  data-ocid={`nav.${id}.link`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
              <div className="border-t my-2" />
              <button
                type="button"
                onClick={() => {
                  clear();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left text-destructive hover:bg-red-50 transition-colors"
                data-ocid="nav.logout.button"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 overflow-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-40">
        <div className="flex">
          {bottomNav.map(({ id, icon: Icon, label }) => {
            const active = page === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => setPage(id)}
                className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                data-ocid={`nav.${id}.link`}
              >
                <Icon
                  className={`h-5 w-5 mb-1 ${active ? "text-primary" : ""}`}
                />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
