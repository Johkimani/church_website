interface MarianImageProps {
  src: string;
  alt?: string;
  caption?: string;
  size?: number;
  className?: string;
  href?: string;
}

/**
 * A framed image of the Blessed Virgin Mary used across the Devotions section
 * and other pages. Renders a gold-ringed rounded figure with an optional
 * caption and (when `href` is provided) wraps the figure in a link.
 */
export default function MarianImage({
  src,
  alt = "The Blessed Virgin Mary",
  caption,
  size = 120,
  className = "",
  href,
}: MarianImageProps) {
  const frame = (
    <figure className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="rounded-2xl overflow-hidden shrink-0"
        style={{
          width: size,
          height: size,
          padding: 4,
          background: "linear-gradient(135deg, #FFFFFF, #FDF6EC)",
          border: "3px solid rgba(217,119,6,0.4)",
          boxShadow: "0 14px 30px rgba(217,119,6,0.22), 0 4px 14px rgba(28,25,23,0.12)",
        }}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover rounded-xl block"
        />
      </div>
      {caption && (
        <figcaption
          className="text-[10px] font-bold tracking-[0.18em] uppercase text-center"
          style={{ color: "#B45309" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );

  if (href) {
    return (
      <a
        href={href}
        className="inline-flex hover:scale-105 transition-transform duration-200"
        title={caption || alt}
      >
        {frame}
      </a>
    );
  }

  return frame;
}
