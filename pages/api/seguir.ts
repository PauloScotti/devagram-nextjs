import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { politicaCors } from "../../middlewares/politicaCors";
import { validarTokeJWT } from "../../middlewares/validarTokenJWT";
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

            // id do usuario e ser seguidor - query
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({ erro : 'Usuario a ser seguido nao encontrado'});
            }

            const indexDoUsuarioNoSeguido = usuarioASerSeguido.seguidores.findIndex((e : any) => e.toString() === usuarioLogado._id.toString());

            if(indexDoUsuarioNoSeguido != -1){
                usuarioASerSeguido.seguidores.splice(indexDoUsuarioNoSeguido, 1);
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                usuarioLogado.seguindo.splice(indexDoUsuarioNoSeguido, 1);
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                return res.status(200).json({msg : 'Deixou de seguir o usuario com sucesso'});
            }else {
                // se o index for -1 sinal q ele nao curte a foto
                usuarioASerSeguido.seguidores.push(usuarioLogado._id);
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                usuarioLogado.seguindo.push(usuarioASerSeguido._id);
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

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
