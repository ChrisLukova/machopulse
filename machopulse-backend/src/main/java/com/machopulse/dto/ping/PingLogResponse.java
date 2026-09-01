package com.machopulse.dto.ping;

import java.time.LocalDateTime;

public record PingLogResponse(
        Long id,
        Integer statusCode,
        Long responseTimeMs,
        Boolean isUp,
        String errorMessage,
        LocalDateTime timestamp
) {
}
