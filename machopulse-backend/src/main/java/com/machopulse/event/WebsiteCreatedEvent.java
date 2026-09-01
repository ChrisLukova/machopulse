package com.machopulse.event;

import com.machopulse.entity.MonitoredWebsite;

public record WebsiteCreatedEvent(MonitoredWebsite website) {
}
