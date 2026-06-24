import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Product } from '../types/product';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class CheckoutPage extends BasePage {
  readonly checkoutPageContainer: Locator;
  readonly checkoutPage: Locator;
  readonly title: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipInput: Locator;
  readonly countryInput: Locator;
  readonly itemsValue: Locator;
  readonly totalValue: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page, '/checkout');
    this.checkoutPageContainer = this.byTestId('checkout-page-container');
    this.checkoutPage = this.byTestId('checkout-page');
    this.title = this.byTestId('checkout-title');
    this.streetInput = this.byTestId('checkout-street-input');
    this.cityInput = this.byTestId('checkout-city-input');
    this.stateInput = this.byTestId('checkout-state-input');
    this.zipInput = this.byTestId('checkout-zip-input');
    this.countryInput = this.byTestId('checkout-country-input');
    this.itemsValue = this.byTestId('checkout-items-value');
    this.totalValue = this.byTestId('checkout-total-value');
    this.submitButton = this.byTestId('checkout-submit-button');
  }

  async verifyLoaded(product: Product, quantity: number) {
    await this.verifyUrl();
    await expect(this.checkoutPageContainer).toBeVisible();
    await expect(this.checkoutPage).toBeVisible();
    await expect(this.title).toHaveText('Checkout');
    await expect(this.itemsValue).toHaveText(String(quantity));
    await expect(this.totalValue).toHaveText(this.formatPrice(product.price * quantity));
    await expect(this.byTestId(`checkout-item-name-${product.id}`)).toHaveText(product.name);
    await expect(this.byTestId(`checkout-item-quantity-${product.id}`)).toHaveText(String(quantity));
    await expect(this.byTestId(`checkout-item-total-${product.id}`)).toHaveText(
      this.formatPrice(product.price * quantity)
    );
  }

  async placeOrder(address: ShippingAddress) {
    await this.streetInput.fill(address.street);
    await this.cityInput.fill(address.city);
    await this.stateInput.fill(address.state);
    await this.zipInput.fill(address.zipCode);
    await this.countryInput.fill(address.country);
    await this.submitButton.click();
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
