const SIZES = {
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-24 h-24 sm:w-28 sm:h-28 text-3xl",
};

export default function Avatar({ url, name, size = "md", className = "" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className={`${SIZES[size]} flex-shrink-0 overflow-hidden rounded-full border border-border bg-surface-2 ${className}`}>
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center font-display font-bold text-subtle" aria-hidden="true">
          {initial}
        </div>
      )}
    </div>
  );
}
