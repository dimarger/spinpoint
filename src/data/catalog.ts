import { catalogSchema } from '../types/catalog';
import products from './products.json';
export const initialCatalog = catalogSchema.parse(products);
