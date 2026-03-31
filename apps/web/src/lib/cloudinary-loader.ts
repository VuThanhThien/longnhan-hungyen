// next/image custom loader for Cloudinary CDN
// Applies auto-format, auto-quality, and responsive width transforms

interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: CloudinaryLoaderParams): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || 'demo';
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality ?? 'auto'}`];
  // src may already be a full Cloudinary URL or just a public_id
  if (src.startsWith('http')) {
    return src;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(',')}/${src}`;
}
