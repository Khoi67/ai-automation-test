import { Locator, test } from '@playwright/test';
import { SelfHealingTelemetry } from './self-healing-telemetry.js';

/**
 * Lớp UIElement (Element Wrapper) - Chuẩn thiết kế chuyên nghiệp.
 * Bọc lại Playwright Locator để tự động hóa việc ghi log (Allure/HTML Report) thông qua test.step.
 * Tích hợp cơ chế "Heal & Warn" tự phục hồi thông minh nhưng luôn cảnh báo minh bạch (tránh che giấu bug thật).
 */
export class UIElement {
  private _locator: Locator;
  private name: string;
  private fallbacks: { locator: Locator; name: string }[] = [];

  /**
   * @param locator Playwright Locator gốc
   * @param name Tên mô tả của Element (VD: "Nút Đăng Nhập", "Input Email") để hiển thị trên Report
   */
  constructor(locator: Locator, name: string) {
    this._locator = locator;
    this.name = name;
  }

  /**
   * Đăng ký Fallback Locator cho cơ chế Heal & Warn.
   * Nếu locator chính fail, UIElement sẽ thử fallback này và ghi nhận telemetry cảnh báo.
   */
  withFallback(fallbackLocator: Locator, fallbackName = 'alternative selector'): this {
    this.fallbacks.push({ locator: fallbackLocator, name: fallbackName });
    return this;
  }

  /**
   * Trả về Locator gốc của Playwright để dùng cho các assertion expect(locator)
   */
  getLocator(): Locator {
    return this._locator;
  }

  /**
   * Click vào element với tính năng tự động ghi log Allure và Heal & Warn fallback.
   */
  async click(options?: Parameters<Locator['click']>[0]): Promise<void> {
    await test.step(`Click: [${this.name}]`, async () => {
      try {
        await this._locator.click(options);
      } catch (primaryError) {
        if (this.fallbacks.length > 0) {
          for (const fallback of this.fallbacks) {
            try {
              await fallback.locator.click(options);

              // Ghi nhận cảnh báo "Heal & Warn"
              SelfHealingTelemetry.record({
                elementName: this.name,
                primarySelector: this._locator.toString(),
                healedSelector: fallback.name,
                testTitle: test.info?.()?.title,
              });

              try {
                test.info?.()?.annotations.push({
                  type: 'warning:self-healed',
                  description: `Element [${this.name}] healed with fallback "${fallback.name}". Please review locator!`,
                });
              } catch {
                // Ignore if called outside test context
              }

              console.warn(
                `⚠️ [HEAL & WARN] Element [${this.name}] primary locator failed. Recovered via fallback: "${fallback.name}".`,
              );
              return;
            } catch {
              // Try next fallback
            }
          }
        }
        throw primaryError;
      }
    });
  }

  /**
   * Nhập dữ liệu vào element tự động ghi log Allure và Heal & Warn fallback.
   */
  async fill(value: string, options?: Parameters<Locator['fill']>[1]): Promise<void> {
    await test.step(`Nhập: [${this.name}] = "${value}"`, async () => {
      try {
        await this._locator.fill(value, options);
      } catch (primaryError) {
        if (this.fallbacks.length > 0) {
          for (const fallback of this.fallbacks) {
            try {
              await fallback.locator.fill(value, options);

              SelfHealingTelemetry.record({
                elementName: this.name,
                primarySelector: this._locator.toString(),
                healedSelector: fallback.name,
                testTitle: test.info?.()?.title,
              });

              try {
                test.info?.()?.annotations.push({
                  type: 'warning:self-healed',
                  description: `Element [${this.name}] healed with fallback "${fallback.name}". Please review locator!`,
                });
              } catch {
                // Ignore if called outside test context
              }

              console.warn(
                `⚠️ [HEAL & WARN] Element [${this.name}] primary locator failed. Recovered via fallback: "${fallback.name}".`,
              );
              return;
            } catch {
              // Try next fallback
            }
          }
        }
        throw primaryError;
      }
    });
  }

  /**
   * Hover chuột vào element tự động ghi log Allure.
   */
  async hover(options?: Parameters<Locator['hover']>[0]): Promise<void> {
    await test.step(`Hover chuột vào: [${this.name}]`, async () => {
      await this._locator.hover(options);
    });
  }

  /**
   * Lấy text bên trong element.
   */
  async getText(options?: Parameters<Locator['innerText']>[0]): Promise<string> {
    return await test.step(`Lấy text từ: [${this.name}]`, async () => {
      const text = await this._locator.innerText(options);
      return text.trim();
    });
  }

