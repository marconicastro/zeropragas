/**
 * Setup global para testes
 */
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpar após cada teste
afterEach(() => {
  cleanup();
});

// Mock do window.fbq para testes
global.window = {
  ...global.window,
  fbq: vi.fn(),
  location: {
    href: 'https://example.com',
    search: '',
    pathname: '/'
  } as Location,
  navigator: {
    userAgent: 'test-agent'
  } as Navigator
} as any;

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock as any;

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.sessionStorage = sessionStorageMock as any;

// Mock do crypto.subtle para testes de hash
global.crypto = {
  subtle: {
    digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
  }
} as any;

