import type { NextApiHandler } from 'next';

type Requisicao = {
  method?: string;
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
};

// Chama um handler de API com req/res mínimos e devolve o que foi respondido.
export async function chamar(handler: NextApiHandler, requisicao: Requisicao) {
  const resposta = {
    status: 0,
    corpo: undefined as any,
    cabecalhos: {} as Record<string, unknown>,
  };
  const res = {
    status(codigo: number) {
      resposta.status = codigo;
      return res;
    },
    json(corpo: unknown) {
      resposta.corpo = corpo;
      return res;
    },
    send(corpo: unknown) {
      resposta.corpo = corpo;
      return res;
    },
    end() {
      return res;
    },
    setHeader(nome: string, valor: unknown) {
      resposta.cabecalhos[nome] = valor;
      return res;
    },
  };
  const req = { method: 'GET', query: {}, headers: {}, ...requisicao };
  await handler(req as any, res as any);
  return resposta;
}
