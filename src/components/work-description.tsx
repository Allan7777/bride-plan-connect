import type { Json } from "@/integrations/supabase/types";
import { parseWorkBlocks } from "@/lib/vendor-portfolio";

export function WorkDescription({ value }: { value: Json | null | undefined }) {
  const blocks = parseWorkBlocks(value);
  if (!blocks.length) return null;
  return <div className="space-y-3 text-muted-foreground">
    {blocks.map((block, index) => block.type === "list"
      ? <ul key={index} className="ml-5 list-disc"><li className={block.bold ? "font-semibold text-foreground" : ""}>{block.text}</li></ul>
      : <p key={index} className={block.bold ? "font-semibold text-foreground" : ""}>{block.text}</p>)}
  </div>;
}