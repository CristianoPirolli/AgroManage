# AgroManage

Aplicação web para gerenciamento de propriedades rurais: centraliza culturas, atividades agrícolas, estoque, produção e custos, auxiliando o produtor na organização e na tomada de decisões.

> Projeto acadêmico — disciplina **Programação IV**, UNOESC.
> Time: **Semeando Bugs** — Cristiano Pirolli.

## Status

Este repositório está na etapa de **kickoff estrutural**: repositório, backend e frontend configurados, banco de dados com a migration inicial aplicada. As funcionalidades (CRUDs, dashboard, autenticação) ainda **não estão integradas** — isso está planejado nas [Issues](../../issues) do repositório e será implementado em etapas.

## Funcionalidades planejadas

- Gerenciar propriedades rurais.
- Cadastrar culturas agrícolas.
- Registrar atividades realizadas nas propriedades.
- Controlar itens de estoque e insumos, com alerta de quantidade baixa.
- Registrar despesas da propriedade.
- Registrar informações básicas de produção/colheita.
- Dashboard com dados reais (propriedades, culturas ativas, despesas do mês, atividades recentes, estoque baixo).
- Autenticação de usuários com JWT e proteção de rotas.

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
│   ├── prisma/            # schema.prisma e migrations
│   └── src/
│       ├── config/        # validação das variáveis de ambiente
│       ├── database/      # PrismaService / DatabaseModule
│       └── health.controller.ts
└── frontend/
    ├── app/                # rotas (App Router)
    ├── components/
    ├── services/           # comunicação com a API
    ├── types/
    ├── hooks/
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

1. **Prioridade 1** — CRUD de propriedades, culturas, atividades, estoque e despesas, com frontend integrado.
2. **Prioridade 2** — Dashboard com dados reais, autenticação JWT, proteção de rotas, alertas de estoque baixo.
3. **Prioridade 3** — Produção, gráficos, upload de imagens, relatórios.

Os próximos passos estão registrados como [Issues](../../issues) neste repositório.

## Deploy

- Frontend: [https://frontend-beta-six-acqj50dno4.vercel.app](https://frontend-beta-six-acqj50dno4.vercel.app) (Vercel)
- Backend: _pendente — será publicado no Render ou Railway junto com um PostgreSQL na nuvem, quando as APIs estiverem integradas ao frontend._

## Vídeo de apresentação

_Pendente._
