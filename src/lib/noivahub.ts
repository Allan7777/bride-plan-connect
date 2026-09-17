export const PRICE_BRL = "R$ 10,90";

export const TASK_STATUS_LABELS: Record<string, string> = {
  nao_iniciado: "Não iniciado",
  pesquisando: "Pesquisando",
  contato: "Entrei em contato",
  negociacao: "Em negociação",
  contratado: "Contratado",
};

export const TASK_STATUS_ORDER = [
  "nao_iniciado",
  "pesquisando",
  "contato",
  "negociacao",
  "contratado",
] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  contatado: "Contatado",
  negociacao: "Em negociação",
  fechado: "Fechado",
  perdido: "Perdido",
};

export const VENDOR_STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  suspenso: "Suspenso",
};

export const UF = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function brl(value?: number | null) {
  if (value === null || value === undefined) return "Sob consulta";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function daysUntil(date?: string | null) {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function vendorPriceLabel(priceFrom?: number | null) {
  return priceFrom == null ? "Consulte o fornecedor" : `A partir de ${brl(priceFrom)}`;
}
