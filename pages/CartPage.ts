import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Product } from '../types/product';

export class CartPage extends BasePage {
  readonly cartPageContainer: Locator;
  readonly cartPage: Locator;
  readonly title: Locator;
  readonly continueShoppingButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly browseProductsButton: Locator;
  readonly summary: Locator;
  readonly summaryItemsCount: Locator;
  readonly summaryTotalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly clearCartButton: Locator;
  readonly cartItemsList: Locator;

  constructor(page: Page) {
    super(page, '/cart');
    this.cartPageContainer = this.byTestId('cart-page-container');
    this.cartPage = this.byTestId('cart-page');
    this.title = this.byTestId('cart-title');
    this.continueShoppingButton = this.byTestId('cart-continue-shopping');
    this.emptyCartMessage = this.byTestId('cart-empty');
    this.browseProductsButton = this.byTestId('cart-browse-products');
    this.summary = this.byTestId('cart-summary');
    this.summaryItemsCount = this.byTestId('cart-summary-items-count');
    this.summaryTotalPrice = this.byTestId('cart-summary-total-price');
    this.checkoutButton = this.byTestId('cart-checkout-button');
    this.clearCartButton = this.byTestId('cart-clear-button');
    this.cartItemsList = this.byTestId('cart-items-list');
  }

  async verifyEmptyCartLoaded() {
    await this.verifyUrl();
    await expect(this.cartPageContainer).toBeVisible();
    await expect(this.cartPage).toBeVisible();
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.continueShoppingButton).toBeVisible();
    await expect(this.emptyCartMessage).toContainText('Your cart is empty');
    await expect(this.browseProductsButton).toBeVisible();
  }

  cartItem(product: Product) {
    return this.byTestId(`cart-item-${product.id}`);
  }

  async verifyLoadedWithItem(product: Product, quantity: number) {
    await this.verifyUrl();
    await expect(this.cartPageContainer).toBeVisible();
    await expect(this.cartPage).toBeVisible();
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.summary).toBeVisible();
    await expect(this.summaryItemsCount).toHaveText(String(quantity));
    await expect(this.summaryTotalPrice).toHaveText(this.formatPrice(product.price * quantity));
    await expect(this.cartItem(product)).toBeVisible();
    await expect(this.byTestId(`cart-item-name-${product.id}`)).toHaveText(product.name);
    await expect(this.byTestId(`cart-item-price-${product.id}`)).toHaveText(this.formatPrice(product.price));
    await expect(this.byTestId(`cart-item-quantity-${product.id}`)).toHaveText(String(quantity));
    await expect(this.byTestId(`cart-item-total-${product.id}`)).toHaveText(this.formatPrice(product.price * quantity));
    await expect(this.checkoutButton).toBeEnabled();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
