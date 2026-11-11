import type { NextApiHandler } from 'next';
import { RequisicaoAutenticada, responderErro } from '../lib/endpoint';
import { lerToken } from '../lib/token';

export const validarTokenJWT =
  (handler: NextApiHandler): NextApiHandler =>
  (req, res) => {
    let usuarioId: string | null;
    try {
      usuarioId = lerToken(req.headers.authorization);
    } catch (erro) {
      return responderErro(res, erro);
    }
    if (!usuarioId) {
      return res
        .status(401)
        .json({ erro: 'Não foi possível validar o token de acesso!' });
    }

    (req as RequisicaoAutenticada).usuarioId = usuarioId;
    return handler(req, res);
  };
