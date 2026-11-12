import {
  OpenApiGeneratorV31,
  OpenAPIRegistry,
  RouteConfig,
} from '@asteasolutions/zod-to-openapi';
import type { ZodType } from 'zod';
import { z } from '../schemas/zod';
import { erroSchema, idQuerySchema, mensagemSchema } from '../schemas/comum';
import {
  comentarioSchema,
  feedQuerySchema,
  publicacaoCorpoSchema,
  publicacaoSchema,
} from '../schemas/publicacao';
import {
  atualizarUsuarioSchema,
  cadastroUsuarioSchema,
  loginRespostaSchema,
  loginSchema,
  perfilSchema,
  pesquisaQuerySchema,
  usuarioSchema,
} from '../schemas/usuario';

type Acesso = 'publico' | 'autenticado';

type Rota = {
  metodo: RouteConfig['method'];
  caminho: string;
  resumo: string;
  grupo: string;
  acesso: Acesso;
  query?: z.ZodObject;
  corpo?: ZodType;
  formulario?: ZodType;
  resposta: ZodType;
};

const arquivoSchema = z.object({
  file: z
    .string()
    .optional()
    .openapi({ format: 'binary', description: 'Imagem de até 5 MB' }),
});

const comArquivo = (schema: ZodType) =>
  (schema as z.ZodObject).extend(arquivoSchema.shape);

const rotas: Rota[] = [
  {
    metodo: 'post',
    caminho: '/api/login',
    resumo: 'Entrar e receber o token de acesso',
    grupo: 'Usuários',
    acesso: 'publico',
    corpo: loginSchema,
    resposta: loginRespostaSchema,
  },
  {
    metodo: 'post',
    caminho: '/api/cadastro',
    resumo: 'Cadastrar usuário',
    grupo: 'Usuários',
    acesso: 'publico',
    formulario: comArquivo(cadastroUsuarioSchema),
    resposta: mensagemSchema,
  },
  {
    metodo: 'get',
    caminho: '/api/usuario',
    resumo: 'Dados do usuário logado',
    grupo: 'Usuários',
    acesso: 'autenticado',
    resposta: usuarioSchema,
  },
  {
    metodo: 'put',
    caminho: '/api/usuario',
    resumo: 'Atualizar nome e avatar do usuário logado',
    grupo: 'Usuários',
    acesso: 'autenticado',
    formulario: comArquivo(atualizarUsuarioSchema),
    resposta: mensagemSchema,
  },
  {
    metodo: 'get',
    caminho: '/api/pesquisa',
    resumo: 'Buscar usuários por nome ou e-mail, ou obter um por id',
    grupo: 'Usuários',
    acesso: 'autenticado',
    query: pesquisaQuerySchema,
    resposta: z.union([perfilSchema, z.array(usuarioSchema)]),
  },
  {
    metodo: 'get',
    caminho: '/api/feed',
    resumo: 'Feed do usuário logado, ou publicações de um usuário',
    grupo: 'Publicações',
    acesso: 'autenticado',
    query: feedQuerySchema,
    resposta: z.array(publicacaoSchema),
  },
  {
    metodo: 'post',
    caminho: '/api/publicacao',
    resumo: 'Criar publicação com imagem',
    grupo: 'Publicações',
    acesso: 'autenticado',
    formulario: comArquivo(publicacaoCorpoSchema),
    resposta: mensagemSchema,
  },
  {
    metodo: 'put',
    caminho: '/api/comentario',
    resumo: 'Comentar em uma publicação (id da publicação)',
    grupo: 'Publicações',
    acesso: 'autenticado',
    query: idQuerySchema,
    corpo: comentarioSchema,
    resposta: mensagemSchema,
  },
  {
    metodo: 'put',
    caminho: '/api/likes',
    resumo: 'Curtir ou descurtir uma publicação (id da publicação)',
    grupo: 'Publicações',
    acesso: 'autenticado',
    query: idQuerySchema,
    resposta: mensagemSchema,
  },
  {
    metodo: 'put',
    caminho: '/api/seguir',
    resumo: 'Seguir ou deixar de seguir um usuário (id do usuário)',
    grupo: 'Seguidores',
    acesso: 'autenticado',
    query: idQuerySchema,
    resposta: mensagemSchema,
  },
];

const erro = (description: string) => ({
  description,
  content: { 'application/json': { schema: erroSchema } },
});

function corpoDaRota(rota: Rota): RouteConfig['request'] {
  if (rota.corpo) {
    return {
      body: { content: { 'application/json': { schema: rota.corpo } } },
    };
  }
  if (rota.formulario) {
    return {
      body: {
        content: { 'multipart/form-data': { schema: rota.formulario } },
      },
    };
  }
  return {};
}

export function gerarDocumentoOpenApi() {
  const registro = new OpenAPIRegistry();
  const bearer = registro.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  for (const rota of rotas) {
    registro.registerPath({
      method: rota.metodo,
      path: rota.caminho,
      summary: rota.resumo,
      tags: [rota.grupo],
      security: rota.acesso === 'publico' ? [] : [{ [bearer.name]: [] }],
      request: { query: rota.query, ...corpoDaRota(rota) },
      responses: {
        200: {
          description: 'Sucesso',
          content: { 'application/json': { schema: rota.resposta } },
        },
        400: erro('Dados inválidos ou registro não encontrado'),
        ...(rota.acesso !== 'publico' && {
          401: erro('Token ausente, inválido ou expirado'),
        }),
      },
    });
  }

  return new OpenApiGeneratorV31(registro.definitions).generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Devagram — API',
      version: '2.0.0',
      description:
        'API de uma rede social de fotos: usuários, publicações e seguidores. Rotas marcadas com cadeado exigem `Authorization: Bearer <token>` obtido em `/api/login`.',
    },
  });
}
