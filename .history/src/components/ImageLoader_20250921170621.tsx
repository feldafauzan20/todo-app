"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function ImageLoader({ src, alt, ...props }) {
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