// URL base da API (backend Spring Boot)
const API = "http://localhost:8080/api/livros";

// Elementos da página
const form = document.getElementById("livro-form");
const formTitulo = document.getElementById("form-titulo");
const inputId = document.getElementById("livro-id");
const inputNome = document.getElementById("nome");
const inputAutor = document.getElementById("autor");
const inputDescricao = document.getElementById("descricao");
const inputIsbn = document.getElementById("codigoISBN");
const inputDisponibilidade = document.getElementById("disponibilidade");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const btnRecarregar = document.getElementById("btn-recarregar");
const lista = document.getElementById("lista");
const msg = document.getElementById("msg");

// ---- EXIBIÇÃO: listar todos os livros (GET /api/livros) ----
async function carregarLivros() {
    lista.innerHTML = "Carregando...";
    try {
        const resp = await fetch(API);
        if (!resp.ok) throw new Error("Falha ao listar (HTTP " + resp.status + ")");
        const livros = await resp.json();
        renderizarLivros(livros);
    } catch (err) {
        lista.innerHTML = `<p class="vazio">Erro ao carregar: ${err.message}. O backend está rodando na porta 8080?</p>`;
    }
}

function renderizarLivros(livros) {
    if (!livros.length) {
        lista.innerHTML = `<p class="vazio">Nenhum livro cadastrado ainda.</p>`;
        return;
    }
    lista.innerHTML = "";
    livros.forEach((livro) => {
        const div = document.createElement("div");
        div.className = "livro";
        const disp = livro.disponibilidade
            ? `<span class="badge sim">Disponível</span>`
            : `<span class="badge nao">Indisponível</span>`;
        div.innerHTML = `
            <h3>${escapar(livro.nome) || "(sem nome)"}</h3>
            <div class="autor">${escapar(livro.autor) || "Autor desconhecido"}</div>
            <p class="descricao">${escapar(livro.descricao) || ""}</p>
            <div class="meta">
                <span>ISBN: ${escapar(livro.codigoISBN) || "—"}</span>
                <span>${disp}</span>
            </div>
            <div class="livro-actions">
                <button class="secondary" data-acao="editar">Editar</button>
                <button class="secondary" data-acao="excluir">Excluir</button>
            </div>
        `;
        div.querySelector('[data-acao="editar"]').onclick = () => editarLivro(livro);
        div.querySelector('[data-acao="excluir"]').onclick = () => excluirLivro(livro.id);
        lista.appendChild(div);
    });
}

// ---- CRIAÇÃO / EDIÇÃO: envia o formulário ----
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = inputId.value;
    const dados = {
        nome: inputNome.value.trim(),
        autor: inputAutor.value.trim(),
        descricao: inputDescricao.value.trim(),
        codigoISBN: inputIsbn.value.trim(),
        disponibilidade: inputDisponibilidade.checked,
    };

    try {
        let resp;
        if (id) {
            // EDIÇÃO: PATCH /api/livros/{id}
            resp = await fetch(`${API}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados),
            });
        } else {
            // CRIAÇÃO: POST /api/livros/InserirNovoLivro
            resp = await fetch(`${API}/InserirNovoLivro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados),
            });
        }
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        mostrarMsg(id ? "Livro atualizado!" : "Livro adicionado!", "ok");
        resetarFormulario();
        carregarLivros();
    } catch (err) {
        mostrarMsg("Erro ao salvar: " + err.message, "erro");
    }
});

// Preenche o formulário com os dados do livro para edição
function editarLivro(livro) {
    inputId.value = livro.id;
    inputNome.value = livro.nome || "";
    inputAutor.value = livro.autor || "";
    inputDescricao.value = livro.descricao || "";
    inputIsbn.value = livro.codigoISBN || "";
    inputDisponibilidade.checked = !!livro.disponibilidade;

    formTitulo.textContent = "Editar livro";
    btnSalvar.textContent = "Salvar alterações";
    btnCancelar.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---- EXCLUSÃO: DELETE /api/livros/{id} ----
async function excluirLivro(id) {
    if (!confirm("Tem certeza que deseja excluir este livro?")) return;
    try {
        const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!resp.ok && resp.status !== 204) throw new Error("HTTP " + resp.status);
        mostrarMsg("Livro excluído.", "ok");
        carregarLivros();
    } catch (err) {
        mostrarMsg("Erro ao excluir: " + err.message, "erro");
    }
}

function resetarFormulario() {
    form.reset();
    inputId.value = "";
    inputDisponibilidade.checked = true;
    formTitulo.textContent = "Novo livro";
    btnSalvar.textContent = "Adicionar";
    btnCancelar.hidden = true;
}

