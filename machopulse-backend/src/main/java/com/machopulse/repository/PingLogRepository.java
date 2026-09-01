package com.machopulse.repository;

import com.machopulse.entity.MonitoredWebsite;
import com.machopulse.entity.PingLog;
import com.machopulse.repository.projection.PingLogStatsProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PingLogRepository extends JpaRepository<PingLog, Long> {
    List<PingLog> findByWebsiteOrderByTimestampDesc(MonitoredWebsite website, Pageable pageable);

    @Modifying
    @Query("DELETE FROM PingLog p WHERE p.timestamp < :cutoff ")
    int deleteLogsOlderThan(@Param("cutoff")LocalDateTime cutoff);

    @Modifying
    @Query("DELETE FROM PingLog p WHERE p.website.id = :websiteId")
    void deleteByWebsiteId(@Param("websiteId") Long websiteId);

    @Query("""
        SELECT
                COUNT(p) as totalChecks,
                SUM(CASE WHEN p.isUp = true THEN 1 ELSE 0 END) as totalUp,
                AVG(p.responseTimeMs) as avgResponseTime
        FROM PingLog p
        WHERE p.website = :website AND p.timestamp >= :since
        """)
    PingLogStatsProjection calculateStatsForWebsite(
            @Param("website") MonitoredWebsite website,
            @Param("since") LocalDateTime since
    );
}
