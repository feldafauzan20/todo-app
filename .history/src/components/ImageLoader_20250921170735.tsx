"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

type ImageLoaderProps = Omit<ImageProps, "onLoadingComplete"> & {
  src: string;
  alt: string;
};

export default function ImageLoader({ src, alt, ...props }: ImageLoaderProps) {
  const [isLoading, setLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
      )}
      <Image
        src={src}
        alt={alt}
        {...props}
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  );
}
