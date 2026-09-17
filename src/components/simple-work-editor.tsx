import { Bold, List, Pilcrow, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import type { WorkBlock } from "@/lib/vendor-portfolio";

export function SimpleWorkEditor({ value, onChange }: { value: WorkBlock[]; onChange: (value: WorkBlock[]) => void }) {
  function update(index: number, patch: Partial<WorkBlock>) {
    onChange(value.map((block, current) => current === index ? { ...block, ...patch } : block));
  }

  return <div className="space-y-3">
    {value.map((block, index) => <div key={index} className="flex items-start gap-2">
      <div className="flex shrink-0 gap-1">
        <Toggle aria-label="Negrito" title="Negrito" pressed={!!block.bold} onPressedChange={(bold) => update(index, { bold })}><Bold /></Toggle>
        <Toggle aria-label="Lista" title="Lista" pressed={block.type === "list"} onPressedChange={(list) => update(index, { type: list ? "list" : "paragraph" })}>{block.type === "list" ? <List /> : <Pilcrow />}</Toggle>
      </div>
      <Input value={block.text} maxLength={600} placeholder={block.type === "list" ? "Item da lista" : "Escreva um parágrafo"} onChange={(event) => update(index, { text: event.target.value })} />
      <Button type="button" variant="ghost" size="icon" title="Remover trecho" aria-label="Remover trecho" onClick={() => onChange(value.filter((_, current) => current !== index))}><Trash2 className="size-4" /></Button>
    </div>)}
    <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { type: "paragraph", text: "" }])} disabled={value.length >= 20}>
      <Plus className="mr-2 size-4" /> Adicionar trecho
    </Button>
  </div>;
}