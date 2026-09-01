package com.machopulse.mapper;

import com.machopulse.dto.website.WebsiteCreateRequest;
import com.machopulse.dto.website.WebsiteResponse;
import com.machopulse.entity.MonitoredWebsite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MonitoredWebsiteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "lastChecked", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "pingLogs", ignore = true)
    MonitoredWebsite toEntity(WebsiteCreateRequest request);

    WebsiteResponse toResponse(MonitoredWebsite website);

    List<WebsiteResponse> toResponseList(List<MonitoredWebsite> websites);

}
