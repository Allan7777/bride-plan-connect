import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/noivahub";
import { cn } from "@/lib/utils";

export type VendorCardData = {
  id: string;
  slug: string;
  company_name: string;
  city: string | null;
  state: string | null;
  price_from: number | null;
  rating: number;
  reviews_count: number;
  cover_url: string | null;
  categories?: { name: string; emoji: string } | null;
};

export function VendorCard({
  vendor,
  favorited,
  onToggleFavorite,
  selectable,
  selected,
  onToggleSelect,
}: {
  vendor: VendorCardData;
  favorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  return (
    <article className="surface group overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {vendor.cover_url ? (
          <img
            src={vendor.cover_url}
            alt={`Trabalho de ${vendor.company_name}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        {onToggleFavorite ? (
          <button
            type="button"
            aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
            onClick={() => onToggleFavorite(vendor.id)}
            className="absolute right-3 top-3 rounded-full bg-background/90 p-2 shadow-sm transition-transform hover:scale-110"
          >
            <Heart
              className={cn("size-4", favorited && "fill-destructive text-destructive")}
            />
          </button>
        ) : null}
      </div>
      <div className="space-y-2 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {vendor.categories ? `${vendor.categories.emoji} ${vendor.categories.name}` : "Fornecedor"}
        </p>
        <h3 className="font-display text-xl leading-tight">{vendor.company_name}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {vendor.city} - {vendor.state}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm">A partir de {brl(vendor.price_from)}</span>
          {vendor.reviews_count > 0 ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-3.5 fill-gold text-gold" />
              {vendor.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <div className="flex gap-2 pt-3">
          <Button asChild size="sm" className="flex-1">
            <Link to="/fornecedor/$slug" params={{ slug: vendor.slug }}>
              Ver perfil
            </Link>
          </Button>
          {selectable ? (
            <Button
              size="sm"
              variant={selected ? "default" : "outline"}
              onClick={() => onToggleSelect?.(vendor.id)}
            >
              {selected ? "Comparando" : "Comparar"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
