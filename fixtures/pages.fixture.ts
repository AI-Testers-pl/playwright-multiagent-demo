import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { EmailPage } from '../pages/EmailPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { HomePage } from '../pages/HomePage';
import { LlmPage } from '../pages/LlmPage';
import { LoginPage } from '../pages/LoginPage';
import { OrderDetailsPage } from '../pages/OrderDetailsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { QrCodePage } from '../pages/QrCodePage';
import { RegisterPage } from '../pages/RegisterPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { TrafficMonitorPage } from '../pages/TrafficMonitorPage';
import { test as base } from './ui.fixture';

interface PageFixtures {
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  emailPage: EmailPage;
  forgotPasswordPage: ForgotPasswordPage;
  homePage: HomePage;
  llmPage: LlmPage;
  loginPage: LoginPage;
  orderDetailsPage: OrderDetailsPage;
  productDetailsPage: ProductDetailsPage;
  productsPage: ProductsPage;
  profilePage: ProfilePage;
  qrCodePage: QrCodePage;
  registerPage: RegisterPage;
  resetPasswordPage: ResetPasswordPage;
  trafficMonitorPage: TrafficMonitorPage;
}

export const test = base.extend<PageFixtures>({
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  emailPage: async ({ page }, use) => {
    await use(new EmailPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  llmPage: async ({ page }, use) => {
    await use(new LlmPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  orderDetailsPage: async ({ page }, use) => {
    await use(new OrderDetailsPage(page));
  },

  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  qrCodePage: async ({ page }, use) => {
    await use(new QrCodePage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  resetPasswordPage: async ({ page }, use) => {
    await use(new ResetPasswordPage(page));
  },

  trafficMonitorPage: async ({ page }, use) => {
    await use(new TrafficMonitorPage(page));
  }
});

export { expect } from './ui.fixture';
