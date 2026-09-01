package com.machopulse.mapper;

import com.machopulse.dto.auth.AuthResponse;
import com.machopulse.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "token", source = "token")
    @Mapping(target = "type", constant = "Bearer")
    @Mapping(target = "role", source = "user.role")
    AuthResponse toAuthResponse(User user, String token);
}
