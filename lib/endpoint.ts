import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { ZodType } from 'zod';

export type RespostaPadraoMsg = {
  msg?: string;
  erro?: string;
};

export type RequisicaoAutenticada = NextApiRequest & { usuarioId: string };

export class ErroHttp extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Tratador<Req> = (req: Req, res: NextApiResponse) => unknown;

export function validar<T>(schema: ZodType<T>, dado: unknown): T {
  const resultado = schema.safeParse(dado ?? {});
  if (!resultado.success) {
    throw new ErroHttp(400, resultado.error.issues[0].message);
  }
  return resultado.data;
}

export function responderErro(res: NextApiResponse, erro: unknown) {
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message });
  }
  console.error(erro);
  return res.status(500).json({ erro: 'Ocorreu um erro interno' });
}

// Despacha por método HTTP e converte qualquer exceção em resposta JSON, sem
// vazar detalhes internos (mensagem do banco, stack) para o cliente.
export function criarEndpoint<Req extends NextApiRequest = NextApiRequest>(
  tratadores: Partial<Record<Metodo, Tratador<Req>>>,
): NextApiHandler {
  return async (req, res) => {
    const tratador = tratadores[req.method as Metodo];
    if (!tratador) {
      return res.status(405).json({ erro: 'Método informado não é válido' });
    }
    try {
      await tratador(req as Req, res);
    } catch (erro) {
      responderErro(res, erro);
    }
  };
}
