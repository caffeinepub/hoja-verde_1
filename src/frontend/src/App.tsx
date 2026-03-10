import { useState } from "react";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AjustesPage from "./pages/AjustesPage";
import CalendarioPage from "./pages/CalendarioPage";
import ClientesPage from "./pages/ClientesPage";
import CotizacionesPage from "./pages/CotizacionesPage";
import DashboardPage from "./pages/DashboardPage";
import FacturasPage from "./pages/FacturasPage";
import FinanzasPage from "./pages/FinanzasPage";
import JardinesPage from "./pages/JardinesPage";
import LoginPage from "./pages/LoginPage";
import ProspectosPage from "./pages/ProspectosPage";
import RutasPage from "./pages/RutasPage";
import TrabajosPage from "./pages/TrabajosPage";

export type PageId =
  | "dashboard"
  | "clientes"
  | "calendario"
  | "trabajos"
  | "finanzas"
  | "cotizaciones"
  | "facturas"
  | "prospectos"
  | "jardines"
  | "rutas"
  | "ajustes";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [page, setPage] = useState<PageId>("dashboard");

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">🌿</div>
          <div className="text-lg font-semibold">Hoja Verde</div>
          <div className="text-sm opacity-75 mt-1">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage navigate={setPage} />;
      case "clientes":
        return <ClientesPage />;
      case "calendario":
        return <CalendarioPage />;
      case "trabajos":
        return <TrabajosPage />;
      case "finanzas":
        return <FinanzasPage />;
      case "cotizaciones":
        return <CotizacionesPage />;
      case "facturas":
        return <FacturasPage />;
      case "prospectos":
        return <ProspectosPage />;
      case "jardines":
        return <JardinesPage />;
      case "rutas":
        return <RutasPage />;
      case "ajustes":
        return <AjustesPage />;
      default:
        return <DashboardPage navigate={setPage} />;
    }
  };

  return (
    <Layout page={page} setPage={setPage}>
      {renderPage()}
      <Toaster position="top-center" richColors />
    </Layout>
  );
}
