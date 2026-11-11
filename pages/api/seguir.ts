import { Types } from 'mongoose';
import {
  criarEndpoint,
  ErroHttp,
  RequisicaoAutenticada,
  validar,
} from '../../lib/endpoint';
import { rotaAutenticada } from '../../lib/rotas';
import { UsuarioModel } from '../../models/UsuarioModel';
import { idQuerySchema } from '../../schemas/comum';

const endpointSeguir = criarEndpoint<RequisicaoAutenticada>({
  // Alterna: segue se ainda não segue, deixa de seguir se já segue.
  PUT: async (req, res) => {
    const { id } = validar(idQuerySchema, req.query);

    if (id === req.usuarioId) {
      throw new ErroHttp(400, 'Você não pode seguir a si mesmo');
    }
    const usuarioASerSeguido = await UsuarioModel.findById(id)
      .select('seguidores')
      .lean<{ seguidores: unknown[] }>();
    if (!usuarioASerSeguido) {
      throw new ErroHttp(400, 'Usuário a ser seguido não encontrado');
    }

    const jaSegue = usuarioASerSeguido.seguidores.some(
      (seguidor) => String(seguidor) === req.usuarioId,
    );
    const eu = new Types.ObjectId(req.usuarioId);
    const ele = new Types.ObjectId(id);
    // $addToSet e $pull são atômicos e mexem só no id certo de cada lista.
    const operacao = jaSegue ? '$pull' : '$addToSet';
    await UsuarioModel.updateOne({ _id: ele }, { [operacao]: { seguidores: eu } });
    await UsuarioModel.updateOne({ _id: eu }, { [operacao]: { seguindo: ele } });

    return res.status(200).json({
      msg: jaSegue
        ? 'Deixou de seguir o usuário com sucesso'
        : 'Usuário seguido com sucesso',
    });
  },
});

export default rotaAutenticada(endpointSeguir);
