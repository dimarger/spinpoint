import { z } from 'zod';
export const categories = [
  'rubbers',
  'blades',
  'rackets',
  'cleaners',
  'cases',
  'balls',
  'accessories',
] as const;
export type Category = (typeof categories)[number];
export const wholesaleThresholds = [3, 5, 10] as const;
const wholesalePrice = z
  .number()
  .finite()
  .positive()
  .max(1000000)
  .multipleOf(0.01)
  .nullable()
  .optional();
export const wholesalePricesSchema = z.object({
  '3': wholesalePrice,
  '5': wholesalePrice,
  '10': wholesalePrice,
});
const imageSchema = z
  .string()
  .refine(
    (v) => v === '' || /^https:\/\//.test(v) || /^images\/[a-zA-Z0-9/_.-]+$/.test(v),
    'Використовуйте HTTPS або images/filename.webp'
  );
export const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(160),
  brand: z.string().min(1).max(60),
  category: z.enum(categories),
  price: z.number().finite().nonnegative().max(1000000),
  priceEstimated: z.boolean().optional(),
  wholesalePrices: wholesalePricesSchema.default({}),
  status: z.enum(['preorder', 'available', 'unavailable']),
  leadTime: z.string().trim().min(1).max(120).default('20–30 днів'),
  description: z.string().max(5000),
  summary: z.string().max(160).optional(),
  bestFor: z.string().max(900).optional(),
  highlights: z.array(z.string().max(200)).max(6).optional(),
  selectionNote: z.string().max(1200).optional(),
  care: z.string().max(1200).optional(),
  variants: z.array(z.string().min(1).max(120)).min(1).max(30),
  specs: z.record(z.string(), z.string()),
  popular: z.boolean(),
  isNew: z.boolean(),
  image: imageSchema,
  gallery: z.array(imageSchema).max(8).optional(),
  accessoryType: z.enum(['tape', 'glue', 'film', 'other']).optional(),
  demo: z.boolean(),
  addedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type Product = z.infer<typeof productSchema>;
export const catalogSchema = z
  .array(productSchema)
  .min(1)
  .max(1000)
  .superRefine((p, ctx) => {
    if (new Set(p.map((x) => x.id)).size !== p.length)
      ctx.addIssue({ code: 'custom', message: 'ID товарів мають бути унікальними' });
  });
export interface CartItem {
  key: string;
  productId: string;
  variant: string;
  quantity: number;
  group?: string;
}
export interface CheckoutDetails {
  name: string;
  contact: string;
  city: string;
  delivery: string;
  comment: string;
}
