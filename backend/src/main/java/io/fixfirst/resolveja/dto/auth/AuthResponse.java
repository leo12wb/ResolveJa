package io.fixfirst.resolveja.dto.auth;

import java.util.UUID;

public record AuthResponse(
    String token,
    PrestadorInfo prestador
) {
    public record PrestadorInfo(UUID id, String nome, String email) {}
}
