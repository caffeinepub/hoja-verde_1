import { Leaf, TreePine } from "lucide-react";
import { Button } from "../components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary rounded-full p-5">
            <TreePine className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary mb-1">Hoja Verde</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Gestión Profesional de Jardinería
        </p>

        <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-6">
          <Leaf className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground text-left">
            Inicia sesión de forma segura con tu identidad digital
          </p>
        </div>

        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full h-12 text-base font-semibold rounded-xl"
          data-ocid="login.submit_button"
        >
          {isLoggingIn ? "Iniciando..." : "Iniciar Sesión"}
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Powered by Internet Computer
        </p>
      </div>
    </div>
  );
}
