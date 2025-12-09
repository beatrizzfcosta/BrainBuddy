# Diagramas BPMN - BrainBuddy

Este documento contém os diagramas BPMN (Business Process Model and Notation) dos principais processos do sistema BrainBuddy.

---

## Processo de Autenticação/Login

```mermaid
flowchart TD
    Start([Utilizador acessa aplicação]) --> CheckAuth{Utilizador<br/>autenticado?}
    
    CheckAuth -->|Sim| Homepage[Mostrar Homepage]
    CheckAuth -->|Não| LoginPage[Redirecionar para /login]
    
    LoginPage --> ClickLogin[Utilizador clica<br/>Login com Google]
    ClickLogin --> RedirectGoogle[Redirecionar para<br/>Google OAuth]
    
    RedirectGoogle --> GoogleAuth{Google<br/>solicita<br/>autorização}
    GoogleAuth -->|utilizador nega| Error1[Mostrar erro]
    GoogleAuth -->|utilizador autoriza| Callback[Callback com<br/>código de autorização]
    
    Callback --> ValidateToken[Backend valida token<br/>com Google]
    ValidateToken --> GetUserInfo[Backend obtém<br/>dados do utilizador]
    GetUserInfo --> CheckUser{Utilizador existe<br/>no Firestore?}
    
    CheckUser -->|Não| CreateUser[Criar novo utilizador<br/>no Firestore]
    CheckUser -->|Sim| UpdateUser[Atualizar dados<br/>do utilizador]
    
    CreateUser --> SaveLocal[Salvar userId e user<br/>no LocalStorage]
    UpdateUser --> SaveLocal
    
    SaveLocal --> Homepage
    Error1 --> LoginPage
    
    Homepage --> End([Utilizador autenticado])
    
    style Start fill:#4A90E2,color:#fff
    style CheckAuth fill:#FFB347,color:#000
    style GoogleAuth fill:#FFB347,color:#000
    style CheckUser fill:#FFB347,color:#000
    style Homepage fill:#50C878,color:#fff
    style Error1 fill:#FF6B6B,color:#fff
    style End fill:#50C878,color:#fff
```

---

## Processo de Criação de Subject

```mermaid
flowchart TD
    Start([Utilizador acessa /newsubject]) --> CheckAuth{Utilizador<br/>autenticado?}
    
    CheckAuth -->|Não| Redirect1[Redirecionar<br/>para /login]
    CheckAuth -->|Sim| LoadHistory[Carregar histórico<br/>de tópicos]
    
    LoadHistory --> ShowForm[Mostrar formulário<br/>de criação]
    ShowForm --> UserInput[Utilizador preenche<br/>nome e descrição]
    
    UserInput --> ClickCreate[Utilizador clica<br/>Create Subject]
    ClickCreate --> Validate{Validar<br/>dados}
    
    Validate -->|Nome vazio| Error1[Mostrar erro:<br/>Nome obrigatório]
    Validate -->|Dados válidos| SendAPI[POST /api/subjects/<br/>com dados]
    
    Error1 --> ShowForm
    
    SendAPI --> CheckResponse{Resposta<br/>OK?}
    CheckResponse -->|Erro| Error2[Mostrar erro<br/>da API]
    CheckResponse -->|Sucesso| SaveSubject[Subject salvo<br/>no Firestore]
    
    SaveSubject --> Redirect2[Redirecionar<br/>para /homepage]
    Redirect2 --> UpdateList[Homepage atualiza<br/>lista de subjects]
    
    UpdateList --> End([Subject criado])
    Error2 --> ShowForm
    Redirect1 --> End
    
    style Start fill:#4A90E2,color:#fff
    style CheckAuth fill:#FFB347,color:#000
    style Validate fill:#FFB347,color:#000
    style CheckResponse fill:#FFB347,color:#000
    style SaveSubject fill:#50C878,color:#fff
    style Error1 fill:#FF6B6B,color:#fff
    style Error2 fill:#FF6B6B,color:#fff
    style End fill:#50C878,color:#fff
```

---

## Processo de Criação de Topic

