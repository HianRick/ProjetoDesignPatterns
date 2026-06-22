# Frontend - Biblioteca (exemplo de consumo da API)

Frontend simples em HTML/CSS/JS puro (sem build) com duas abas: **Livros** e
**Empréstimos**. A aba de empréstimos demonstra a `EmprestimoFactory` — ao deixar
a data de devolução em branco, a tela mostra o prazo padrão (15 dias) que a
fábrica calculou.

### Livros
| Ação      | Endpoint                              | Método |
|-----------|---------------------------------------|--------|
| Exibir    | `/api/livros`                         | GET    |
| Criar     | `/api/livros/InserirNovoLivro`        | POST   |
| Editar    | `/api/livros/{id}`                    | PATCH  |
| Excluir   | `/api/livros/{id}`                    | DELETE |

### Empréstimos
| Ação                | Endpoint                          | Método |
|---------------------|-----------------------------------|--------|
| Exibir              | `/api/emprestimos`                | GET    |
| Realizar (Factory)  | `/api/emprestimos`                | POST   |
| Devolver            | `/api/emprestimos/{id}/devolver`  | PATCH  |
| Cancelar            | `/api/emprestimos/{id}`           | DELETE |
| Cadastrar leitor    | `/api/leitores/inserirNovo`       | POST   |

## Como rodar

1. **Inicie o backend** primeiro (porta 8080):
   ```
   cd ../backend
   ./mvnw.cmd spring-boot:run
   ```

2. **Abra o frontend.** Como ele faz requisições HTTP, o ideal é servir os
   arquivos por um servidor local (e não abrir o `index.html` direto pelo
   `file://`). Opções:

   - **VS Code:** instale a extensão *Live Server*, clique com o botão direito
     em `index.html` → "Open with Live Server" (abre em `http://127.0.0.1:5500`).

   - **Python:** dentro da pasta `frontend`:
     ```
     python -m http.server 5500
     ```
     e acesse `http://localhost:5500`.

O backend já está configurado para aceitar CORS dessas origens
(ver `CorsConfig.java`).
