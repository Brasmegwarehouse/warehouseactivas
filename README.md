# WarehouseOne

WMS (controle de estoque para armazém geral) — Next.js 14 + Prisma + Postgres + NextAuth.

## O que já funciona
- Login com e-mail/senha (NextAuth + bcrypt)
- Seleção de empresa (multi-tenant real: um usuário pode ter acesso a várias empresas)
- Dashboard com métricas reais do banco
- Produtos: cadastro + listagem (CRUD real)
- Movimentação: entrada, transferência e saída de estoque, com atualização de posição e histórico
- Registro de avaria (baixa de estoque com causa)
- Consulta de estoque, Validades e Histórico (leitura do banco)
- Usuários por empresa (com perfis Admin / Gestor / Operador)
- Cobrança / Faturamento (leitura — geração automática ainda não implementada)

## O que falta (próximos passos sugeridos)
- Editar/inativar produtos e usuários (hoje só criação)
- Geração automática de faturamento a partir das movimentações do período
- Conferir se `src/lib/business.ts` (cálculo de pallets/cubagem) bate 100% com as fórmulas do
  `WarehouseOne_v6_4.gs` original — copiei uma versão razoável, mas vale revisar
- Filtros e exportação CSV nas telas de histórico/consulta
- Página de gestão de empresas (hoje a criação de empresa é só via banco/seed)

## Rodando localmente

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Banco de dados**: crie um Postgres gratuito em [neon.tech](https://neon.tech) ou
   [vercel.com/storage/postgres](https://vercel.com/storage/postgres). Copie a connection string.

3. **Configure o ambiente**
   ```bash
   cp .env.example .env
   ```
   Cole a `DATABASE_URL` do banco e gere um `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Crie as tabelas e popule com dados de exemplo**
   ```bash
   npm run db:push
   npm run db:seed
   ```
   Isso cria o login de teste: `admin@brasmeg.com.br` / senha `123456`.

5. **Rode o projeto**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

## Subindo pro GitHub

```bash
git init
git add .
git commit -m "WarehouseOne — versão inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/warehouseone.git
git push -u origin main
```

## Publicando no Vercel

1. Entre em [vercel.com/new](https://vercel.com/new) e importe o repositório do GitHub.
2. Em **Environment Variables**, adicione `DATABASE_URL` e `NEXTAUTH_SECRET` (os mesmos valores do
   seu `.env`, ou os de produção se usar um banco separado).
3. Adicione também `NEXTAUTH_URL` com a URL final do seu projeto (ex:
   `https://warehouseone.vercel.app`) — isso o Vercel te mostra depois do primeiro deploy; você pode
   atualizar essa variável e fazer um redeploy.
4. Clique em **Deploy**.

Depois do primeiro deploy, rode `npm run db:push` e `npm run db:seed` (localmente, apontando pro
banco de produção) para criar as tabelas e o usuário inicial lá também.

## Estrutura do projeto

```
src/
  app/
    login/              tela de login
    empresas/            seleção de empresa (multi-tenant)
    (app)/[empresaId]/   app autenticado, uma rota por empresa
      dashboard/
      movimentacao/
      avaria/
      consulta/
      validades/
      historico/
      produtos/
      usuarios/
      cobrancas/
  components/            Sidebar, Rackmap (mapa do galpão)
  lib/
    auth.ts              configuração do NextAuth
    prisma.ts             cliente do banco
    business.ts           cálculo de pallets, cubagem, status de validade
    tenant.ts              verificação de acesso multi-tenant
prisma/
  schema.prisma          modelo do banco
  seed.ts                dados de exemplo
```
