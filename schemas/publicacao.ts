import { z } from './zod';
import { idSchema } from './comum';

export const publicacaoCorpoSchema = z
  .object({
    descricao: z
      .string({ error: 'Descrição não é válida' })
      .trim()
      .min(2, 'Descrição não é válida')
      .max(2200, 'Descrição não é válida'),
  })
  .openapi('NovaPublicacao');

export const comentarioSchema = z
  .object({
    comentario: z
      .string({ error: 'Comentário não é válido' })
      .trim()
      .min(2, 'Comentário não é válido')
      .max(1000, 'Comentário não é válido'),
  })
  .openapi('NovoComentario');

export const feedQuerySchema = z.object({
  id: idSchema.optional().openapi({
    description: 'Id de um usuário, para ver só as publicações dele',
  }),
});

export const publicacaoSchema = z
  .object({
    _id: z.string(),
    idUsuario: z.string(),
    descricao: z.string(),
    foto: z.string(),
    data: z.string().openapi({ format: 'date-time' }),
    comentarios: z.array(
      z.object({
        usuarioId: z.string(),
        nome: z.string(),
        comentario: z.string(),
      }),
    ),
    likes: z.array(z.string()),
    usuario: z
      .object({
        nome: z.string(),
        avatar: z.string().optional(),
      })
      .optional()
      .openapi({ description: 'Presente no feed do usuário logado' }),
  })
  .openapi('Publicacao');
