const TASA_IMPUESTO = 0.15;

function calcularTotalYActualizarInventario(items, inventario) {
  let total = 0;

  for (let indice = 0; indice < items.length; indice++) {
    let itemPedido = items[indice];
    let producto = inventario.find(prod => prod.nombre === itemPedido.nombre);

    if (!producto) {
      return { error: "Producto " + itemPedido.nombre + " no existe" };
    }

    if (itemPedido.cantidad <= 0) {
      return { error: "Cantidad inválida" };
    }

    if (producto.stock < itemPedido.cantidad) {
      return { error: "Stock insuficiente para " + itemPedido.nombre };
    }

    total = total + producto.precio * itemPedido.cantidad;
    producto.stock = producto.stock - itemPedido.cantidad;
  }

  return { total };
}

function notificarCliente(whatsapp, telefono, totalFinal) {
  whatsapp.enviar(
    telefono,
    "Su pedido fue procesado por L." + totalFinal
  );
}

function procesarPedido(pedido, inventario, db, whatsapp) {
  if (!pedido.cliente || !pedido.cliente.nombre) {
    return "Cliente inválido";
  }

  if (!pedido.items || pedido.items.length === 0) {
    return "Pedido vacío";
  }

  const resultado = calcularTotalYActualizarInventario(pedido.items, inventario);
  if (resultado.error) {
    return resultado.error;
  }
  let total = resultado.total;

  let impuesto = total * TASA_IMPUESTO;
  let totalFinal = total + impuesto;

  db.guardar({
    cliente: pedido.cliente.nombre,
    items: pedido.items,
    total: totalFinal
  });

  console.log("----- TICKET -----");
  console.log("Cliente: " + pedido.cliente.nombre);
  console.log("Total: L." + totalFinal);

  notificarCliente(whatsapp, pedido.cliente.telefono, totalFinal);

  if (totalFinal > 1000) {
    console.log("Cliente con compra grande");
  }

  return totalFinal;
}

module.exports = { procesarPedido };