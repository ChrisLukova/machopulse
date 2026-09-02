package com.machopulse.service;

import com.machopulse.dto.website.WebsiteCreateRequest;
import com.machopulse.dto.website.WebsiteResponse;
import com.machopulse.dto.website.WebsiteUpdateRequest;
import com.machopulse.entity.MonitoredWebsite;
import com.machopulse.entity.User;
import com.machopulse.event.WebsiteCreatedEvent;
import com.machopulse.exception.DuplicateWebsiteUrlException;
import com.machopulse.exception.WebsiteNotFoundException;
import com.machopulse.mapper.MonitoredWebsiteMapper;
import com.machopulse.repository.MonitoredWebsiteRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@NullMarked
public class MonitoredWebsiteService {

    private final MonitoredWebsiteRepository monitoredWebsiteRepository;
    private final MonitoredWebsiteMapper monitoredWebsiteMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final PingLogService pingLogService;

    private static final int MAX_WEBSITES_PER_USER = 20;

    public WebsiteResponse createWebsite(WebsiteCreateRequest request, User currentUser) {

        long existingCount = monitoredWebsiteRepository.countByUser(currentUser);
        if (existingCount >=  MAX_WEBSITES_PER_USER) {
            throw new IllegalStateException("Maximum limit of " +  MAX_WEBSITES_PER_USER + " monitored websites reached");
        }

        String normalizedUrl = normalizeUrl(request.url());

        if (monitoredWebsiteRepository.existsByUserAndUrlIgnoreCase(currentUser, normalizedUrl)) {
            throw  new DuplicateWebsiteUrlException("Website already exists");
        }

        MonitoredWebsite website = monitoredWebsiteMapper.toEntity(request);
        website.setUrl(normalizedUrl);
        website.setUser(currentUser);

        MonitoredWebsite savedWebsite = monitoredWebsiteRepository.saveAndFlush(website);

        eventPublisher.publishEvent(new WebsiteCreatedEvent(savedWebsite));

        return monitoredWebsiteMapper.toResponse(savedWebsite);
    }

    @Transactional(readOnly = true)
    public List<WebsiteResponse> getUserWebsites(User currentUser) {
        List<MonitoredWebsite> websites = monitoredWebsiteRepository.findByUser(currentUser);
        return monitoredWebsiteMapper.toResponseList(websites);
    }

    @Transactional(readOnly = true)
    public WebsiteResponse getWebsiteById(Long id, User currentUser) {
        MonitoredWebsite website = monitoredWebsiteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new WebsiteNotFoundException("Website not found with id: " + id));
        return monitoredWebsiteMapper.toResponse(website);
    }

    public WebsiteResponse updateWebsite(Long id, WebsiteUpdateRequest request, User currentUser) {
        MonitoredWebsite website = monitoredWebsiteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new WebsiteNotFoundException("Website not found with id: " + id));

        String normalizedUrl = normalizeUrl(request.url());
        boolean urlChanged = !website.getUrl().equalsIgnoreCase(normalizedUrl);

        // Check for duplicate URL only if the URL is actually changing
        if (urlChanged &&
                monitoredWebsiteRepository.existsByUserAndUrlIgnoreCase(currentUser, normalizedUrl)) {
            throw new DuplicateWebsiteUrlException("Website with this URL already exists");
        }

        website.setName(request.name());
        website.setUrl(normalizedUrl);
        website.setCheckIntervalSeconds(request.checkIntervalSeconds());

        MonitoredWebsite updatedWebsite = monitoredWebsiteRepository.save(website);

        // Immediately ping the new URL for status updates
        if (urlChanged) {
            pingLogService.executePing(updatedWebsite);
        }

        return monitoredWebsiteMapper.toResponse(updatedWebsite);
    }

    public void triggerManualPing(Long websiteId, User currentUser) {
        MonitoredWebsite website = monitoredWebsiteRepository.findByIdAndUser(websiteId, currentUser)
                .orElseThrow(() -> new WebsiteNotFoundException("Website not found with id: " + websiteId));
        pingLogService.executePing(website);
    }

    public void deleteWebsite(Long id, User currentUser) {
        MonitoredWebsite website = monitoredWebsiteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new WebsiteNotFoundException("Website not found with id: " + id));

        pingLogService.deleteLogsForWebsite(website.getId());

        monitoredWebsiteRepository.delete(website);
    }

    private String normalizeUrl(String rawUrl) {
        String url = rawUrl.trim();
        // Default to https:// if user omitted protocol
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }
}
