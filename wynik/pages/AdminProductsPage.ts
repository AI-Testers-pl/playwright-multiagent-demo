import { expect, type Locator, type Page } from '@playwright/test';
import type { Product } from '../types/product';
import { BasePage } from './BasePage';

export class AdminProductsPage extends BasePage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly addNewProductLink: Locator;
  readonly productTable: Locator;

  constructor(page: Page) {
    super(page, '/admin/products');
    this.pageRoot = this.byTestId('admin-products-page');
    this.title = this.byTestId('admin-product-list-title');
    this.addNewProductLink = this.byTestId('admin-product-list-add-new');
    this.productTable = this.byTestId('admin-product-list-table');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.title).toHaveText('Manage Products');
    await expect(this.addNewProductLink).toBeVisible();
    await expect(this.productTable).toBeVisible();
  }

  async openNewProductForm() {
    await this.addNewProductLink.click();
  }

  productRow(product: Product) {
    return this.byTestId(`admin-product-row-${product.id}`);
  }

  async editProduct(product: Product) {
    await this.byTestId(`admin-product-edit-${product.id}`).click();
  }

  async deleteProduct(product: Product) {
    this.page.once('dialog', dialog => dialog.accept());
    await this.byTestId(`admin-product-delete-${product.id}`).click();
  }

  async verifyProductRow(product: Product) {
    await expect(this.productRow(product)).toBeVisible();
    await expect(this.byTestId(`admin-product-name-${product.id}`)).toHaveText(product.name);
    await expect(this.byTestId(`admin-product-price-${product.id}`)).toHaveText(this.formatPrice(product.price));
    await expect(this.byTestId(`admin-product-stock-${product.id}`)).toHaveText(String(product.stockQuantity));
    await expect(this.byTestId(`admin-product-category-${product.id}`)).toHaveText(product.category);
    await expect(this.byTestId(`admin-product-image-${product.id}`)).toHaveAttribute('alt', product.name);
  }

  async verifyProductAbsent(product: Product) {
    await expect(this.productRow(product)).toBeHidden();
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
