# Devagram — API

API de uma rede social de fotos, no estilo Instagram: usuários publicam fotos, seguem outros usuários, curtem e comentam.

Construída sobre as API Routes do Next.js com MongoDB. Nasceu como projeto da formação Devaria e foi revisada para servir de referência: senhas com argon2, validação de entrada com zod, e documentação OpenAPI navegável.

## Stack

| Camada       | Tecnologia                                        |
| ------------ | ------------------------------------------------- |
| Runtime      | Node.js 22+, Next.js 16 (API Routes), TypeScript  |
| Banco        | MongoDB com Mongoose 9                            |
| Autenticação | JWT (HS256, validade de 7 dias), senhas em argon2 |
| Validação    | zod 4                                             |
| Documentação | OpenAPI 3.1 gerado dos schemas zod + Scalar       |
| Imagens      | Cosmic (avatares e publicações)                   |
| Testes       | Vitest                                            |

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

A API sobe em `http://localhost:3000/api`. A documentação interativa fica em `http://localhost:3000/api/docs` (a raiz redireciona para ela) e o documento OpenAPI em `http://localhost:3000/api/openapi`.

### Variáveis de ambiente

| Variável                     | Obrigatória | Para quê                                                                  |
| ---------------------------- | ----------- | ------------------------------------------------------------------------- |
| `DB_CONEXAO_STRING`          | sim         | String de conexão do MongoDB                                              |
| `MINHA_CHAVE_JWT`            | sim         | Segredo que assina os tokens                                              |
| `BUCKET_AVATARES`            | para upload | Slug do bucket de avatares no Cosmic                                      |
| `CHAVE_GRAVACAO_AVATARES`    | para upload | Chave de escrita do bucket de avatares                                    |
| `CHAVE_LEITURA_AVATARES`     | não         | Chave de leitura do bucket de avatares                                    |
| `BUCKET_PUBLICACOES`         | para upload | Slug do bucket de publicações no Cosmic                                   |
| `CHAVE_GRAVACAO_PUBLICACOES` | para upload | Chave de escrita do bucket de publicações                                 |
| `CHAVE_LEITURA_PUBLICACOES`  | não         | Chave de leitura do bucket de publicações                                 |
| `CORS_ORIGENS`               | não         | Origens aceitas, separadas por vírgula. Sem ela, qualquer origem é aceita |

## Rotas

| Rota              | Método                 | O que faz                                                    |
| ----------------- | ---------------------- | ------------------------------------------------------------ |
| `/api/login`      | POST                   | Entrar e receber o token (pública)                           |
| `/api/cadastro`   | POST                   | Criar conta, com avatar opcional (pública)                   |
| `/api/usuario`    | GET, PUT               | Ver e atualizar o próprio cadastro                           |
| `/api/pesquisa`   | GET                    | Buscar usuários por nome ou e-mail, ou obter um por id       |
| `/api/feed`       | GET                    | Feed de quem o usuário segue, ou publicações de um usuário   |
| `/api/publicacao` | POST                   | Publicar uma foto                                            |
| `/api/comentario` | PUT                    | Comentar em uma publicação                                   |
| `/api/likes`      | PUT                    | Curtir ou descurtir uma publicação                           |
| `/api/seguir`     | PUT                    | Seguir ou deixar de seguir um usuário                        |

Fora login e cadastro, todas esperam `Authorization: Bearer <token>`. Cadastro, atualização de usuário e publicação usam `multipart/form-data`; as demais usam JSON. Corpos, parâmetros e respostas de cada rota estão em `/api/docs`.

## Estrutura

```
lib/          regras reutilizáveis: senha, token, upload, OpenAPI
middlewares/  CORS, conexão com o banco e token
models/       modelos do Mongoose
pages/api/    uma rota por arquivo
schemas/      schemas zod (validação e origem da documentação)
tests/        testes unitários
```

## Testes

```bash
npm test
npm run typecheck
```

## Segurança

- Senhas gravadas com argon2id. Contas antigas, em MD5, continuam entrando e têm a senha regravada em argon2 no primeiro login.
- Toda entrada passa por um schema zod: campos desconhecidos são descartados e objetos no lugar de texto são rejeitados, o que fecha a injeção de operadores do MongoDB.
- Nenhuma rota devolve a senha, nem como hash.
- Upload aceita só imagens de até 5 MB.
- Erros inesperados respondem com mensagem genérica; o detalhe fica no log do servidor.
