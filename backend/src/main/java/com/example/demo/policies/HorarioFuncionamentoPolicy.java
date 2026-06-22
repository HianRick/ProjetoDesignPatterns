package com.example.demo.policies;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

/**
 * Regra de negócio isolada: define se o horário atual permite operações de empréstimo.
 * Mantida fora da fachada/serviço para poder ser testada e alterada sozinha.
 */
@Component
public class HorarioFuncionamentoPolicy {

    public boolean estaDentroDoHorario(LocalDateTime agora) {
        DayOfWeek dia = agora.getDayOfWeek();
        boolean fimDeSemana = dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY;
        boolean foraDoExpediente = agora.getHour() < 8 || agora.getHour() >= 22;
        return !fimDeSemana && !foraDoExpediente;
    }
}
