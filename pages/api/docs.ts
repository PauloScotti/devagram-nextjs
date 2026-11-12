import { renderApiReference } from '@scalar/client-side-rendering';
import { criarEndpoint } from '../../lib/endpoint';

// Página do Scalar com a referência da API, lida de /api/openapi.
export default criarEndpoint({
  GET: (_req, res) => {
    const html = renderApiReference({
      pageTitle: 'Devagram — API',
      config: { url: '/api/openapi' },
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  },
});
