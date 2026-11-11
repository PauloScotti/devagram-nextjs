import {
  criarEndpoint,
  ErroHttp,
  RequisicaoAutenticada,
  validar,
} from '../../lib/endpoint';
import { rotaAutenticada } from '../../lib/rotas';
import {
  enviarImagem,
  lerFormulario,
  RequisicaoComArquivo,
} from '../../lib/upload';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import { publicacaoCorpoSchema } from '../../schemas/publicacao';

const endpointPublicacao = criarEndpoint<RequisicaoAutenticada>({
  POST: async (req, res) => {
    await lerFormulario(req, res);
    const { descricao } = validar(publicacaoCorpoSchema, req.body);

    if (!(req as RequisicaoComArquivo).file?.originalname) {
      throw new ErroHttp(400, 'Imagem é obrigatória');
    }
    if (!(await UsuarioModel.exists({ _id: req.usuarioId }))) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }

    const foto = await enviarImagem(req, 'publicacao');
    await PublicacaoModel.create({
      idUsuario: req.usuarioId,
      descricao,
      foto,
      data: new Date(),
    });
    await UsuarioModel.updateOne(
      { _id: req.usuarioId },
      { $inc: { publicacoes: 1 } },
    );
    return res.status(200).json({ msg: 'Publicação criada com sucesso' });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default rotaAutenticada(endpointPublicacao);
