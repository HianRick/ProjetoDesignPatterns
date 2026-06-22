package com.example.demo.controllers;

import com.example.demo.dtos.InserirEmprestimoDTO;
import com.example.demo.entities.EmprestimoEntities;
import com.example.demo.facade.EmprestimoFacade;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoFacade emprestimoFacade;

    public EmprestimoController(EmprestimoFacade emprestimoFacade) {
        this.emprestimoFacade = emprestimoFacade;
    }

    @GetMapping
    @Operation(summary = "Listar todos os empréstimos.", description = "Retorna todos os empréstimos já cadastrados no sistema!")
    public List<EmprestimoEntities> getTodos() {
        return emprestimoFacade.listarTodos();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lista os empréstimos por ID.")
    public ResponseEntity<Object> getPorId(@PathVariable UUID id) {
        Optional<EmprestimoEntities> emprestimo = emprestimoFacade.buscarPorId(id);

        if (emprestimo.isPresent()) {
            return ResponseEntity.ok(emprestimo.get());
        } else {
            return ResponseEntity.status(404).body("Empréstimo não encontrado");
        }
    }

    @PostMapping
    @Operation(summary = "Insere um novo empréstimo.")
    public ResponseEntity<?> criar(@RequestBody InserirEmprestimoDTO dto) {
        Object resultado = emprestimoFacade.realizarEmprestimo(dto);
        if (resultado instanceof String) {
            return ResponseEntity.badRequest().body(resultado);
        } else {
            return ResponseEntity.status(201).body(resultado);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deleta um empréstimo.")
    public ResponseEntity<?> deletar(@PathVariable UUID id) {
        boolean deletado = emprestimoFacade.cancelar(id);
        if (deletado) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(404).body("Empréstimo não encontrado");
        }
    }

    @PatchMapping("/{id}/devolver")
    @Operation(summary = "Devolve o livro emprestado.")
    public ResponseEntity<?> devolver(@PathVariable UUID id) {
        boolean devolvido = emprestimoFacade.devolver(id);
        if (devolvido) {
            return ResponseEntity.ok("Livro devolvido");
        } else {
            return ResponseEntity.status(404).body("Empréstimo não encontrado");
        }
    }
}
