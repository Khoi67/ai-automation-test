import { Locator, expect } from '@playwright/test';

/**
 * Common element actions and assertion helpers.
 * Wraps Playwright Locator API with consistent patterns.
 */
export class ElementUtils {
  /** Click an element after ensuring it is visible */
  static async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /** Double click an element */
  static async doubleClick(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /** Fill a text input — clears existing value first */
  static async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /** Type text character by character (useful for inputs with debounce) */
  static async type(locator: Locator, value: string): Promise<void> {
    await locator.pressSequentially(value, { delay: 50 });
  }

  /** Clear an input field */
  static async clear(locator: Locator): Promise<void> {
    await locator.clear();
  }

  /** Get text content of an element */
  static async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }

  /** Get input value */
  static async getInputValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  /** Select an option from <select> by value */
  static async selectByValue(locator: Locator, value: string): Promise<void> {
    await locator.selectOption({ value });
  }

  /** Select an option from <select> by visible text */
  static async selectByLabel(locator: Locator, label: string): Promise<void> {
    await locator.selectOption({ label });
  }

  /** Check if element is visible (non-throwing) */
  static async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /** Assert element is visible */
  static async assertVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  /** Assert element contains expected text */
  static async assertText(locator: Locator, expected: string, message?: string): Promise<void> {
    await expect(locator, message).toContainText(expected);
  }

  /** Assert element has exact text */
  static async assertExactText(locator: Locator, expected: string, message?: string): Promise<void> {
    await expect(locator, message).toHaveText(expected);
  }

  /** Assert input has expected value */
  static async assertValue(locator: Locator, expected: string, message?: string): Promise<void> {
    await expect(locator, message).toHaveValue(expected);
  }

  /** Assert element is hidden or not present */
  static async assertHidden(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeHidden();
  }

  /** Assert element is enabled */
  static async assertEnabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeEnabled();
  }

  /** Assert element is disabled */
  static async assertDisabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeDisabled();
  }

  /** Assert element count */
  static async assertCount(locator: Locator, count: number, message?: string): Promise<void> {
    await expect(locator, message).toHaveCount(count);
  }
}
