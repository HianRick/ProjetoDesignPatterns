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
## 5. Refatoração Arquitetural e Design Patterns Aplicados

### 5.1 Problemas Identificados na Arquitetura Inicial

Na arquitetura original, a classe `EmprestimoService` concentrava praticamente toda a lógica relacionada aos empréstimos. Ela era responsável por:

- Validar horário de funcionamento;
- Buscar livros e leitores;
- Verificar disponibilidade do livro;
- Alterar status de disponibilidade do acervo;
- Criar objetos de empréstimo;
- Persistir empréstimos;
- Processar devoluções;
- Cancelar registros.

Essa abordagem gerava alguns problemas arquiteturais:

- **Baixa coesão**, pois uma única classe possuía diversas responsabilidades.
- **Alto acoplamento** entre regras de negócio diferentes.
- **Dificuldade de manutenção**, já que qualquer alteração exigia modificações em uma classe central.
- **Menor facilidade de testes**, pois várias regras estavam misturadas em um único componente.
- **Baixa extensibilidade**, dificultando a inclusão de novos requisitos sem aumentar ainda mais a complexidade do service.

---

### 5.2 Novos Requisitos Recebidos

Além das funcionalidades já existentes, o sistema passou a exigir uma organização mais adequada das responsabilidades da camada de negócio, permitindo:

- Separar regras específicas em componentes independentes;
- Centralizar o fluxo de empréstimos sem expor detalhes internos ao controller;
- Padronizar a criação de novos empréstimos;
- Facilitar futuras alterações em regras de prazo, status e disponibilidade;
- Melhorar a manutenção e evolução da aplicação.

Para atender esses requisitos foram aplicados os padrões **Facade** e **Factory Method**.

---

### 5.3 Pattern Aplicado: Facade

### Objetivo

O padrão **Facade** foi implementado através da classe `EmprestimoFacade`, que atua como uma porta de entrada única para todas as operações relacionadas aos empréstimos.

Antes da refatoração, a lógica de empréstimos estava concentrada em um único service, que realizava validações, buscas e alterações de estado. Com a facade, o controller passou a utilizar apenas métodos de alto nível:

```java
emprestimoFacade.realizarEmprestimo(dto);
emprestimoFacade.devolver(id);
emprestimoFacade.cancelar(id);
```

Dessa forma, o controller fica responsável apenas por receber requisições HTTP e retornar respostas, sem conhecer os detalhes da regra de negócio.

### Funcionamento

Ao realizar um empréstimo, a facade coordena a execução dos componentes especializados:

| Componente | Responsabilidade |
|------------|------------------|
| HorarioFuncionamentoPolicy | Validar horário permitido para empréstimos |
| AcervoService | Buscar livro, verificar disponibilidade, reservar e devolver |
| LeitorRepository | Buscar leitor |
| RegistroEmprestimoService | Registrar, listar, devolver e cancelar empréstimos |
| EmprestimoFacade | Coordenar todo o fluxo |

Fluxo executado pela facade:

1. Verifica se o horário é válido;
2. Busca o livro solicitado;
3. Busca o leitor;
4. Verifica a disponibilidade do livro;
5. Reserva o exemplar;
6. Registra o empréstimo.

### Justificativa Técnica

O padrão Facade foi escolhido porque permite:

- Reduzir o acoplamento entre controller e regras de negócio;
- Centralizar o fluxo operacional em um único ponto de acesso;
- Esconder a complexidade dos subsistemas internos;
- Facilitar a manutenção do sistema.

Caso uma regra específica precise ser alterada futuramente, a modificação ocorre apenas no componente responsável. Por exemplo:

- Alterações de horário → `HorarioFuncionamentoPolicy`;
- Alterações de disponibilidade → `AcervoService`;
- Alterações de criação de empréstimos → `EmprestimoFactory`.

---

### 5.4 Pattern Aplicado: Factory Method

### Objetivo

O padrão **Factory Method** foi implementado através da classe `EmprestimoFactory`, responsável por centralizar a criação de novos empréstimos.

Antes da refatoração, toda a lógica de construção do objeto ficava misturada dentro do service, que acumulava duas responsabilidades:

- Criar corretamente o empréstimo;
- Persistir o empréstimo.

Após a refatoração, o service apenas solicita a criação do objeto:

```java
EmprestimoEntities emprestimo =
    EmprestimoFactory.novo(livro, leitor, dto);

return emprestimoRepository.save(emprestimo);
```

### Regras Centralizadas na Factory

A factory define todas as regras de criação:

```java
private static final int PRAZO_PADRAO_DIAS = 15;
```

- Status inicial: **"Emprestado"**;
- Data de empréstimo:
  - Utiliza a data informada no DTO;
  - Caso não exista, utiliza a data atual.
- Data de devolução:
  - Utiliza a data informada no DTO;
  - Caso não exista, calcula automaticamente adicionando 15 dias à data do empréstimo.

### Justificativa Técnica

O Factory Method foi utilizado para:

- Centralizar a lógica de criação dos empréstimos;
- Garantir padronização na construção dos objetos;
- Evitar duplicação de regras;
- Reduzir responsabilidades do service;
- Facilitar alterações futuras.

Por exemplo, caso o prazo padrão mude de 15 para 20 dias, a alteração será realizada apenas na factory, sem necessidade de modificar os serviços ou controllers.

---

### 5.5 Impactos Arquiteturais Percebidos

Após a aplicação dos padrões, foram observados os seguintes impactos na arquitetura:

### Benefícios

- Maior separação de responsabilidades;
- Redução do acoplamento entre componentes;
- Aumento da coesão das classes;
- Código mais organizado e legível;
- Maior facilidade para testes unitários;
- Facilidade para inclusão de novas regras de negócio;
- Melhor aderência ao princípio da Responsabilidade Única (SRP).

### Exemplo Prático

Antes da refatoração, alterações em regras de horário, disponibilidade ou criação de empréstimos exigiam modificações diretas em um único service centralizado.

Após a refatoração:

- Regras de horário ficam isoladas em `HorarioFuncionamentoPolicy`;
- Regras do acervo ficam em `AcervoService`;
- Regras de criação ficam em `EmprestimoFactory`;
- A coordenação do fluxo fica em `EmprestimoFacade`.

Isso torna o sistema mais modular, escalável e preparado para futuras evoluções sem aumentar significativamente a complexidade do código.

---

## 6. Como Executar

## Backend (porta 8080)

Requisitos: **JDK 17**.

```
cd backend
./mvnw.cmd spring-boot:run      # Windows
./mvnw spring-boot:run          # Linux/Mac
```

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Console H2: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:file:./data/meubanco`, usuário `sa`, senha em branco)

## Frontend

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
