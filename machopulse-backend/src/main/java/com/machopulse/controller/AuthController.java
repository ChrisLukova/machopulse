package com.machopulse.controller;

import com.machopulse.dto.auth.AuthResponse;
import com.machopulse.dto.auth.LoginRequest;
import com.machopulse.dto.auth.RegisterRequest;
import com.machopulse.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@NullMarked
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.me(authentication));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }
}
