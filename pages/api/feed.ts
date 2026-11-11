import {
  criarEndpoint,
  ErroHttp,
  RequisicaoAutenticada,
  validar,
} from '../../lib/endpoint';
import { rotaAutenticada } from '../../lib/rotas';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import { feedQuerySchema } from '../../schemas/publicacao';

const endpointFeed = criarEndpoint<RequisicaoAutenticada>({
  GET: async (req, res) => {
    const { id } = validar(feedQuerySchema, req.query);

    if (id) {
      if (!(await UsuarioModel.exists({ _id: id }))) {
        throw new ErroHttp(400, 'Usuário não encontrado');
      }
      const publicacoes = await PublicacaoModel.find({ idUsuario: id }).sort({
        data: -1,
      });
      return res.status(200).json(publicacoes);
    }

    // Feed do usuário logado: as publicações dele e de quem ele segue.
    const usuarioLogado = await UsuarioModel.findById(req.usuarioId)
      .select('seguindo')
      .lean<{ seguindo: unknown[] }>();
    if (!usuarioLogado) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }
    const autores = [req.usuarioId, ...usuarioLogado.seguindo.map(String)];

    const publicacoes = await PublicacaoModel.find({
      idUsuario: { $in: autores },
    })
      .sort({ data: -1 })
      .lean<{ idUsuario: string }[]>();
    const usuarios = await UsuarioModel.find({ _id: { $in: autores } })
      .select('nome avatar')
      .lean<{ _id: unknown; nome: string; avatar?: string }[]>();
    const usuarioPorId = new Map(usuarios.map((u) => [String(u._id), u]));

    const feed = publicacoes.flatMap((publicacao) => {
      const autor = usuarioPorId.get(String(publicacao.idUsuario));
      return autor
        ? [
            {
              ...publicacao,
              usuario: { nome: autor.nome, avatar: autor.avatar },
            },
          ]
        : [];
    });
    return res.status(200).json(feed);
  },
});

export default rotaAutenticada(endpointFeed);
