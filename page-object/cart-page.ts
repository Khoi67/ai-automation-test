import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Cart Page — handles shopping cart and coupon.
 */
export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly cartTotal: Locator;
  readonly couponInput: Locator;
  readonly btnApplyCoupon: Locator;
  readonly couponSuccessMsg: Locator;
  readonly couponErrorMsg: Locator;

  constructor(page: Page) {
    super(page);

    this.cartItems = page.locator('.cart-item, [data-testid="cart-item"]');
    this.cartTotal = page.locator('.cart-total, [data-testid="cart-total"]');
    this.couponInput = page.locator('input[placeholder*="mã giảm giá"], input[name="coupon"], [data-testid="coupon-input"]');
    this.btnApplyCoupon = page.getByRole('button', { name: /áp dụng/i });
    this.couponSuccessMsg = page.locator('.coupon-success, [data-testid="coupon-success"]');
    this.couponErrorMsg = page.locator('.coupon-error, [data-testid="coupon-error"]');
  }

  async goToCartPage(): Promise<void> {
    await test.step('Navigate to cart page (/giohang)', async () => {
      await this.navigate('/giohang');
    });
  }

  async applyCoupon(code: string): Promise<void> {
    await test.step(`Apply coupon: ${code}`, async () => {
      await this.couponInput.fill(code);
      await this.btnApplyCoupon.click();
    });
  }

  getAlertModalLocator(): Locator {
    return this.page.locator('.swal2-popup, .modal, [role="dialog"]').first();
  }

  getAlertTextLocator(): Locator {
    return this.page.locator('.swal2-title, .swal2-html-container, .alert, .toast').first();
  }
}
