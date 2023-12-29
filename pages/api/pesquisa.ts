import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { politicaCors } from '../../middlewares/politicaCors';
import { validarTokeJWT } from '../../middlewares/validarTokenJWT';
import { UsuarioModel } from '../../models/UsuarioModel';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { SeguidorModel } from '../../models/SeguidorModel';

const pesquisaEndpoint
    = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
        try {
            if (req.method === 'GET') {
                if (req?.query?.id) {
                    const usuarioEncontrado = await UsuarioModel.findById(req?.query?.id);
                    if (!usuarioEncontrado) {
                        return res.status(400).json({ erro: 'Usuario nao encontrado' });
                    }

                    const user = {
                        senha: null,
                        segueEsseUsuario: false,
                        nome: usuarioEncontrado.nome,
                        email: usuarioEncontrado.email,
                        _id: usuarioEncontrado._id,
                        avatar: usuarioEncontrado.avatar,
                        seguidores: usuarioEncontrado.seguidores,
                        seguindo: usuarioEncontrado.seguindo,
                        publicacoes: usuarioEncontrado.publicacoes,
                    } as any;

                    const segueEsseUsuario = user.seguidores.findIndex((e : any) => e.toString() === req?.query?.userId?.toString());
                    
                    if (segueEsseUsuario != -1) {
                        user.segueEsseUsuario = true;
                    }
                    return res.status(200).json(user);
                } else {

                    const { filtro } = req.query;
                    if (!filtro || filtro.length < 2) {
                        return res.status(400).json({ erro: 'Favor informar pelo menos 2 caracteres para a busca' });
                    }

                    const usuariosEncontrados = await UsuarioModel.find({
                        $or: [{ nome: { $regex: filtro, $options: 'i' } },
                        { email: { $regex: filtro, $options: 'i' } }
                        ]
                    });

                    return res.status(200).json(usuariosEncontrados);
                }

            }
            return res.status(405).json({ erro: 'Metodo informado nao e valido' });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ erro: 'Nao foi possivel buscar usuarios:' + e });
        }
    }

export default politicaCors(validarTokeJWT(conectarMongoDB(pesquisaEndpoint)));