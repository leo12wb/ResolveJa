package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardService.DashboardData> dashboard(
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(dashboardService.carregar(prestador.getId()));
    }
}
