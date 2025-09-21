"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

type ImageWithFallbackProps = ImageProps & {
  fallback?: React.ReactNode;
};

export default function ImageWithFallback({
  fallback,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          {fallback || (
            <div className="text-sm text-gray-500">Loading image...</div>
          )}
        </div>
      )}

      {!error ? (
        <Image
          alt={alt}
          {...props}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
}
