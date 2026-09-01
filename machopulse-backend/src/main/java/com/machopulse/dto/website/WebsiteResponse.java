package com.machopulse.dto.website;

import java.time.LocalDateTime;

public record WebsiteResponse(
        Long id,
        String name,
        String url,
        Integer checkIntervalSeconds,
        String status,
        LocalDateTime lastChecked,
        LocalDateTime createdAt
) {
}
