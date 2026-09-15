import { useState } from 'react';

export function ProductImage({ src, alt, className, loading }: {
  src: string; alt: string; className?: string; loading?: 'lazy' | 'eager';
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = src && failedSource !== src ? src : '/product-placeholder.svg';
  return <img src={source} alt={alt} className={className} loading={loading}
    onError={source === '/product-placeholder.svg' ? undefined : () => setFailedSource(src)}/>;
}
