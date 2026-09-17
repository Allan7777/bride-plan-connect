import type { Json } from "@/integrations/supabase/types";

export const PORTFOLIO_BUCKET = "vendor-portfolios";
export const PORTFOLIO_MAX_FILE_BYTES = 8 * 1024 * 1024;
export const PORTFOLIO_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá! Encontrei seu trabalho pelo NoivaHub e gostaria de consultar os valores e condições para o meu casamento. Poderia me enviar um orçamento?";

export type WorkBlock = {
  type: "paragraph" | "list";
  text: string;
  bold?: boolean;
};

export function parseWorkBlocks(value: Json | null | undefined): WorkBlock[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const blocks = "blocks" in value && Array.isArray(value.blocks) ? value.blocks : [];
  return blocks.flatMap((block) => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return [];
    const text = typeof block.text === "string" ? block.text.trim().slice(0, 600) : "";
    if (!text) return [];
    return [{
      type: block.type === "list" ? "list" : "paragraph",
      text,
      bold: block.bold === true,
    } satisfies WorkBlock];
  }).slice(0, 20);
}

export function serializeWorkBlocks(blocks: WorkBlock[]): Json {
  return { blocks: blocks.map((block) => ({ ...block, text: block.text.trim().slice(0, 600) })) };
}

export function normalizeBrazilianWhatsapp(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("55")) digits = `55${digits}`;
  return /^55[1-9][0-9]{9,10}$/.test(digits) ? digits : null;
}

export function formatWeddingDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}