import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashData, hashMultiple, hashObject, isValidHash } from '@/lib/hashing';

describe('Hashing System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hashData', () => {
    it('should hash email consistently', async () => {
      const email = 'user@example.com';
      const hash1 = await hashData(email);
      const hash2 = await hashData(email);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toBeTruthy();
      expect(typeof hash1).toBe('string');
      expect(hash1?.length).toBe(64); // SHA-256 produces 64 hex chars
    });

    it('should normalize before hashing', async () => {
      const hash1 = await hashData('User@EXAMPLE.COM');
      const hash2 = await hashData('user@example.com');
      const hash3 = await hashData('  user@example.com  ');
      
      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    it('should return null for null/undefined/empty', async () => {
      expect(await hashData(null)).toBeNull();
      expect(await hashData(undefined)).toBeNull();
      expect(await hashData('')).toBeNull();
      expect(await hashData('   ')).toBeNull();
    });

    it('should handle special characters', async () => {
      const hash = await hashData('user+test@example.com');
      expect(hash).toBeTruthy();
      expect(hash?.length).toBe(64);
    });
  });

  describe('hashMultiple', () => {
    it('should hash multiple values in parallel', async () => {
      const values = ['email@test.com', '11999999999', 'João Silva'];
      const hashes = await hashMultiple(values);
      
      expect(hashes).toHaveLength(3);
      hashes.forEach(hash => {
        expect(hash).toBeTruthy();
        expect(hash?.length).toBe(64);
      });
    });

    it('should handle null values in array', async () => {
      const values = ['email@test.com', null, 'João Silva'];
      const hashes = await hashMultiple(values);
      
      expect(hashes).toHaveLength(3);
      expect(hashes[0]).toBeTruthy();
      expect(hashes[1]).toBeNull();
      expect(hashes[2]).toBeTruthy();
    });
  });

  describe('hashObject', () => {
    it('should hash all object values', async () => {
      const data = {
        email: 'user@example.com',
        phone: '11999999999',
        name: 'João Silva'
      };
      
      const hashed = await hashObject(data);
      
      expect(hashed.email).toBeTruthy();
      expect(hashed.phone).toBeTruthy();
      expect(hashed.name).toBeTruthy();
      expect(hashed.email?.length).toBe(64);
    });

    it('should preserve object keys', async () => {
      const data = {
        email: 'user@example.com',
        phone: '11999999999'
      };
      
      const hashed = await hashObject(data);
      
      expect(hashed).toHaveProperty('email');
      expect(hashed).toHaveProperty('phone');
    });

    it('should handle null values in object', async () => {
      const data = {
        email: 'user@example.com',
        phone: null,
        name: 'João'
      };
      
      const hashed = await hashObject(data);
      
      expect(hashed.email).toBeTruthy();
      expect(hashed.phone).toBeNull();
      expect(hashed.name).toBeTruthy();
    });
  });

  describe('isValidHash', () => {
    it('should validate correct SHA-256 hash', () => {
      const validHash = 'a'.repeat(64);
      expect(isValidHash(validHash)).toBe(true);
    });

    it('should reject invalid hashes', () => {
      expect(isValidHash('short')).toBe(false);
      expect(isValidHash('a'.repeat(63))).toBe(false);
      expect(isValidHash('a'.repeat(65))).toBe(false);
      expect(isValidHash('invalid chars!@#')).toBe(false);
      expect(isValidHash(null)).toBe(false);
      expect(isValidHash(undefined)).toBe(false);
    });

    it('should accept hexadecimal characters only', () => {
      expect(isValidHash('abcdef1234567890'.repeat(4))).toBe(true);
      expect(isValidHash('ABCDEF1234567890'.repeat(4))).toBe(true);
    });
  });
});

