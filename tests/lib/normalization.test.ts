import { describe, it, expect } from 'vitest';
import {
  normalizeEmail,
  normalizePhone,
  normalizeName,
  normalizeCity,
  normalizeState,
  normalizeZipcode,
  normalizeCountry,
  normalizeUserData
} from '@/lib/normalization';

describe('Normalization System', () => {
  describe('normalizeEmail', () => {
    it('should normalize email to lowercase and trim', () => {
      expect(normalizeEmail('  User@EXAMPLE.COM  ')).toBe('user@example.com');
      expect(normalizeEmail('TEST@TEST.COM')).toBe('test@test.com');
    });

    it('should validate email format', () => {
      expect(normalizeEmail('invalid-email')).toBeNull();
      expect(normalizeEmail('@example.com')).toBeNull();
      expect(normalizeEmail('user@')).toBeNull();
    });

    it('should return null for invalid inputs', () => {
      expect(normalizeEmail(null)).toBeNull();
      expect(normalizeEmail(undefined)).toBeNull();
      expect(normalizeEmail('')).toBeNull();
    });
  });

  describe('normalizePhone', () => {
    it('should remove non-numeric characters', () => {
      expect(normalizePhone('(11) 99999-9999')).toBe('11999999999');
      expect(normalizePhone('+55 11 99999-9999')).toBe('11999999999');
    });

    it('should add country code when requested', () => {
      expect(normalizePhone('11999999999', true)).toBe('5511999999999');
      expect(normalizePhone('(11) 99999-9999', true)).toBe('5511999999999');
    });

    it('should validate phone length', () => {
      expect(normalizePhone('123')).toBeNull(); // Too short
      expect(normalizePhone('11999999999')).toBe('11999999999'); // Valid
      expect(normalizePhone('119999999999')).toBeNull(); // Too long
    });

    it('should remove country code if present', () => {
      expect(normalizePhone('5511999999999')).toBe('11999999999');
      expect(normalizePhone('5511999999999', true)).toBe('5511999999999');
    });
  });

  describe('normalizeName', () => {
    it('should separate first and last name', () => {
      const result = normalizeName('João Silva Santos');
      expect(result.firstName).toBe('joão');
      expect(result.lastName).toBe('silva santos');
    });

    it('should handle single name', () => {
      const result = normalizeName('João');
      expect(result.firstName).toBe('joão');
      expect(result.lastName).toBeNull();
    });

    it('should normalize whitespace', () => {
      const result = normalizeName('  João   Silva  ');
      expect(result.firstName).toBe('joão');
      expect(result.lastName).toBe('silva');
    });

    it('should return null for invalid inputs', () => {
      const result = normalizeName(null);
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
    });
  });

  describe('normalizeCity', () => {
    it('should normalize city name', () => {
      expect(normalizeCity('  São Paulo  ')).toBe('são paulo');
      expect(normalizeCity('RIO DE JANEIRO')).toBe('rio de janeiro');
    });

    it('should normalize multiple spaces', () => {
      expect(normalizeCity('São    Paulo')).toBe('são paulo');
    });
  });

  describe('normalizeState', () => {
    it('should convert full state name to abbreviation', () => {
      expect(normalizeState('São Paulo')).toBe('sp');
      expect(normalizeState('Rio de Janeiro')).toBe('rj');
      expect(normalizeState('Minas Gerais')).toBe('mg');
    });

    it('should keep abbreviation if already abbreviated', () => {
      expect(normalizeState('SP')).toBe('sp');
      expect(normalizeState('RJ')).toBe('rj');
    });

    it('should handle unknown states', () => {
      expect(normalizeState('Unknown State')).toBe('unknown state');
    });
  });

  describe('normalizeZipcode', () => {
    it('should remove non-numeric characters', () => {
      expect(normalizeZipcode('01310-100')).toBe('01310100');
      expect(normalizeZipcode('01310 100')).toBe('01310100');
    });

    it('should validate zipcode length', () => {
      expect(normalizeZipcode('123')).toBeNull(); // Too short
      expect(normalizeZipcode('01310100')).toBe('01310100'); // Valid
      expect(normalizeZipcode('013101001')).toBeNull(); // Too long
    });
  });

  describe('normalizeCountry', () => {
    it('should default to BR', () => {
      expect(normalizeCountry(null)).toBe('br');
      expect(normalizeCountry(undefined)).toBe('br');
    });

    it('should convert country names to codes', () => {
      expect(normalizeCountry('Brasil')).toBe('br');
      expect(normalizeCountry('Brazil')).toBe('br');
    });

    it('should keep code if already a code', () => {
      expect(normalizeCountry('BR')).toBe('br');
      expect(normalizeCountry('US')).toBe('us');
    });
  });

  describe('normalizeUserData', () => {
    it('should normalize all user data fields', () => {
      const input = {
        email: '  User@EXAMPLE.COM  ',
        phone: '(11) 99999-9999',
        fullName: '  João  Silva  ',
        city: '  São Paulo  ',
        state: 'São Paulo',
        zipcode: '01310-100',
        country: 'Brasil'
      };

      const result = normalizeUserData(input);

      expect(result.email).toBe('user@example.com');
      expect(result.phone).toBe('11999999999');
      expect(result.firstName).toBe('joão');
      expect(result.lastName).toBe('silva');
      expect(result.city).toBe('são paulo');
      expect(result.state).toBe('sp');
      expect(result.zipcode).toBe('01310100');
      expect(result.country).toBe('br');
    });

    it('should handle partial data', () => {
      const input = {
        email: 'user@example.com',
        phone: null,
        fullName: null,
        city: null,
        state: null,
        zipcode: null,
        country: null
      };

      const result = normalizeUserData(input);

      expect(result.email).toBe('user@example.com');
      expect(result.phone).toBeNull();
      expect(result.country).toBe('br'); // Default
    });
  });
});

