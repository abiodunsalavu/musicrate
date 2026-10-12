import Link from "next/link";
import ScoreBadge from "./ScoreBadge";

// cover-first grid tile used for collections
export default function AlbumTile({ album, rating, review }) {
  return (
    <Link href={`/albums/${album.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2">
        {album.cover_url ? (
          <img
            src={album.cover_url}
            alt={album.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center p-3 text-center text-sm text-subtle">{album.title}</div>
        )}
        {rating != null && <ScoreBadge score={rating} size="sm" className="absolute right-2 top-2 shadow-md" />}
      </div>
      <h3 className="mt-2.5 truncate font-sans text-sm font-semibold tracking-normal group-hover:text-accent-text">{album.title}</h3>
      <p className="truncate text-sm text-muted">
        {album.artist}
        {album.year ? ` · ${album.year}` : ""}
      </p>
      {review && <p className="mt-1 line-clamp-2 text-sm italic text-subtle">&ldquo;{review}&rdquo;</p>}
    </Link>
  );
}
