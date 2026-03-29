import { cn } from "~/lib/utils";

const DEFAULT_COVER = "/images/default-album-cover.svg";

const sizeClasses = {
  sm: "size-12",
  md: "size-20",
  lg: "size-40",
} as const;

interface AlbumCoverProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AlbumCover({
  src,
  alt,
  size = "sm",
  className,
}: AlbumCoverProps) {
  return (
    <img
      src={src ?? DEFAULT_COVER}
      alt={alt}
      loading="lazy"
      className={cn(
        "aspect-square shrink-0 rounded-md bg-muted object-cover",
        sizeClasses[size],
        className,
      )}
    />
  );
}
