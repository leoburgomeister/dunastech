import { describe, it, expect } from 'vitest';
import { validateCPF, formatCPF, slugify } from './utils';

describe('validateCPF', () => {
  it('should validate correct CPFs', () => {
    // Valid generated CPFs
    expect(validateCPF('11144477735')).toBe(true);
    expect(validateCPF('52998224725')).toBe(true);
    expect(validateCPF('11144477736')).toBe(false); // Invalid check digits
  });

  it('should reject CPFs with invalid lengths or characters', () => {
    expect(validateCPF('123')).toBe(false);
    expect(validateCPF('11111111111111')).toBe(false);
    expect(validateCPF('abc')).toBe(false);
  });

  it('should reject CPFs with all same digits', () => {
    expect(validateCPF('00000000000')).toBe(false);
    expect(validateCPF('11111111111')).toBe(false);
    expect(validateCPF('99999999999')).toBe(false);
  });
});

describe('formatCPF', () => {
  it('should format raw CPFs correctly', () => {
    expect(formatCPF('11144477735')).toBe('111.444.777-35');
    expect(formatCPF('52998224725')).toBe('529.982.247-25');
  });

  it('should handle partial CPFs gracefully', () => {
    expect(formatCPF('12')).toBe('12');
    expect(formatCPF('1234')).toBe('123.4');
    expect(formatCPF('1234567')).toBe('123.456.7');
  });
});

describe('slugify', () => {
  it('should convert text to URL-friendly slugs', () => {
    expect(slugify('Ponta Negra e Morro do Careca')).toBe('ponta-negra-e-morro-do-careca');
    expect(slugify('Praia da Pipa (Tibau do Sul)')).toBe('praia-da-pipa-tibau-do-sul');
    expect(slugify('São Miguel do Gostoso')).toBe('sao-miguel-do-gostoso');
  });

  it('should remove special characters and normalize accents', () => {
    expect(slugify('Água Sanitária!Input')).toBe('agua-sanitariainput');
    expect(slugify('coração e açaí')).toBe('coracao-e-acai');
  });
});
