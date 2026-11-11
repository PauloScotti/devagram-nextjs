import {
  criarEndpoint,
  ErroHttp,
  RequisicaoAutenticada,
  validar,
} from '../../lib/endpoint';
import { rotaAutenticada } from '../../lib/rotas';
import { enviarImagem, lerFormulario } from '../../lib/upload';
import { UsuarioModel } from '../../models/UsuarioModel';
import { atualizarUsuarioSchema, CAMPOS_PUBLICOS } from '../../schemas/usuario';

const endpointUsuario = criarEndpoint<RequisicaoAutenticada>({
  GET: async (req, res) => {
    const usuario = await UsuarioModel.findById(req.usuarioId).select(
      CAMPOS_PUBLICOS,
    );
    if (!usuario) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }
    return res.status(200).json(usuario);
  },

  PUT: async (req, res) => {
    await lerFormulario(req, res);
    const { nome } = validar(atualizarUsuarioSchema, req.body);

    const avatar = await enviarImagem(req, 'avatar');
    const usuario = await UsuarioModel.findByIdAndUpdate(req.usuarioId, {
      ...(nome && { nome }),
      ...(avatar && { avatar }),
    });
    if (!usuario) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }
    return res.status(200).json({ msg: 'Usuário alterado com sucesso' });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default rotaAutenticada(endpointUsuario);
