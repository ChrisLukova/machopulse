package com.machopulse.controller;

import com.machopulse.dto.ping.PingLogResponse;
import com.machopulse.dto.ping.WebsiteStatsResponse;
import com.machopulse.dto.website.WebsiteCreateRequest;
import com.machopulse.dto.website.WebsiteResponse;
import com.machopulse.dto.website.WebsiteUpdateRequest;
import com.machopulse.entity.User;
import com.machopulse.security.CustomUserDetails;
import com.machopulse.service.MonitoredWebsiteService;
import com.machopulse.service.PingLogQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/websites")
@RequiredArgsConstructor
@NullMarked
@Tag(name = "Monitored Websites", description = "Endpoints for managing user-monitored websites")
@SecurityRequirement(name = "bearerAuth")
public class MonitoredWebsiteController {

    private final MonitoredWebsiteService monitoredWebsiteService;
    private final PingLogQueryService pingLogQueryService;

    @PostMapping
    @Operation(summary = "Add a new website to monitor")
    public ResponseEntity<WebsiteResponse> createWebsite(@Valid @RequestBody WebsiteCreateRequest request,
                                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.user();
        WebsiteResponse response = monitoredWebsiteService.createWebsite(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing monitored website configuration")
    public ResponseEntity<WebsiteResponse> updateWebsite(@PathVariable Long id,
                                                         @Valid @RequestBody WebsiteUpdateRequest request,
                                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.user();
        WebsiteResponse response = monitoredWebsiteService.updateWebsite(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/ping")
    @Operation(summary = "Manually trigger an immediate ping for a monitored website")
    public ResponseEntity<Void> triggerManualPing(@PathVariable Long id,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.user();
        monitoredWebsiteService.triggerManualPing(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "Get all websites monitored by the authenticated user")
    public ResponseEntity<List<WebsiteResponse>> getUserWebsites(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.user();
        List<WebsiteResponse> websites = monitoredWebsiteService.getUserWebsites(currentUser);
        return ResponseEntity.ok(websites);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific monitored website by ID")
    public ResponseEntity<WebsiteResponse> getWebsiteById(@PathVariable Long id,
                                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.user();
        WebsiteResponse response = monitoredWebsiteService.getWebsiteById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    // PingLog History Endpoint
    @GetMapping("/{id}/logs")
    @Operation(summary = "Get ping history logs for a monitored website")
    public ResponseEntity<List<PingLogResponse>> getWebsiteLogs(@PathVariable Long id,
                                                                @RequestParam(defaultValue = "20") int limit,
                                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.user();
        List<PingLogResponse> logs = pingLogQueryService.getWebsiteLogs(id, limit, currentUser);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Get aggregate uptime and latency statistics for a monitored website")
    public ResponseEntity<WebsiteStatsResponse> getWebsiteStats(@PathVariable Long id,
                                                                @RequestParam(defaultValue = "24h") String period,
                                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.user();
        WebsiteStatsResponse stats = pingLogQueryService.getWebsiteStats(id, period, currentUser);
        return ResponseEntity.ok(stats);
    }


    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a website from monitoring")
    public ResponseEntity<Void> deleteWebsite(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomUserDetails userDetails ) {
        User currentUser = userDetails.user();
        monitoredWebsiteService.deleteWebsite(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
