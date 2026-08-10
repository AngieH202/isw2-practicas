# Notas de los principios aplicados

## Principio S — Una responsabilidad

1. **Principio 2:** Se aplicó al separar las diferentes tareas que realizaba originalmente la clase `Pedido`.
2. La validación del stock ahora está separada en `ValidadorStock`.
3. El cálculo del subtotal, ISV y total quedó en `CalculadoraTotal`.
4. La impresión del ticket y la actualización del inventario también tienen responsabilidades independientes.
5. Esto hace que cada parte del código sea más fácil de entender, mantener y modificar.

## Principio D — Diseñar para el cambio

1. **Principio 9:** Se aplicó al diseñar `Pedido` para que sus dependencias puedan cambiar sin modificar su lógica principal.
2. El componente para guardar los pedidos se recibe desde afuera mediante inyección de dependencias.
3. El servicio para enviar WhatsApp también se recibe como una dependencia.
4. Esto permite cambiar la forma de guardar datos o enviar mensajes sin modificar la clase `Pedido`.
5. De esta manera, el código queda menos acoplado y preparado para futuros cambios.