```mermaid
flowchart TD
    Start([Utilizador acessa /newtopic]) --> CheckAuth{Utilizador<br/>autenticado?}
    
    CheckAuth -->|Não| Redirect1[Redirecionar<br/>para /login]
    CheckAuth -->|Sim| CheckSubjectId{SubjectId<br/>válido?}
    
    CheckSubjectId -->|Não| Error1[Mostrar erro:<br/>Subject ID não fornecido]
    CheckSubjectId -->|Sim| LoadSubject[Carregar dados<br/>do Subject]
    LoadSubject --> LoadHistory[Carregar histórico]
    
    LoadHistory --> ShowForm[Mostrar formulário<br/>de criação]
    ShowForm --> UserInput[Utilizador preenche<br/>nome do tópico]
    
    UserInput --> ClickGenerate[Utilizador clica<br/>Generate Plan]
    ClickGenerate --> Validate{Validar<br/>dados}
    
    Validate -->|Nome vazio| Error2[Mostrar erro:<br/>Nome obrigatório]
    Validate -->|Dados válidos| SendAPI[POST /api/topics/<br/>com dados]
    
    Error2 --> ShowForm
    Error1 --> ShowForm
    
    SendAPI --> CheckResponse{Resposta<br/>OK?}
    CheckResponse -->|Erro| Error3[Mostrar erro<br/>da API]
    CheckResponse -->|Sucesso| SaveTopic[Topic salvo<br/>no Firestore]
    
    SaveTopic --> Redirect2[Redirecionar<br/>para /homepage]
    Redirect2 --> UpdateList[Homepage atualiza<br/>lista de topics]
    
    UpdateList --> End([Topic criado])
    Error3 --> ShowForm
    Redirect1 --> End
    
    style Start fill:#4A90E2,color:#fff
    style CheckAuth fill:#FFB347,color:#000
    style CheckSubjectId fill:#FFB347,color:#000
    style Validate fill:#FFB347,color:#000
    style CheckResponse fill:#FFB347,color:#000
    style SaveTopic fill:#50C878,color:#fff
    style Error1 fill:#FF6B6B,color:#fff
    style Error2 fill:#FF6B6B,color:#fff
    style Error3 fill:#FF6B6B,color:#fff
    style End fill:#50C878,color:#fff
```

---

## Processo de Geração de Conteúdo com IA

```mermaid
flowchart TD
    Start([Utilizador acessa /topic/:topicId]) --> CheckAuth{Utilizador<br/>autenticado?}
    
    CheckAuth -->|Não| Redirect1[Redirecionar<br/>para /login]
    CheckAuth -->|Sim| LoadTopic[Carregar dados<br/>do Topic]
    LoadTopic --> LoadHistory[Carregar histórico]
    
    LoadHistory --> CheckNotes{Notes existem<br/>para o topic?}
    
    CheckNotes -->|Sim| LoadNotes[Carregar notes<br/>do Firestore]
    CheckNotes -->|Não| CreateNote[Criar note vazia<br/>no Firestore]
    
    LoadNotes --> CheckAIContent{Note com conteúdo<br/>AI existe?}
    CheckAIContent -->|Sim| ShowContent[Mostrar conteúdo<br/>existente]
    CheckAIContent -->|Não| CreateNote
    
    CreateNote --> CallGemini[Chamar API Gemini<br/>POST /api/gemini/generate]
    
    CallGemini --> CheckGemini{Gemini<br/>respondeu?}
    CheckGemini -->|Erro| Error1[Mostrar erro:<br/>Falha ao gerar conteúdo]
    CheckGemini -->|Sucesso| GetContent[Obter conteúdo<br/>gerado]
    
    GetContent --> UpdateNote[Atualizar note<br/>com conteúdo gerado]
    UpdateNote --> SaveNote[Salvar note<br/>no Firestore]
    
    SaveNote --> ShowContent
    ShowContent --> LoadYouTube[Carregar sugestões<br/>do YouTube]
    
    LoadYouTube --> CheckYouTube{Sugestões<br/>existem?}
    CheckYouTube -->|Não| GenerateYouTube[Gerar sugestões<br/>do YouTube]
    CheckYouTube -->|Sim| ShowYouTube[Mostrar sugestões]
    
    GenerateYouTube --> ShowYouTube
    ShowYouTube --> End([Conteúdo exibido])
    
    Error1 --> ShowContent
    Redirect1 --> End
    
    style Start fill:#4A90E2,color:#fff
    style CheckAuth fill:#FFB347,color:#000
    style CheckNotes fill:#FFB347,color:#000
    style CheckAIContent fill:#FFB347,color:#000
    style CheckGemini fill:#FFB347,color:#000
    style CheckYouTube fill:#FFB347,color:#000
    style CallGemini fill:#50C878,color:#fff
    style SaveNote fill:#50C878,color:#fff
    style Error1 fill:#FF6B6B,color:#fff
    style End fill:#50C878,color:#fff
```

---

