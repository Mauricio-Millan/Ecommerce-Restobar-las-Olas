package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.dto.auth.AuthProfileRequest;
import org.example.backendrestobarlasolas.dto.auth.AuthProfileResponse;
import org.example.backendrestobarlasolas.model.Rol;
import org.example.backendrestobarlasolas.model.Usuario;
import org.example.backendrestobarlasolas.repository.RolRepository;
import org.example.backendrestobarlasolas.repository.UsuarioRepository;
import org.example.backendrestobarlasolas.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String DEFAULT_ROLE = "Cliente";

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    public AuthServiceImpl(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    @Transactional
    public AuthProfileResponse registerOrUpdateProfile(Jwt jwt, AuthProfileRequest request) {
        ResolvedIdentity identity = resolveIdentity(jwt, request);
        Rol rol = jwt != null ? resolveRole(jwt).orElseGet(this::resolveDefaultRole) : resolveDefaultRole();
        Usuario usuario = findOrCreateUsuario(identity, rol);
        validateDuplicateEmail(usuario.getId(), identity.email());
        validateDuplicateDni(usuario.getId(), request.getDni());

        usuario.setEmail(identity.email());
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setDni(request.getDni().trim());
        usuario.setCelular(normalize(request.getCelular()));
        usuario.setDireccion(normalize(request.getDireccion()));
        usuario.setRol(rol);

        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthProfileResponse getCurrentProfile(Jwt jwt) {
        Usuario usuario = usuarioRepository.findById(resolveUserId(jwt))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El perfil del usuario autenticado no existe"));
        return toResponse(usuario);
    }

    private Usuario findOrCreateUsuario(ResolvedIdentity identity, Rol rol) {
        UUID userId = identity.userId();
        return usuarioRepository.findById(userId)
                .orElseGet(() -> Usuario.builder()
                        .id(userId)
                        .email(identity.email())
                        .rol(rol)
                        .build());
    }

    private ResolvedIdentity resolveIdentity(Jwt jwt, AuthProfileRequest request) {
        if (jwt != null) {
            UUID userId = resolveUserId(jwt);
            String email = extractEmail(jwt);
            validateRequestIdentity(request, userId, email);
            return new ResolvedIdentity(userId, email);
        }

        UUID requestUserId = parseRequestUserId(request.getUserId());
        String requestEmail = normalizeEmail(request.getEmail());

        if (requestUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cuando no se envía JWT, el userId es obligatorio");
        }

        if (!StringUtils.hasText(requestEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cuando no se envía JWT, el email es obligatorio");
        }

        return new ResolvedIdentity(requestUserId, requestEmail);
    }

    private void validateRequestIdentity(AuthProfileRequest request, UUID userId, String email) {
        if (StringUtils.hasText(request.getUserId())) {
            UUID requestUserId = parseRequestUserId(request.getUserId());
            if (!userId.equals(requestUserId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El userId enviado no coincide con el JWT");
            }
        }

        if (StringUtils.hasText(request.getEmail())) {
            String requestEmail = normalizeEmail(request.getEmail());
            if (!email.equalsIgnoreCase(requestEmail)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email enviado no coincide con el JWT");
            }
        }
    }

    private UUID parseRequestUserId(String userId) {
        if (!StringUtils.hasText(userId)) {
            return null;
        }

        try {
            return UUID.fromString(userId.trim());
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El userId debe ser un UUID válido");
        }
    }

    private void validateDuplicateEmail(UUID currentUserId, String email) {
        usuarioRepository.findByEmailIgnoreCase(email)
                .filter(usuario -> !usuario.getId().equals(currentUserId))
                .ifPresent(usuario -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
                });
    }

    private void validateDuplicateDni(UUID currentUserId, String dni) {
        if (dni == null || dni.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El DNI es obligatorio");
        }
        usuarioRepository.findByDni(dni.trim())
                .filter(usuario -> !usuario.getId().equals(currentUserId))
                .ifPresent(usuario -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "El DNI ya está registrado");
                });
    }

    private Rol resolveDefaultRole() {
        return rolRepository.findByRolIgnoreCase(DEFAULT_ROLE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "No existe el rol por defecto 'Cliente'"));
    }

    private Optional<Rol> resolveRole(Jwt jwt) {
        Object customRole = jwt.getClaims().get("custom_role");
        if (customRole instanceof String role && !role.isBlank()) {
            return rolRepository.findByRolIgnoreCase(role.trim());
        }

        Object appMetadata = jwt.getClaims().get("app_metadata");
        if (appMetadata instanceof java.util.Map<?, ?> metadata) {
            Object role = metadata.get("role");
            if (role instanceof String roleValue && !roleValue.isBlank()) {
                return rolRepository.findByRolIgnoreCase(roleValue.trim());
            }
        }

        return Optional.empty();
    }

    private UUID resolveUserId(Jwt jwt) {
        try {
            return UUID.fromString(jwt.getSubject());
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El JWT no contiene un subject válido");
        }
    }

    private String extractEmail(Jwt jwt) {
        String email = normalizeEmail(jwt.getClaimAsString("email"));
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El JWT no contiene un email válido");
        }
        return email;
    }

    private String normalizeEmail(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase() : null;
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AuthProfileResponse toResponse(Usuario usuario) {
        return AuthProfileResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .idRol(usuario.getRol() != null ? usuario.getRol().getId() : null)
                .rol(usuario.getRol() != null ? usuario.getRol().getRol() : null)
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .dni(usuario.getDni())
                .celular(usuario.getCelular())
                .direccion(usuario.getDireccion())
                .build();
    }

    private record ResolvedIdentity(UUID userId, String email) {
    }
}
