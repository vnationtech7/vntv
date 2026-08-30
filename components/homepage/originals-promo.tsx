import Link from "next/link";
import { Play } from "lucide-react";
import Image from "next/image";

interface OriginalsPromoProps {
  title?: string;
  description?: string;
  ctaText?: string;
  imageUrl?: string;
}

export function OriginalsPromo({
  title = "VNTV Originals",
  description = "Exclusive content you won't find anywhere else. Stories that matter, told our way.",
  ctaText = "Watch Now",
  imageUrl,
}: OriginalsPromoProps) {
  return (
    <section className="py-8">
      <Link
        href="/originals"
        className="group relative block overflow-hidden rounded-lg border border-[--border] bg-gradient-to-br from-[#1c0d10] to-[--bg] h-[280px] transition-transform hover:scale-[1.02]"
      >
        {/* Background Image with Overlay */}
        {imageUrl && (
          <>
            <div className="absolute inset-0 opacity-35">
              <Image
                src={imageUrl}
                alt="VNTV Originals"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
          {/* Label */}
          <div className="mb-4">
            <span className="text-xs font-extrabold tracking-[2px] text-[--muted]">
              EXCLUSIVE <span className="text-[--red]">SERIES</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3 max-w-lg">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[--muted] mb-6 max-w-md leading-relaxed">
            {description}
          </p>

          {/* CTA Button */}
          <div className="inline-flex items-center gap-2 bg-[--red] text-white text-xs font-extrabold tracking-wide px-5 py-3 rounded-md w-fit transition-colors group-hover:bg-[#c11026]">
            <Play className="w-4 h-4" fill="currentColor" />
            {ctaText}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-6 right-6 w-16 h-16 border-2 border-[--red]/30 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
          <Play className="w-8 h-8 text-[--red]" fill="currentColor" />
        </div>
      </Link>
    </section>
  );
}
