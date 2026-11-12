import { createHash } from 'crypto';
import { describe, expect, it } from 'vitest';
import { conferirSenha, gerarHash } from '../lib/senha';

const md5 = (texto: string) => createHash('md5').update(texto).digest('hex');

describe('senha', () => {
  it('gera hash argon2id, diferente a cada chamada', async () => {
    const primeiro = await gerarHash('segredo-forte');
    const segundo = await gerarHash('segredo-forte');

    expect(primeiro).toMatch(/^\$argon2id\$/);
    expect(primeiro).not.toBe(segundo);
  });

  it('confere a senha certa e rejeita a errada', async () => {
    const hash = await gerarHash('segredo-forte');

    expect(await conferirSenha('segredo-forte', hash)).toEqual({
      valida: true,
      precisaRegravar: false,
    });
    expect((await conferirSenha('errada', hash)).valida).toBe(false);
  });

  it('aceita senha antiga em MD5 e pede para regravar', async () => {
    expect(await conferirSenha('1234', md5('1234'))).toEqual({
      valida: true,
      precisaRegravar: true,
    });
  });

  it('rejeita MD5 errado, e o próprio hash MD5 não serve como senha', async () => {
    const armazenada = md5('1234');

    expect(await conferirSenha('4321', armazenada)).toEqual({
      valida: false,
      precisaRegravar: false,
    });
    expect((await conferirSenha(armazenada, armazenada)).valida).toBe(false);
  });

  it('rejeita valor armazenado em formato desconhecido sem estourar', async () => {
    expect(await conferirSenha('1234', 'texto-qualquer')).toEqual({
      valida: false,
      precisaRegravar: false,
    });
  });
});
