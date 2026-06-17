import { BadRequestException } from '@nestjs/common';
import { validateImportUrl } from './validate-import-url.util';

describe('validateImportUrl', () => {
  it('allows valid HTTPS URLs', () => {
    expect(() => validateImportUrl('https://example.com/post')).not.toThrow();
  });

  it('rejects localhost', () => {
    expect(() => validateImportUrl('http://localhost/admin')).toThrow(
      BadRequestException,
    );
  });

  it('rejects private IPv4', () => {
    expect(() => validateImportUrl('http://192.168.1.1/')).toThrow(
      BadRequestException,
    );
  });

  it('rejects non-http(s) schemes', () => {
    expect(() => validateImportUrl('ftp://example.com')).toThrow(
      BadRequestException,
    );
  });

  it('rejects empty URL', () => {
    expect(() => validateImportUrl('')).toThrow(BadRequestException);
  });

  it('rejects URLs over 2048 characters', () => {
    const longUrl = `https://example.com/${'a'.repeat(2048)}`;
    expect(() => validateImportUrl(longUrl)).toThrow(BadRequestException);
  });
});
