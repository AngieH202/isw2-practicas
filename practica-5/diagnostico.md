# Diagnóstico — Práctica 5

| Problema | Principio violado | Refactor aplicado |
|---|---|---|
| Variables poco descriptivas (`i`, `item`, `p`) | Claridad de código (M1) | Renombradas a `indice`, `itemPedido`, `prod` |
| Número mágico `0.15` sin explicación | Claridad de código (M1) | Extraído a constante `TASA_IMPUESTO` |
| Función con múltiples responsabilidades (valida, calcula, guarda, imprime, notifica) | Single Responsibility Principle (SRP, M3) | Se separó el cálculo de inventario en `calcularTotalYActualizarInventario` y la notificación en `notificarCliente` |
| Lógica de negocio mezclada con `console.log` | Separación de responsabilidades (M1/M3) | El cálculo del total ya no depende de la impresión en consola |
| Dependencias directas de `db` y `whatsapp` dentro de la función principal | Dependency Inversion / bajo acoplamiento (SOLID, M3) | Se aisló la notificación en su propia función, reduciendo el acoplamiento directo dentro de la lógica principal |