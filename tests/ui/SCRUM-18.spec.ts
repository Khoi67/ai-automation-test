import { expect, test } from '../../fixture/page-fixture.js';

test.describe('SCRUM-18: [Cart] Thêm khóa học vào Giỏ hàng & Áp dụng mã giảm giá', () => {
  // Use fixme to protect CI if this feature is not yet fully implemented or has bugs
  // as the requirement doesn't exist in the current CyberSoft system, so UI might not have these elements
  // The test acts as a scaffold according to the standard and workflow.

  test.fixme('TC_CART_01: Thêm khóa học vào giỏ hàng thành công', async ({ coursePage, cartPage }) => {
    // 1. Go to course list
    await coursePage.goToCourseList();
    
    // 2. We assume there's an "Add to cart" button inside a course card
    // Note: If the platform doesn't have this, it will fail here, which is expected for a fixme test
    await coursePage.clickCourseByIndex(0);
    await coursePage.clickEnroll(); // or an explicit addToCart action

    // We'd expect some indicator of success
    await expect(cartPage.getAlertModalLocator()).toBeVisible();
    await expect(cartPage.getAlertTextLocator()).toContainText(/thành công/i);
  });

  test.fixme('TC_CART_02: Xem trang Giỏ hàng', async ({ cartPage }) => {
    await cartPage.goToCartPage();
    
    // Expect cart items and total to be visible
    await expect(cartPage.cartTotal).toBeVisible();
  });

  test.fixme('TC_CART_03: Áp dụng mã giảm giá hợp lệ', async ({ cartPage }) => {
    await cartPage.goToCartPage();
    
    await cartPage.applyCoupon('CYBER2026');
    
    await expect(cartPage.couponSuccessMsg).toBeVisible();
    await expect(cartPage.couponSuccessMsg).toContainText(/thành công/i);
  });

  test.fixme('TC_CART_04: Áp dụng mã giảm giá không hợp lệ', async ({ cartPage }) => {
    await cartPage.goToCartPage();
    
    await cartPage.applyCoupon('INVALID_CODE');
    
    await expect(cartPage.couponErrorMsg).toBeVisible();
    await expect(cartPage.couponErrorMsg).toContainText(/không hợp lệ/i);
  });
});
