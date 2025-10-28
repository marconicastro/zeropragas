/**
 * Enhanced Matching Avançado para Meta
 * Envia dados adicionais para melhorar precisão de matching
 */

interface EnhancedUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  gender?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
}

export class MetaEnhancedMatching {
  /**
   * Limpa e formata dados para Enhanced Matching
   */
  static formatUserData(userData: EnhancedUserData) {
    const cleanData: any = {};

    // Email - lowercase, sem espaços
    if (userData.email) {
      cleanData.em = userData.email.toLowerCase().trim().replace(/\s+/g, '');
    }

    // Telefone - apenas números, código do país
    if (userData.phone) {
      const phoneClean = userData.phone.replace(/\D/g, '');
      if (phoneClean.length >= 10) {
        cleanData.ph = phoneClean.length === 10 ? `55${phoneClean}` : phoneClean;
      }
    }

    // Nome - separar first/last name
    if (userData.firstName) {
      cleanData.fn = userData.firstName.toLowerCase().trim().replace(/\s+/g, '');
    }

    if (userData.lastName) {
      cleanData.ln = userData.lastName.toLowerCase().trim().replace(/\s+/g, '');
    }

    // Localização
    if (userData.city) {
      cleanData.ct = userData.city.toLowerCase().trim().replace(/\s+/g, '');
    }

    if (userData.state) {
      cleanData.st = userData.state.toLowerCase().trim().replace(/\s+/g, '');
    }

    if (userData.country) {
      cleanData.country = userData.country.toLowerCase().trim().replace(/\s+/g, '');
    }

    if (userData.zipCode) {
      cleanData.zip = userData.zipCode.replace(/\D/g, '');
    }

    // Dados demográficos (se disponíveis)
    if (userData.gender) {
      cleanData.ge = userData.gender.toLowerCase().trim();
    }

    if (userData.birthYear && userData.birthMonth && userData.birthDay) {
      cleanData.dob = `${userData.birthYear}${userData.birthMonth.padStart(2, '0')}${userData.birthDay.padStart(2, '0')}`;
    }

    return cleanData;
  }

  /**
   * Extrai dados da URL para enriquecer o matching
   */
  static extractFromURL(url: string): Partial<EnhancedUserData> {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const extracted: Partial<EnhancedUserData> = {};

    // Extrair dados de UTM parameters que possam conter informações
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');

    // Se utm_content contiver informações demográficas
    if (utmContent) {
      // Exemplo: utm_content=male_25-35_sao_paulo
      const parts = utmContent.split('_');
      if (parts[0] && ['male', 'female'].includes(parts[0])) {
        extracted.gender = parts[0];
      }
      
      if (parts[2]) {
        extracted.city = parts[2].replace(/-/g, ' ');
      }
    }

    return extracted;
  }

  /**
   * Combina dados do formulário com dados da URL
   */
  static combineData(formData: any, urlData: any) {
    const urlExtracted = this.extractFromURL(urlData.url || window.location.href);
    
    // Separar nome completo
    const nameParts = formData.fullName?.split(' ') || [];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return this.formatUserData({
      ...formData,
      firstName,
      lastName,
      ...urlExtracted,
      country: 'BR' // Brasil como padrão
    });
  }
}