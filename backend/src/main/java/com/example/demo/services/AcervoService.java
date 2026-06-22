package com.example.demo.services;

import com.example.demo.entities.LivrosEntities;
import com.example.demo.repositories.LivrosRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Subsistema responsável pelo acervo (livros) no contexto de empréstimos.
 * Centraliza a mutação de disponibilidade, que antes estava repetida no EmprestimoService.
 */
@Service
public class AcervoService {

    private final LivrosRepository livrosRepository;

    public AcervoService(LivrosRepository livrosRepository) {
        this.livrosRepository = livrosRepository;
    }

    public Optional<LivrosEntities> buscarPorId(UUID id) {
        return livrosRepository.findById(id);
    }

    public void reservar(LivrosEntities livro) {
        livro.setDisponibilidade(false);
        livrosRepository.save(livro);
    }

    public void devolver(LivrosEntities livro) {
        livro.setDisponibilidade(true);
        livrosRepository.save(livro);
    }
}
