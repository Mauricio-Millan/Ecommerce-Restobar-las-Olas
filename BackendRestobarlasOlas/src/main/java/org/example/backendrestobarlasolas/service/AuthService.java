package org.example.backendrestobarlasolas.service;

import org.example.backendrestobarlasolas.dto.auth.AuthProfileRequest;
import org.example.backendrestobarlasolas.dto.auth.AuthProfileResponse;
import org.springframework.security.oauth2.jwt.Jwt;

public interface AuthService {

    AuthProfileResponse registerOrUpdateProfile(Jwt jwt, AuthProfileRequest request);

    AuthProfileResponse getCurrentProfile(Jwt jwt);
}

