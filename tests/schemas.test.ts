import { describe, expect, it } from 'vitest';
import { escaparRegex, idSchema } from '../schemas/comum';
import { comentarioSchema } from '../schemas/publicacao';
import {
  atualizarUsuarioSchema,
  cadastroUsuarioSchema,
  CAMPOS_PUBLICOS,
  loginSchema,
  pesquisaQuerySchema,
} from '../schemas/usuario';

const usuarioValido = {
  nome: 'Ana',
  email: 'ana@exemplo.com',
  senha: 'segredo-forte',
};

describe('schemas de usuário', () => {
  it('aceita cadastro válido e descarta campos desconhecidos', () => {
    expect(
      cadastroUsuarioSchema.parse({
        ...usuarioValido,
        seguidores: 9999,
        avatar: 'http://externo',
      }),
    ).toEqual(usuarioValido);
  });

  it('rejeita e-mail inválido e senha curta', () => {
    for (const campo of [{ email: 'ana' }, { senha: '1234567' }]) {
      expect(
        cadastroUsuarioSchema.safeParse({ ...usuarioValido, ...campo }).success,
      ).toBe(false);
    }
  });

  it('login rejeita operadores do MongoDB no lugar de texto', () => {
    expect(
      loginSchema.safeParse({ login: { $ne: null }, senha: 'x' }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ login: 'ana@exemplo.com', senha: { $gt: '' } })
        .success,
    ).toBe(false);
  });

  it('login aceita senha antiga, mais curta que o mínimo atual', () => {
    expect(
      loginSchema.safeParse({ login: 'ana@exemplo.com', senha: '1234' }).success,
    ).toBe(true);
  });

  it('atualização só aceita o nome; contadores e senha são descartados', () => {
    expect(
      atualizarUsuarioSchema.parse({ nome: 'Ana', seguidores: 1000, senha: 'z' }),
    ).toEqual({ nome: 'Ana' });
  });

  it('a senha nunca está entre os campos públicos', () => {
    expect(CAMPOS_PUBLICOS.split(' ')).not.toContain('senha');
  });
});

describe('schemas de consulta e publicação', () => {
  it('id precisa ser um ObjectId; objeto e lista são rejeitados', () => {
    expect(idSchema.safeParse('65a1f0c2e4b0a1b2c3d4e5f6').success).toBe(true);
    for (const id of ['123', { $ne: null }, ['65a1f0c2e4b0a1b2c3d4e5f6']]) {
      expect(idSchema.safeParse(id).success).toBe(false);
    }
  });

  it('busca exige ao menos dois caracteres', () => {
    expect(pesquisaQuerySchema.safeParse({ filtro: 'a' }).success).toBe(false);
    expect(pesquisaQuerySchema.safeParse({ filtro: 'an' }).success).toBe(true);
  });

  it('comentário não aceita objeto nem texto vazio', () => {
    for (const comentario of ['', ' ', { $set: {} }]) {
      expect(comentarioSchema.safeParse({ comentario }).success).toBe(false);
    }
  });

  it('escaparRegex neutraliza metacaracteres', () => {
    const padrao = new RegExp(escaparRegex('(a+)+$'));

    expect(padrao.test('(a+)+$')).toBe(true);
    expect(padrao.test('aaaa')).toBe(false);
  });
});
