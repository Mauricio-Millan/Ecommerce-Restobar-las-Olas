# Backend Restobar Las Olas

Proyecto Spring Boot 3/4 con arquitectura en capas para el esquema SQL documentado en `Agents.md`.

## Capas incluidas

- `model`: entidades JPA (`Rol`, `Categoria`, `Usuario`, `Plato`, `Agregado`, `Venta`, `DetalleVenta`, `DetalleVentaAgregado`)
- `repository`: repositorios Spring Data JPA
- `service`: contrato CRUD genérico y contratos específicos por entidad
- `service.impl`: implementación concreta de servicios
- `controller`: endpoints REST CRUD

## Validación

Ejecutar pruebas:

```powershell
.\mvnw.cmd test
```

## Notas

- En pruebas se usa H2 en memoria para permitir el arranque del contexto de Spring.
- La persistencia de ventas usa cascada para guardar cabecera, detalles y agregados seleccionados.
- La integración con Supabase/JWT puede añadirse en una siguiente etapa.

