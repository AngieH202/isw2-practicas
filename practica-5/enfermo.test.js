const { procesarPedido } = require("./enfermo.js");

let pasados = 0;
let fallados = 0;

function test(nombre, fn) {
  try {
    fn();
    console.log("✅ " + nombre);
    pasados++;
  } catch (e) {
    console.log("❌ " + nombre);
    console.log("   " + e.message);
    fallados++;
  }
}

function assertIgual(actual, esperado, mensaje) {
  if (actual !== esperado) {
    throw new Error(
      (mensaje || "Valores distintos") +
        ` (esperado: ${esperado}, obtenido: ${actual})`
    );
  }
}

// Mocks: simulan db y whatsapp sin usar los reales
function crearDbMock() {
  return {
    llamadas: [],
    guardar(registro) {
      this.llamadas.push(registro);
    }
  };
}

function crearWhatsappMock() {
  return {
    llamadas: [],
    enviar(telefono, mensaje) {
      this.llamadas.push({ telefono, mensaje });
    }
  };
}

function crearInventario() {
  return [
    { nombre: "Camisa", precio: 200, stock: 5 },
    { nombre: "Pantalon", precio: 300, stock: 2 }
  ];
}

// --- Casos de prueba ---

test("Rechaza pedido sin cliente", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const resultado = procesarPedido({ items: [] }, crearInventario(), db, wa);
  assertIgual(resultado, "Cliente inválido");
});

test("Rechaza pedido sin nombre de cliente", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const pedido = { cliente: {}, items: [] };
  const resultado = procesarPedido(pedido, crearInventario(), db, wa);
  assertIgual(resultado, "Cliente inválido");
});

test("Rechaza pedido sin items", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const pedido = { cliente: { nombre: "Angie" }, items: [] };
  const resultado = procesarPedido(pedido, crearInventario(), db, wa);
  assertIgual(resultado, "Pedido vacío");
});

test("Rechaza producto que no existe en inventario", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const pedido = {
    cliente: { nombre: "Angie" },
    items: [{ nombre: "Zapatos", cantidad: 1 }]
  };
  const resultado = procesarPedido(pedido, crearInventario(), db, wa);
  assertIgual(resultado, "Producto Zapatos no existe");
});

test("Rechaza cantidad inválida (0 o negativa)", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const pedido = {
    cliente: { nombre: "Angie" },
    items: [{ nombre: "Camisa", cantidad: 0 }]
  };
  const resultado = procesarPedido(pedido, crearInventario(), db, wa);
  assertIgual(resultado, "Cantidad inválida");
});

test("Rechaza si no hay stock suficiente", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const pedido = {
    cliente: { nombre: "Angie" },
    items: [{ nombre: "Pantalon", cantidad: 5 }]
  };
  const resultado = procesarPedido(pedido, crearInventario(), db, wa);
  assertIgual(resultado, "Stock insuficiente para Pantalon");
});

test("Procesa un pedido válido y calcula el total con impuesto", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const inventario = crearInventario();
  const pedido = {
    cliente: { nombre: "Angie", telefono: "99999999" },
    items: [{ nombre: "Camisa", cantidad: 2 }]
  };
  // 2 camisas x 200 = 400, + 15% impuesto = 460
  const resultado = procesarPedido(pedido, inventario, db, wa);
  assertIgual(resultado, 460, "Total con impuesto incorrecto");
});

test("Descuenta el stock correctamente tras procesar", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const inventario = crearInventario();
  const pedido = {
    cliente: { nombre: "Angie", telefono: "99999999" },
    items: [{ nombre: "Camisa", cantidad: 2 }]
  };
  procesarPedido(pedido, inventario, db, wa);
  const camisa = inventario.find(p => p.nombre === "Camisa");
  assertIgual(camisa.stock, 3, "El stock no se descontó bien");
});

test("Guarda el pedido en la base de datos", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const pedido = {
    cliente: { nombre: "Angie", telefono: "99999999" },
    items: [{ nombre: "Camisa", cantidad: 1 }]
  };
  procesarPedido(pedido, crearInventario(), db, wa);
  assertIgual(db.llamadas.length, 1, "No se llamó a db.guardar una vez");
  assertIgual(db.llamadas[0].cliente, "Angie");
});

test("Envía el mensaje de WhatsApp al cliente", () => {
  const db = crearDbMock();
  const wa = crearWhatsappMock();
  const pedido = {
    cliente: { nombre: "Angie", telefono: "99999999" },
    items: [{ nombre: "Camisa", cantidad: 1 }]
  };
  procesarPedido(pedido, crearInventario(), db, wa);
  assertIgual(wa.llamadas.length, 1, "No se llamó a whatsapp.enviar");
  assertIgual(wa.llamadas[0].telefono, "99999999");
});

// --- Resumen ---
console.log("\n--- Resultado ---");
console.log(`Pasados: ${pasados}, Fallados: ${fallados}`);