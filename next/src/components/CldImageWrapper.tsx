'use client';
import { CldImage } from 'next-cloudinary';

interface CldImageWrapperProps {
  publicId: string;
  width: number;
  height: number;
  alt: string;
  lqip: string;
  sizes?: string;
  className?: string;
}

export function CldImageWrapper({
  publicId,
  width,
  height,
  alt,
  lqip,
  sizes,
  className,
}: CldImageWrapperProps) {
  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      alt={alt}
      sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
      placeholder="blur"
      blurDataURL={lqip}
      className={className}
    />
  );
}
