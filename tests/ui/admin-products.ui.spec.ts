import { test, expect } from '../../fixtures/admin.fixture';
import { createAdminProductInput } from '../../generators/productGenerator';
import { ProductsClient } from '../../http-clients/ProductsClient';
import { AdminProductFormPage } from '../../pages/AdminProductFormPage';
import { AdminProductsPage } from '../../pages/AdminProductsPage';
import type { Product } from '../../types/product';

test.describe('Admin product management UI tests', () => {
  test('should open product management from admin dashboard and render real products', async ({
    adminUser,
    adminDashboardPage,
    page,
    request
  }) => {
    // given
    const productsClient = new ProductsClient(request, adminUser.token);
    const adminProductsPage = new AdminProductsPage(page);
    const products = await productsClient.getProducts();
    await adminDashboardPage.goto();
    await adminDashboardPage.verifyLoaded();

    // when
    await adminDashboardPage.manageProductsLink.click();

    // then
    await adminProductsPage.verifyLoaded();
    await adminProductsPage.verifyProductRow(products[0]);
  });

  test('should validate required fields before creating product', async ({ page }) => {
    // given
    const adminProductFormPage = new AdminProductFormPage(page);
    await adminProductFormPage.goto();
    await adminProductFormPage.verifyLoaded('create');

    // when
    await adminProductFormPage.submit();

    // then
    await adminProductFormPage.verifyRequiredFieldErrors();
    await adminProductFormPage.verifyLoaded('create');
  });

  test('should create and delete disposable product from product management', async ({ adminUser, page, request }, testInfo) => {
    // given
    const productsClient = new ProductsClient(request, adminUser.token);
    const adminProductsPage = new AdminProductsPage(page);
    const adminProductFormPage = new AdminProductFormPage(page);
    const productInput = createAdminProductInput(`${testInfo.workerIndex}-${Date.now()}`);
    const cleanupProductNames = [productInput.name];

    try {
      await adminProductsPage.goto();
      await adminProductsPage.verifyLoaded();

      // when
      await adminProductsPage.openNewProductForm();
      await adminProductFormPage.verifyLoaded('create');
      await adminProductFormPage.fillProduct(productInput);
      await adminProductFormPage.submit();

      // then
      const createdProduct = await waitForProductByName(productsClient, productInput.name);
      await adminProductsPage.goto();
      await adminProductsPage.verifyLoaded();
      await adminProductsPage.verifyProductRow(createdProduct);

      // when
      await adminProductsPage.deleteProduct(createdProduct);

      // then
      await adminProductsPage.verifyProductAbsent(createdProduct);
      await expect.poll(async () => productExists(productsClient, productInput.name)).toBe(false);
    } finally {
      await cleanupProductsByName(productsClient, cleanupProductNames);
    }
  });

  test('should prefill edit form for selected product', async ({ adminUser, page, request }, testInfo) => {
    // given
    const productsClient = new ProductsClient(request, adminUser.token);
    const adminProductsPage = new AdminProductsPage(page);
    const adminProductFormPage = new AdminProductFormPage(page);
    const productInput = createAdminProductInput(`${testInfo.workerIndex}-${Date.now()}`);
    const cleanupProductNames = [productInput.name];

    try {
      const createdProduct = await productsClient.createProduct(productInput);
      await adminProductsPage.goto();
      await adminProductsPage.verifyLoaded();
      await adminProductsPage.verifyProductRow(createdProduct);

      // when
      await adminProductsPage.editProduct(createdProduct);

      // then
      await expect(page).toHaveURL(adminProductFormPage.urlForProduct(createdProduct));
      await adminProductFormPage.verifyLoaded('edit');
      await adminProductFormPage.verifyProductValues(productInput);
    } finally {
      await cleanupProductsByName(productsClient, cleanupProductNames);
    }
  });

  async function waitForProductByName(productsClient: ProductsClient, name: string): Promise<Product> {
    await expect.poll(async () => {
      const products = await productsClient.getProducts();
      return products.some(product => product.name === name);
    }).toBe(true);

    const products = await productsClient.getProducts();
    const product = products.find(currentProduct => currentProduct.name === name);

    if (!product) {
      throw new Error(`Product was not created: ${name}`);
    }

    return product;
  }

  async function productExists(productsClient: ProductsClient, name: string) {
    const products = await productsClient.getProducts();

    return products.some(product => product.name === name);
  }

  async function cleanupProductsByName(productsClient: ProductsClient, names: string[]) {
    const products = await productsClient.getProducts();
    const disposableProducts = products.filter(product => names.includes(product.name));

    for (const product of disposableProducts) {
      await expect.poll(async () => {
        const status = await productsClient.tryDeleteProduct(product.id);

        return status === 204 || status === 404;
      }, {
        timeout: 15_000
      }).toBe(true).catch(() => undefined);
    }
  }
});
