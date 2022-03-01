import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { politicaCors } from "../../middlewares/politicaCors";
import { validarTokeJWT } from "../../middlewares/validarTokenJWT";
import { PublicacaoModel } from "../../models/PublicacaoModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';

const likeEndpoint 
    = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {

    try {
        if(req.method === 'PUT'){
            // id da Publicacao - checked
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro : 'Publicação não encontrada'});
            }

            // id do usuario que ta curtindo a pub            
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro : 'Usuario não encontrada'});
            }
            
            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString());

            // se o index for > -1 sinal q ele ja curte a foto
            if(indexDoUsuarioNoLike != -1){
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicação descurtida com sucesso'});
            }else {
                // se o index for -1 sinal q ele nao curte a foto
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicação curtida com sucesso'});
            }
        }

        return res.status(405).json({erro : 'Metodo informado não é válido'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu erro ao curtir/descurtir uma publicação'});
    }
}

export default politicaCors(validarTokeJWT(conectarMongoDB(likeEndpoint)));