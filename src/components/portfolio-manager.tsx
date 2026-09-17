import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { PORTFOLIO_ACCEPTED_TYPES, PORTFOLIO_BUCKET, PORTFOLIO_MAX_FILE_BYTES } from "@/lib/vendor-portfolio";

export function PortfolioManager({ vendorId, userId, limit }: { vendorId: string; userId: string; limit: number }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { data: photos = [] } = useQuery({
    queryKey: ["portfolio-manager", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_photos").select("*").eq("vendor_id", vendorId).order("sort_order");
      if (error) throw error;
      return Promise.all((data ?? []).map(async (photo) => {
        if (!photo.storage_path) return { ...photo, displayUrl: photo.url };
        const { data: signed } = await supabase.storage.from(PORTFOLIO_BUCKET).createSignedUrl(photo.storage_path, 3600);
        return { ...photo, displayUrl: signed?.signedUrl ?? photo.url };
      }));
    },
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (photos.length + selected.length > limit) { toast.error(`Seu portfólio permite até ${limit} imagens.`); return; }
    const invalid = selected.find((file) => !PORTFOLIO_ACCEPTED_TYPES.includes(file.type) || file.size > PORTFOLIO_MAX_FILE_BYTES);
    if (invalid) { toast.error("Use apenas JPG, PNG ou WEBP com até 8 MB."); return; }
    setUploading(true);
    let order = photos.length;
    for (const file of selected) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${vendorId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from(PORTFOLIO_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) { toast.error(uploadError.message); continue; }
      const { data: publicData } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path);
      const { error: insertError } = await supabase.from("vendor_photos").insert({ vendor_id: vendorId, url: publicData.publicUrl, storage_path: path, sort_order: order, is_cover: photos.length === 0 && order === 0 });
      if (insertError) { await supabase.storage.from(PORTFOLIO_BUCKET).remove([path]); toast.error(insertError.message); continue; }
      order += 1;
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    await queryClient.invalidateQueries({ queryKey: ["portfolio-manager", vendorId] });
    toast.success("Portfólio atualizado.");
  }

  async function remove(photo: (typeof photos)[number]) {
    if (photo.storage_path) {
      const { error } = await supabase.storage.from(PORTFOLIO_BUCKET).remove([photo.storage_path]);
      if (error) { toast.error(error.message); return; }
    }
    const { error } = await supabase.from("vendor_photos").delete().eq("id", photo.id).eq("vendor_id", vendorId);
    if (error) { toast.error(error.message); return; }
    await queryClient.invalidateQueries({ queryKey: ["portfolio-manager", vendorId] });
  }

  async function setCover(photoId: string) {
    const currentCover = photos.find((photo) => photo.is_cover);
    if (currentCover && currentCover.id !== photoId) await supabase.from("vendor_photos").update({ is_cover: false }).eq("id", currentCover.id).eq("vendor_id", vendorId);
    const { error } = await supabase.from("vendor_photos").update({ is_cover: true }).eq("id", photoId).eq("vendor_id", vendorId);
    if (error) toast.error(error.message); else { toast.success("Foto de capa definida."); await queryClient.invalidateQueries({ queryKey: ["portfolio-manager", vendorId] }); }
  }

  async function move(index: number, direction: -1 | 1) {
    const otherIndex = index + direction;
    const current = photos[index]; const other = photos[otherIndex];
    if (!current || !other) return;
    const temporary = -Date.now();
    await supabase.from("vendor_photos").update({ sort_order: temporary }).eq("id", current.id).eq("vendor_id", vendorId);
    await supabase.from("vendor_photos").update({ sort_order: current.sort_order }).eq("id", other.id).eq("vendor_id", vendorId);
    await supabase.from("vendor_photos").update({ sort_order: other.sort_order }).eq("id", current.id).eq("vendor_id", vendorId);
    await queryClient.invalidateQueries({ queryKey: ["portfolio-manager", vendorId] });
  }

  async function describe(photoId: string, description: string) {
    const { error } = await supabase.from("vendor_photos").update({ description: description.trim().slice(0, 300) || null }).eq("id", photoId).eq("vendor_id", vendorId);
    if (error) toast.error(error.message);
  }

  return <section className="mt-10">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="font-display text-3xl">Meu Portfólio</h2><p className="mt-1 text-sm text-muted-foreground">{photos.length} de {limit} imagens</p></div>
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={uploading || photos.length >= limit}><ImagePlus className="mr-2 size-4" />{uploading ? "Enviando..." : "Adicionar trabalho"}</Button>
      <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => upload(event.target.files)} />
    </div>
    {photos.length ? <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
      {photos.map((photo, index) => <article key={photo.id} className="surface overflow-hidden">
        <div className="relative aspect-square bg-muted"><img src={photo.displayUrl} alt={photo.description || "Trabalho do fornecedor"} className="size-full object-cover" />{photo.is_cover ? <span className="absolute left-2 top-2 rounded-md bg-background/95 px-2 py-1 text-xs font-medium"><Star className="mr-1 inline size-3 fill-gold text-gold" />Capa</span> : null}</div>
        <div className="space-y-3 p-3"><Input defaultValue={photo.description ?? ""} maxLength={300} placeholder="Descrição opcional" onBlur={(event) => describe(photo.id, event.target.value)} /><div className="flex flex-wrap gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Mover para cima" title="Mover para cima" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button><Button type="button" size="icon" variant="ghost" aria-label="Mover para baixo" title="Mover para baixo" disabled={index === photos.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button><Button type="button" size="icon" variant="ghost" aria-label="Definir como capa" title="Definir como capa" disabled={photo.is_cover} onClick={() => setCover(photo.id)}><Star /></Button><Button type="button" size="icon" variant="ghost" aria-label="Excluir imagem" title="Excluir imagem" onClick={() => remove(photo)}><Trash2 className="text-destructive" /></Button></div></div>
      </article>)}
    </div> : <div className="mt-5 border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Adicione seus melhores trabalhos para transformar seu perfil em uma vitrine.</div>}
  </section>;
}