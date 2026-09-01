package com.machopulse.service;

import com.machopulse.dto.auth.AuthResponse;
import com.machopulse.dto.auth.LoginRequest;
import com.machopulse.dto.auth.RegisterRequest;
import com.machopulse.entity.User;
import com.machopulse.exception.UserAlreadyExistsException;
import com.machopulse.exception.UserNotFoundException;
import com.machopulse.mapper.UserMapper;
import com.machopulse.repository.UserRepository;
import com.machopulse.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@NullMarked
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserMapper userMapper;


    @Transactional(readOnly = true)
    public AuthResponse me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails userDetails)) {
            throw new BadCredentialsException("Not authenticated");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .or(() -> userRepository.findByUsername(userDetails.getUsername()))
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Generate a fresh token or pass back existing context
        String token = jwtService.generateToken(userDetails);

        return userMapper.toAuthResponse(user, token);
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new UserAlreadyExistsException("Email is already registered");
        }
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new UserAlreadyExistsException("Username is already taken");
        }

        User user = User.builder()
                .username(registerRequest.username())
                .email(registerRequest.email())
                .password(passwordEncoder.encode(registerRequest.password()))
                .role(User.Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateToken(userDetails);

        return userMapper.toAuthResponse(savedUser, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {
        // 1. Resolve user by email OR username first to get the canonical identifier (email)
        User user = userRepository.findByEmail(loginRequest.usernameOrEmail())
                .or(() -> userRepository.findByUsername(loginRequest.usernameOrEmail()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));

        // 2. Authenticate using user.getEmail() to match getEmail() in CustomUserDetails
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        loginRequest.password()
                )
        );

        if (!(authentication.getPrincipal() instanceof UserDetails userDetails)) {
            throw new BadCredentialsException("Invalid username/email or password");
        }

        // 3. Generate token using the authenticated userDetails
        String token = jwtService.generateToken(userDetails);

        return userMapper.toAuthResponse(user, token);
    }

}
