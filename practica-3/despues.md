# Después: Pedido separado por responsabilidades

La clase `Pedido` ahora tiene una responsabilidad principal: coordinar el procesamiento del pedido. Las operaciones específicas se separan en clases independientes.

```javascript
class Pedido {
    constructor(guardador, notificador) {
        this.guardador = guardador;
        this.notificador = notificador;
    }

    procesar(cliente, productos) {
        ValidadorStock.validar(productos);

        let subtotal = CalculadoraTotal.calcularSubtotal(productos);
        let isv = CalculadoraTotal.calcularISV(subtotal);
        let total = CalculadoraTotal.calcularTotal(subtotal, isv);

        Inventario.actualizarStock(productos);

        this.guardador.guardar({
            cliente: cliente.nombre,
            productos: productos,
            subtotal: subtotal,
            isv: isv,
            total: total
        });

        Ticket.imprimir(cliente, productos, subtotal, isv, total);

        this.notificador.enviar(
            cliente.telefono,
            "Su pedido fue procesado. Total: L. " + total
        );
    }
}


class ValidadorStock {
    static validar(productos) {
        for (let producto of productos) {
            if (producto.stock < producto.cantidad) {
                throw new Error("Stock insuficiente");
            }
        }
    }
}


class CalculadoraTotal {
    static calcularSubtotal(productos) {
        let subtotal = 0;

        for (let producto of productos) {
            subtotal += producto.precio * producto.cantidad;
        }

        return subtotal;
    }

    static calcularISV(subtotal) {
        return subtotal * 0.15;
    }

    static calcularTotal(subtotal, isv) {
        return subtotal + isv;
    }
}


class Inventario {
    static actualizarStock(productos) {
        for (let producto of productos) {
            producto.stock -= producto.cantidad;
        }
    }
}


class Ticket {
    static imprimir(cliente, productos, subtotal, isv, total) {
        console.log("====== TICKET ======");
        console.log("Cliente: " + cliente.nombre);
        console.log("Subtotal: L. " + subtotal);
        console.log("ISV: L. " + isv);
        console.log("Total: L. " + total);
        console.log("====================");
    }
}


// Dependencia para guardar información
class RepositorioPedidos {
    guardar(pedido) {
        console.log("Guardando pedido en la base de datos");
    }
}


// Dependencia para enviar notificaciones
class NotificadorWhatsApp {
    enviar(telefono, mensaje) {
        console.log("Enviando WhatsApp a " + telefono);
    }
}


// Las dependencias se inyectan desde afuera
let repositorio = new RepositorioPedidos();
let notificador = new NotificadorWhatsApp();

let pedido = new Pedido(repositorio, notificador);
```

## Principios aplicados

**S — Single Responsibility Principle:** cada clase tiene una responsabilidad específica. `ValidadorStock` valida stock, `CalculadoraTotal` calcula los valores, `Inventario` modifica el stock y `Ticket` se encarga de imprimir.

**D — Dependency Inversion Principle:** `Pedido` no crea directamente las dependencias para guardar datos o enviar mensajes. Recibe `guardador` y `notificador` mediante el constructor.

De esta manera, `Pedido` depende de abstracciones o servicios proporcionados desde afuera, facilitando cambiar la implementación del almacenamiento o de las notificaciones sin modificar la lógica principal.
