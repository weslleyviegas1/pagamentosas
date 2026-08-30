const vencimentos = [
  {
    initials: "AC",
    tone: "bg-info/15 text-info",
    title: "Agência Criativa LTDA",
    subtitle: "Desenvolvimento de site",
    amount: "R$ 3.750,00",
    date: "15/05/2025",
    dateTone: "text-destructive",
    badge: "Vence hoje",
    badgeTone: "bg-destructive text-destructive-foreground",
  },
  {
    initials: "IN",
    tone: "bg-info/15 text-info",
    title: "Inova Soluções",
    subtitle: "Manutenção mensal",
    amount: "R$ 1.250,00",
    date: "18/05/2025",
    dateTone: "text-warning",
    badge: "Em 3 dias",
    badgeTone: "bg-warning text-warning-foreground",
  },
  {
    initials: "DO",
    tone: "bg-info/15 text-info",
    title: "Domínio & Cia",
    subtitle: "Hospedagem e domínio",
    amount: "R$ 480,00",
    date: "20/05/2025",
    dateTone: "text-muted-foreground",
    badge: "Em 5 dias",
    badgeTone: "bg-secondary text-foreground",
  },
  {
    initials: "MA",
    tone: "bg-info/15 text-info",
    title: "Marketing Digital PRO",
    subtitle: "Gestão de tráfego",
    amount: "R$ 2.980,00",
    date: "25/05/2025",
    dateTone: "text-muted-foreground",
    badge: "Em 10 dias",
    badgeTone: "bg-secondary text-foreground",
  },
];

export function Upcoming() {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Próximos vencimentos</h2>
        <button className="rounded-md bg-secondary px-2.5 py-1 text-[12px] font-medium text-info hover:underline">
          Ver todas
        </button>
      </div>
      <ul className="mt-2 divide-y divide-border">
        {vencimentos.map((v) => (
          <li key={v.title} className="flex items-center gap-3 py-3.5">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${v.tone}`}
            >
              {v.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{v.title}</p>
              <p className="truncate text-[12px] text-muted-foreground">{v.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground">{v.amount}</p>
              <p className={`text-[12px] font-medium ${v.dateTone}`}>{v.date}</p>
            </div>
            <span
              className={`ml-1 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${v.badgeTone}`}
            >
              {v.badge}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CashSummary() {
  const rows = [
    { label: "Saldo inicial", value: "R$ 15.200,00", tone: "" },
    { label: "Entradas", value: "R$ 58.750,00", tone: "text-success" },
    { label: "Saídas", value: "- R$ 18.230,00", tone: "text-destructive" },
  ];

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Resumo do fluxo de caixa</h2>
        <button className="text-[12px] font-medium text-info hover:underline">Ver relatório</button>
      </div>
      <ul className="mt-3 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between py-3.5 text-[13px]">
            <span className="text-muted-foreground">{r.label}</span>
            <span className={`font-medium ${r.tone}`}>{r.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-[15px] font-semibold">Saldo final</p>
          <p className="text-[12px] text-muted-foreground">(Este mês)</p>
        </div>
        <p className="text-xl font-bold">R$ 55.720,00</p>
      </div>
    </div>
  );
}
