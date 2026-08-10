# Antes: clase Pedido

```javascript
class Pedido {
    procesarPedido(cliente, productos) {
        // 1. Verificar que existan productos
        if (productos.length === 0) {
            console.log("El pedido no tiene productos");
            return;
        }

        // 2. Validar el stock de cada producto
        for (let producto of productos) {
            if (producto.stock < producto.cantidad) {
                console.log("Stock insuficiente para " + producto.nombre);
                return;
            }
        }

        // 3. Calcular subtotal
        let subtotal = 0;
        for (let producto of productos) {
            subtotal += producto.precio * producto.cantidad;
        }

        // 4. Calcular ISV
        let isv = subtotal * 0.15;

        // 5. Calcular total
        let total = subtotal + isv;

        // 6. Descontar productos del stock
        for (let producto of productos) {
            producto.stock -= producto.cantidad;
        }

        // 7. Guardar pedido en la base de datos
        baseDeDatos.guardar({
            cliente: cliente.nombre,
            productos: productos,
            subtotal: subtotal,
            isv: isv,
            total: total
        });

        // 8. Imprimir ticket
        console.log("====== TICKET ======");
        console.log("Cliente: " + cliente.nombre);
        console.log("Subtotal: L. " + subtotal);
        console.log("ISV: L. " + isv);
        console.log("Total: L. " + total);
        console.log("====================");

        // 9. Enviar WhatsApp al cliente
        whatsapp.enviar(
            cliente.telefono,
            "Su pedido fue procesado. Total: L. " + total
        );

        console.log("Pedido procesado correctamente");
    }
}
```

La clase `Pedido` realiza demasiadas tareas en un mismo método: valida el stock, calcula precios, modifica el inventario, guarda información, imprime el ticket y envía una notificación.
