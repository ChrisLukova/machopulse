package com.machopulse.dto.auth;

public record AuthResponse(
        String token,
        String type,
        Long id,
        String username,
        String email,
        String role
) {
    public AuthResponse(String token, Long id, String username, String email, String role) {
        this(token, "Bearer", id, username, email, role);
    }
}
