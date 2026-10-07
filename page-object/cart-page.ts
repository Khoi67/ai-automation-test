import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './base-page.js';
import { UIElement } from '../core/element/ui-element.js';

/**
 * Cart Page — handles shopping cart and coupon.
 */
export class CartPage extends BasePage {
  readonly cartItems: UIElement;
  readonly cartTotal: UIElement;
  readonly couponInput: UIElement;
  readonly btnApplyCoupon: UIElement;
  readonly couponSuccessMsg: UIElement;
  readonly couponErrorMsg: UIElement;

  constructor(page: Page) {
    super(page);

    this.cartItems = new UIElement(
      page.locator('.cart-item, [data-testid="cart-item"]'), 
      'Danh sách sản phẩm trong giỏ hàng'
    );
    this.cartTotal = new UIElement(
      page.locator('.cart-total, [data-testid="cart-total"]'), 
      'Tổng tiền giỏ hàng'
    );
    this.couponInput = new UIElement(
      page.locator('input[placeholder*="mã giảm giá"], input[name="coupon"], [data-testid="coupon-input"]'), 
      'Ô nhập mã giảm giá'
    );
    this.btnApplyCoupon = new UIElement(
      page.getByRole('button', { name: /áp dụng/i }), 
      'Nút Áp dụng mã giảm giá'
    );
    this.couponSuccessMsg = new UIElement(
      page.locator('.coupon-success, [data-testid="coupon-success"]'), 
      'Thông báo áp dụng mã thành công'
    );
    this.couponErrorMsg = new UIElement(
      page.locator('.coupon-error, [data-testid="coupon-error"]'), 
      'Thông báo lỗi áp dụng mã'
    );
  }

  async goToCartPage(): Promise<void> {
    await test.step('Navigate to cart page (/giohang)', async () => {
      await this.navigate('/giohang');
    });
  }

  async applyCoupon(code: string): Promise<void> {
    await test.step(`Thực hiện quy trình áp dụng mã giảm giá: ${code}`, async () => {
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
