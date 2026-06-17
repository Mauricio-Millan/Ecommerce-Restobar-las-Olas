package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Rol;
import org.example.backendrestobarlasolas.model.Usuario;
import org.example.backendrestobarlasolas.repository.RolRepository;
import org.example.backendrestobarlasolas.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UsuarioGestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Test
    void testBuscarCuentas() throws Exception {
        // 1. Guardar usuarios de prueba
        Usuario u1 = Usuario.builder()
                .id(UUID.randomUUID())
                .nombre("Juan")
                .apellido("Perez")
                .dni("12345678")
                .email("juan.perez@example.com")
                .activo(true)
                .build();
        usuarioRepository.save(u1);

        Usuario u2 = Usuario.builder()
                .id(UUID.randomUUID())
                .nombre("Maria")
                .apellido("Gomez")
                .dni("87654321")
                .email("maria.gomez@example.com")
                .activo(true)
                .build();
        usuarioRepository.save(u2);

        // 2. Buscar por DNI
        mockMvc.perform(get("/api/usuarios/buscar")
                        .param("query", "12345678"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Juan"));

        // 3. Buscar por Nombre/Apellido
        mockMvc.perform(get("/api/usuarios/buscar")
                        .param("query", "Gomez"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Maria"));
    }

    @Test
    void testCambiarEstado() throws Exception {
        UUID userId = UUID.randomUUID();
        Usuario user = Usuario.builder()
                .id(userId)
                .nombre("Pedro")
                .apellido("Flores")
                .dni("11223344")
                .email("pedro.flores@example.com")
                .activo(true)
                .build();
        usuarioRepository.save(user);

        // 1. Desactivar
        mockMvc.perform(put("/api/usuarios/" + userId + "/estado")
                        .param("activo", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false));

        assertFalse(usuarioRepository.findById(userId).orElseThrow().getActivo());

        // 2. Activar
        mockMvc.perform(put("/api/usuarios/" + userId + "/estado")
                        .param("activo", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(true));

        assertTrue(usuarioRepository.findById(userId).orElseThrow().getActivo());
    }

    @Test
    void testAsignarRol() throws Exception {
        // 1. Crear rol
        Rol rol = rolRepository.save(Rol.builder().rol("Cocinero").build());

        UUID userId = UUID.randomUUID();
        Usuario user = Usuario.builder()
                .id(userId)
                .nombre("Carlos")
                .apellido("Ruiz")
                .dni("55667788")
                .email("carlos.ruiz@example.com")
                .activo(true)
                .build();
        usuarioRepository.save(user);

        // 2. Asignar rol
        mockMvc.perform(put("/api/usuarios/" + userId + "/rol")
                        .param("rolId", rol.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol.rol").value("Cocinero"));

        assertEquals("Cocinero", usuarioRepository.findById(userId).orElseThrow().getRol().getRol());
    }
}
