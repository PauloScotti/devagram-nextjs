import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';
import { assinarToken, lerToken } from '../lib/token';

describe('token', () => {
  beforeEach(() => {
    process.env.MINHA_CHAVE_JWT = 'chave-de-teste';
  });

  it('assina e lê o id do usuário', () => {
    const token = assinarToken('65a1f0c2e4b0a1b2c3d4e5f6');

    expect(lerToken(`Bearer ${token}`)).toBe('65a1f0c2e4b0a1b2c3d4e5f6');
  });

  it('emite token com validade', () => {
    const payload = jwt.decode(assinarToken('abc')) as jwt.JwtPayload;

    expect(payload.exp).toBeGreaterThan(payload.iat!);
  });

  it('rejeita cabeçalho ausente, sem Bearer ou adulterado', () => {
    const token = assinarToken('abc');

    expect(lerToken(undefined)).toBeNull();
    expect(lerToken(token)).toBeNull();
    expect(lerToken(`Bearer ${token}x`)).toBeNull();
  });

  it('rejeita token assinado com outra chave, expirado ou sem assinatura', () => {
    const outraChave = jwt.sign({ _id: 'abc' }, 'outra-chave');
    const expirado = jwt.sign({ _id: 'abc' }, 'chave-de-teste', {
      expiresIn: -10,
    });
    const semAssinatura = jwt.sign({ _id: 'abc' }, '', { algorithm: 'none' });

    expect(lerToken(`Bearer ${outraChave}`)).toBeNull();
    expect(lerToken(`Bearer ${expirado}`)).toBeNull();
    expect(lerToken(`Bearer ${semAssinatura}`)).toBeNull();
  });

  it('rejeita payload cujo _id não é texto', () => {
    const token = jwt.sign({ _id: { $ne: null } }, 'chave-de-teste');

    expect(lerToken(`Bearer ${token}`)).toBeNull();
  });

  it('falha com erro 500 quando a chave não está configurada', () => {
    delete process.env.MINHA_CHAVE_JWT;

    expect(() => lerToken('Bearer qualquer')).toThrow('ENV JWT não informada!');
  });
});
