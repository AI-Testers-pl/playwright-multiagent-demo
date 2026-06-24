import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedInHeader } from '../components/LoggedInHeader';
import { ToastAlert } from '../components/ToastAlert';
import type { Product } from '../types/product';

export type ProductSortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export class ProductsPage extends BasePage {
  readonly header: LoggedInHeader;
  readonly toast: ToastAlert;
  readonly productsPage: Locator;
  readonly title: Locator;
  readonly countSummary: Locator;
  readonly categoriesContainer: Locator;
  readonly productListTitle: Locator;
  readonly productList: Locator;
  readonly searchInput: Locator;
  readonly sortSelect: Locator;
  readonly noProductsFound: Locator;
  readonly resetSearchButton: Locator;

  constructor(page: Page) {
    super(page, '/products');
    this.header = new LoggedInHeader(page);
    this.toast = new ToastAlert(page);
    this.productsPage = this.byTestId('products-page');
    this.title = this.byTestId('products-title');
    this.countSummary = this.byTestId('products-count-summary');
    this.categoriesContainer = this.byTestId('products-categories-container');
    this.productListTitle = this.byTestId('product-list-title');
    this.productList = this.byTestId('product-list');
    this.searchInput = this.byTestId('product-search');
    this.sortSelect = this.byTestId('product-sort');
    this.noProductsFound = this.page.getByText('No products found');
    this.resetSearchButton = this.byTestId('reset-search-button');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.productsPage).toBeVisible();
    await expect(this.title).toHaveText('Products');
    await expect(this.countSummary).toBeVisible();
    await expect(this.categoriesContainer).toBeVisible();
  }

  productCards() {
    return this.productList.getByTestId('product-item');
  }

  productCardByName(name: string) {
    return this.productCards().filter({ hasText: name });
  }

  categoryButton(category: string) {
    return this.byTestId(`products-category-${category.toLowerCase().replace(/\s+/g, '-')}`);
  }

  async verifyCatalogSummary(products: Product[]) {
    const categoryCount = new Set(products.map(product => product.category)).size;

    await expect(this.countSummary).toHaveText(`${products.length} products across ${categoryCount} categories`);
  }

  async verifyProductCards(products: Product[]) {
    await expect(this.productCards()).toHaveCount(products.length);

    for (const product of products) {
      await this.verifyProductCard(product);
    }
  }

  async verifyProductCard(product: Product) {
    const card = this.productCardByName(product.name);

    await expect(card).toBeVisible();
    await expect(card.getByTestId('product-name')).toHaveText(product.name);
    await expect(card.getByTestId('product-price')).toHaveText(this.formatPrice(product.price));
    await expect(card.getByTestId('product-category')).toHaveText(product.category);
    await expect(card.getByTestId('product-description')).toHaveText(product.description);
    await expect(card.getByTestId('product-image')).toHaveAttribute('alt', product.name);
    await expect(card.getByTestId('product-quantity-value')).toHaveText('1');
    await expect(card.getByTestId('product-add-button')).toBeVisible();
  }

  async filterByCategory(category: string) {
    await this.categoryButton(category).click();
  }

  async searchFor(term: string) {
    await this.searchInput.fill(term);
  }

  async sortBy(option: ProductSortOption) {
    await this.sortSelect.selectOption(option);
  }

  async visibleProductNames() {
    return this.productCards().getByTestId('product-name').allTextContents();
  }

  async visibleProductPrices() {
    const prices = await this.productCards().getByTestId('product-price').allTextContents();

    return prices.map(price => Number(price.replace(/[$,]/g, '')));
  }

  async openProduct(name: string) {
    await this.productCardByName(name).click();
  }

  async addProductToCartFromList(name: string, quantity = 1) {
    const card = this.productCardByName(name);

    for (let currentQuantity = 1; currentQuantity < quantity; currentQuantity += 1) {
      await card.getByTestId('product-increase-quantity').click();
    }

    await card.getByTestId('product-add-button').click();
  }

  async verifyNoProductsFound() {
    await expect(this.noProductsFound).toBeVisible();
    await expect(this.resetSearchButton).toBeVisible();
    await expect(this.productCards()).toHaveCount(0);
  }

  async verifyProductAddedToCart(product: Product, quantity: number) {
    await this.header.verifyCartQuantity(quantity);
    await this.toast.verifyAlert('Added to cart', this.productAddedToCartMessage(product, quantity));
  }

  private productAddedToCartMessage(product: Product, quantity: number) {
    return `${quantity} \u00d7 ${product.name} added to your cart`;
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
