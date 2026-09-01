package com.machopulse.exception;

import com.machopulse.dto.exceptionhandler.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // --- Not Found Handlers (404) ---
    @ExceptionHandler({UserNotFoundException.class, WebsiteNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException exception) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                exception.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // --- Already Exists / Conflict Handlers (409) ---
    @ExceptionHandler({UserAlreadyExistsException.class, DuplicateWebsiteUrlException.class})
    public ResponseEntity<ErrorResponse> handleAlreadyExists(RuntimeException exception) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                exception.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    // --- Authorization / Access Handlers (403) ---
    @ExceptionHandler({UnauthorizedAccessException.class})
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(UnauthorizedAccessException exception) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                exception.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    // --- Authentication Handlers (401) ---
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException exception) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Invalid username/email or password"
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    // --- Validation Handlers (400) ---
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException exception) {
        String errorMessage = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                errorMessage
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // --- Fallback Handler (500) ---
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception exception) {
        log.error("Unhandled internal server exception", exception);
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "An unexpected error occurred. Please try again later."
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
