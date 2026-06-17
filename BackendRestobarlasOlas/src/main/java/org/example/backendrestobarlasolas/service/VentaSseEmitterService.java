package org.example.backendrestobarlasolas.service;

import lombok.extern.slf4j.Slf4j;
import org.example.backendrestobarlasolas.dto.venta.VentaResponseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Servicio simple que mantiene una colección de SseEmitters y permite publicar
 * actualizaciones de ventas a todos los clientes conectados.
 */
@Slf4j
@Component
public class VentaSseEmitterService {

    private final Set<SseEmitter> emitters = new CopyOnWriteArraySet<>();

    /**
     * Registra un nuevo emitter y lo devuelve al controller para que el cliente lo use.
     */
    public SseEmitter registerEmitter() {
        // 0L = no timeout (cliente must disconnect)
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);

        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            log.debug("SSE emitter completed and removed");
        });
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            log.debug("SSE emitter timeout and removed");
        });
        emitter.onError((ex) -> {
            emitters.remove(emitter);
            log.debug("SSE emitter error and removed: {}", ex.getMessage());
        });

        return emitter;
    }

    /**
     * Publica una actualización de venta a todos los clientes conectados.
     */
    public void publishVentaUpdate(VentaResponseDto dto) {
        if (dto == null) return;
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("venta-update").data(dto));
            } catch (IOException e) {
                emitters.remove(emitter);
                log.debug("Fallo al enviar evento SSE, se elimina el emitter: {}", e.getMessage());
            }
        }
    }
}