  /**
   * Clear text trong ô input.
   */
  async clear(options?: Parameters<Locator['clear']>[0]): Promise<void> {
    await test.step(`Xóa dữ liệu trong: [${this.name}]`, async () => {
      await this._locator.clear(options);
    });
  }

  /**
   * Chờ element ở trạng thái mong muốn.
   */
  async waitFor(options?: Parameters<Locator['waitFor']>[0]): Promise<void> {
    await test.step(`Chờ [${this.name}] (trạng thái: ${options?.state || 'visible'})`, async () => {
      await this._locator.waitFor(options);
    });
  }

  // === CÁC HÀM PROXY TRẢ VỀ UIElement MỚI ĐỂ CHAINING ===

  or(other: UIElement | Locator): UIElement {
    const loc = 'getLocator' in other ? other.getLocator() : other;
    const otherName = 'name' in other ? other.name : 'other';
    return new UIElement(this._locator.or(loc), `${this.name} or ${otherName}`);
  }

  and(other: UIElement | Locator): UIElement {
    const loc = 'getLocator' in other ? other.getLocator() : other;
    const otherName = 'name' in other ? other.name : 'other';
    return new UIElement(this._locator.and(loc), `${this.name} and ${otherName}`);
  }

  first(): UIElement {
    return new UIElement(this._locator.first(), `${this.name} (first)`);
  }

  nth(index: number): UIElement {
    return new UIElement(this._locator.nth(index), `${this.name} (nth: ${index})`);
  }

  filter(options: Parameters<Locator['filter']>[0]): UIElement {
    return new UIElement(this._locator.filter(options), `${this.name} (filtered)`);
  }

  locator(selector: string | Locator, options?: Parameters<Locator['locator']>[1]): UIElement {
    return new UIElement(this._locator.locator(selector, options), `${this.name} -> child`);
  }

  getByRole(
    role: Parameters<Locator['getByRole']>[0],
    options?: Parameters<Locator['getByRole']>[1],
  ): UIElement {
    return new UIElement(this._locator.getByRole(role, options), `${this.name} -> byRole(${role})`);
  }

  getByPlaceholder(
    text: Parameters<Locator['getByPlaceholder']>[0],
    options?: Parameters<Locator['getByPlaceholder']>[1],
  ): UIElement {
    return new UIElement(
      this._locator.getByPlaceholder(text, options),
      `${this.name} -> byPlaceholder`,
    );
  }

  getByText(
    text: Parameters<Locator['getByText']>[0],
    options?: Parameters<Locator['getByText']>[1],
  ): UIElement {
    return new UIElement(this._locator.getByText(text, options), `${this.name} -> byText`);
  }

  // === CÁC HÀM ACTION & ASSERTION KHÁC ===

  async count(): Promise<number> {
    return await this._locator.count();
  }

  async allTextContents(): Promise<string[]> {
    return await this._locator.allTextContents();
  }

  async selectOption(
    values: Parameters<Locator['selectOption']>[0],
    options?: Parameters<Locator['selectOption']>[1],
  ): Promise<string[]> {
    return await test.step(`Chọn option tại: [${this.name}]`, async () => {
      return await this._locator.selectOption(values, options);
    });
  }

  async setInputFiles(
    files: Parameters<Locator['setInputFiles']>[0],
    options?: Parameters<Locator['setInputFiles']>[1],
  ): Promise<void> {
    await test.step(`Upload file vào: [${this.name}]`, async () => {
      await this._locator.setInputFiles(files, options);
    });
  }

  async isVisible(options?: Parameters<Locator['isVisible']>[0]): Promise<boolean> {
    return await this._locator.isVisible(options);
  }

  async isEnabled(options?: Parameters<Locator['isEnabled']>[0]): Promise<boolean> {
    return await this._locator.isEnabled(options);
  }

  async getAttribute(
    name: string,
    options?: Parameters<Locator['getAttribute']>[1],
  ): Promise<string | null> {
    return await this._locator.getAttribute(name, options);
  }

  async evaluate<R = unknown, Arg = unknown>(
    pageFunction: Parameters<Locator['evaluate']>[0],
    arg?: Arg,
    options?: { timeout?: number },
  ): Promise<R> {
    return (await this._locator.evaluate(pageFunction, arg, options)) as R;
  }
}
