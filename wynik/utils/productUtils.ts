import type { Product } from '../types/product';

type SortDirection = 'asc' | 'desc';

export const compareProductsByName = (direction: SortDirection) => (first: Product, second: Product) => {
  const comparison = first.name.localeCompare(second.name);

  return direction === 'asc' ? comparison : -comparison;
};

export const compareProductsByPrice = (direction: SortDirection) => (first: Product, second: Product) => {
  const comparison = first.price - second.price;

  return direction === 'asc' ? comparison : -comparison;
};

export const sortProductsByName = (products: Product[], direction: SortDirection) =>
  [...products].sort(compareProductsByName(direction));

export const sortProductsByPrice = (products: Product[], direction: SortDirection) =>
  [...products].sort(compareProductsByPrice(direction));

export const getMatchingProducts = (products: Product[], searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.toLowerCase();

  return products.filter(product =>
    product.name.toLowerCase().includes(normalizedSearchTerm) ||
    product.description.toLowerCase().includes(normalizedSearchTerm) ||
    product.category.toLowerCase().includes(normalizedSearchTerm)
  );
};

export const getCategoryWithMultipleProducts = (products: Product[]) => {
  const categories = products.map(product => product.category);

  return categories.find(category =>
    products.filter(product => product.category === category).length > 1
  ) ?? categories[0];
};
