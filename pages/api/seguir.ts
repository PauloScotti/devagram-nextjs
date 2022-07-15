import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { politicaCors } from "../../middlewares/politicaCors";
import { validarTokeJWT } from "../../middlewares/validarTokenJWT";
import { SeguidorModel } from "../../models/SeguidorModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';

const endpointSeguir = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    try{
        if(req.method === 'PUT'){

            const {userId, id} = req?.query;

            // usuario_id é o usuário logado
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuário logado não encontrado'});
            }

            // id do usuário a ser seguido
            const usuarioSeguido = await UsuarioModel.findById(id);
            if(!usuarioSeguido){
                return res.status(400).json({erro : 'Usuário a ser seguido não encontrado'});
            }

            const euJaSigoEsseUsuario = await SeguidorModel.find({usuarioId: usuarioLogado._id, usuarioSeguidoId : usuarioSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                // sinal que sigo o usuário
                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id : e._id}));

                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                usuarioSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioSeguido._id}, usuarioSeguido);

                return res.status(200).json({msg : 'Deixou de seguir o usuário com sucesso'});
            } else {
                // sinal que não sigo o usuário
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioSeguido._id
                };
                await SeguidorModel.create(seguidor);

                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                
                usuarioSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioSeguido._id}, usuarioSeguido);
                
                return res.status(200).json({msg : 'Usuário seguido com sucesso'});
            }
        }

        return res.status(405).json({erro : 'Método informado não é válido'});
    } catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Não foi possível seguir/deseguir o usuário informado'});
    }
}

export default politicaCors(validarTokeJWT(conectarMongoDB(endpointSeguir)));