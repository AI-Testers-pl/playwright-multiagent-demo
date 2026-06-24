import { test, expect } from '../../fixtures/auth.fixture';
import { CartClient } from '../../http-clients/CartClient';
import { ProductsClient } from '../../http-clients/ProductsClient';
import type { Product } from '../../types/product';
import { sortProductsByName } from '../../utils/productUtils';

test.describe('Cart and checkout UI tests', () => {
  let products: Product[];

  test.beforeEach(async ({ authUser, request }) => {
    // given
    const productsClient = new ProductsClient(request, authUser.token);
    products = await productsClient.getProducts();
  });

  test('should add product to cart, checkout, and open order details', async ({
    authUser,
    cartPage,
    checkoutPage,
    orderDetailsPage,
    page,
    productsPage,
    request
  }) => {
    // given
    const quantity = 1;
    const product = sortProductsByName(products, 'asc')[0];
    const shippingAddress = {
      street: `Cart Checkout ${Date.now()} Street`,
      city: 'Warsaw',
      state: 'Masovian',
      zipCode: '00-001',
      country: 'Poland'
    };
    const cartClient = new CartClient(request, authUser.token);
    await productsPage.goto();

    // when
    await productsPage.addProductToCartFromList(product.name, quantity);
    await productsPage.header.cartLink.click();

    // then
    await cartPage.verifyLoadedWithItem(product, quantity);
    const cart = await cartClient.getCart();
    expect(cart.items).toContainEqual({ productId: product.id, quantity });
    expect(cart.totalItems).toBe(quantity);

    // when
    await cartPage.proceedToCheckout();

    // then
    await checkoutPage.verifyLoaded(product, quantity);

    // when
    await checkoutPage.placeOrder(shippingAddress);

    // then
    await orderDetailsPage.verifyLoaded(product, quantity, shippingAddress);
  });
});
