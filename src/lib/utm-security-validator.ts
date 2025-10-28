// 🛡️ Módulo de Validação de Segurança para Parâmetros UTM e Checkout
// ✅ Validação de entrada • ✅ Sanitização • ✅ Prevenção contra injeção

interface SecurityRule {
  name: string;
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sanitizedData: Record<string, string>;
  riskScore: number;
}

interface ValidationError {
  field: string;
  value: string;
  rule: string;
  message: string;
  severity: 'medium' | 'high' | 'critical';
}

interface ValidationWarning {
  field: string;
  value: string;
  message: string;
  suggestion: string;
}

class UTMSecurityValidator {
  private rules: SecurityRule[] = [
    // Regras de segurança críticas
    {
      name: 'no_script_tags',
      pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      description: 'Detecta tags de script',
      severity: 'critical'
    },
    {
      name: 'no_javascript_protocol',
      pattern: /javascript:/gi,
      description: 'Detecta protocolo javascript:',
      severity: 'critical'
    },
    {
      name: 'no_data_urls',
      pattern: /data:(?:text\/html|application\/javascript)/gi,
      description: 'Detecta data URLs maliciosos',
      severity: 'critical'
    },
    {
      name: 'no_sql_injection',
      pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER)\b)/gi,
      description: 'Detecta possíveis injeções SQL',
      severity: 'high'
    },
    {
      name: 'no_xss_patterns',
      pattern: /on\w+\s*=/gi,
      description: 'Detecta event handlers XSS',
      severity: 'high'
    },
    {
      name: 'no_html_tags',
      pattern: /<[^>]*>/g,
      description: 'Detecta tags HTML',
      severity: 'medium'
    },
    {
      name: 'no_special_chars',
      pattern: /[<>"'&]/g,
      description: 'Detecta caracteres especiais perigosos',
      severity: 'medium'
    }
  ];

  private allowedDomains = [
    'go.allpes.com.br',
    'maracujazeropragas.com',
    'localhost',
    '127.0.0.1'
  ];

  private allowedProtocols = [
    'https:',
    'http:'
  ];

  /**
   * Valida e sanitiza dados de parâmetros
   */
  public validateParams(params: Record<string, string>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const sanitizedData: Record<string, string> = {};
    let riskScore = 0;

    Object.entries(params).forEach(([key, value]) => {
      if (!value || typeof value !== 'string') return;

      // Validar cada parâmetro contra as regras
      this.rules.forEach(rule => {
        if (rule.pattern.test(value)) {
          const severityWeight = this.getSeverityWeight(rule.severity);
          riskScore += severityWeight;

          if (rule.severity === 'critical' || rule.severity === 'high') {
            errors.push({
              field: key,
              value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
              rule: rule.name,
              message: `Possível ${rule.description.toLowerCase()} detectado`,
              severity: rule.severity
            });
          }
        }
      });

      // Sanitizar valor
      const sanitized = this.sanitizeValue(value);
      sanitizedData[key] = sanitized;

      // Adicionar avisos para valores suspeitos
      if (sanitized !== value) {
        warnings.push({
          field: key,
          value: value.substring(0, 30) + (value.length > 30 ? '...' : ''),
          message: 'Valor foi sanitizado',
          suggestion: 'Verifique se o valor está correto após a limpeza'
        });
      }

      // Validações específicas por tipo de parâmetro
      this.validateSpecificParam(key, sanitized, errors, warnings);
    });

    const isValid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return {
      isValid,
      errors,
      warnings,
      sanitizedData,
      riskScore: Math.min(riskScore, 100)
    };
  }

  /**
   * Valida URL de checkout
   */
  public validateCheckoutURL(url: string): ValidationResult {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      
      // Extrair parâmetros
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Validar domínio
      if (!this.allowedDomains.includes(urlObj.hostname)) {
        return {
          isValid: false,
          errors: [{
            field: 'domain',
            value: urlObj.hostname,
            rule: 'allowed_domain',
            message: 'Domínio não está na lista de permitidos',
            severity: 'high'
          }],
          warnings: [],
          sanitizedData: {},
          riskScore: 80
        };
      }

      // Validar protocolo
      if (!this.allowedProtocols.includes(urlObj.protocol)) {
        return {
          isValid: false,
          errors: [{
            field: 'protocol',
            value: urlObj.protocol,
            rule: 'allowed_protocol',
            message: 'Protocolo não permitido',
            severity: 'critical'
          }],
          warnings: [],
          sanitizedData: {},
          riskScore: 100
        };
      }

      // Validar parâmetros
      return this.validateParams(params);

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          field: 'url',
          value: url,
          rule: 'valid_url',
          message: 'URL inválida',
          severity: 'critical'
        }],
        warnings: [],
        sanitizedData: {},
        riskScore: 100
      };
    }
  }

  /**
   * Valida parâmetros específicos baseado em seu tipo
   */
  private validateSpecificParam(
    key: string, 
    value: string, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    switch (key) {
      case 'email':
        if (!this.isValidEmail(value)) {
          warnings.push({
            field: key,
            value,
            message: 'Formato de email inválido',
            suggestion: 'Use formato: nome@exemplo.com'
          });
        }
        break;

      case 'phone':
      case 'telefone':
        if (!this.isValidPhone(value)) {
          warnings.push({
            field: key,
            value,
            message: 'Formato de telefone inválido',
            suggestion: 'Use apenas números ou formato (XX) XXXXX-XXXX'
          });
        }
        break;

      case 'value':
      case 'valor':
        if (!this.isValidCurrency(value)) {
          errors.push({
            field: key,
            value,
            rule: 'valid_currency',
            message: 'Valor monetário inválido',
            severity: 'medium'
          });
        }
        break;

      case 'session_id':
      case 'event_id':
        if (!this.isValidSessionId(value)) {
          warnings.push({
            field: key,
            value,
            message: 'Formato de ID de sessão inválido',
            suggestion: 'Use formato: prefixo_timestamp_suffix'
          });
        }
        break;

      case 'url':
      case 'success_url':
      case 'cancel_url':
        if (!this.isValidURL(value)) {
          errors.push({
            field: key,
            value,
            rule: 'valid_url_format',
            message: 'Formato de URL inválido',
            severity: 'high'
          });
        }
        break;
    }
  }

  /**
   * Sanitiza valor removendo conteúdo perigoso
   */
  private sanitizeValue(value: string): string {
    return value
      // Remover tags HTML
      .replace(/<[^>]*>/g, '')
      // Remover event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remover protocolos perigosos
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      // Normalizar aspas
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      // Remover caracteres especiais perigosos
      .replace(/[<>]/g, '')
      // Trim
      .trim();
  }

  /**
   * Obtém peso baseado na severidade
   */
  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 25;
      case 'high': return 15;
      case 'medium': return 8;
      case 'low': return 3;
      default: return 1;
    }
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de telefone
   */
  private isValidPhone(phone: string): boolean {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Verifica se tem entre 10 e 11 dígitos
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Valida formato de moeda
   */
  private isValidCurrency(value: string): boolean {
    const currencyRegex = /^\d+(\.\d{1,2})?$/;
    return currencyRegex.test(value);
  }

  /**
   * Valida formato de ID de sessão
   */
  private isValidSessionId(sessionId: string): boolean {
    // Verifica formato: prefixo_timestamp_suffix
    const sessionRegex = /^[a-z]+_\d+_[a-z0-9]+$/i;
    return sessionRegex.test(sessionId);
  }

  /**
   * Valida formato de URL
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gera relatório de segurança
   */
  public generateSecurityReport(result: ValidationResult): string {
    const { isValid, errors, warnings, riskScore } = result;
    
    let report = `🛡️ RELATÓRIO DE SEGURANÇA\n`;
    report += `═══════════════════════════════════════\n\n`;
    
    report += `📊 Status: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`;
    report += `🎯 Pontuação de Risco: ${riskScore}/100\n\n`;
    
    if (errors.length > 0) {
      report += `🚨 ERROS ENCONTRADOS:\n`;
      errors.forEach((error, index) => {
        report += `${index + 1}. ${error.field}: ${error.message}\n`;
        report += `   Regra: ${error.rule} | Severidade: ${error.severity}\n`;
        report += `   Valor: ${error.value}\n\n`;
      });
    }
    
    if (warnings.length > 0) {
      report += `⚠️  AVISOS:\n`;
      warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning.field}: ${warning.message}\n`;
        report += `   Sugestão: ${warning.suggestion}\n`;
        report += `   Valor: ${warning.value}\n\n`;
      });
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      report += `✅ Nenhuma ameaça detectada. Dados seguros para processamento.\n`;
    }
    
    return report;
  }
}

// Instância global
const securityValidator = new UTMSecurityValidator();

export default securityValidator;
export { UTMSecurityValidator, SecurityRule, ValidationResult, ValidationError, ValidationWarning };