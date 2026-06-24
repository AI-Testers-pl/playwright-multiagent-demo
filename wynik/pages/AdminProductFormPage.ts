import { expect, type Locator, type Page } from '@playwright/test';
import type { Product, ProductInput } from '../types/product';
import { BasePage } from './BasePage';

type ProductFormMode = 'create' | 'edit';

export class AdminProductFormPage extends BasePage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly priceInput: Locator;
  readonly stockInput: Locator;
  readonly categoryInput: Locator;
  readonly imageInput: Locator;
  readonly submitButton: Locator;
  readonly nameError: Locator;
  readonly priceError: Locator;
  readonly stockError: Locator;
  readonly categoryError: Locator;

  constructor(page: Page) {
    super(page, '/admin/products/new');
    this.pageRoot = this.byTestId('admin-product-form-page');
    this.title = this.byTestId('admin-product-form-title');
    this.nameInput = this.byTestId('product-name-input');
    this.descriptionInput = this.byTestId('product-description-input');
    this.priceInput = this.byTestId('product-price-input');
    this.stockInput = this.byTestId('product-stock-input');
    this.categoryInput = this.byTestId('product-category-input');
    this.imageInput = this.byTestId('product-image-input');
    this.submitButton = this.byTestId('product-submit-button');
    this.nameError = this.byTestId('product-name-error');
    this.priceError = this.byTestId('product-price-error');
    this.stockError = this.byTestId('product-stock-error');
    this.categoryError = this.byTestId('product-category-error');
  }

  urlForProduct(product: Product) {
    return `${this.url.replace('/new', '')}/edit/${product.id}`;
  }

  async gotoProduct(product: Product) {
    await this.page.goto(this.urlForProduct(product), { waitUntil: 'domcontentloaded' });
  }

  async verifyLoaded(mode: ProductFormMode) {
    await expect(this.pageRoot).toBeVisible();
    await expect(this.title).toHaveText(mode === 'create' ? 'Add New Product' : 'Edit Product');
    await expect(this.submitButton).toHaveText(mode === 'create' ? 'Create Product' : 'Update Product');
  }

  async fillProduct(product: ProductInput) {
    await this.nameInput.fill(product.name);
    await this.descriptionInput.fill(product.description);
    await this.priceInput.fill(String(product.price));
    await this.stockInput.fill(String(product.stockQuantity));
    await this.categoryInput.fill(product.category);
    await this.imageInput.fill(product.imageUrl);
  }

  async submit() {
    await this.submitButton.click();
  }

  async verifyProductValues(product: ProductInput) {
    await expect(this.nameInput).toHaveValue(product.name);
    await expect(this.descriptionInput).toHaveValue(product.description);
    await expect(this.priceInput).toHaveValue(String(product.price));
    await expect(this.stockInput).toHaveValue(String(product.stockQuantity));
    await expect(this.categoryInput).toHaveValue(product.category);
    await expect(this.imageInput).toHaveValue(product.imageUrl);
  }

  async verifyRequiredFieldErrors() {
    await expect(this.nameError).toHaveText('Product name is required');
    await expect(this.priceError).toHaveText('Price is required');
    await expect(this.stockError).toHaveText('Stock quantity is required');
    await expect(this.categoryError).toHaveText('Category is required');
  }
}
