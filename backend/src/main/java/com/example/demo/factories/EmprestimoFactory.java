package com.example.demo.factories;

import com.example.demo.dtos.InserirEmprestimoDTO;
import com.example.demo.entities.EmprestimoEntities;
import com.example.demo.entities.LeitorEntities;
import com.example.demo.entities.LivrosEntities;

import java.time.LocalDate;

/**
 * Simple Factory (padrão criacional).
 *
 * Centraliza a política de criação de um empréstimo — status inicial e prazo
 * padrão de devolução — tirando essa regra de dentro do service. Se o DTO já
 * trouxer as datas, elas são respeitadas; caso contrário aplicam-se os padrões.
 */
public class EmprestimoFactory {

    private static final int PRAZO_PADRAO_DIAS = 15;

    private EmprestimoFactory() {
        // Fábrica de uso estático: não deve ser instanciada.
    }

    public static EmprestimoEntities novo(LivrosEntities livro, LeitorEntities leitor, InserirEmprestimoDTO dto) {
        LocalDate dataEmprestimo = dto.getDataEmprestimo() != null
                ? dto.getDataEmprestimo()
                : LocalDate.now();

        LocalDate dataDevolucao = dto.getDataDevolucao() != null
                ? dto.getDataDevolucao()
                : dataEmprestimo.plusDays(PRAZO_PADRAO_DIAS);

        EmprestimoEntities emprestimo = new EmprestimoEntities();
        emprestimo.setLivro(livro);
        emprestimo.setLeitor(leitor);
        emprestimo.setDataEmprestimo(dataEmprestimo);
        emprestimo.setDataDevolucao(dataDevolucao);
        emprestimo.setStatusEmprestimo("Emprestado");
        return emprestimo;
    }
}
