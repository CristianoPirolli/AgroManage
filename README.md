# AgroManage

Aplicação web para gerenciamento de propriedades rurais: centraliza culturas, atividades agrícolas, estoque, produção e custos, auxiliando o produtor na organização e na tomada de decisões.

> Projeto acadêmico — disciplina **Programação IV**, UNOESC.
> Time: **Semeando Bugs** — Cristiano Pirolli.

## Status

MVP funcional, com todas as prioridades 1 e 2 do escopo implementadas e integradas de ponta a ponta (frontend → backend → Prisma → PostgreSQL), publicado em produção. Falta apenas Produção/gráficos/relatórios (prioridade 3, extras). Acompanhamento nas [Issues](../../issues).

## Funcionalidades

- Cadastro e login de usuários com JWT (senha com hash bcrypt).
- CRUD de propriedades rurais.
- CRUD de culturas agrícolas, vinculadas a uma propriedade.
- CRUD de atividades agrícolas, vinculadas a uma propriedade e, opcionalmente, a uma cultura da mesma propriedade.
- CRUD de itens de estoque, com alerta visual quando a quantidade fica igual ou abaixo do mínimo.
- CRUD de despesas por categoria, com total gasto exibido na tela.
- Dashboard com dados reais: propriedades, culturas ativas, despesas do mês, atividades registradas, alertas de estoque baixo, últimas atividades e despesas.
- Todos os dados são isolados por usuário — cada conta só acessa suas próprias propriedades e registros.
- Rate limit simples contra brute-force em `/auth/register` e `/auth/login`.

## Tecnologias utilizadas

**Frontend**

- Next.js (App Router)
- TypeScript
- Tailwind CSS

**Backend**

- NestJS
- TypeScript

**Banco de dados**

- PostgreSQL
- Prisma ORM (com `@prisma/adapter-pg`)

## Arquitetura

```mermaid
flowchart LR
    U[Usuário] --> F[Next.js - App Router]
    F -->|HTTP/REST| B[NestJS API]
    B --> P[Prisma ORM]
    P --> D[(PostgreSQL)]
```

O frontend consome a API REST do backend via HTTP. O backend expõe rotas RESTful organizadas por módulo, valida e trata erros, e usa o Prisma como camada de acesso ao PostgreSQL.

## Modelagem das entidades

```
USER
  └── PROPERTY
        ├── CROP
        │     ├── ACTIVITY (opcional)
        │     └── PRODUCTION
        ├── ACTIVITY
        ├── STOCK_ITEM
        ├── EXPENSE
        └── PRODUCTION
```

O schema completo, com todos os campos e relacionamentos, está em [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

## Estrutura do projeto

```text
agromanage/
├── docker-compose.yml     # Postgres para desenvolvimento local
├── backend/
│   ├── api/index.ts       # entrada serverless (deploy na Vercel)
│   ├── prisma/            # schema.prisma e migrations
│   └── src/
│       ├── config/        # validação das variáveis de ambiente
│       ├── database/      # PrismaService / DatabaseModule
│       ├── common/        # rate limit e utilitários compartilhados
│       ├── auth/          # cadastro, login, JWT, guard
│       ├── properties/    # CRUD de propriedades
│       ├── crops/         # CRUD de culturas
│       ├── activities/    # CRUD de atividades
│       ├── stock-items/   # CRUD de estoque
│       ├── expenses/      # CRUD de despesas
│       └── health.controller.ts
└── frontend/
    ├── app/                # rotas (App Router): login, cadastro, dashboard, propriedades, culturas, atividades, estoque, despesas
    ├── components/         # modais de formulário (um por entidade)
    ├── services/           # comunicação com a API (um arquivo por entidade)
    ├── types/
    ├── hooks/              # useAuth
    └── lib/
```

## Pré-requisitos

- Node.js 22 ou superior
- npm
- Docker (para o PostgreSQL de desenvolvimento)

## Instalação

```bash
git clone https://github.com/CristianoPirolli/AgroManage.git
cd AgroManage

cd backend
npm install

cd ../frontend
npm install
```

## Configuração local

Copie os arquivos de exemplo:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Variáveis do backend (`backend/.env`):

```env
DATABASE_URL=postgresql://agromanage:agromanage@localhost:5433/agromanage?schema=public
PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Variáveis do frontend (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

> O Postgres do `docker-compose.yml` expõe a porta `5433` no host (não `5432`) para não conflitar com uma instalação local do PostgreSQL já existente na máquina.

## Banco de dados

Suba o PostgreSQL via Docker:

```bash
docker compose up -d
```

Gere o cliente Prisma e aplique as migrations:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

Em produção, use `npx prisma migrate deploy` em vez de `migrate dev`.

### Banco na nuvem (produção)

Em produção, o PostgreSQL fica hospedado no [Neon](https://neon.tech), provisionado pelo Vercel Marketplace e conectado ao projeto `backend` na Vercel:

```bash
cd backend
npx vercel link          # se ainda não estiver linkado
npx vercel integration add neon --no-claim
npx vercel env pull .env.local --yes
```

Isso cria `backend/.env.local` (ignorado pelo Git) com `DATABASE_URL` (pooled) e `DATABASE_URL_UNPOOLED` do Neon. Para aplicar as migrations nesse banco, use a URL sem pooling:

```bash
DATABASE_URL=$DATABASE_URL_UNPOOLED npx prisma migrate deploy
```

## Executando

Terminal do backend:

```bash
cd backend
npm run start:dev
```

Terminal do frontend:

```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:3333`
- Health check: `http://localhost:3333/health`

## Testando

```bash
cd backend
npm run build   # compila o backend

cd ../frontend
npm run build   # compila e valida o frontend
```

Com o backend rodando, `GET http://localhost:3333/health` deve responder `{"status":"ok","database":"up"}`, confirmando a conexão com o PostgreSQL.

## Roadmap

1. ✅ **Prioridade 1** — CRUD de propriedades, culturas, atividades, estoque e despesas, com frontend integrado.
2. ✅ **Prioridade 2** — Dashboard com dados reais, autenticação JWT, proteção de rotas, alertas de estoque baixo.
3. ⬜ **Prioridade 3** — Produção, gráficos, upload de imagens, relatórios (extras).

Os próximos passos estão registrados como [Issues](../../issues) neste repositório.

## Deploy

- Frontend: [https://frontend-beta-six-acqj50dno4.vercel.app](https://frontend-beta-six-acqj50dno4.vercel.app) (Vercel)
- Backend (API): [https://backend-phi-nine-31.vercel.app](https://backend-phi-nine-31.vercel.app) (Vercel, função serverless) — health check em `/health`
- Banco: PostgreSQL gerenciado pelo [Neon](https://neon.tech)

> O backend roda como função serverless na Vercel (`backend/api/index.ts` + `backend/vercel.json`), no mesmo padrão do NestJS empacotado com `@vercel/node`, em vez de Render/Railway.

## Vídeo de apresentação

_Pendente._
