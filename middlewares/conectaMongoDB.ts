import type { NextApiHandler } from 'next';
import mongoose from 'mongoose';

export const conectaMongoDB =
  (handler: NextApiHandler): NextApiHandler =>
  async (req, res) => {
    if (mongoose.connection.readyState === 1) {
      return handler(req, res);
    }

    const { DB_CONEXAO_STRING } = process.env;
    if (!DB_CONEXAO_STRING) {
      return res
        .status(500)
        .json({ erro: 'ENV de configuração do banco não informada' });
    }

    try {
      await mongoose.connect(DB_CONEXAO_STRING);
    } catch (erro) {
      console.error('Erro ao conectar com o banco de dados:', erro);
      return res
        .status(500)
        .json({ erro: 'Não foi possível conectar ao banco de dados' });
    }
    return handler(req, res);
  };
