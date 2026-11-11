import { criarEndpoint } from '../../lib/endpoint';
import { gerarDocumentoOpenApi } from '../../lib/openapi';
import { politicaCORS } from '../../middlewares/politicaCORS';

export default politicaCORS(
  criarEndpoint({
    GET: (_req, res) => res.status(200).json(gerarDocumentoOpenApi()),
  }),
);
