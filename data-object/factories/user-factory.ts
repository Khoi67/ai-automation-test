import { faker } from '@faker-js/faker';
import { NguoiDungVMM, ThongTinDangNhap } from '../api/user-model.js';

/**
 * UserBuilder — fluent builder for generating deterministic or dynamic test data.
 */
export class UserBuilder {
  private data: NguoiDungVMM;

  constructor() {
    const timestamp = Date.now().toString().slice(-6);
    this.data = {
      taiKhoan: `auto_${faker.string.alphanumeric({ length: 5 }).toLowerCase()}_${timestamp}`,
      matKhau: `Pass@${faker.string.alphanumeric({ length: 6 })}1!`,
      hoTen: faker.person.fullName(),
      soDT: `09${faker.string.numeric({ length: 8 })}`,
      maNhom: process.env.MA_NHOM || 'GP01',
      email: faker.internet.email({ provider: 'automation.test' }).toLowerCase(),
    };
  }

  static aValidUser(): UserBuilder {
    return new UserBuilder();
  }

  withTaiKhoan(taiKhoan: string): this {
    this.data.taiKhoan = taiKhoan;
    return this;
  }

  withMatKhau(matKhau: string): this {
    this.data.matKhau = matKhau;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withInvalidEmail(): this {
    this.data.email = 'invalid-email-format-without-at';
    return this;
  }

  withEmptyPassword(): this {
    this.data.matKhau = '';
    return this;
  }

  withEmptyTaiKhoan(): this {
    this.data.taiKhoan = '';
    return this;
  }

  build(): NguoiDungVMM {
    return { ...this.data };
  }

  buildLoginCredentials(): ThongTinDangNhap {
    return {
      taiKhoan: this.data.taiKhoan,
      matKhau: this.data.matKhau,
    };
  }
}
