import type { NextApiRequest, NextApiResponse } from 'next';
import multer, { MulterError } from 'multer';
import { createBucketClient } from '@cosmicjs/sdk';
import { ErroHttp } from './endpoint';

const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type Arquivo = { originalname: string; buffer: Buffer };
export type RequisicaoComArquivo = NextApiRequest & { file?: Arquivo };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (TIPOS_ACEITOS.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new ErroHttp(400, 'A imagem precisa ser JPEG, PNG, WebP ou GIF'));
  },
}).single('file');

// Lê o corpo multipart/form-data: campos em req.body, imagem em req.file.
export function lerFormulario(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  return new Promise((resolve, reject) => {
    upload(req as any, res as any, (erro: unknown) => {
      if (erro instanceof MulterError) {
        return reject(
          new ErroHttp(
            400,
            erro.code === 'LIMIT_FILE_SIZE'
              ? 'A imagem pode ter no máximo 5 MB'
              : 'Não foi possível ler o arquivo enviado',
          ),
        );
      }
      if (erro) {
        return reject(erro);
      }
      resolve();
    });
  });
}

type Destino = 'avatar' | 'publicacao';

const BUCKETS: Record<Destino, { slug: string; escrita: string; leitura: string }> = {
  avatar: {
    slug: 'BUCKET_AVATARES',
    escrita: 'CHAVE_GRAVACAO_AVATARES',
    leitura: 'CHAVE_LEITURA_AVATARES',
  },
  publicacao: {
    slug: 'BUCKET_PUBLICACOES',
    escrita: 'CHAVE_GRAVACAO_PUBLICACOES',
    leitura: 'CHAVE_LEITURA_PUBLICACOES',
  },
};

export async function enviarImagem(
  req: RequisicaoComArquivo,
  destino: Destino,
): Promise<string | undefined> {
  if (!req.file?.originalname) {
    return undefined;
  }
  const bucket = BUCKETS[destino];
  const bucketSlug = process.env[bucket.slug];
  const writeKey = process.env[bucket.escrita];
  if (!bucketSlug || !writeKey) {
    throw new ErroHttp(500, 'ENV do bucket de imagens não informada');
  }

  const cliente = createBucketClient({
    bucketSlug,
    readKey: process.env[bucket.leitura] ?? '',
    writeKey,
  });
  const resposta = await cliente.media.insertOne({
    media: { originalname: req.file.originalname, buffer: req.file.buffer },
  });
  return resposta?.media?.url;
}
