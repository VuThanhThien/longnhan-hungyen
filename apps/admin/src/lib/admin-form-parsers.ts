interface ProductVariantInput {
  label: string;
  weightG?: number;
  price: number;
  stock: number;
  skuCode?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface ProductPayload {
  name: string;
  description?: string;
  summary?: string;
  descriptionHtml?: string;
  basePrice: number;
  images: string[];
  featuredImageUrl?: string;
  videoUrl?: string;
  category: string;
  active: boolean;
  variants: ProductVariantInput[];
}

export interface ArticlePayload {
  title: string;
  excerpt?: string;
  contentHtml: string;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  published?: boolean;
}

function toInt(raw: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseProductPayload(formData: FormData): ProductPayload {
  const images = String(formData.get('images') || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  let variants: ProductVariantInput[] = [];
  const variantsRaw = String(formData.get('variantsJson') || '[]');
  try {
    const parsed = JSON.parse(variantsRaw) as ProductVariantInput[];
    variants = Array.isArray(parsed) ? parsed : [];
  } catch {
    variants = [];
  }

  return {
    name: String(formData.get('name') || '').trim(),
    // Backward compatibility: if older forms still send `description`,
    // we forward it too (API maps it into `summary`).
    description: String(formData.get('description') || '').trim() || undefined,
    summary: String(formData.get('summary') || '').trim() || undefined,
    descriptionHtml: String(formData.get('descriptionHtml') || '').trim() || undefined,
    basePrice: toInt(formData.get('basePrice'), 0),
    category: String(formData.get('category') || '').trim(),
    featuredImageUrl: String(formData.get('featuredImageUrl') || '').trim() || undefined,
    videoUrl: String(formData.get('videoUrl') || '').trim() || undefined,
    active: String(formData.get('active') || '') === 'on',
    images,
    variants: variants
      .filter((variant) => variant.label.trim().length > 0)
      .map((variant, index) => ({
      label: variant.label.trim(),
      weightG: variant.weightG || undefined,
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
      skuCode: variant.skuCode || undefined,
      sortOrder: variant.sortOrder ?? index,
      active: variant.active ?? true,
    })),
  };
}

export function parseArticlePayload(formData: FormData): ArticlePayload {
  const tags = String(formData.get('tags') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const publish = String(formData.get('published') || '') === 'on';

  return {
    title: String(formData.get('title') || '').trim(),
    excerpt: String(formData.get('excerpt') || '').trim() || undefined,
    contentHtml: String(formData.get('contentHtml') || '').trim(),
    featuredImageUrl: String(formData.get('featuredImageUrl') || '').trim() || undefined,
    metaTitle: String(formData.get('metaTitle') || '').trim() || undefined,
    metaDescription: String(formData.get('metaDescription') || '').trim() || undefined,
    tags,
    published: publish,
  };
}
