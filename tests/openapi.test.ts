import { readdirSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { gerarDocumentoOpenApi } from '../lib/openapi';

const documento = gerarDocumentoOpenApi();
const caminhos = documento.paths ?? {};

describe('documento OpenAPI', () => {
  it('documenta toda rota de pages/api', () => {
    const arquivos = readdirSync(join(__dirname, '..', 'pages', 'api'))
      .map((arquivo) => `/api/${arquivo.replace(/\.ts$/, '')}`)
      .filter((rota) => !['/api/openapi', '/api/docs'].includes(rota));

    expect(Object.keys(caminhos).sort()).toEqual(arquivos.sort());
  });

  it('marca rotas protegidas com bearer e deixa as públicas abertas', () => {
    expect(caminhos['/api/login']?.post?.security).toEqual([]);
    expect(caminhos['/api/usuario']?.get?.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(caminhos['/api/seguir']?.put?.responses).toHaveProperty('401');
  });

  it('nunca expõe a senha nos schemas de resposta', () => {
    const schemas = documento.components?.schemas ?? {};

    expect(JSON.stringify(schemas.Usuario)).not.toContain('senha');
    expect(JSON.stringify(schemas.LoginResposta)).not.toContain('senha');
  });
});
