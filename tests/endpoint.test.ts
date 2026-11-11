import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { criarEndpoint, ErroHttp, validar } from '../lib/endpoint';
import { politicaCORS } from '../middlewares/politicaCORS';
import { validarTokenJWT } from '../middlewares/validarTokenJWT';
import { assinarToken } from '../lib/token';
import { chamar } from './ajuda';

describe('validar', () => {
  const schema = z.object({ nome: z.string('Nome não é válido') });

  it('devolve o dado validado, sem campos extras', () => {
    expect(validar(schema, { nome: 'Ana', admin: true })).toEqual({
      nome: 'Ana',
    });
  });

  it('lança erro 400 com a mensagem do schema, inclusive sem corpo', () => {
    expect(() => validar(schema, undefined)).toThrow(
      new ErroHttp(400, 'Nome não é válido'),
    );
  });
});

describe('criarEndpoint', () => {
  it('responde 405 para método sem tratador', async () => {
    const resposta = await chamar(criarEndpoint({ GET: vi.fn() }), {
      method: 'POST',
    });

    expect(resposta.status).toBe(405);
  });

  it('converte ErroHttp na resposta correspondente', async () => {
    const endpoint = criarEndpoint({
      GET: () => {
        throw new ErroHttp(400, 'Aula não encontrada');
      },
    });

    expect(await chamar(endpoint, {})).toMatchObject({
      status: 400,
      corpo: { erro: 'Aula não encontrada' },
    });
  });

  it('não vaza detalhes de erro inesperado', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const endpoint = criarEndpoint({
      GET: () => {
        throw new Error('E11000 duplicate key mongodb://usuario:senha@host');
      },
    });

    expect(await chamar(endpoint, {})).toMatchObject({
      status: 500,
      corpo: { erro: 'Ocorreu um erro interno' },
    });
  });
});

describe('validarTokenJWT', () => {
  it('bloqueia sem token e libera com token válido, expondo o id', async () => {
    process.env.MINHA_CHAVE_JWT = 'chave-de-teste';
    const handler = vi.fn((req, res) => res.status(200).json({ id: req.usuarioId }));
    const protegido = validarTokenJWT(handler);

    expect((await chamar(protegido, {})).status).toBe(401);
    expect(handler).not.toHaveBeenCalled();

    const resposta = await chamar(protegido, {
      headers: { authorization: `Bearer ${assinarToken('abc')}` },
    });
    expect(resposta.corpo).toEqual({ id: 'abc' });
  });

  it('ignora userId enviado na query', async () => {
    process.env.MINHA_CHAVE_JWT = 'chave-de-teste';
    const protegido = validarTokenJWT((_req, res) => res.status(200).end());

    const resposta = await chamar(protegido, { query: { userId: 'abc' } });
    expect(resposta.status).toBe(401);
  });
});

describe('politicaCORS', () => {
  const handler = politicaCORS((_req, res) => res.status(200).json({}));

  it('aceita qualquer origem quando CORS_ORIGENS não está definida', async () => {
    delete process.env.CORS_ORIGENS;

    const resposta = await chamar(handler, {
      headers: { origin: 'https://qualquer.com' },
    });
    expect(resposta.cabecalhos['Access-Control-Allow-Origin']).toBe('*');
  });

  it('com CORS_ORIGENS, só devolve o cabeçalho para origem da lista', async () => {
    process.env.CORS_ORIGENS = 'https://app.com, https://outro.com';

    const permitida = await chamar(handler, {
      headers: { origin: 'https://outro.com' },
    });
    const bloqueada = await chamar(handler, {
      headers: { origin: 'https://malicioso.com' },
    });

    expect(permitida.cabecalhos['Access-Control-Allow-Origin']).toBe(
      'https://outro.com',
    );
    expect(bloqueada.cabecalhos).not.toHaveProperty(
      'Access-Control-Allow-Origin',
    );
    delete process.env.CORS_ORIGENS;
  });

  it('responde ao preflight sem chamar o handler', async () => {
    const interno = vi.fn();

    const resposta = await chamar(politicaCORS(interno), { method: 'OPTIONS' });
    expect(resposta.status).toBe(200);
    expect(interno).not.toHaveBeenCalled();
  });
});