## Processo de Agendamento de Sessões de Estudo

```mermaid
flowchart TD
    Start([Utilizador acessa /schedule]) --> CheckAuth{Utilizador<br/>autenticado?}
    
    CheckAuth -->|Não| Redirect1[Redirecionar<br/>para /login]
    CheckAuth -->|Sim| CheckParams{SubjectId e<br/>TopicId válidos?}
    
    CheckParams -->|Não| Error1[Mostrar erro:<br/>Parâmetros inválidos]
    CheckParams -->|Sim| LoadTopic[Carregar dados<br/>do Topic]
    LoadTopic --> LoadHistory[Carregar histórico]
    
    LoadHistory --> ShowForm[Mostrar formulário<br/>de agendamento]
    ShowForm --> UserSelect[Utilizador seleciona<br/>dias da semana]
    
    UserSelect --> UserTime[Utilizador define<br/>horário início/fim]
    UserTime --> ClickAdd[Utilizador clica<br/>Add to Calendar]
    
    ClickAdd --> Validate{Validar<br/>dados}
    
    Validate -->|Nenhum dia selecionado| Error2[Mostrar erro:<br/>Selecione dias]
    Validate -->|Horário inválido| Error3[Mostrar erro:<br/>Horário inválido]
    Validate -->|Duração < 30min| Error4[Mostrar erro:<br/>Mínimo 30min]
    Validate -->|Dados válidos| CalculateDates[Calcular datas<br/>próximas 4 semanas]
    
    Error2 --> ShowForm
    Error3 --> ShowForm
    Error4 --> ShowForm
    Error1 --> ShowForm
    
    CalculateDates --> GetToken{Access Token<br/>disponível?}
    GetToken -->|Não| CreateSessionsOnly[Criar apenas<br/>Study Sessions]
    GetToken -->|Sim| CreateSessions[Criar Study Sessions<br/>no Firestore]
    
    CreateSessions --> CreateCalendarEvents[Criar eventos<br/>no Google Calendar]
    CreateCalendarEvents --> LinkEvents[Vincular eventos<br/>às Study Sessions]
    
    CreateSessionsOnly --> CheckSuccess{Sessões<br/>criadas?}
    LinkEvents --> CheckSuccess
    
    CheckSuccess -->|Erro| Error5[Mostrar erro:<br/>Falha ao criar sessões]
    CheckSuccess -->|Sucesso| Redirect2[Redirecionar<br/>para /homepage]
    
    Redirect2 --> UpdateSessions[Homepage atualiza<br/>lista de sessões]
    UpdateSessions --> End([Sessões agendadas])
    
    Error5 --> ShowForm
    Redirect1 --> End
    
    style Start fill:#4A90E2,color:#fff
    style CheckAuth fill:#FFB347,color:#000
    style CheckParams fill:#FFB347,color:#000
    style Validate fill:#FFB347,color:#000
    style GetToken fill:#FFB347,color:#000
    style CheckSuccess fill:#FFB347,color:#000
    style CreateSessions fill:#50C878,color:#fff
    style CreateCalendarEvents fill:#50C878,color:#fff
    style Error1 fill:#FF6B6B,color:#fff
    style Error2 fill:#FF6B6B,color:#fff
    style Error3 fill:#FF6B6B,color:#fff
    style Error4 fill:#FF6B6B,color:#fff
    style Error5 fill:#FF6B6B,color:#fff
    style End fill:#50C878,color:#fff
```

---

## Processo de Visualização de Topic

