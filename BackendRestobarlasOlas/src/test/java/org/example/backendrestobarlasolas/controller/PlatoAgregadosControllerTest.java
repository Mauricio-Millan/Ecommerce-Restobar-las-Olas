package org.example.backendrestobarlasolas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.backendrestobarlasolas.model.PlatoAgregados;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class PlatoAgregadosControllerTest {

    @Test
    void testJacksonDeserialization() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();

        String json = """
        {
          "id": {
            "idPlato": 1,
            "idAgregado": 2
          },
          "plato": { "id": 1 },
          "agregado": { "id": 2 }
        }
        """;

        PlatoAgregados platoAgregados = objectMapper.readValue(json, PlatoAgregados.class);

        // Con @JsonIgnore, estos seran NULL, lo que causa el fallo en base de datos.
        // Queremos que NO sean NULL para que Hibernate pueda persistir la asociacion con @MapsId.
        System.out.println("Plato: " + platoAgregados.getPlato());
        System.out.println("Agregado: " + platoAgregados.getAgregado());

        // Este assert fallara con la configuracion original (@JsonIgnore)
        assertNotNull(platoAgregados.getPlato(), "El plato no deberia ser nulo");
        assertNotNull(platoAgregados.getAgregado(), "El agregado no deberia ser nulo");
    }
}
