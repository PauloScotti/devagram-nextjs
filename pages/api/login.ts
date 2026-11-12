import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { rotaPublica } from '../../lib/rotas';
import { conferirSenha, gerarHash } from '../../lib/senha';
import { assinarToken } from '../../lib/token';
import { UsuarioModel } from '../../models/UsuarioModel';
import { loginSchema } from '../../schemas/usuario';

const endpointLogin = criarEndpoint({
  POST: async (req, res) => {
    const { login, senha } = validar(loginSchema, req.body);

    // Mesma resposta para e-mail inexistente e senha errada: não revela quais
    // e-mails têm conta.
    const usuario = await UsuarioModel.findOne({ email: login });
    const resultado = usuario
      ? await conferirSenha(senha, usuario.senha)
      : { valida: false, precisaRegravar: false };
    if (!usuario || !resultado.valida) {
      throw new ErroHttp(400, 'Usuário ou senha não encontrado');
    }

    if (resultado.precisaRegravar) {
      await UsuarioModel.updateOne(
        { _id: usuario._id },
        { senha: await gerarHash(senha) },
      );
    }

    return res.status(200).json({
      nome: usuario.nome,
      email: usuario.email,
      token: assinarToken(String(usuario._id)),
    });
  },
});

export default rotaPublica(endpointLogin);
