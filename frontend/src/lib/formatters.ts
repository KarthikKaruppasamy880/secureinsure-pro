export interface FormatOptions {
  currency?: {
    symbol?: string;
    decimals?: number;
    locale?: string;
  };
  percent?: {
    decimals?: number;
    showSymbol?: boolean;
  };
  date?: {
    format?: string;
    locale?: string;
  };
  phone?: {
    format?: string;
    country?: string;
  };
  ssn?: {
    mask?: boolean;
    separator?: string;
  };
  zip?: {
    format?: string;
    country?: string;
  };
}

export class Formatters {
  private static defaultOptions: FormatOptions = {
    currency: { symbol: '$', decimals: 2, locale: 'en-US' },
    percent: { decimals: 2, showSymbol: true },
    date: { format: 'MM/DD/YYYY', locale: 'en-US' },
    phone: { format: '(###) ###-####', country: 'US' },
    ssn: { mask: false, separator: '-' },
    zip: { format: '#####', country: 'US' }
  };

  static formatValue(value: any, type: string, format?: string, options?: Partial<FormatOptions>): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const mergedOptions = this.mergeOptions(options);

    switch (type) {
      case 'currency':
        return this.formatCurrency(value, format, mergedOptions.currency);
      case 'percent':
        return this.formatPercent(value, format, mergedOptions.percent);
      case 'date':
        return this.formatDate(value, format, mergedOptions.date);
      case 'phone':
        return this.formatPhone(value, format, mergedOptions.phone);
      case 'ssn':
        return this.formatSSN(value, format, mergedOptions.ssn);
      case 'zip':
        return this.formatZip(value, format, mergedOptions.zip);
      case 'email':
        return this.formatEmail(value);
      case 'number':
        return this.formatNumber(value, format);
      default:
        return String(value);
    }
  }

  static parseValue(value: string, type: string, format?: string): any {
    if (!value || typeof value !== 'string') {
      return value;
    }

    switch (type) {
      case 'currency':
        return this.parseCurrency(value);
      case 'percent':
        return this.parsePercent(value);
      case 'date':
        return this.parseDate(value);
      case 'phone':
        return this.parsePhone(value);
      case 'ssn':
        return this.parseSSN(value);
      case 'number':
        return this.parseNumber(value);
      default:
        return value;
    }
  }

  private static formatCurrency(value: any, format?: string, options?: FormatOptions['currency']): string {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : Number(value);
    
    if (isNaN(numValue)) return '';
    
    const opts = { ...this.defaultOptions.currency, ...options };
    
    try {
      return new Intl.NumberFormat(opts.locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: opts.decimals,
        maximumFractionDigits: opts.decimals
      }).format(numValue);
    } catch {
      return `${opts.symbol}${numValue.toFixed(opts.decimals)}`;
    }
  }

  private static formatPercent(value: any, format?: string, options?: FormatOptions['percent']): string {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : Number(value);
    
    if (isNaN(numValue)) return '';
    
    const opts = { ...this.defaultOptions.percent, ...options };
    const formatted = numValue.toFixed(opts.decimals);
    
    return opts.showSymbol ? `${formatted}%` : formatted;
  }

  private static formatDate(value: any, format?: string, options?: FormatOptions['date']): string {
    let date: Date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) return '';
    
    const opts = { ...this.defaultOptions.date, ...options };
    
    try {
      if (opts.format === 'MM/DD/YYYY') {
        return date.toLocaleDateString(opts.locale);
      } else if (opts.format === 'MM-DD-YYYY') {
        return date.toLocaleDateString(opts.locale).replace(/\//g, '-');
      } else if (opts.format === 'DD/MM/YYYY') {
        return date.toLocaleDateString(opts.locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      return date.toLocaleDateString(opts.locale);
    } catch {
      return date.toLocaleDateString();
    }
  }

  private static formatPhone(value: any, format?: string, options?: FormatOptions['phone']): string {
    const phoneStr = String(value).replace(/\D/g, '');
    const opts = { ...this.defaultOptions.phone, ...options };
    
    if (phoneStr.length === 10) {
      return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (phoneStr.length === 11 && phoneStr.startsWith('1')) {
      return phoneStr.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    }
    
    return phoneStr;
  }

  private static formatSSN(value: any, format?: string, options?: FormatOptions['ssn']): string {
    const ssnStr = String(value).replace(/\D/g, '');
    const opts = { ...this.defaultOptions.ssn, ...options };
    
    if (ssnStr.length === 9) {
      if (opts.mask) {
        return `***-**-${ssnStr.slice(-4)}`;
      }
      return ssnStr.replace(/(\d{3})(\d{2})(\d{4})/, `$1${opts.separator}$2${opts.separator}$3`);
    }
    
    return ssnStr;
  }

  private static formatZip(value: any, format?: string, options?: FormatOptions['zip']): string {
    const zipStr = String(value).replace(/\D/g, '');
    const opts = { ...this.defaultOptions.zip, ...options };
    
    if (zipStr.length === 5) {
      return zipStr;
    } else if (zipStr.length === 9) {
      return `${zipStr.slice(0, 5)}-${zipStr.slice(5)}`;
    }
    
    return zipStr;
  }

  private static formatEmail(value: any): string {
    return String(value).toLowerCase().trim();
  }

  private static formatNumber(value: any, format?: string): string {
    const numValue = Number(value);
    
    if (isNaN(numValue)) return '';
    
    if (format === 'integer') {
      return Math.round(numValue).toString();
    } else if (format === 'decimal') {
      return numValue.toFixed(2);
    }
    
    return numValue.toString();
  }

  private static parseCurrency(value: string): number {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static parsePercent(value: string): number {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static parseDate(value: string): Date | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  private static parsePhone(value: string): string {
    return value.replace(/\D/g, '');
  }

  private static parseSSN(value: string): string {
    return value.replace(/\D/g, '');
  }

  private static parseNumber(value: string): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static mergeOptions(options?: Partial<FormatOptions>): FormatOptions {
    if (!options) return this.defaultOptions;
    
    return {
      currency: { ...this.defaultOptions.currency, ...options.currency },
      percent: { ...this.defaultOptions.percent, ...options.percent },
      date: { ...this.defaultOptions.date, ...options.date },
      phone: { ...this.defaultOptions.phone, ...options.phone },
      ssn: { ...this.defaultOptions.ssn, ...options.ssn },
      zip: { ...this.defaultOptions.zip, ...options.zip }
    };
  }

  // Utility method to get display value for form fields
  static getDisplayValue(value: any, type: string, format?: string, options?: Partial<FormatOptions>): string {
    return this.formatValue(value, type, format, options);
  }

  // Utility method to get input value for form fields
  static getInputValue(value: any, type: string): any {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return value;
      case 'checkbox':
        return Boolean(value);
      case 'number':
      case 'currency':
      case 'percent':
        return Number(value) || '';
      default:
        return String(value);
    }
  }
}
