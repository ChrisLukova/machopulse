package com.machopulse.repository.projection;

public interface PingLogStatsProjection {
    Long getTotalChecks();
    Long getTotalUp();
    Double getAvgResponseTime();
}
