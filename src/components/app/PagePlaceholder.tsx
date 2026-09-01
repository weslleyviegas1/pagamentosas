import { Card, CardContent } from "@/components/ui/card";

export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Nada por aqui ainda. Esta área será liberada na próxima etapa.
        </CardContent>
      </Card>
    </div>
  );
}
