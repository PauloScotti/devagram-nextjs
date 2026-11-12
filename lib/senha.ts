import argon2 from 'argon2';
import { createHash, timingSafeEqual } from 'crypto';

const HASH_MD5 = /^[a-f0-9]{32}$/;

export function gerarHash(senha: string): Promise<string> {
  return argon2.hash(senha, { type: argon2.argon2id });
}

export type ResultadoSenha = { valida: boolean; precisaRegravar: boolean };

// As contas antigas guardam a senha em MD5. Elas continuam entrando, e quem
// chama regrava com argon2 quando `precisaRegravar` vem verdadeiro.
export async function conferirSenha(
  senha: string,
  armazenada: string,
): Promise<ResultadoSenha> {
  if (HASH_MD5.test(armazenada)) {
    const calculada = createHash('md5').update(senha).digest();
    const valida = timingSafeEqual(calculada, Buffer.from(armazenada, 'hex'));
    return { valida, precisaRegravar: valida };
  }

  try {
    const valida = await argon2.verify(armazenada, senha);
    return {
      valida,
      precisaRegravar: valida && argon2.needsRehash(armazenada),
    };
  } catch {
    return { valida: false, precisaRegravar: false };
  }
}
