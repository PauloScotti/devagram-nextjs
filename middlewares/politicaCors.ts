import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMsg } from "../types/RespostaPadraoMsg";
import NextCors from "nextjs-cors";

export const politicaCors = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {

        try{

            await NextCors(req, res, {
                origin : '*',
                methods : ['GET', 'POST', 'PUT'],
                optionSuccessStatus : 200, // navegadores antigos dão problemas se retorna 204 (No Content) sem retorno
            });

            return handler(req, res);

        }catch(e){
            console.log('Erro ao tratar a política de CORS', e);
            return res.status(500).json({erro : 'Ocorreu erro ao tratar a política de CORS'});
        }

    }