function mostrarMsg(texto, tipo) {
    msg.textContent = texto;
    msg.className = "msg " + tipo;
    setTimeout(() => {
        msg.textContent = "";
        msg.className = "msg";
    }, 3000);
}

// Evita injeção de HTML ao exibir os textos
function escapar(texto) {
    if (texto == null) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

btnCancelar.addEventListener("click", resetarFormulario);
btnRecarregar.addEventListener("click", carregarLivros);

// Carrega a lista ao abrir a página
carregarLivros();


// =========================================================================
//  ABAS
// =========================================================================
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const alvo = btn.dataset.tab;
        tabBtns.forEach((b) => b.classList.toggle("active", b === btn));
        tabPanels.forEach((p) => (p.hidden = p.id !== "tab-" + alvo));
        if (alvo === "emprestimos") abrirAbaEmprestimos();
    });
});


// =========================================================================
//  EMPRÉSTIMOS  (consome a API que usa a EmprestimoFactory)
// =========================================================================
const API_EMP = "http://localhost:8080/api/emprestimos";
const API_LEITORES = "http://localhost:8080/api/leitores";

const empForm = document.getElementById("emprestimo-form");
const selLivro = document.getElementById("emp-livro");      // input hidden -> guarda o id do livro
const selLeitor = document.getElementById("emp-leitor");    // input hidden -> guarda o id do leitor
const lblLivro = document.getElementById("emp-livro-label");
const lblLeitor = document.getElementById("emp-leitor-label");
const inpDataEmp = document.getElementById("emp-data-emprestimo");
const inpDataDev = document.getElementById("emp-data-devolucao");
const empMsg = document.getElementById("emp-msg");
const empResultado = document.getElementById("emp-resultado");
const empLista = document.getElementById("emp-lista");
const btnRecarregarEmp = document.getElementById("btn-recarregar-emp");

// Elementos dos modais
const btnPickLivro = document.getElementById("btn-pick-livro");
const btnPickLeitor = document.getElementById("btn-pick-leitor");
const modalLivro = document.getElementById("modal-livro");
const modalLeitor = document.getElementById("modal-leitor");
const buscaLivro = document.getElementById("busca-livro");
const buscaLeitor = document.getElementById("busca-leitor");
const modalLivroLista = document.getElementById("modal-livro-lista");
const modalLeitorLista = document.getElementById("modal-leitor-lista");
const modalLeitorMsg = document.getElementById("modal-leitor-msg");
const novoLeitorNome = document.getElementById("novo-leitor-nome");
const novoLeitorContato = document.getElementById("novo-leitor-contato");
const btnAddLeitor = document.getElementById("btn-add-leitor");

// Caches para filtrar localmente conforme o usuário digita
let livrosCache = [];
let leitoresCache = [];

function abrirAbaEmprestimos() {
    if (!inpDataEmp.value) {
        inpDataEmp.value = new Date().toISOString().slice(0, 10);
    }
    carregarEmprestimos();
}

// ---------- Helpers de modal ----------
function abrirModal(modal) {
    modal.hidden = false;
}
function fecharModal(modal) {
    modal.hidden = true;
}

document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => fecharModal(document.getElementById(btn.dataset.close)));
});
[modalLivro, modalLeitor].forEach((m) => {
    m.addEventListener("click", (e) => {
        if (e.target === m) fecharModal(m); // clique fora do conteúdo fecha
    });
});

// ---------- Modal: buscar LIVRO ----------
btnPickLivro.addEventListener("click", async () => {
    abrirModal(modalLivro);
    buscaLivro.value = "";
    modalLivroLista.innerHTML = `<p class="modal-vazio">Carregando...</p>`;
    try {
        const resp = await fetch(API);
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        livrosCache = (await resp.json()).filter((l) => l.disponibilidade);
        renderLivros();
        buscaLivro.focus();
    } catch (err) {
        modalLivroLista.innerHTML = `<p class="modal-vazio">Erro ao carregar livros (${err.message})</p>`;
    }
});

buscaLivro.addEventListener("input", renderLivros);

function renderLivros() {
    if (!livrosCache.length) {
        modalLivroLista.innerHTML = `<p class="modal-vazio">Nenhum livro disponível no momento.</p>`;
        return;
    }
    const termo = buscaLivro.value.trim().toLowerCase();
    const filtrados = livrosCache.filter(
        (l) => (l.nome || "").toLowerCase().includes(termo) || (l.autor || "").toLowerCase().includes(termo)
    );
    if (!filtrados.length) {
        modalLivroLista.innerHTML = `<p class="modal-vazio">Nenhum livro encontrado para "${escapar(buscaLivro.value)}".</p>`;
        return;
    }
    modalLivroLista.innerHTML = "";
    filtrados.forEach((l) => {
        const div = document.createElement("div");
        div.className = "modal-item";
        div.innerHTML = `<div class="item-titulo">${escapar(l.nome)}</div>
            <div class="item-sub">${escapar(l.autor) || "Autor desconhecido"}${
            l.codigoISBN ? " · ISBN " + escapar(l.codigoISBN) : ""
        }</div>`;
        div.onclick = () => {
            selLivro.value = l.id;
            lblLivro.textContent = l.nome + (l.autor ? " — " + l.autor : "");
            lblLivro.classList.remove("vazio");
            fecharModal(modalLivro);
        };
        modalLivroLista.appendChild(div);
    });
}

