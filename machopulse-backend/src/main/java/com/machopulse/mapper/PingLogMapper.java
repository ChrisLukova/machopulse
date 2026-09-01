package com.machopulse.mapper;

import com.machopulse.dto.ping.PingLogResponse;
import com.machopulse.entity.PingLog;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PingLogMapper {

    PingLogResponse toResponse(PingLog pingLog);
    List<PingLogResponse> toResponseList(List<PingLog> pingLogs);
}
