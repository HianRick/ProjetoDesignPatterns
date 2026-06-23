package com.example.demo.policies;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;


@Component
public class HorarioFuncionamentoPolicy {

    public boolean estaDentroDoHorario(LocalDateTime agora) {
        DayOfWeek dia = agora.getDayOfWeek();
        boolean fimDeSemana = dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY;
        boolean foraDoExpediente = agora.getHour() < 8 || agora.getHour() >= 22;
        return !fimDeSemana && !foraDoExpediente;
    }
}
