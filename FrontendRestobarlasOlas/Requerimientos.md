**Resumen de Historias de Usuario Detalladas**

El documento presenta 18 Historias de Usuario (HU) detalladas, todas con Prioridad en Negocio "Alta" o "Media", un Riesgo en Desarrollo "Media" y 1 Punto Estimado. Las historias están organizadas en 6 iteraciones y cubren las perspectivas de tres roles principales: **Cliente**, **Cocina**, y **Administrador**.

### **Agrupación por Iteración (HU 01 a HU 18)**

| Iteración | Foco Principal                        | Roles Involucrados     | Historias (N° - Nombre)                                                                                                       |
| :-------: | :------------------------------------ | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **1**     | Autenticación y Registro              | Cliente                | 01 - Registrar cuenta, 02 - Iniciar Sesión, 03 - Recuperar contraseña                                                         |
| **2**     | Selección y Personalización de Platos | Cliente                | 04 - Ver información del plato, 05 - Seleccionar plato, 06 - Personalizar plato, 07 - Gestionar cantidad                      |
| **3**     | Proceso de Pago (`Checkout`)          | Cliente                | 08 - Ver resumen de pedido, 09 - Elegir tipo comprobante, 10 - Elegir método de pago                                          |
| **4**     | Seguimiento y Comprobante             | Cliente                | 11 - Ver estado del pedido, 12 - Ver comprobante                                                                              |
| **5**     | Gestión de Pedidos por Cocina         | Cocina                 | 13 - Ver pedidos nuevos, 14 - Cambiar estado del pedido                                                                       |
| **6**     | Mantenimiento y Administración        | Cliente, Administrador | 15 - Modificar perfil, 16 - Ver historial de pedidos (Cliente); 17 - Consultar ventas, 18 - Gestionar cuentas (Administrador) |

-----

### **Resumen por Rol y Funcionalidad**

#### **1. Cliente (HU 01 a 12, 15, 16)**

El rol de Cliente tiene la mayor cantidad de historias, centradas en la experiencia de ordenar comida:

* **Acceso y Seguridad (Iteración 1):**

    * **Registro:** Permite guardar información personal. La validación exige que la contraseña tenga al menos 8 caracteres, una mayúscula y un número.
    * **Inicio de Sesión:** Necesario para guardar el historial de pedidos. Incluye bloqueo temporal tras 5 intentos fallidos para prevenir ataques de fuerza bruta.
    * **Recuperación:** Se utiliza un enlace de un solo uso que expira a los 15 minutos.

* **Pedido y Personalización (Iteración 2):**

    * Permite ver la descripción detallada del plato, incluyendo ingredientes, tiempo de preparación, fotos en alta resolución, y advertencias de alérgenos.
    * El cliente puede **Seleccionar** y **Personalizar** el plato (ej ingredientes extra con coste en tiempo real).
    * La **Gestión de cantidad** incluye la eliminación del producto si se presiona el botón "-" cuando la cantidad es 1.

* **Pago y Checkout (Iteración 3):**

    * El **Resumen de pedido** muestra un desglose claro de subtotal, impuestos (IGV) y total.
    * **Comprobante:** Ofrece elegir entre Boleta (valida 8 dígitos de DNI) y Factura (valida 11 dígitos de RUC).
    * **Método de Pago:** Incluye opciones como Yape/Plin (con subida de voucher) y pago al recoger en tienda.

* **Post-Pedido y Perfil (Iteraciones 4 y 6):**

    * **Estado del pedido:** Se visualiza mediante una barra de progreso (Recibido, En Cocina, Listo, Entregado) que se actualiza automáticamente.
    * **Comprobante:** Genera un código QR para validación en tienda y ofrece un botón de descarga en PDF.
    * **Perfil:** Permite **Modificar perfil** (ej. validar número de celular de 9 dígitos para Perú) y **Ver historial de pedidos** con opción de "Repetir Pedido".

#### **2. Cocina (HU 13, 14)**

El personal de Cocina maneja el flujo de preparación (Iteración 5):

* **Ver pedidos nuevos:** La pantalla de cocina se actualiza con una alerta sonora. Los pedidos urgentes resaltan en color rojo, y las personalizaciones se muestran en negrita.
* **Cambiar estado del pedido:** Permite marcar como "Listo" (enviando notificación al cliente) o "Cancelado" (requiriendo obligatoriamente un motivo).

#### **3. Administrador (HU 17, 18)**

Las historias del Administrador se centran en el control de negocio (Iteración 6, prioridad Baja):

* **Consultar ventas:** Permite generar reportes gráficos (platos más vendidos) y exportar las ventas diarias a formato Excel (.xlsx) o CSV.
* **Gestionar cuentas:** Faculta al administrador para activar o desactivar el acceso de personal buscar por dni o nombre-apellido y asignar roles con permisos limitados (ej. Cocina no puede ver reportes de ventas).
### **Programadores Responsables**

Cuatro programadores son responsables de las historias:

* **Mauricio Leandro Millan Pariona:** 5 historias (HU 01, 05, 09, 13, 17)
* **David Ruben Arone Calle:** 5 historias (HU 02, 06, 10, 14, 18)
* **Josué Adrián Franco Canchanga:** 4 historias (HU 03, 07, 11, 15)
* **Jesus Jeanpier Vera Roque:** 4 historias (HU 04, 08, 12, 16)
