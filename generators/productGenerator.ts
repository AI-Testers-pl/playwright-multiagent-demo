import type { ProductInput } from '../types/product';

export const createAdminProductInput = (suffix = Date.now().toString()): ProductInput => ({
  name: `Admin UI Product ${suffix}`,
  description: `Disposable product created by admin UI test ${suffix}`,
  price: 19.99,
  stockQuantity: 7,
  category: 'Automation',
  imageUrl: 'https://placehold.co/300x300'
});
