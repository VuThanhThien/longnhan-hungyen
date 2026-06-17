import { BadRequestException } from '@nestjs/common';

const MAX_URL_LENGTH = 2048;

const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1', '[::1]']);

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (normalized === '::1') return true;
  if (normalized.startsWith('fe80:')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (lower.endsWith('.localhost')) return true;
  if (isPrivateIpv4(lower)) return true;
  if (lower.includes(':') && isPrivateIpv6(lower)) return true;

  return false;
}

export function validateImportUrl(url: string): void {
  if (!url || url.length > MAX_URL_LENGTH) {
    throw new BadRequestException('URL không hợp lệ');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new BadRequestException('URL không hợp lệ');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException('URL không hợp lệ');
  }

  if (isBlockedHostname(parsed.hostname)) {
    throw new BadRequestException('URL không hợp lệ');
  }
}
