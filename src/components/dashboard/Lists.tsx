type Item = {
  initials: string;
  tone: string;
  title: string;
  subtitle: string;
  amount: string;
  date: string;
};

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${tone}`}
    >
      {initials}
    </div>
  );
}

export function ListCard({
  title,
  action,
  items,
  amountTone,
  dateTone,
}: {
  title: string;
  action: string;
  items: Item[];
  amountTone?: string;
  dateTone: string;
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <button className="text-[12px] font-medium text-info hover:underline">{action}</button>
      </div>
      <ul className="mt-2 divide-y divide-border">
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-3 py-3">
            <Avatar initials={item.initials} tone={item.tone} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{item.title}</p>
              <p className="truncate text-[12px] text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className="text-right">
              <p className={`text-[13px] font-semibold ${amountTone ?? ""}`}>{item.amount}</p>
              <p className={`text-[12px] ${dateTone}`}>{item.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const receitas: Item[] = [
  {
    initials: "AC",
    tone: "bg-info/15 text-info",
    title: "Agência Criativa LTDA",
    subtitle: "Projeto identidade visual",
    amount: "R$ 4.250,00",
    date: "08/05/2025",
  },
  {
    initials: "IS",
    tone: "bg-success/15 text-success",
    title: "Inova Soluções",
    subtitle: "Desenvolvimento de sistema",
    amount: "R$ 9.800,00",
    date: "07/05/2025",
  },
  {
    initials: "CP",
    tone: "bg-warning/15 text-warning",
    title: "Consultoria Premium",
    subtitle: "Consultoria financeira",
    amount: "R$ 2.750,00",
    date: "05/05/2025",
  },
  {
    initials: "DI",
    tone: "bg-destructive/15 text-destructive",
    title: "Design Inteligente",
    subtitle: "Landing page",
    amount: "R$ 1.950,00",
    date: "03/05/2025",
  },
];

export const despesas: Item[] = [
  {
    initials: "AW",
    tone: "bg-warning/15 text-warning",
    title: "AWS",
    subtitle: "Hospedagem",
    amount: "R$ 350,00",
    date: "09/05/2025",
  },
  {
    initials: "N",
    tone: "bg-secondary text-foreground",
    title: "Notion",
    subtitle: "Ferramenta de gestão",
    amount: "R$ 60,00",
    date: "08/05/2025",
  },
  {
    initials: "G",
    tone: "bg-info/15 text-info",
    title: "Google Workspace",
    subtitle: "Plano Business",
    amount: "R$ 56,00",
    date: "07/05/2025",
  },
  {
    initials: "C",
    tone: "bg-info/15 text-info",
    title: "Canva Pro",
    subtitle: "Assinatura anual",
    amount: "R$ 129,90",
    date: "03/05/2025",
  },
];
