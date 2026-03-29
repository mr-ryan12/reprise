import { Link } from "react-router";
import { Heart } from "lucide-react";
import { AlbumCover } from "~/components/album-cover";

interface ShowCardProps {
  show: {
    id: string;
    date: string;
    tourName: string | null;
    venue: { name: string; city: string; state: string };
    albumCoverUrl: string | null;
  };
  isFavorited?: boolean;
  linkTo: string;
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ShowCard({ show, isFavorited, linkTo }: ShowCardProps) {
  return (
    <Link
      to={linkTo}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
    >
      <AlbumCover
        src={show.albumCoverUrl}
        alt={`${formatDate(show.date)} album cover`}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold leading-snug tracking-tight">
          {formatDate(show.date)}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground/80">
          {show.venue.name}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {show.venue.city}, {show.venue.state}
          {show.tourName && (
            <span className="ml-1.5 text-muted-foreground/60">
              &middot; {show.tourName}
            </span>
          )}
        </p>
      </div>
      {isFavorited && (
        <Heart className="size-4 shrink-0 fill-red-500 text-red-500" />
      )}
    </Link>
  );
}
