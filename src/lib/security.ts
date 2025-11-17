// Utilitários de segurança

interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'phone' | 'cpf';
  minLength?: number;
  maxLength?: number;
}

export class SecurityUtils {
  // Sanitizar dados de entrada
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/[<>]/g, '') // Remove tags HTML básicas
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validar se o usuário tem permissão para acessar um recurso
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'administrador': 3,
      'funcionario': 2,
      'visitante': 1
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }

  // Gerar token de sessão seguro
  static generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validar força da senha
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Comprimento mínimo
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('A senha deve ter pelo menos 8 caracteres');
    }

    // Contém letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('A senha deve conter pelo menos uma letra minúscula');
    }

    // Contém letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    // Contém números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('A senha deve conter pelo menos um número');
    }

    // Contém caracteres especiais
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('A senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: score >= 3,
      score,
      feedback
    };
  }

  // Rate limiting simples
  static rateLimitCheck(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Remove tentativas antigas
    const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false; // Rate limit excedido
    }
    
    // Adiciona nova tentativa
    validAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(validAttempts));
    
    return true; // Permitido
  }

  // Log de atividades de segurança
  static logSecurityEvent(event: string, details: any, userId?: string) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userId,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Em produção, isso viria do servidor
    };

    // Em produção, isso seria enviado para um serviço de logging
    console.log('Security Event:', logEntry);
    
    // Salvar localmente para debug
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
  }

  // Validar dados antes de enviar para o servidor
  static validateData(data: any, schema: Record<string, ValidationRule>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [key, ruleSet] of Object.entries(schema)) {
      const value = data[key];
      
      if (ruleSet.required && (!value || value.toString().trim() === '')) {
        errors.push(`${key} é obrigatório`);
        continue;
      }

      if (value && ruleSet.type) {
        if (ruleSet.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${key} deve ser um email válido`);
        }
        
        if (ruleSet.type === 'phone' && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
          errors.push(`${key} deve estar no formato (00) 00000-0000`);
        }
        
        if (ruleSet.type === 'cpf' && !this.validateCPF(value)) {
          errors.push(`${key} deve ser um CPF válido`);
        }
      }

      if (value && ruleSet.minLength && value.length < ruleSet.minLength) {
        errors.push(`${key} deve ter pelo menos ${ruleSet.minLength} caracteres`);
      }

      if (value && ruleSet.maxLength && value.length > ruleSet.maxLength) {
        errors.push(`${key} deve ter no máximo ${ruleSet.maxLength} caracteres`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validar CPF
  static validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }
}

