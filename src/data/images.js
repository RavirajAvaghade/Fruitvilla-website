// Image resolution for fruits.
//
// Local photographs (provided by the shop owner) live in src/assets/fruits/:
//   apple.jpg, banana.jpg, grapes.jpg, dalimb.jpg (pomegranate)
// They are picked up automatically if present. If a file is missing the app falls back
// to a remote photograph and finally to an inline SVG placeholder, so images never break.

const localFiles = import.meta.glob('../assets/fruits/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
});

function findLocal(baseName) {
  const wanted = baseName.toLowerCase();
  for (const [path, url] of Object.entries(localFiles)) {
    const file = path.split('/').pop().toLowerCase();
    const stem = file.replace(/\.[a-z]+$/, '');
    if (stem === wanted) return url;
  }
  return null;
}

const u = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// key -> { local file stem (optional), remote photograph }
const IMAGE_SOURCES = {
  apple: { local: 'apple', remote: u('photo-1560806887-1e4cd0b6cbd6') },
  banana: { local: 'banana', remote: u('photo-1571771894821-ce9b6c11b08e') },
  mango: { remote: u('photo-1553279768-865429fa0078') },
  grapes: { local: 'grapes', remote: u('photo-1537640538966-79f369143f8f') },
  orange: { remote: u('photo-1547514701-42782101795e') },
  pomegranate: { local: 'dalimb', remote: u('photo-1615485290382-441e4d049cb5') },
  watermelon: { remote: u('photo-1587049352846-4a222e784d38') },
  pineapple: { remote: u('photo-1550258987-190a2d41a8ba') },
};

// Inline SVG placeholder (data URI) used when no image can be displayed.
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e8f7ee"/><stop offset="1" stop-color="#fff4e0"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <circle cx="200" cy="165" r="62" fill="#1f8f4e" opacity=".9"/>
      <path d="M200 103c0-24 14-38 38-42-3 24-15 38-38 42z" fill="#f59e0b"/>
      <text x="200" y="268" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#166534">Fruivilla</text>
    </svg>`
  );

/** Returns the best-known image URL for a product (custom URL > local file > remote photo). */
export function resolveImage(product) {
  if (!product) return FALLBACK_IMAGE;
  if (product.image && product.image.trim()) return product.image.trim();
  const src = IMAGE_SOURCES[product.imageKey];
  if (src) return (src.local && findLocal(src.local)) || src.remote;
  return FALLBACK_IMAGE;
}

/** Secondary source (remote photo) tried if the primary URL fails to load. */
export function resolveBackupImage(product) {
  const src = product && IMAGE_SOURCES[product.imageKey];
  return src ? src.remote : null;
}

/** Image for a named key, used for hero collage etc. */
export function imageForKey(key) {
  return resolveImage({ imageKey: key });
}

export function backupForKey(key) {
  return resolveBackupImage({ imageKey: key });
}
