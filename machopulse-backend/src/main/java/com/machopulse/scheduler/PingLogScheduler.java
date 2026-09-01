package com.machopulse.scheduler;

import com.machopulse.entity.MonitoredWebsite;
import com.machopulse.repository.MonitoredWebsiteRepository;
import com.machopulse.repository.PingLogRepository;
import com.machopulse.service.PingLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@NullMarked
public class PingLogScheduler {

    private final MonitoredWebsiteRepository  monitoredWebsiteRepository;
    private final PingLogRepository pingLogRepository;
    private final PingLogService pingLogService;

    @Scheduled(fixedRate = 60000)
    public void schedulePings() {
        List<MonitoredWebsite> websites = monitoredWebsiteRepository.findAll();

        if (websites.isEmpty()) {
            return;
        }

        log.info("Triggering scheduled pings for {} website(s)", websites.size());

        for (MonitoredWebsite website : websites) {
            try {
                pingLogService.executePing(website);
            } catch (Exception e) {
                log.error("Unhandled error during ping execution for website ID {}", website.getId(), e);
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void purgeOldPingLogs() {
        log.info("Starting scheduled purge of ping logs older than 30 days...");

        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        int deletedCount = pingLogRepository.deleteLogsOlderThan(cutoff);

        log.info("Successfully purged {} old ping logs created before {}", deletedCount, cutoff);
    }

}
