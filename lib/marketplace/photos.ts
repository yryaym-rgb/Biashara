const LISTING_PHOTOS_BUCKET = 'listing-photos';

export function getListingPhotoPublicUrl(storagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return '';
  }
  const normalizedPath = storagePath.replace(/^\//, '');
  return `${baseUrl}/storage/v1/object/public/${LISTING_PHOTOS_BUCKET}/${normalizedPath}`;
}

export { LISTING_PHOTOS_BUCKET };
