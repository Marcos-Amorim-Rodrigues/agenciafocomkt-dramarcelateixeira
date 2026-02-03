import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
        <div>
          <h2 className="text-xl font-semibold">Carregando dados...</h2>
          <p className="text-muted-foreground">Buscando métricas do Meta Ads</p>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-3xl">⚠️</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-destructive">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mt-2">{message}</p>
        </div>
      </div>
    </div>
  );
}
