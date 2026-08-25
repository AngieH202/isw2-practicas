function procesarPedido(pedido, inventario, db, whatsapp) {
  if (!pedido.cliente || !pedido.cliente.nombre) {
    return "Cliente inválido";
  }

  if (!pedido.items || pedido.items.length === 0) {
    return "Pedido vacío";
  }

  let total = 0;

  for (let i = 0; i < pedido.items.length; i++) {
    let item = pedido.items[i];
    let producto = inventario.find(p => p.nombre === item.nombre);

    if (!producto) {
      return "Producto " + item.nombre + " no existe";
    }

    if (item.cantidad <= 0) {
      return "Cantidad inválida";
    }

    if (producto.stock < item.cantidad) {
      return "Stock insuficiente para " + item.nombre;
    }

    total = total + producto.precio * item.cantidad;
    producto.stock = producto.stock - item.cantidad;
  }

  let impuesto = total * 0.15;
  let totalFinal = total + impuesto;

  db.guardar({
    cliente: pedido.cliente.nombre,
    items: pedido.items,
    total: totalFinal
  });

  console.log("----- TICKET -----");
  console.log("Cliente: " + pedido.cliente.nombre);
  console.log("Total: L." + totalFinal);

  whatsapp.enviar(
    pedido.cliente.telefono,
    "Su pedido fue procesado por L." + totalFinal
  );

  if (totalFinal > 1000) {
    console.log("Cliente con compra grande");
  }

  return totalFinal;
}

module.exports = { procesarPedido };