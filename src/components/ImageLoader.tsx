"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Loader } from "lucide-react";

type ImageLoaderProps = Omit<ImageProps, "onLoadingComplete"> & {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
};

export default function ImageLoader({
  src,
  alt,
  fallback,
  ...props
}: ImageLoaderProps) {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {fallback || (
            <Loader className="h-6 w-6 animate-spin text-gray-400" />
          )}
        </div>
      )}

      {!error ? (
        <Image
          src={src}
          alt={alt}
          {...props}
          onLoadingComplete={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 p-4 text-sm text-gray-500">
          Failed to load image
        </div>
      )}
    </div>
  );
}
