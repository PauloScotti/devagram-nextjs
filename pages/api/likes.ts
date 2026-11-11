import { Types } from 'mongoose';
import {
  criarEndpoint,
  ErroHttp,
  RequisicaoAutenticada,
  validar,
} from '../../lib/endpoint';
import { rotaAutenticada } from '../../lib/rotas';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { idQuerySchema } from '../../schemas/comum';

const endpointLikes = criarEndpoint<RequisicaoAutenticada>({
  // Alterna: curte se ainda não curtiu, descurte se já curtiu.
  PUT: async (req, res) => {
    const { id } = validar(idQuerySchema, req.query);

    const publicacao = await PublicacaoModel.findById(id).select('likes');
    if (!publicacao) {
      throw new ErroHttp(400, 'Publicação não encontrada');
    }

    const jaCurtiu = publicacao.likes.some(
      (like: unknown) => String(like) === req.usuarioId,
    );
    // Curtidas antigas foram gravadas como ObjectId; as duas formas são removidas.
    // $addToSet e $pull são atômicos: dois cliques simultâneos não duplicam o like.
    const comoObjectId = new Types.ObjectId(req.usuarioId);
    await PublicacaoModel.updateOne(
      { _id: id },
      jaCurtiu
        ? { $pull: { likes: { $in: [req.usuarioId, comoObjectId] } } }
        : { $addToSet: { likes: comoObjectId } },
    );
    return res.status(200).json({
      msg: jaCurtiu
        ? 'Publicação descurtida com sucesso'
        : 'Publicação curtida com sucesso',
    });
  },
});

export default rotaAutenticada(endpointLikes);
