# 📚 Sistema de Gerenciamento de Biblioteca

---

## 1. Definição do Tema

O projeto consiste em um **Sistema de Gerenciamento de Biblioteca**, uma aplicação web responsável por automatizar o controle de **livros**, **leitores** e **empréstimos** de uma biblioteca.

O objetivo é substituir controles manuais por uma solução digital que permita o cadastro de acervo, o registro de leitores e o acompanhamento de empréstimos e devoluções, oferecendo também consultas rápidas sobre a disponibilidade dos livros.

---

## 2. Delimitação do Escopo

### ✅ O que o sistema contempla

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

A aplicação é dividida em duas camadas independentes: **Backend (API REST)** e **Frontend (SPA)**.

### 🔧 Backend

> Repositório: **https://github.com/patriciamrs/BackendFINAL**

| Tecnologia | Descrição |
|------------|-----------|
| **Java 17** | Linguagem principal |
| **Spring Boot 3.5.3** | Framework para construção da API |
| **Spring Web** | Criação dos endpoints REST |
| **Spring Data JPA / Hibernate** | Persistência e mapeamento objeto-relacional |
| **Hibernate Validator** | Validação dos dados de entrada |
| **H2 Database** | Banco de dados em memória |
| **Swagger / OpenAPI** | Documentação interativa da API |
| **Maven** | Gerenciamento de dependências e build |

A API segue uma **arquitetura em camadas** (Controllers → Services → Repositories → DTOs/Entities).

#### Principais endpoints

| Recurso | Rota base | Operações |
|---------|-----------|-----------|
| Livros | `/api/livros` | CRUD + filtros (nome, autor, ISBN) |
| Leitores | `/api/leitores` | CRUD |
| Empréstimos | `/api/emprestimos` | Criar, consultar, excluir e processar devolução |

### 💻 Frontend

| Tecnologia | Descrição |
|------------|-----------|
| **React** | Biblioteca para construção da interface |
| **Vite** | Ferramenta de build e servidor de desenvolvimento |
| **JavaScript / JSX** | Linguagem da aplicação |
| **Axios / Fetch** | Consumo da API REST |
| **React Router** | Navegação entre páginas |

O frontend será uma **SPA (Single Page Application)** que consome a API do backend para apresentar e manipular os dados.

---

## 4. Organização Inicial do Repositório

O projeto está organizado em repositórios separados para backend e frontend.

### Backend (`BackendFINAL`)

```
BackendFINAL/
├── src/
│   └── main/
│       ├── java/com/example/demo/
│       │   ├── controller/      # Endpoints REST
│       │   ├── service/         # Regras de negócio
│       │   ├── repository/      # Acesso a dados (JPA)
│       │   ├── entities/        # Entidades (Livro, Leitor, Empréstimo)
│       │   └── dto/             # Objetos de transferência de dados
│       └── resources/
│           └── application.properties
├── mvnw / mvnw.cmd              # Maven Wrapper
└── pom.xml                      # Dependências do projeto
```

### Frontend (React + Vite) — estrutura prevista

```
frontend/
├── public/
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Páginas (Livros, Leitores, Empréstimos)
│   ├── services/     # Integração com a API
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 6. Equipe

Hian Rick Francesconi Macedo
Patricia Morais da Silva
---

