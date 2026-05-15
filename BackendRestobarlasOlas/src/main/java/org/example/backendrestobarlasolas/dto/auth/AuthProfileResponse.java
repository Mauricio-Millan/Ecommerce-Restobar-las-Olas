package org.example.backendrestobarlasolas.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthProfileResponse {

    private UUID id;
    private String email;
    private Integer idRol;
    private String rol;
    private String nombre;
    private String apellido;
    private String dni;
    private String celular;
    private String direccion;
}

