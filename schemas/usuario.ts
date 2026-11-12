import { z } from './zod';
import { idSchema } from './comum';

const nomeSchema = z
  .string({ error: 'Nome inválido' })
  .trim()
  .min(2, 'Nome inválido')
  .max(100, 'Nome inválido');

export const cadastroUsuarioSchema = z
  .object({
    nome: nomeSchema,
    email: z.email('E-mail inválido').max(254, 'E-mail inválido'),
    senha: z
      .string({ error: 'Senha inválida' })
      .min(8, 'A senha precisa ter pelo menos 8 caracteres')
      .max(128, 'Senha inválida'),
  })
  .openapi('CadastroUsuario');

export const loginSchema = z
  .object({
    login: z
      .string({ error: 'Usuário ou senha não encontrado' })
      .min(1, 'Usuário ou senha não encontrado')
      .max(254, 'Usuário ou senha não encontrado')
      .openapi({ description: 'E-mail do usuário' }),
    // Sem regra de tamanho mínimo: contas antigas têm senhas mais curtas.
    senha: z
      .string({ error: 'Usuário ou senha não encontrado' })
      .min(1, 'Usuário ou senha não encontrado')
      .max(128, 'Usuário ou senha não encontrado'),
  })
  .openapi('Login');

export const loginRespostaSchema = z
  .object({ nome: z.string(), email: z.string(), token: z.string() })
  .openapi('LoginResposta');

export const atualizarUsuarioSchema = z
  .object({ nome: nomeSchema.optional() })
  .openapi('AtualizarUsuario');

export const pesquisaQuerySchema = z.object({
  id: idSchema.optional(),
  filtro: z
    .string({ error: 'Favor informar pelo menos 2 caracteres para a busca' })
    .min(2, 'Favor informar pelo menos 2 caracteres para a busca')
    .max(100, 'Busca não é válida')
    .optional(),
});

export const usuarioSchema = z
  .object({
    _id: z.string(),
    nome: z.string(),
    email: z.string(),
    avatar: z.string().optional(),
    seguidores: z.array(z.string()).openapi({ description: 'Ids dos seguidores' }),
    seguindo: z.array(z.string()).openapi({ description: 'Ids de quem o usuário segue' }),
    publicacoes: z.number(),
  })
  .openapi('Usuario');

export const perfilSchema = usuarioSchema
  .extend({
    segueEsseUsuario: z
      .boolean()
      .openapi({ description: 'Se o usuário logado segue este usuário' }),
  })
  .openapi('Perfil');

// Campos de usuário que podem sair da API. A senha nunca entra nesta lista.
export const CAMPOS_PUBLICOS = 'nome email avatar seguidores seguindo publicacoes';
