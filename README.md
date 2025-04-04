# Circles Visualization

Este projeto é uma visualização interativa de círculos e papéis organizacionais, utilizando dados do Notion e D3.js.

## Como Usar

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

4. Acesse a aplicação em `http://localhost:3000`
5. **IMPORTANTE**: Você precisará inserir sua chave da API do Notion diretamente na interface do frontend. A chave não será armazenada no servidor.
6. Insira os IDs dos bancos de dados de Papéis e Círculos do Notion
7. Clique em "Buscar Dados do Notion" para carregar a visualização

## Como Obter os IDs dos Bancos de Dados do Notion

Para obter o ID de um banco de dados do Notion:

1. Abra o banco de dados no Notion
2. Clique nos três pontos (...) no canto superior direito
3. Selecione "Copiar link"
4. O ID é a parte do link entre o nome do workspace e o nome do banco de dados
   - Exemplo: `https://www.notion.so/workspace/1234567890abcdef1234567890abcdef?v=...`
   - O ID neste caso seria: `1234567890abcdef1234567890abcdef`

Você precisará obter dois IDs:
- ID do banco de dados de Papéis
- ID do banco de dados de Círculos

## Estrutura do Banco de Dados do Notion

### Banco de Dados de Círculos
Campos obrigatórios:
- `CircleName` (título): Nome do círculo
- `CircleID` (número): Identificador único do círculo
- `Purpose` (texto, opcional): Propósito do círculo
- `Responsibilities` (texto, opcional): Responsabilidades do círculo
- `Projects` (texto, opcional): Projetos relacionados

### Banco de Dados de Papéis
Campos obrigatórios:
- `RoleName` (título): Nome do papel
- `RoleID` (número): Identificador único do papel
- `CircleID` (número): ID do círculo ao qual o papel pertence
- `Purpose` (texto, opcional): Propósito do papel
- `Responsibilities` (texto, opcional): Lista de responsabilidades
- `Pessoas alocadas` (relação): Relação com o banco de dados de Pessoas/Usuários
- `Area` (texto, opcional): Área ou departamento

## Tecnologias Utilizadas

- Next.js
- TypeScript
- D3.js
- Tailwind CSS
- Notion API

## Features

- Visualização em tempo real da hierarquia de dados do Notion
- Visualização interativa de círculos com D3.js
- Funcionalidade de busca para papéis e pessoas
- Design responsivo com interface moderna
- Segurança: a chave da API é usada apenas no frontend e não é armazenada no servidor

## Deploy

O projeto pode ser facilmente implantado em qualquer plataforma que suporte Next.js, como Vercel, Netlify ou Railway. Não é necessário configurar nenhuma variável de ambiente no servidor, pois toda a autenticação é feita diretamente no frontend.

### Nota sobre o Deploy

Para garantir que o deploy funcione corretamente, certifique-se de que:
1. O projeto foi instalado com todas as dependências, incluindo `@types/d3`
2. O build local está funcionando sem erros de TypeScript
3. Não há variáveis de ambiente necessárias no servidor 