type PlaceholderImageProps = {
  n: number;
  className?: string;
};

/**
 * Stand-in for a real image/logo asset that hasn't been uploaded yet.
 * Numbered so it's obvious at a glance which CMS entry still needs real media.
 */
export default function PlaceholderImage({ n, className = "" }: PlaceholderImageProps) {
  return (
    <div
      className={`flex items-center justify-center bg-[#c4c4c4] text-black/40 font-mono font-bold text-3xl select-none ${className}`}
    >
      {String(n).padStart(2, "0")}
    </div>
  );
}
