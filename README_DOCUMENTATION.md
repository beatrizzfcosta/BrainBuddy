# Documentação do Projeto BrainBuddy

Este projeto possui documentação completa gerada automaticamente a partir do código.

## Como Visualizar a Documentação

### Frontend (TypeScript/React)

A documentação está em: `frontend/docs/index.html`

**Para gerar/atualizar:**
```bash
cd frontend
npm run docs
```

**Para visualizar:**
- Abra `frontend/docs/index.html` no navegador
- Ou use: `npm run docs:open` (abre automaticamente)

### Backend (Python/FastAPI)

A documentação está em: `backend/docs/index.html`

**Para gerar/atualizar:**
```bash
cd backend
source venv/bin/activate
python generate_docs.py
```

**Para visualizar:**
- Abra `backend/docs/index.html` no navegador
- Ou use o servidor interativo: `pdoc -h localhost -p 8080 app`

## Estrutura da Documentação

### Frontend
- **Componentes React**: Todos os componentes com props e exemplos
- **Hooks**: useSidebar, useSidebarPadding, etc.
- **Tipos e Interfaces**: Subject, Topic, Note, etc.
- **Páginas**: Login, Homepage, Topic, Subject, etc.

### Backend
- **APIs**: Todas as rotas FastAPI com parâmetros e retornos
- **Serviços**: UserService, TopicService, etc. (lógica de negócio)
- **Modelos**: Pydantic models (User, Topic, Subject, etc.)

## Navegação

1. Abra o arquivo `index.html` no navegador
2. Use a barra lateral para navegar entre módulos
3. Use a busca para encontrar funções/componentes específicos
4. Clique em qualquer item para ver detalhes completos

## Notas

- A documentação é gerada automaticamente a partir de JSDoc (frontend) e docstrings (backend)
- Sempre regenere a documentação após adicionar/modificar código
- Os arquivos HTML estão versionados no Git para fácil acesso

