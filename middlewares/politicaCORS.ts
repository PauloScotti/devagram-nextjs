import type { NextApiHandler } from 'next';

// CORS_ORIGENS: lista separada por vírgula. Sem ela, qualquer origem é aceita
// (a API autentica por token no cabeçalho, não por cookie).
function origemPermitida(origem: string | undefined): string | null {
  const permitidas = (process.env.CORS_ORIGENS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (permitidas.length === 0) {
    return '*';
  }
  return origem && permitidas.includes(origem) ? origem : null;
}

export const politicaCORS =
  (handler: NextApiHandler): NextApiHandler =>
  async (req, res) => {
    const origem = origemPermitida(req.headers.origin);
    if (origem) {
      res.setHeader('Access-Control-Allow-Origin', origem);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type',
    );

    if (req.method === 'OPTIONS') {
      // navegadores antigos dão problema quando se retorna 204
      return res.status(200).end();
    }
    return handler(req, res);
  };
