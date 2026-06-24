import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ShippingAddress } from './CheckoutPage';
import type { Product } from '../types/product';

export class OrderDetailsPage extends BasePage {
  readonly orderDetailsPageContainer: Locator;
  readonly orderDetails: Locator;
  readonly title: Locator;
  readonly status: Locator;
  readonly itemsList: Locator;
  readonly totalAmount: Locator;
  readonly shippingAddress: Locator;
  readonly addressStreet: Locator;
  readonly addressCityState: Locator;
  readonly addressCountry: Locator;

  constructor(page: Page) {
    super(page, '/orders');
    this.orderDetailsPageContainer = this.byTestId('order-details-page-container');
    this.orderDetails = this.byTestId('order-details');
    this.title = this.byTestId('order-details-title');
    this.status = this.byTestId('order-details-status');
    this.itemsList = this.byTestId('order-details-items-list');
    this.totalAmount = this.byTestId('order-details-total-amount');
    this.shippingAddress = this.byTestId('order-details-shipping-address');
    this.addressStreet = this.byTestId('order-details-address-street');
    this.addressCityState = this.byTestId('order-details-address-city-state');
    this.addressCountry = this.byTestId('order-details-address-country');
  }

  async verifyLoaded(product: Product, quantity: number, address: ShippingAddress) {
    await expect(this.page).toHaveURL(/\/orders\/\d+$/);
    await expect(this.orderDetailsPageContainer).toBeVisible();
    await expect(this.orderDetails).toBeVisible();
    await expect(this.title).toContainText('Order #');
    await expect(this.status).toBeVisible();
    await expect(this.itemsList.getByText(product.name)).toBeVisible();
    await expect(this.itemsList.getByText(`$${product.price} x ${quantity}`)).toBeVisible();
    await expect(this.totalAmount).toHaveText(this.formatPrice(product.price * quantity));
    await expect(this.shippingAddress).toBeVisible();
    await expect(this.addressStreet).toHaveText(address.street);
    await expect(this.addressCityState).toHaveText(`${address.city}, ${address.state} ${address.zipCode}`);
    await expect(this.addressCountry).toHaveText(address.country);
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
