import { test, expect } from '../../fixtures/auth.fixture';
import { CartClient } from '../../http-clients/CartClient';
import { ProductsClient } from '../../http-clients/ProductsClient';
import type { Product } from '../../types/product';
import {
  getCategoryWithMultipleProducts,
  getMatchingProducts,
  sortProductsByName,
  sortProductsByPrice
} from '../../utils/productUtils';

test.describe('Products UI tests', () => {
  let products: Product[];

  test.beforeEach(async ({ authUser, request }) => {
    // given
    const productsClient = new ProductsClient(request, authUser.token);
    products = await productsClient.getProducts();
  });

  test('should render catalog from real API data', async ({ productsPage }) => {
    // when
    await productsPage.goto();

    // then
    await productsPage.verifyLoaded();
    await productsPage.verifyCatalogSummary(products);
    await productsPage.verifyProductCards(products);
  });

  test('should filter products by category', async ({ productsPage }) => {
    // given
    const selectedCategory = getCategoryWithMultipleProducts(products);
    const expectedProducts = products.filter(product => product.category === selectedCategory);
    await productsPage.goto();

    // when
    await productsPage.filterByCategory(selectedCategory);

    // then
    await expect(productsPage.productListTitle).toHaveText(`${selectedCategory} Products`);
    await expect(productsPage.productCards()).toHaveCount(expectedProducts.length);
    await expect(productsPage.productCards().getByTestId('product-category')).toHaveText(
      expectedProducts.map(product => product.category)
    );
    await expect(productsPage.productCards().getByTestId('product-name')).toHaveText(
      expectedProducts.map(product => product.name)
    );
  });

  test('should search products within all products', async ({ productsPage }) => {
    // given
    const searchTerm = 'code';
    const expectedProducts = sortProductsByName(getMatchingProducts(products, searchTerm), 'asc');
    await productsPage.goto();

    // when
    await productsPage.searchFor(searchTerm);

    // then
    await expect(productsPage.productCards()).toHaveCount(expectedProducts.length);
    await expect(productsPage.productCards().getByTestId('product-name')).toHaveText(
      expectedProducts.map(product => product.name)
    );
  });

  test('should show empty state when category and search do not match', async ({ productsPage }) => {
    // given
    const selectedCategory = products.find(product => product.category !== 'Books')?.category ?? products[0].category;
    await productsPage.goto();
    await productsPage.filterByCategory(selectedCategory);

    // when
    await productsPage.searchFor('clean code');

    // then
    await productsPage.verifyNoProductsFound();
  });

  test('should sort products by price ascending and descending', async ({ productsPage }) => {
    // given
    await productsPage.goto();

    // when
    await productsPage.sortBy('price-asc');

    // then
    expect(await productsPage.visibleProductPrices()).toEqual(
      sortProductsByPrice(products, 'asc').map(product => product.price)
    );

    // when
    await productsPage.sortBy('price-desc');

    // then
    expect(await productsPage.visibleProductPrices()).toEqual(
      sortProductsByPrice(products, 'desc').map(product => product.price)
    );
  });

  test('should sort products by name ascending and descending', async ({ productsPage }) => {
    // given
    await productsPage.goto();

    // when
    await productsPage.sortBy('name-asc');

    // then
    expect(await productsPage.visibleProductNames()).toEqual(
      sortProductsByName(products, 'asc').map(product => product.name)
    );

    // when
    await productsPage.sortBy('name-desc');

    // then
    expect(await productsPage.visibleProductNames()).toEqual(
      sortProductsByName(products, 'desc').map(product => product.name)
    );
  });

  test('should open product details from product card', async ({ productDetailsPage, productsPage }) => {
    // given
    const product = sortProductsByName(products, 'asc')[0];
    await productsPage.goto();

    // when
    await productsPage.openProduct(product.name);

    // then
    await productDetailsPage.verifyLoaded(product);
  });

  test('should add selected quantity to cart from product details', async ({
    authUser,
    productDetailsPage,
    request
  }) => {
    // given
    const quantity = 3;
    const cartClient = new CartClient(request, authUser.token);
    const product = sortProductsByName(products, 'asc')[0];
    await productDetailsPage.gotoProduct(product);

    // when
    await productDetailsPage.setQuantity(quantity);
    await productDetailsPage.addToCart();

    // then
    await productDetailsPage.verifyAddedToCart(product, quantity);
    const cart = await cartClient.getCart();
    expect(cart.items).toContainEqual({ productId: product.id, quantity });
    expect(cart.totalItems).toBe(quantity);
  });

  test('should add product to cart from product list without opening details', async ({
    authUser,
    productsPage,
    request
  }) => {
    // given
    const quantity = 2;
    const cartClient = new CartClient(request, authUser.token);
    const product = sortProductsByName(products, 'asc')[0];
    await productsPage.goto();

    // when
    await productsPage.addProductToCartFromList(product.name, quantity);

    // then
    await productsPage.verifyProductAddedToCart(product, quantity);
    const cart = await cartClient.getCart();
    expect(cart.items).toContainEqual({ productId: product.id, quantity });
    expect(cart.totalItems).toBe(quantity);
  });

  test('should navigate back from details to list', async ({
    productDetailsPage,
    productsPage
  }) => {
    // given
    const product = sortProductsByName(products, 'asc')[0];
    await productDetailsPage.gotoProduct(product);
    await productDetailsPage.verifyLoaded(product);

    // when
    await productDetailsPage.backLink.click();

    // then
    await productsPage.verifyLoaded();
    await expect(productsPage.productCardByName(product.name)).toBeVisible();
  });
});
