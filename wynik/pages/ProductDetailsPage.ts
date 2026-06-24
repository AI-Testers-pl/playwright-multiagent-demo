import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedInHeader } from '../components/LoggedInHeader';
import { ToastAlert } from '../components/ToastAlert';
import type { Product } from '../types/product';

export class ProductDetailsPage extends BasePage {
  readonly header: LoggedInHeader;
  readonly toast: ToastAlert;
  readonly productDetailsPage: Locator;
  readonly backLink: Locator;
  readonly image: Locator;
  readonly title: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly category: Locator;
  readonly stock: Locator;
  readonly quantityValue: Locator;
  readonly decreaseQuantityButton: Locator;
  readonly increaseQuantityButton: Locator;
  readonly addToCartButton: Locator;
  readonly removeFromCartButton: Locator;
  readonly updateCartButton: Locator;

  constructor(page: Page) {
    super(page, '/products');
    this.header = new LoggedInHeader(page);
    this.toast = new ToastAlert(page);
    this.productDetailsPage = this.byTestId('product-details-page');
    this.backLink = this.byTestId('product-back-link');
    this.image = this.byTestId('product-image');
    this.title = this.byTestId('product-title');
    this.price = this.byTestId('product-price');
    this.description = this.byTestId('product-description');
    this.category = this.byTestId('product-category');
    this.stock = this.byTestId('product-stock');
    this.quantityValue = this.byTestId('quantity-value');
    this.decreaseQuantityButton = this.byTestId('decrease-quantity');
    this.increaseQuantityButton = this.byTestId('increase-quantity');
    this.addToCartButton = this.byTestId('add-to-cart');
    this.removeFromCartButton = this.page.getByRole('button', { name: 'Remove from Cart' });
    this.updateCartButton = this.page.getByRole('button', { name: 'Update Cart' });
  }

  async gotoProduct(product: Product) {
    await this.page.goto(this.urlFor(product), { waitUntil: 'domcontentloaded' });
  }

  async verifyLoaded(product: Product) {
    await expect(this.page).toHaveURL(this.urlFor(product));
    await expect(this.productDetailsPage).toBeVisible();
    await expect(this.backLink).toBeVisible();
    await expect(this.title).toHaveText(product.name);
    await expect(this.price).toHaveText(this.formatPrice(product.price));
    await expect(this.description).toHaveText(product.description);
    await expect(this.category).toHaveText(product.category);
    await expect(this.stock).toHaveText(`${product.stockQuantity} in stock`);
    await expect(this.image).toHaveAttribute('alt', product.name);
  }

  async setQuantity(quantity: number) {
    await expect(this.quantityValue).toHaveText('1');

    for (let currentQuantity = 1; currentQuantity < quantity; currentQuantity += 1) {
      await this.increaseQuantityButton.click();
    }

    await expect(this.quantityValue).toHaveText(String(quantity));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async verifyAddedToCart(product: Product, quantity: number) {
    await this.header.verifyCartQuantity(quantity);
    await expect(this.productDetailsPage.getByText(`${quantity} in cart`)).toBeVisible();
    await expect(this.removeFromCartButton).toBeVisible();
    await expect(this.updateCartButton).toBeVisible();
    await this.toast.verifyAlert('Added to cart', this.productAddedToCartMessage(product, quantity));
  }

  private urlFor(product: Product) {
    return `${this.url}/${product.id}`;
  }

  private productAddedToCartMessage(product: Product, quantity: number) {
    return `${quantity} \u00d7 ${product.name} added to your cart`;
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
