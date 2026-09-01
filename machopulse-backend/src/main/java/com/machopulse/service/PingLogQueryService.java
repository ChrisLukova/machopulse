package com.machopulse.service;

import com.machopulse.dto.ping.PingLogResponse;
import com.machopulse.dto.ping.WebsiteStatsResponse;
import com.machopulse.entity.MonitoredWebsite;
import com.machopulse.entity.PingLog;
import com.machopulse.entity.User;
import com.machopulse.exception.UnauthorizedAccessException;
import com.machopulse.exception.WebsiteNotFoundException;
import com.machopulse.mapper.PingLogMapper;
import com.machopulse.repository.MonitoredWebsiteRepository;
import com.machopulse.repository.PingLogRepository;
import com.machopulse.repository.projection.PingLogStatsProjection;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@NullMarked
public class PingLogQueryService {

    private final PingLogRepository pingLogRepository;
    private final PingLogMapper pingLogMapper;
    private final MonitoredWebsiteRepository monitoredWebsiteRepository;

    @Transactional(readOnly = true)
    public List<PingLogResponse> getWebsiteLogs(Long monitoredWebsiteId, int limit, User currentUser) {
        MonitoredWebsite website = getWebsiteAndVerifyOwner(monitoredWebsiteId, currentUser);

        int safeLimit = Math.clamp(limit, 1, 100);

        List<PingLog> logs = pingLogRepository.findByWebsiteOrderByTimestampDesc(
                website, PageRequest.of(0, safeLimit)
        );
        return pingLogMapper.toResponseList(logs);
    }

    @Transactional(readOnly = true)
    public WebsiteStatsResponse getWebsiteStats(Long monitoredWebsiteId, String period, User currentUser) {
        MonitoredWebsite website = getWebsiteAndVerifyOwner(monitoredWebsiteId, currentUser);

        LocalDateTime since = resolveCutoffTime(period);

        PingLogStatsProjection stats = pingLogRepository.calculateStatsForWebsite(website, since);

        long totalChecks = stats.getTotalChecks() != null ? stats.getTotalChecks() : 0;
        long totalUp = stats.getTotalUp() != null ? stats.getTotalUp() : 0;
        long totalDown = totalChecks - totalUp;
        double rawAvgResponseTime = stats.getAvgResponseTime() != null ? stats.getAvgResponseTime() : 0.0;

        double uptimePercentage = 100.0;
        if (totalChecks > 0) {
            uptimePercentage = ((double) totalUp / totalChecks) * 100.0;
        }

        return new WebsiteStatsResponse(
                period,
                roundToTwoDecimals(uptimePercentage),
                roundToTwoDecimals(rawAvgResponseTime),
                totalChecks,
                totalUp,
                totalDown
        );
    }

    private MonitoredWebsite getWebsiteAndVerifyOwner(Long monitoredWebsiteId, User currentUser) {
        MonitoredWebsite website = monitoredWebsiteRepository.findById(monitoredWebsiteId)
                .orElseThrow(() -> new WebsiteNotFoundException("Website not found with ID: " + monitoredWebsiteId));

        if (!website.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("Access denied");
        }
        return website;
    }

    private LocalDateTime resolveCutoffTime(String period) {
        return switch (period.toLowerCase()) {
            case "7d" -> LocalDateTime.now().minusDays(7);
            case "30d" -> LocalDateTime.now().minusDays(30);
            default -> LocalDateTime.now().minusHours(24);
        };
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}