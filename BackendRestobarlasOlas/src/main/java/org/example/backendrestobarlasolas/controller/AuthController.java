package org.example.backendrestobarlasolas.controller;

import jakarta.validation.Valid;
import org.example.backendrestobarlasolas.dto.auth.AuthProfileRequest;
import org.example.backendrestobarlasolas.dto.auth.AuthProfileResponse;
import org.example.backendrestobarlasolas.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register-profile")
    public ResponseEntity<AuthProfileResponse> registerProfile(@AuthenticationPrincipal Jwt jwt,
                                                               @Valid @RequestBody AuthProfileRequest request) {
        return ResponseEntity.ok(authService.registerOrUpdateProfile(jwt, request));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthProfileResponse> updateMyProfile(@AuthenticationPrincipal Jwt jwt,
                                                               @Valid @RequestBody AuthProfileRequest request) {
        return ResponseEntity.ok(authService.registerOrUpdateProfile(jwt, request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthProfileResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(authService.getCurrentProfile(jwt));
    }
}

