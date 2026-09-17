import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Photo = { id: string; displayUrl: string; description: string | null };

export function PortfolioLightbox({ photos, index, onIndexChange, onClose }: { photos: Photo[]; index: number | null; onIndexChange: (index: number) => void; onClose: () => void }) {
  useEffect(() => {
    if (index === null) return;
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") onIndexChange((index + 1) % photos.length);
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [index, photos.length, onIndexChange]);

  const photo = index === null ? null : photos[index];
  return <Dialog open={index !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-w-5xl border-0 bg-foreground p-2 text-background">
      <DialogTitle className="sr-only">Imagem ampliada do portfólio</DialogTitle>
      <DialogDescription className="sr-only">Use as setas para navegar pelas imagens.</DialogDescription>
      {photo ? <div className="relative flex min-h-[55vh] items-center justify-center">
        <img src={photo.displayUrl} alt={photo.description || "Trabalho do fornecedor"} className="max-h-[78vh] max-w-full object-contain" />
        {photos.length > 1 ? <>
          <Button variant="secondary" size="icon" aria-label="Imagem anterior" className="absolute left-3" onClick={() => onIndexChange((index as number) === 0 ? photos.length - 1 : (index as number) - 1)}><ChevronLeft /></Button>
          <Button variant="secondary" size="icon" aria-label="Próxima imagem" className="absolute right-3" onClick={() => onIndexChange(((index as number) + 1) % photos.length)}><ChevronRight /></Button>
        </> : null}
        {photo.description ? <p className="absolute bottom-3 left-3 right-3 bg-foreground/80 p-3 text-center text-sm text-background">{photo.description}</p> : null}
      </div> : null}
    </DialogContent>
  </Dialog>;
}