```mermaid
flowchart TD
    Start([Utilizador acessa /topic/:topicId]) --> CheckAuth{Utilizador<br/>autenticado?}
    
    CheckAuth -->|Não| Redirect1[Redirecionar<br/>para /login]
    CheckAuth -->|Sim| LoadTopic[Carregar Topic<br/>do Firestore]
    LoadTopic --> LoadHistory[Carregar histórico<br/>de tópicos]
    
    LoadHistory --> CheckTopic{Topic<br/>encontrado?}
    CheckTopic -->|Não| Error1[Mostrar erro:<br/>Topic não encontrado]
    CheckTopic -->|Sim| LoadNotes[Carregar Notes<br/>do Firestore]
    
    LoadNotes --> CheckNotes{Notes<br/>existem?}
    CheckNotes -->|Sim| GetAIContent[Buscar note<br/>com conteúdo AI]
    CheckNotes -->|Não| AutoGenerate[Gerar conteúdo<br/>automaticamente]
    
    GetAIContent --> CheckAIContent{Conteúdo AI<br/>existe?}
    CheckAIContent -->|Sim| ShowContent[Mostrar conteúdo]
    CheckAIContent -->|Não| AutoGenerate
    
    AutoGenerate --> ShowContent
    ShowContent --> LoadYouTube[Carregar sugestões<br/>do YouTube]
    
    LoadYouTube --> CheckYouTube{Sugestões<br/>existem?}
    CheckYouTube -->|Sim| ShowYouTube[Mostrar links<br/>do YouTube]
    CheckYouTube -->|Não| GenerateYouTube[Gerar sugestões<br/>automaticamente]
    
    GenerateYouTube --> ShowYouTube
    ShowYouTube --> ShowActions[Mostrar ações:<br/>Editar, Agendar, Deletar]
    
    ShowActions --> UserAction{Ação do<br/>Utilizador}
    
    UserAction -->|Editar| EditMode[Modo de edição]
    UserAction -->|Salvar| SaveContent[Salvar conteúdo<br/>no Firestore]
    UserAction -->|Agendar| GoSchedule[Ir para /schedule]
    UserAction -->|Deletar| ConfirmDelete{Confirmar<br/>deleção?}
    UserAction -->|Voltar| GoBack[Voltar para<br/>subject/homepage]
    
    EditMode --> UserAction
    SaveContent --> ShowContent
    GoSchedule --> End1([Página de agendamento])
    GoBack --> End2([Página anterior])
    
    ConfirmDelete -->|Cancelar| ShowActions
    ConfirmDelete -->|Confirmar| DeleteTopic[Deletar Topic<br/>do Firestore]
    DeleteTopic --> GoBack
    
    End([Topic visualizado]) --> End
    Error1 --> End
    Redirect1 --> End
    
    style Start fill:#4A90E2,color:#fff
    style CheckAuth fill:#FFB347,color:#000
    style CheckTopic fill:#FFB347,color:#000
    style CheckNotes fill:#FFB347,color:#000
    style CheckAIContent fill:#FFB347,color:#000
    style CheckYouTube fill:#FFB347,color:#000
    style UserAction fill:#FFB347,color:#000
    style ConfirmDelete fill:#FFB347,color:#000
    style ShowContent fill:#50C878,color:#fff
    style SaveContent fill:#50C878,color:#fff
    style DeleteTopic fill:#FF6B6B,color:#fff
    style Error1 fill:#FF6B6B,color:#fff
    style End fill:#50C878,color:#fff
```

---

## Processo de Confirmação de Sessão de Estudo

```mermaid
flowchart TD
    Start([Utilizador visualiza sessão<br/>na homepage]) --> ShowSession[Mostrar card<br/>da sessão]
    
    ShowSession --> UserAction{Ação do<br/>utilizador}
    
    UserAction -->|Confirmar| ConfirmClick[Utilizador clica<br/>ícone Check]
    UserAction -->|Cancelar| CancelClick[Utilizador clica<br/>ícone X]
    UserAction -->|Nenhuma| Wait[Aguardar ação]
    
    ConfirmClick --> UpdateState[PUT /api/study-sessions/:id<br/>state: completed]
    UpdateState --> CheckResponse1{Resposta<br/>OK?}
    
    CheckResponse1 -->|Erro| Error1[Mostrar erro:<br/>Falha ao confirmar]
    CheckResponse1 -->|Sucesso| RemoveSession[Remover sessão<br/>da lista]
    RemoveSession --> End1([Sessão confirmada])
    
    CancelClick --> CheckCalendar{Evento no<br/>Calendar existe?}
    CheckCalendar -->|Sim| GetToken[Obter Access Token]
    CheckCalendar -->|Não| UpdateState2[PUT /api/study-sessions/:id<br/>state: missed]
    
    GetToken --> DeleteCalendar[DELETE /api/calendar/events/:id<br/>Deletar do Google Calendar]
    DeleteCalendar --> UpdateState2
    
    UpdateState2 --> CheckResponse2{Resposta<br/>OK?}
    CheckResponse2 -->|Erro| Error2[Mostrar erro:<br/>Falha ao cancelar]
    CheckResponse2 -->|Sucesso| RemoveSession2[Remover sessão<br/>da lista]
    RemoveSession2 --> End2([Sessão cancelada])
    
    Error1 --> ShowSession
    Error2 --> ShowSession
    Wait --> UserAction
    
    style Start fill:#4A90E2,color:#fff
    style UserAction fill:#FFB347,color:#000
    style CheckResponse1 fill:#FFB347,color:#000
    style CheckResponse2 fill:#FFB347,color:#000
    style CheckCalendar fill:#FFB347,color:#000
    style UpdateState fill:#50C878,color:#fff
    style DeleteCalendar fill:#FF6B6B,color:#fff
    style Error1 fill:#FF6B6B,color:#fff
    style Error2 fill:#FF6B6B,color:#fff
    style End1 fill:#50C878,color:#fff
    style End2 fill:#FF6B6B,color:#fff
```

