import { ValidationResult, PublishValidationResult, PageState, CTASection } from '@/types/builder.types';

/**
 * Email validation utility with common typo detection
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  // Check for common typos
  const domain = email.split('@')[1]?.toLowerCase();
  const suggestions = checkForTypos(domain);
  
  return {
    isValid: true,
    warning: suggestions ? `Did you mean ${suggestions}?` : undefined
  };
};

/**
 * Check for common email domain typos and suggest corrections
 */
const checkForTypos = (domain: string): string | null => {
  if (!domain) return null;
  
  const commonDomains = [
    'gmail.com',
    'yahoo.com', 
    'hotmail.com',
    'outlook.com',
    'naver.com',
    'daum.net',
    'company.com'
  ];
  
  // Simple distance-based typo detection
  for (const correctDomain of commonDomains) {
    if (getLevenshteinDistance(domain, correctDomain) === 1) {
      return correctDomain;
    }
  }
  
  // Check for common specific typos
  const typoMap: Record<string, string> = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com', 
    'gmail.co': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlook.co': 'outlook.com'
  };
  
  return typoMap[domain] || null;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const getLevenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Validate page for publishing - checks email configuration requirements
 */
export function validateForPublishing(page: PageState | null | undefined): PublishValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Early return if page is not available
  if (!page || !page.sections) {
    return {
      canPublish: false,
      errors: ['Page data is not available'],
      warnings: []
    };
  }
  
  // Check CTA section email configuration
  const ctaSection = page.sections.find(s => s.type === 'cta') as CTASection;
  
  if (ctaSection?.data.formEnabled) {
    if (!ctaSection.data.recipientEmail) {
      errors.push('Email address is required to receive form submissions in CTA section');
    } else {
      const emailValidation = validateEmail(ctaSection.data.recipientEmail);
      if (!emailValidation.isValid) {
        errors.push(`Invalid email address in CTA section: ${emailValidation.error}`);
      } else if (!ctaSection.data.emailVerified) {
        warnings.push('Email has not been verified. Consider sending a test email to ensure you can receive form submissions.');
      }
    }
  }
  
  // Additional validation rules can be added here
  
  return {
    canPublish: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Debounce utility for input validation
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};