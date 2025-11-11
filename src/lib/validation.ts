/**
 * ✅ SISTEMA DE VALIDAÇÃO COM ZOD
 * 
 * Validação de schemas para eventos Meta Pixel
 * Garante que dados estão corretos antes de enviar
 * 
 * USO:
 *   import { validateMetaEvent, MetaEventSchema } from '@/lib/validation';
 *   const result = validateMetaEvent(eventData);
 */

import { z } from 'zod';

/**
 * Schema para user_data do Meta Pixel
 */
export const MetaUserDataSchema = z.object({
  em: z.string().nullable().optional(), // Email hash
  ph: z.string().nullable().optional(), // Phone hash
  fn: z.string().nullable().optional(), // First name hash
  ln: z.string().nullable().optional(), // Last name hash
  ct: z.string().nullable().optional(), // City hash
  st: z.string().nullable().optional(), // State hash
  zp: z.string().nullable().optional(), // Zipcode hash
  country: z.string().nullable().optional(), // Country hash
  external_id: z.string().optional(),
  client_ip_address: z.string().nullable().optional(),
  client_user_agent: z.string().nullable().optional(),
  client_timezone: z.string().optional(),
  client_isp: z.string().optional(),
  fbp: z.string().nullable().optional(), // Facebook Browser Pixel
  fbc: z.string().nullable().optional() // Facebook Click ID
}).refine(
  (data) => {
    // Deve ter pelo menos um identificador
    return !!(data.em || data.ph || data.fn || data.external_id);
  },
  {
    message: 'user_data deve ter pelo menos um identificador (em, ph, fn ou external_id)'
  }
);

/**
 * Schema para custom_data do Meta Pixel
 */
export const MetaCustomDataSchema = z.object({
  value: z.number().optional(),
  currency: z.string().optional(),
  content_ids: z.array(z.string()).optional(),
  content_name: z.string().optional(),
  content_type: z.string().optional(),
  content_category: z.string().optional(),
  transaction_id: z.string().optional(),
  order_id: z.string().optional(),
  event_id: z.string().optional(),
  // Campos adicionais permitidos
}).passthrough(); // Permite campos extras

/**
 * Schema completo para evento Meta Pixel
 */
export const MetaEventSchema = z.object({
  event_name: z.string().min(1),
  event_time: z.number().int().positive(),
  action_source: z.enum(['website', 'email', 'app', 'phone_call', 'chat', 'physical_store', 'system_generated', 'other']),
  event_source_url: z.string().url().optional(),
  user_data: MetaUserDataSchema,
  custom_data: MetaCustomDataSchema.optional(),
  event_id: z.string().optional()
});

/**
 * Tipos TypeScript derivados dos schemas
 */
export type MetaUserData = z.infer<typeof MetaUserDataSchema>;
export type MetaCustomData = z.infer<typeof MetaCustomDataSchema>;
export type MetaEvent = z.infer<typeof MetaEventSchema>;

/**
 * Resultado da validação
 */
export interface ValidationResult {
  success: boolean;
  data?: MetaEvent;
  errors?: z.ZodError;
  errorMessage?: string;
}

/**
 * Valida evento Meta Pixel
 * 
 * @param eventData - Dados do evento a validar
 * @returns Resultado da validação
 * 
 * @example
 * ```typescript
 * const result = validateMetaEvent(eventData);
 * if (result.success) {
 *   // Enviar evento
 * } else {
 *   console.error(result.errorMessage);
 * }
 * ```
 */
export function validateMetaEvent(eventData: unknown): ValidationResult {
  try {
    const validated = MetaEventSchema.parse(eventData);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error,
        errorMessage: `Erro de validação: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      };
    }
    
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Erro desconhecido na validação'
    };
  }
}

/**
 * Valida apenas user_data
 */
export function validateUserData(userData: unknown): ValidationResult {
  try {
    const validated = MetaUserDataSchema.parse(userData);
    return {
      success: true,
      data: validated as any
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error,
        errorMessage: `Erro de validação user_data: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      };
    }
    
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Erro desconhecido na validação'
    };
  }
}

/**
 * Valida apenas custom_data
 */
export function validateCustomData(customData: unknown): ValidationResult {
  try {
    const validated = MetaCustomDataSchema.parse(customData);
    return {
      success: true,
      data: validated as any
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error,
        errorMessage: `Erro de validação custom_data: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      };
    }
    
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Erro desconhecido na validação'
    };
  }
}

