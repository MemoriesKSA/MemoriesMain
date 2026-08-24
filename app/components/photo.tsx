"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useState } from "react";

/**
 * A photograph that degrades into something designed when the file is not
 * there yet.
 *
 * A country card is a full-bleed photo with the name written over it, so a
 * country without photography had only two possible states: a broken tile, or
 * being hidden from the catalogue entirely. We chose hidden, which is how
 * Malaysia, Georgia and Russia ended up invisible on the destinations page
 * while being three of the countries we can actually plan in full, and France,
 * which we cannot plan at all, sat there looking available.
 *
 * With a real fallback there is a third state, so a destination can be listed
 * honestly while its photograph is still being made. The moment the file lands
 * at the same path this starts showing it, with no code change.
 *
 * Client-side on purpose: checking the filesystem would work in the server
 * components but not in the catalogue, which is a client component, and one
 * behaviour everywhere beats two that can drift.
 */
export function Photo({
  src,
  alt,
  fill = true,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`photoPending ${className ?? ""}`.trim()} role="img" aria-label={alt}>
        <Camera aria-hidden="true" />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
