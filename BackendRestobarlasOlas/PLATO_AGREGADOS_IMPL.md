# PlatoAgregados - Implementación Completa

## Resumen

Se añadió la tabla `plato_agregados` con todas sus capas (model, repository, service, controller) para manejar la relación N:M entre platos y agregados disponibles.

---

## Tabla: plato_agregados

```sql
CREATE TABLE plato_agregados (
    id_plato INT REFERENCES plato(id) ON DELETE CASCADE,
    id_agregado INT REFERENCES agregados(id) ON DELETE CASCADE,
    PRIMARY KEY (id_plato, id_agregado)
);
```

**Propósito:** Definir qué agregados están disponibles para cada plato.

---

## Archivos Creados

### 1. Model Layer

#### `PlatoAgregadosId.java` (Clave Primaria Compuesta)
- Clase embeddable con clave compuesta (id_plato, id_agregado)
- Implementa `Serializable` y métodos `equals`, `hashCode`

#### `PlatoAgregados.java` (Entidad)
- Mapea la tabla `plato_agregados`
- Relaciones ManyToOne con `Plato` y `Agregado`
- Usa `@EmbeddedId` para la clave primaria compuesta

### 2. Repository Layer

#### `PlatoAgregadosRepository.java`
```java
public interface PlatoAgregadosRepository extends JpaRepository<PlatoAgregados, PlatoAgregadosId> {
    List<PlatoAgregados> findByPlato_Id(Integer platoId);
    List<PlatoAgregados> findByAgregado_Id(Integer agregadoId);
}
```

Métodos de búsqueda:
- `findByPlato_Id()` - Agregados disponibles para un plato
- `findByAgregado_Id()` - Platos que tienen un agregado disponible

### 3. Service Layer

#### `PlatoAgregadosService.java` (Interfaz)
```java
public interface PlatoAgregadosService extends CrudService<PlatoAgregados, PlatoAgregadosId>
```

#### `PlatoAgregadosServiceImpl.java` (Implementación)
- Extiende `AbstractJpaCrudService`
- Hereda operaciones CRUD básicas

### 4. Controller Layer

#### `PlatoAgregadosController.java`
```java
@RestController
@RequestMapping("/api/plato-agregados")
public class PlatoAgregadosController extends AbstractCrudController<PlatoAgregados, PlatoAgregadosId>
```

**Endpoints disponibles:**
- `GET /api/plato-agregados` - Listar todas las asociaciones
- `GET /api/plato-agregados/{id_plato}/{id_agregado}` - Obtener una asociación específica
- `POST /api/plato-agregados` - Crear nueva asociación
- `PUT /api/plato-agregados/{id_plato}/{id_agregado}` - Actualizar asociación
- `DELETE /api/plato-agregados/{id_plato}/{id_agregado}` - Eliminar asociación

---

## Ejemplo de Uso

### Crear asociación: Plato 1 puede tener Agregado 2

```json
POST /api/plato-agregados
Content-Type: application/json

{
  "id": {
    "idPlato": 1,
    "idAgregado": 2
  },
  "plato": {
    "id": 1
  },
  "agregado": {
    "id": 2
  }
}
```

### Obtener agregados disponibles para un plato

```bash
curl http://localhost:8080/restobarswagger/api/plato-agregados?platoId=1
```

---

## Actualización en Agents.md

El diagrama de tablas fue actualizado para incluir expl ícitamente `plato_agregados`:

```markdown
* **plato_agregados:** Relación N:M entre platos y agregados disponibles.
```

---

## Documentación en BD (Supabase)

Asegúrate que la tabla existe en Supabase ejecutando:

```sql
CREATE TABLE plato_agregados (
    id_plato INT REFERENCES plato(id) ON DELETE CASCADE,
    id_agregado INT REFERENCES agregados(id) ON DELETE CASCADE,
    PRIMARY KEY (id_plato, id_agregado)
);
```

---

## Verificación

✅ **Compilación:** `.\mvnw.cmd clean compile` (exitosa)
✅ **Capas completas:** Model → Repository → Service → Controller
✅ **Clave primaria compuesta:** Implementada con `@EmbeddedId`
✅ **Relaciones JPA:** ManyToOne con Plato y Agregado

---

## Próximos Pasos

1. **Consultas avanzadas:** Agregar métodos al repository para obtener agregados por plato
2. **DTOs:** Crear `PlatoAgregadosDto` para exponer en endpoints
3. **Validaciones:** Agregar validaciones en el servicio (ej: no duplicados)
4. **Tests:** Crear tests unitarios e integración

---

**Estado: ✅ COMPLETO Y COMPILADO**

Todos los archivos fueron creados, compilados exitosamente y están listos para usar.

