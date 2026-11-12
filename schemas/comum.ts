import { z } from './zod';

export const idSchema = z
  .string({ error: 'Id não é válido' })
  .regex(/^[a-f0-9]{24}$/i, 'Id não é válido')
  .openapi({ example: '65a1f0c2e4b0a1b2c3d4e5f6' });

export const idQuerySchema = z.object({ id: idSchema });

export const mensagemSchema = z
  .object({ msg: z.string() })
  .openapi('Mensagem');

export const erroSchema = z.object({ erro: z.string() }).openapi('Erro');

// Texto do usuário usado em $regex: sem escapar, vira injeção de expressão regular.
export function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
