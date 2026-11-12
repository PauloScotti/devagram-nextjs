import {
  criarEndpoint,
  ErroHttp,
  RequisicaoAutenticada,
  validar,
} from '../../lib/endpoint';
import { rotaAutenticada } from '../../lib/rotas';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import { idQuerySchema } from '../../schemas/comum';
import { comentarioSchema } from '../../schemas/publicacao';

const endpointComentario = criarEndpoint<RequisicaoAutenticada>({
  PUT: async (req, res) => {
    const { id } = validar(idQuerySchema, req.query);
    const { comentario } = validar(comentarioSchema, req.body);

    const usuario = await UsuarioModel.findById(req.usuarioId).select('nome');
    if (!usuario) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }

    const publicacao = await PublicacaoModel.findByIdAndUpdate(id, {
      $push: {
        comentarios: { usuarioId: usuario._id, nome: usuario.nome, comentario },
      },
    });
    if (!publicacao) {
      throw new ErroHttp(400, 'Publicação não encontrada');
    }
    return res.status(200).json({ msg: 'Comentário adicionado com sucesso' });
  },
});

export default rotaAutenticada(endpointComentario);