// ---------- Modal: buscar / cadastrar LEITOR ----------
btnPickLeitor.addEventListener("click", async () => {
    abrirModal(modalLeitor);
    buscaLeitor.value = "";
    await recarregarLeitoresModal();
    buscaLeitor.focus();
});

buscaLeitor.addEventListener("input", renderLeitores);

async function recarregarLeitoresModal() {
    modalLeitorLista.innerHTML = `<p class="modal-vazio">Carregando...</p>`;
    try {
        const resp = await fetch(API_LEITORES);
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        leitoresCache = await resp.json();
        renderLeitores();
    } catch (err) {
        modalLeitorLista.innerHTML = `<p class="modal-vazio">Erro ao carregar leitores (${err.message})</p>`;
    }
}

function renderLeitores() {
    if (!leitoresCache.length) {
        modalLeitorLista.innerHTML = `<p class="modal-vazio">Nenhum leitor cadastrado. Use o cadastro rápido abaixo.</p>`;
        return;
    }
    const termo = buscaLeitor.value.trim().toLowerCase();
    const filtrados = leitoresCache.filter((l) => (l.nome || "").toLowerCase().includes(termo));
    if (!filtrados.length) {
        modalLeitorLista.innerHTML = `<p class="modal-vazio">Nenhum leitor encontrado para "${escapar(buscaLeitor.value)}".</p>`;
        return;
    }
    modalLeitorLista.innerHTML = "";
    filtrados.forEach((l) => {
        const div = document.createElement("div");
        div.className = "modal-item";
        div.innerHTML = `<div class="item-titulo">${escapar(l.nome)}</div>
            <div class="item-sub">${escapar(l.contato) || "sem contato"}</div>`;
        div.onclick = () => selecionarLeitor(l);
        modalLeitorLista.appendChild(div);
    });
}

function selecionarLeitor(leitor) {
    selLeitor.value = leitor.id_leitor;
    lblLeitor.textContent = leitor.nome + (leitor.contato ? " (" + leitor.contato + ")" : "");
    lblLeitor.classList.remove("vazio");
    fecharModal(modalLeitor);
}

