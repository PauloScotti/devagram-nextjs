import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { rotaPublica } from '../../lib/rotas';
import { gerarHash } from '../../lib/senha';
import { enviarImagem, lerFormulario } from '../../lib/upload';
import { UsuarioModel } from '../../models/UsuarioModel';
import { cadastroUsuarioSchema } from '../../schemas/usuario';

const endpointCadastro = criarEndpoint({
  POST: async (req, res) => {
    await lerFormulario(req, res);
    const usuario = validar(cadastroUsuarioSchema, req.body);

    if (await UsuarioModel.exists({ email: usuario.email })) {
      throw new ErroHttp(400, 'Já existe uma conta com o e-mail informado');
    }

    await UsuarioModel.create({
      nome: usuario.nome,
      email: usuario.email,
      senha: await gerarHash(usuario.senha),
      avatar: await enviarImagem(req, 'avatar'),
    });
    return res.status(200).json({ msg: 'Usuário cadastrado com sucesso' });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default rotaPublica(endpointCadastro);
