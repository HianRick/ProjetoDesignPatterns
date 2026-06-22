package com.example.demo.facade;

import com.example.demo.dtos.InserirEmprestimoDTO;
import com.example.demo.entities.EmprestimoEntities;
import com.example.demo.entities.LeitorEntities;
import com.example.demo.entities.LivrosEntities;
import com.example.demo.policies.HorarioFuncionamentoPolicy;
import com.example.demo.repositories.LeitorRepository;
import com.example.demo.services.AcervoService;
import com.example.demo.services.RegistroEmprestimoService;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Facade (padrão estrutural) para o fluxo de empréstimos.
 *
 * Oferece ao controller um ponto de entrada simples e esconde a coordenação entre
 * os subsistemas: política de horário, acervo (livros), leitores e persistência do empréstimo.
 * Regras novas tendem a virar um novo subsistema + um passo aqui, em vez de inchar uma classe só.
 */
@Component
public class EmprestimoFacade {

    private final HorarioFuncionamentoPolicy horarioPolicy;
    private final AcervoService acervoService;
    private final LeitorRepository leitorRepository;
    private final RegistroEmprestimoService registroEmprestimoService;

    public EmprestimoFacade(HorarioFuncionamentoPolicy horarioPolicy,
                            AcervoService acervoService,
                            LeitorRepository leitorRepository,
                            RegistroEmprestimoService registroEmprestimoService) {
        this.horarioPolicy = horarioPolicy;
        this.acervoService = acervoService;
        this.leitorRepository = leitorRepository;
        this.registroEmprestimoService = registroEmprestimoService;
    }

    public List<EmprestimoEntities> listarTodos() {
        return registroEmprestimoService.listarTodos();
    }

    public Optional<EmprestimoEntities> buscarPorId(UUID id) {
        return registroEmprestimoService.buscarPorId(id);
    }

    // Fluxo de criação: cada passo agora é uma chamada clara a um subsistema.
    public Object realizarEmprestimo(InserirEmprestimoDTO dto) {
        if (!horarioPolicy.estaDentroDoHorario(LocalDateTime.now())) {
            return "Só criamos empréstimos de segunda à sexta, das 8h às 22h";
        }

        Optional<LivrosEntities> livroOpt = acervoService.buscarPorId(dto.getIdLivro());
        if (livroOpt.isEmpty()) return "Livro não encontrado";

        Optional<LeitorEntities> leitorOpt = leitorRepository.findById(dto.getIdLeitor());
        if (leitorOpt.isEmpty()) return "Leitor não encontrado";

        LivrosEntities livro = livroOpt.get();
        if (!livro.isDisponibilidade()) return "Livro já está emprestado";

        acervoService.reservar(livro);
        return registroEmprestimoService.registrar(livro, leitorOpt.get(), dto);
    }

    public boolean devolver(UUID id) {
        Optional<EmprestimoEntities> emprestimoOpt = registroEmprestimoService.buscarPorId(id);
        if (emprestimoOpt.isEmpty()) return false;

        EmprestimoEntities emprestimo = emprestimoOpt.get();
        registroEmprestimoService.marcarComoDevolvido(emprestimo);
        acervoService.devolver(emprestimo.getLivro());
        return true;
    }

    public boolean cancelar(UUID id) {
        Optional<EmprestimoEntities> emprestimoOpt = registroEmprestimoService.buscarPorId(id);
        if (emprestimoOpt.isEmpty()) return false;

        acervoService.devolver(emprestimoOpt.get().getLivro());
        registroEmprestimoService.remover(id);
        return true;
    }
}
