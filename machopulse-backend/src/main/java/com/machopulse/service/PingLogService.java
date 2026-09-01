package com.machopulse.service;

import com.machopulse.entity.MonitoredWebsite;
import com.machopulse.entity.PingLog;
import com.machopulse.event.WebsiteCreatedEvent;
import com.machopulse.repository.MonitoredWebsiteRepository;
import com.machopulse.repository.PingLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import javax.net.ssl.SSLException;
import java.net.ConnectException;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.*;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@NullMarked
public class PingLogService {

    private final MonitoredWebsiteRepository monitoredWebsiteRepository;
    private final PingLogRepository pingLogRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleWebsiteCreatedEvent(WebsiteCreatedEvent event) {
        log.info("Triggering initial async ping for website: {}", event.website().getUrl());
        executePing(event.website());
    }

    public void executePing(MonitoredWebsite monitoredWebsite) {
        log.debug("Executing ping for website: {}", monitoredWebsite.getUrl());

        long responseTimeMs = 0;
        int statusCode = 0;
        boolean isUp = false;
        String errorMessage = null;

        Instant start = Instant.now();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(monitoredWebsite.getUrl()))
                    .header("User-Agent", "MachoPulseMonitor")
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            Instant end = Instant.now();

            responseTimeMs = Duration.between(start, end).toMillis();
            statusCode = response.statusCode();

            isUp = statusCode >= 200 && statusCode < 400;

            if (!isUp) {
                errorMessage = "HTTP Error " + statusCode;
            }
        } catch (Exception e) {
            Instant end = Instant.now();
            responseTimeMs = Duration.between(start, end).toMillis();
            errorMessage = parseErrorMessage(e);
            log.warn("Ping failed for {}: {}", monitoredWebsite.getUrl(), errorMessage);
        }

        savePingResult(monitoredWebsite, isUp, statusCode, responseTimeMs, errorMessage);
    }

    @Transactional
    protected void savePingResult(MonitoredWebsite website, boolean isUp, int statusCode, long responseTimeMs, @Nullable String errorMessage) {
        website.setLastChecked(LocalDateTime.now());
        website.setStatus(isUp ? MonitoredWebsite.Status.UP : MonitoredWebsite.Status.DOWN);
        monitoredWebsiteRepository.save(website);

        PingLog pingLog = PingLog.builder()
                .website(website)
                .statusCode(statusCode > 0 ? statusCode : null)
                .responseTimeMs(responseTimeMs)
                .isUp(isUp)
                .errorMessage(errorMessage)
                .build();

        pingLogRepository.save(pingLog);

        log.info("Ping complete for [{}]: status={}, code={}, time={}ms",
                website.getName(), website.getStatus(), statusCode, responseTimeMs);
    }

    @Transactional
    public void deleteLogsForWebsite(Long websiteId) {
        log.info("Deleting all ping logs for website ID: {}", websiteId);
        pingLogRepository.deleteByWebsiteId(websiteId);
    }

    private String parseErrorMessage(Throwable throwable) {
        return switch (throwable) {
            case UnknownHostException _ -> "DNS Lookup Failed (Domain does not exist)";
            case ConnectException _ -> "Connection Refused (Server offline or port closed)";
            case HttpConnectTimeoutException _ -> "Connection Timed Out (Failed to establish socket)";
            case HttpTimeoutException _ -> "Request Timed Out (Server failed to respond within 15s)";
            case SSLException _ -> "SSL/TLS Handshake Failure (Invalid certificate)";
            case IllegalArgumentException ex when ex.getMessage() != null && ex.getMessage().contains("URI") ->
                    "Invalid URL Format";
            default -> {
                if (throwable.getCause() != null && throwable.getCause() != throwable) {
                    yield parseErrorMessage(throwable.getCause());
                }
                yield throwable.getMessage() != null ? throwable.getMessage() : throwable.getClass().getSimpleName();
            }
        };
    }
}
