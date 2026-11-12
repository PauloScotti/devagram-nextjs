import type { NextApiHandler } from 'next';
import { conectaMongoDB } from '../middlewares/conectaMongoDB';
import { politicaCORS } from '../middlewares/politicaCORS';
import { validarTokenJWT } from '../middlewares/validarTokenJWT';

export const rotaPublica = (handler: NextApiHandler) =>
  politicaCORS(conectaMongoDB(handler));

export const rotaAutenticada = (handler: NextApiHandler) =>
  politicaCORS(validarTokenJWT(conectaMongoDB(handler)));
