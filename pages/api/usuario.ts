import type { NextApiRequest, NextApiResponse } from "next";
import {validarTokeJWT} from '../../middlewares/validarTokenJwt';

const usuarioEndpoint = (req: NextApiRequest, res: NextApiResponse) => {
    return res.status(200).json('Usuário autenticado com sucesso');
}

export default validarTokeJWT(usuarioEndpoint);