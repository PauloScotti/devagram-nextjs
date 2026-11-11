import jwt from 'jsonwebtoken';
import { ErroHttp } from './endpoint';

const ALGORITMO = 'HS256';
const VALIDADE = '7d';

function chave(): string {
  const { MINHA_CHAVE_JWT } = process.env;
  if (!MINHA_CHAVE_JWT) {
    throw new ErroHttp(500, 'ENV JWT não informada!');
  }
  return MINHA_CHAVE_JWT;
}

export function assinarToken(usuarioId: string): string {
  return jwt.sign({ _id: usuarioId }, chave(), {
    algorithm: ALGORITMO,
    expiresIn: VALIDADE,
  });
}

// Devolve o id do usuário, ou null quando o cabeçalho não traz um token válido.
export function lerToken(authorization: string | undefined): string | null {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  const segredo = chave();
  try {
    const payload = jwt.verify(authorization.slice(7), segredo, {
      algorithms: [ALGORITMO],
    });
    const id = typeof payload === 'object' ? payload._id : undefined;
    return typeof id === 'string' ? id : null;
  } catch {
    return null;
  }
}
