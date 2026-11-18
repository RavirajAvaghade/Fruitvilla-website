import { useEffect, useState } from 'react';
import { FALLBACK_IMAGE, backupForKey, resolveBackupImage, resolveImage, imageForKey } from '../data/images';

// Image that never shows a broken icon: primary -> backup remote photo -> inline SVG placeholder.
export default function FruitImage({ product, imageKey, alt, className = '', eager = false }) {
  const primary = product ? resolveImage(product) : imageForKey(imageKey);
  const backup = product ? resolveBackupImage(product) : backupForKey(imageKey);
  const [src, setSrc] = useState(primary);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setSrc(primary);
    setStage(0);
  }, [primary]);

  function handleError() {
    if (stage === 0 && backup && backup !== src) {
      setStage(1);
      setSrc(backup);
    } else if (src !== FALLBACK_IMAGE) {
      setStage(2);
      setSrc(FALLBACK_IMAGE);
    }
  }

  return (
    <img
      className={`fruit-img ${className}`}
      src={src}
      alt={alt || (product ? product.name : 'Fresh fruit')}
      loading={eager ? 'eager' : 'lazy'}
      onError={handleError}
      draggable="false"
    />
  );
}
