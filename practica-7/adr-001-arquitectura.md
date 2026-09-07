# ADR-001: Arquitectura para la cooperativa de buses

## Contexto

La cooperativa de buses ha crecido hasta alcanzar aproximadamente 50,000
usuarios y presenta picos de venta especialmente altos a las 5:00 AM.

Los atributos de calidad prioritarios son:

1. **Rendimiento:** el sistema debe responder rápidamente durante los picos
   de venta, evitando que las consultas frecuentes saturen la aplicación.

2. **Escalabilidad:** la arquitectura debe permitir aumentar la capacidad
   cuando crezca la cantidad de usuarios o cuando ocurran picos de demanda.

3. **Disponibilidad:** las ventas y consultas deben continuar funcionando
   aunque una instancia de la aplicación tenga problemas.

4. **Mantenibilidad:** la solución debe ser sencilla de desarrollar, probar
   y mantener por el equipo actual.

El gerente propone utilizar microservicios debido a que son una tendencia
popular. Sin embargo, la decisión debe basarse en las necesidades reales
del sistema y no en la moda tecnológica.

## Opciones

### Opción 1: Monolito modular

Consiste en mantener una sola aplicación desplegable, pero separada
internamente en módulos bien definidos, por ejemplo: usuarios, ventas,
rutas y pagos.

**Pros:**

- Menor complejidad operacional.
- Más sencillo de desarrollar, probar y desplegar.
- Permite mantener una separación clara entre responsabilidades.
- Se puede escalar horizontalmente agregando réplicas.
- Permite incorporar cache para reducir consultas repetitivas.

**Contras:**

- Todos los módulos se despliegan como una unidad.
- Un problema grave en la aplicación puede afectar a varios módulos.
- El escalamiento no puede hacerse de forma independiente por módulo.

### Opción 2: Microservicios

Consiste en separar el sistema en servicios independientes, por ejemplo:
usuarios, ventas, rutas y pagos.

**Pros:**

- Cada servicio puede escalarse independientemente.
- Permite desplegar servicios de forma independiente.
- Un problema en un servicio puede aislarse de otros servicios.
- Es apropiado cuando existen equipos grandes y diferentes dominios
  necesitan evolucionar independientemente.

**Contras:**

- Mayor complejidad operacional.
- Requiere comunicación entre servicios y manejo de fallos de red.
- Aumenta la dificultad de monitoreo, pruebas y despliegue.
- Requiere más infraestructura.
- Para un equipo pequeño puede agregar complejidad sin resolver el
  problema principal.

### Opción 3: Serverless

Consiste en ejecutar partes de la aplicación mediante funciones
administradas por un proveedor cloud, pagando principalmente por el uso.

**Pros:**

- Escalamiento automático ante aumentos de demanda.
- Reduce la administración de servidores.
- Puede ser conveniente para cargas variables.
- El proveedor administra gran parte de la infraestructura.

**Contras:**

- Mayor dependencia del proveedor cloud.
- Pueden existir tiempos de arranque de funciones.
- El diseño y monitoreo de aplicaciones distribuidas puede ser complejo.
- No todas las operaciones del sistema se benefician de serverless.
- Puede dificultar la portabilidad entre proveedores.

## Decisión

Se utilizará **monolito modular con cache y escalamiento horizontal mediante
réplicas detrás de un balanceador de carga**.

La razón principal es que el problema actual es principalmente de capacidad
y rendimiento durante picos de demanda, no de necesidad de separar equipos
de desarrollo.

El monolito modular permite mantener una arquitectura sencilla y organizada,
mientras que las réplicas permiten distribuir las solicitudes entre varias
instancias durante los picos de las 5:00 AM.

Se utilizará **cache** para reducir consultas repetitivas, especialmente
sobre información que cambia con menor frecuencia, como rutas, horarios y
disponibilidad que pueda ser cacheada de forma segura.

El **balanceador de carga** distribuirá las solicitudes entre las réplicas
disponibles, permitiendo aumentar la capacidad agregando nuevas instancias.

No se eligen microservicios porque introducirían complejidad operacional que
no está justificada por el escenario actual. Tampoco se elige serverless como
arquitectura principal porque el sistema necesita un comportamiento
predecible para sus operaciones principales y no se ha identificado una
necesidad específica que justifique esa complejidad y dependencia del
proveedor.

## Mini-diagrama de la decisión

```mermaid
flowchart LR
    U[Usuarios<br/>50,000] --> LB[Balanceador de carga]

    LB --> A[Instancia 1<br/>Monolito modular]
    LB --> B[Instancia 2<br/>Monolito modular]
    LB --> C[Instancia N<br/>Monolito modular]

    A --> CACHE[Cache]
    B --> CACHE
    C --> CACHE

    A --> DB[(Base de datos)]
    B --> DB
    C --> DB