---

## 🔍 Processo de Busca e Navegação

```mermaid
flowchart TD
    Start([Utilizador na homepage]) --> ShowSubjects[Mostrar lista<br/>de Subjects]
    
    ShowSubjects --> UserAction{Ação do<br/>utilizador}
    
    UserAction -->|Criar Subject| GoNewSubject[Ir para /newsubject]
    UserAction -->|Clicar Subject| GoSubject[Ir para /subject/:id]
    UserAction -->|Clicar History| GoTopic[Ir para /topic/:topicId]
    
    GoSubject --> LoadSubject[Carregar Subject<br/>do Firestore]
    LoadSubject --> LoadTopics[Carregar Topics<br/>do Subject]
    LoadTopics --> ShowTopics[Mostrar lista<br/>de Topics]
    
    ShowTopics --> UserAction2{Ação do<br/>utilizador}
    
    UserAction2 -->|Selecionar Topic| SelectTopic[Selecionar Topic<br/>no dropdown]
    UserAction2 -->|Criar Topic| GoNewTopic[Ir para /newtopic]
    UserAction2 -->|Deletar Subject| ConfirmDelete{Confirmar<br/>deleção?}
    
    SelectTopic --> ClickSearch[Utilizador clica<br/>Search]
    ClickSearch --> GoTopic
    
    GoTopic --> LoadTopic[Carregar Topic<br/>do Firestore]
    LoadTopic --> LoadContent[Carregar conteúdo<br/>e sugestões]
    LoadContent --> ShowTopic[Mostrar página<br/>do Topic]
    
    ShowTopic --> UserAction3{Ação do<br/>utilizador}
    
    UserAction3 -->|Agendar| GoSchedule[Ir para /schedule]
    UserAction3 -->|Voltar| GoSubject
    UserAction3 -->|Deletar| ConfirmDelete2{Confirmar<br/>deleção?}
    
    ConfirmDelete -->|Confirmar| DeleteSubject[Deletar Subject<br/>do Firestore]
    ConfirmDelete -->|Cancelar| ShowTopics
    
    ConfirmDelete2 -->|Confirmar| DeleteTopic[Deletar Topic<br/>do Firestore]
    ConfirmDelete2 -->|Cancelar| ShowTopic
    
    DeleteSubject --> GoHomepage[Voltar para /homepage]
    DeleteTopic --> GoSubject
    
    GoNewSubject --> End1([Criar Subject])
    GoNewTopic --> End2([Criar Topic])
    GoSchedule --> End3([Agendar Sessão])
    GoHomepage --> End4([Homepage])
    
    style Start fill:#4A90E2,color:#fff
    style UserAction fill:#FFB347,color:#000
    style UserAction2 fill:#FFB347,color:#000
    style UserAction3 fill:#FFB347,color:#000
    style ConfirmDelete fill:#FFB347,color:#000
    style ConfirmDelete2 fill:#FFB347,color:#000
    style DeleteSubject fill:#FF6B6B,color:#fff
    style DeleteTopic fill:#FF6B6B,color:#fff
    style End1 fill:#50C878,color:#fff
    style End2 fill:#50C878,color:#fff
    style End3 fill:#50C878,color:#fff
    style End4 fill:#50C878,color:#fff
```

---


## Resumo dos Processos

| Processo | Complexidade | Integrações Externas | Principais Decisões |
|----------|--------------|---------------------|---------------------|
| Autenticação/Login | Média | Google OAuth, Firebase | Utilizador existe? |
| Criação de Subject | Baixa | Firebase | Dados válidos? |
| Criação de Topic | Baixa | Firebase | SubjectId válido? |
| Geração de Conteúdo IA | Alta | Gemini API, Firebase | Conteúdo existe? |
| Agendamento de Sessões | Alta | Google Calendar, Firebase | Token disponível? |
| Visualização de Topic | Média | Firebase, Gemini, YouTube | Notes existem? |
| Confirmação de Sessão | Média | Google Calendar, Firebase | Evento existe? |
| Busca e Navegação | Baixa | Firebase | Ação do Utilizador? |

---


