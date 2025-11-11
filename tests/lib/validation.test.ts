import { describe, it, expect } from 'vitest';
import {
  validateMetaEvent,
  validateUserData,
  validateCustomData,
  MetaEventSchema,
  MetaUserDataSchema
} from '@/lib/validation';

describe('Validation System', () => {
  describe('validateUserData', () => {
    it('should validate correct user data', () => {
      const userData = {
        em: 'hashed_email',
        ph: 'hashed_phone',
        fn: 'hashed_firstname',
        external_id: 'user123'
      };

      const result = validateUserData(userData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should require at least one identifier', () => {
      const userData = {
        ct: 'hashed_city',
        st: 'hashed_state'
      };

      const result = validateUserData(userData);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('identificador');
    });

    it('should accept nullable fields', () => {
      const userData = {
        em: null,
        ph: null,
        external_id: 'user123'
      };

      const result = validateUserData(userData);
      expect(result.success).toBe(true);
    });
  });

  describe('validateCustomData', () => {
    it('should validate correct custom data', () => {
      const customData = {
        value: 39.9,
        currency: 'BRL',
        content_ids: ['hacr962'],
        content_name: 'Product Name'
      };

      const result = validateCustomData(customData);
      expect(result.success).toBe(true);
    });

    it('should allow additional fields', () => {
      const customData = {
        value: 39.9,
        currency: 'BRL',
        custom_field: 'custom_value'
      };

      const result = validateCustomData(customData);
      expect(result.success).toBe(true);
    });
  });

  describe('validateMetaEvent', () => {
    it('should validate complete event', () => {
      const event = {
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: 'https://example.com',
        user_data: {
          em: 'hashed_email',
          external_id: 'user123'
        },
        custom_data: {
          value: 39.9,
          currency: 'BRL'
        }
      };

      const result = validateMetaEvent(event);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid event_name', () => {
      const event = {
        event_name: '',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          external_id: 'user123'
        }
      };

      const result = validateMetaEvent(event);
      expect(result.success).toBe(false);
    });

    it('should reject invalid action_source', () => {
      const event = {
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'invalid_source',
        user_data: {
          external_id: 'user123'
        }
      };

      const result = validateMetaEvent(event);
      expect(result.success).toBe(false);
    });

    it('should require user_data with identifier', () => {
      const event = {
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {}
      };

      const result = validateMetaEvent(event);
      expect(result.success).toBe(false);
    });
  });
});

