# Sistema de Gerenciamento de Biblioteca

---

## 1. Definição do Tema

O projeto consiste em um **Sistema de Gerenciamento de Biblioteca**, uma aplicação web responsável por automatizar o controle de **livros**, **leitores** e **empréstimos** de uma biblioteca.

O objetivo é substituir controles manuais por uma solução digital que permita o cadastro de acervo, o registro de leitores e o acompanhamento de empréstimos e devoluções, oferecendo também consultas rápidas sobre a disponibilidade dos livros.

---

## 2. Delimitação do Escopo

### O que o sistema contempla

- **Gestão de Livros**
  - Cadastro, edição, exclusão e listagem de livros.
  - Atributos: título, autor, descrição, código ISBN e status de disponibilidade.
  - Filtros de busca por nome, autor e ISBN.
- **Gestão de Leitores**
  - Cadastro, edição, exclusão e listagem de leitores.
  - Atributos: nome e contato.
- **Gestão de Empréstimos**
  - Registro de empréstimos vinculando um livro a um leitor.
  - Controle de data de empréstimo e data de devolução.
  - Processamento da devolução, atualizando a disponibilidade do livro.

---

## 3. Escolha das Tecnologias

A aplicação é dividida em duas camadas independentes: **Backend (API REST)** e **Frontend**.

### Backend

| Tecnologia | Descrição |
|------------|-----------|
| **Java 17** | Linguagem principal |
| **Spring Boot 3.5.3** | Framework para construção da API |
| **Spring Web** | Criação dos endpoints REST |
| **Spring Data JPA / Hibernate** | Persistência e mapeamento objeto-relacional |
| **Hibernate Validator** | Validação dos dados de entrada |
| **H2 Database** | Banco de dados (modo arquivo, persistente em `./data`) |
| **Swagger / OpenAPI** | Documentação interativa da API |
| **Maven** | Gerenciamento de dependências e build |

A API segue uma **arquitetura em camadas** (Controllers → Services → Repositories → DTOs/Entities), com a regra de negócio de empréstimos organizada por **design patterns** (ver seção 5).

#### Principais endpoints

| Recurso | Rota base | Operações |
|---------|-----------|-----------|
| Livros | `/api/livros` | Listar, buscar por id, criar (`/InserirNovoLivro`), editar (PATCH), excluir, filtrar (`/buscarLivros`) |
| Leitores | `/api/leitores` | Listar, buscar por id, criar (`/inserirNovo`), editar (PATCH), excluir |
| Empréstimos | `/api/emprestimos` | Listar, buscar por id, criar (POST), excluir, devolver (`/{id}/devolver`) |

### Frontend

Frontend simples em **HTML + CSS + JavaScript puro** (sem build), servido como página estática, que consome a API REST via `fetch`. Possui duas áreas:

- **Livros**: formulário de cadastro/edição e listagem.
- **Empréstimos**: seleção de livro e leitor por **modais de busca** (com cadastro rápido de leitor) e realização do empréstimo, demonstrando a `EmprestimoFactory`.

O acesso entre origens diferentes é liberado por uma configuração de **CORS** no backend (`config/CorsConfig`).

---

## 4. Organização do Repositório

```
ProjetoDesignPatterns/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── config/        # Configuração de CORS
│   │   ├── controllers/   # Endpoints REST (Livros, Leitor, Emprestimo)
│   │   ├── dtos/          # Objetos de transferência de dados
│   │   ├── entities/      # Entidades JPA (Livros, Leitor, Emprestimo)
│   │   ├── repositories/  # Acesso a dados (Spring Data JPA)
│   │   ├── services/      # Regras de negócio / subsistemas
│   │   ├── policies/      # Regras isoladas (ex.: horário de funcionamento)
│   │   ├── factories/     # Criação de objetos (EmprestimoFactory)
│   │   └── facade/        # Fachada do fluxo de empréstimos
│   ├── src/main/resources/application.properties
│   ├── mvnw / mvnw.cmd    # Maven Wrapper
│   └── pom.xml
└── frontend/
    ├── index.html
    ├── style.css
    ├── app.js
    └── README.md
```

---

## 5. Design Patterns Aplicados

A regra de negócio de **empréstimos** foi refatorada para melhorar a saúde do código (coesão, responsabilidade única e baixo acoplamento). Originalmente, o `EmprestimoService` concentrava todas as etapas (validar horário, buscar livro, buscar leitor, verificar disponibilidade, alterar o livro, criar e salvar o empréstimo, processar devolução). Essa lógica foi distribuída usando dois padrões:

### 5.1. Facade (estrutural) — `EmprestimoFacade`

Fornece ao controller **um ponto de entrada único** para o fluxo de empréstimos e esconde a coordenação entre subsistemas focados:

| Componente | Responsabilidade |
|------------|------------------|
| `HorarioFuncionamentoPolicy` | Regra isolada: o horário atual permite empréstimo? |
| `AcervoService` | Livro: buscar, reservar (indisponível) e devolver (disponível) |
| `LeitorRepository` | Leitor: buscar |
| `RegistroEmprestimoService` | Empréstimo: listar, registrar, marcar devolvido e remover |
| `EmprestimoFacade` | Orquestra os passos acima (realizar, devolver, cancelar) |

**Ganho:** cada subsistema tem uma única responsabilidade; o controller depende só da fachada. Uma regra de negócio nova tende a virar um novo subsistema + um passo na fachada, em vez de inchar uma classe única.

### 5.2. Simple Factory (criacional) — `EmprestimoFactory`

Centraliza a **política de criação** de um empréstimo, tirando essa lógica do service:

- Status inicial `"Emprestado"`.
- `dataEmprestimo` padrão = hoje, quando não informada.
- `dataDevolucao` padrão = `dataEmprestimo + 15 dias` (constante `PRAZO_PADRAO_DIAS`), quando não informada; caso o cliente informe a data, ela é respeitada.

**Ganho:** "como nasce um empréstimo" passa a ter uma fonte única da verdade. O `RegistroEmprestimoService` cuida apenas da persistência, e alterar o prazo/status padrão é mudar um único lugar. A interação na aba **Empréstimos** do frontend demonstra esse comportamento (data de devolução em branco → prazo padrão de 15 dias).

---

## 6. Como Executar

### Backend (porta 8080)

Requisitos: **JDK 17**.

```
cd backend
./mvnw.cmd spring-boot:run      # Windows
./mvnw spring-boot:run          # Linux/Mac
```

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Console H2: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:file:./data/meubanco`, usuário `sa`, senha em branco)

### Frontend

Sirva os arquivos estáticos (não abra via `file://`):

```
cd frontend
python -m http.server 5500
```

Acesse `http://localhost:5500` com o backend em execução. Em VS Code, a extensão *Live Server* também funciona.

---

## 7. Equipe

Hian Rick Francesconi Macedo
Patricia Morais da Silva
