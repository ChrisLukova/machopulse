package com.machopulse.dto.ping;

public record WebsiteStatsResponse(
        String period,
        double uptimePercentage,
        double avgResponseTimeMs,
        long totalChecks,
        long totalUp,
        long totalDown
) {
}
