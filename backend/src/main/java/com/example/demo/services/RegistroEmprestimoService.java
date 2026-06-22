package com.example.demo.services;

import com.example.demo.dtos.InserirEmprestimoDTO;
import com.example.demo.entities.EmprestimoEntities;
import com.example.demo.entities.LeitorEntities;
import com.example.demo.entities.LivrosEntities;
import com.example.demo.factories.EmprestimoFactory;
import com.example.demo.repositories.EmprestimoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Subsistema responsável apenas pela persistência do empréstimo.
 * Não conhece regras de horário, disponibilidade do livro nem leitor — isso é papel da fachada.
 */
@Service
public class RegistroEmprestimoService {

    private final EmprestimoRepository emprestimoRepository;

    public RegistroEmprestimoService(EmprestimoRepository emprestimoRepository) {
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<EmprestimoEntities> listarTodos() {
        return emprestimoRepository.findAll();
    }

    public Optional<EmprestimoEntities> buscarPorId(UUID id) {
        return emprestimoRepository.findById(id);
    }

    public EmprestimoEntities registrar(LivrosEntities livro, LeitorEntities leitor, InserirEmprestimoDTO dto) {
        EmprestimoEntities emprestimo = EmprestimoFactory.novo(livro, leitor, dto);
        return emprestimoRepository.save(emprestimo);
    }

    public void marcarComoDevolvido(EmprestimoEntities emprestimo) {
        emprestimo.setStatusEmprestimo("Devolvido");
        emprestimo.setDataDevolucao(LocalDate.now());
        emprestimoRepository.save(emprestimo);
    }

    public void remover(UUID id) {
        emprestimoRepository.deleteById(id);
    }
}