// Cadastro rápido dentro do modal de leitor: cadastra, seleciona e fecha
btnAddLeitor.addEventListener("click", async () => {
    const nome = novoLeitorNome.value.trim();
    if (!nome) {
        mostrarMsgModalLeitor("Informe o nome do leitor.", "erro");
        return;
    }
    try {
        const resp = await fetch(`${API_LEITORES}/inserirNovo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, contato: novoLeitorContato.value.trim() }),
        });
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        const leitor = await resp.json();
        novoLeitorNome.value = "";
        novoLeitorContato.value = "";
        selecionarLeitor(leitor);
        mostrarMsgEmp("Leitor cadastrado e selecionado!", "ok");
    } catch (err) {
        mostrarMsgModalLeitor("Erro ao cadastrar: " + err.message, "erro");
    }
});

function mostrarMsgModalLeitor(texto, tipo) {
    modalLeitorMsg.textContent = texto;
    modalLeitorMsg.className = "msg " + tipo;
    setTimeout(() => {
        modalLeitorMsg.textContent = "";
        modalLeitorMsg.className = "msg";
    }, 3000);
}

// Limpa a seleção atual de livro/leitor (após emprestar)
function limparSelecaoEmprestimo() {
    selLivro.value = "";
    selLeitor.value = "";
    lblLivro.textContent = "Nenhum livro selecionado";
    lblLivro.classList.add("vazio");
    lblLeitor.textContent = "Nenhum leitor selecionado";
    lblLeitor.classList.add("vazio");
}

// Realizar empréstimo
empForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    empResultado.innerHTML = "";

    if (!selLivro.value) return mostrarMsgEmp("Selecione um livro disponível.", "erro");
    if (!selLeitor.value) return mostrarMsgEmp("Selecione (ou cadastre) um leitor.", "erro");

    // dataDevolucao em branco => enviamos null e a EmprestimoFactory aplica o prazo padrão.
    const devolucaoInformada = inpDataDev.value !== "";
    const body = {
        idLivro: selLivro.value,
        idLeitor: selLeitor.value,
        dataEmprestimo: inpDataEmp.value,
        dataDevolucao: devolucaoInformada ? inpDataDev.value : null,
    };

    try {
        const resp = await fetch(API_EMP, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            // O backend devolve uma mensagem de texto nos erros de regra de negócio.
            const texto = await resp.text();
            throw new Error(texto || "HTTP " + resp.status);
        }

        const emprestimo = await resp.json();
        mostrarMsgEmp("Empréstimo realizado!", "ok");
        mostrarCalloutFactory(emprestimo, devolucaoInformada);
        inpDataDev.value = "";
        limparSelecaoEmprestimo();
        carregarEmprestimos();
    } catch (err) {
        mostrarMsgEmp("Não foi possível emprestar: " + err.message, "erro");
    }
});

// Destaca o que a EmprestimoFactory definiu para a data de devolução
function mostrarCalloutFactory(emprestimo, devolucaoInformada) {
    const div = document.createElement("div");
    if (devolucaoInformada) {
        div.className = "factory-callout informado";
        div.innerHTML = `Devolução <strong>conforme informado</strong>: ${emprestimo.dataDevolucao}.
            <br><small>A EmprestimoFactory respeitou a data enviada.</small>`;
    } else {
        div.className = "factory-callout";
        div.innerHTML = `Devolução <strong>calculada pela EmprestimoFactory</strong>: ${emprestimo.dataDevolucao}
            <br><small>Prazo padrão de 15 dias a partir de ${emprestimo.dataEmprestimo} (campo deixado em branco).</small>`;
    }
    empResultado.innerHTML = "";
    empResultado.appendChild(div);
}

// Lista de empréstimos
async function carregarEmprestimos() {
    empLista.innerHTML = "Carregando...";
    try {
        const resp = await fetch(API_EMP);
        const emprestimos = await resp.json();
        if (!emprestimos.length) {
            empLista.innerHTML = `<p class="vazio">Nenhum empréstimo registrado.</p>`;
            return;
        }
        empLista.innerHTML = "";
        emprestimos.forEach((emp) => {
            const ativo = emp.statusEmprestimo === "Emprestado";
            const div = document.createElement("div");
            div.className = "livro";
            div.innerHTML = `
                <h3>${escapar(emp.livro?.nome) || "(livro)"}</h3>
                <div class="autor">Leitor: ${escapar(emp.leitor?.nome) || "—"}</div>
                <div class="meta">
                    <span>Empréstimo: ${emp.dataEmprestimo || "—"}</span>
                    <span>Devolução: ${emp.dataDevolucao || "—"}</span>
                    <span class="badge ${ativo ? "nao" : "sim"}">${escapar(emp.statusEmprestimo)}</span>
                </div>
                <div class="livro-actions">
                    ${ativo ? `<button class="secondary" data-acao="devolver">Devolver</button>` : ""}
                    <button class="secondary" data-acao="cancelar">Cancelar</button>
                </div>
            `;
            const btnDev = div.querySelector('[data-acao="devolver"]');
            if (btnDev) btnDev.onclick = () => devolverEmprestimo(emp.id);
            div.querySelector('[data-acao="cancelar"]').onclick = () => cancelarEmprestimo(emp.id);
            empLista.appendChild(div);
        });
    } catch (err) {
        empLista.innerHTML = `<p class="vazio">Erro ao carregar empréstimos: ${err.message}</p>`;
    }
}

async function devolverEmprestimo(id) {
    try {
        const resp = await fetch(`${API_EMP}/${id}/devolver`, { method: "PATCH" });
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        mostrarMsgEmp("Livro devolvido.", "ok");
        carregarEmprestimos();
    } catch (err) {
        mostrarMsgEmp("Erro ao devolver: " + err.message, "erro");
    }
}

async function cancelarEmprestimo(id) {
    if (!confirm("Cancelar este empréstimo?")) return;
    try {
        const resp = await fetch(`${API_EMP}/${id}`, { method: "DELETE" });
        if (!resp.ok && resp.status !== 204) throw new Error("HTTP " + resp.status);
        mostrarMsgEmp("Empréstimo cancelado.", "ok");
        carregarEmprestimos();
    } catch (err) {
        mostrarMsgEmp("Erro ao cancelar: " + err.message, "erro");
    }
}

function mostrarMsgEmp(texto, tipo) {
    empMsg.textContent = texto;
    empMsg.className = "msg " + tipo;
    setTimeout(() => {
        empMsg.textContent = "";
        empMsg.className = "msg";
    }, 4000);
}

btnRecarregarEmp.addEventListener("click", carregarEmprestimos);
