export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export function catalogImageUrl(imagePath: string) {
  return assetUrl(imagePath);
}
