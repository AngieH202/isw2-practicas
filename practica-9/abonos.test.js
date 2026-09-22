const { calcularSaldoConAbono } = require("./abonos");

function assertEqual(actual, esperado) {
    if (actual !== esperado) {
        throw new Error(`Esperado ${esperado}, pero fue ${actual}`);
    }
}

function assertThrows(fn) {
    let error = false;

    try {
        fn();
    } catch (e) {
        error = true;
    }

    if (!error) {
        throw new Error("Se esperaba un error");
    }
}

function test(nombre, fn) {
    try {
        fn();
        console.log(`✅ ${nombre}`);
    } catch (error) {
        console.log(`❌ ${nombre}: ${error.message}`);
    }
}

// Test 1: un abono reduce el saldo
test("Un abono parcial reduce el saldo pendiente", () => {
    assertEqual(calcularSaldoConAbono(1000, 300), 700);
});

// Test 2: abono igual al saldo
test("Un abono igual al saldo deja el saldo en cero", () => {
    assertEqual(calcularSaldoConAbono(1000, 1000), 0);
});

// Test 3: abono mayor al saldo
test("Un abono mayor al saldo no permite saldo negativo", () => {
    assertEqual(calcularSaldoConAbono(1000, 1200), 0);
});

// Test 4: abono negativo
test("Un abono negativo genera un error", () => {
    assertThrows(() => calcularSaldoConAbono(1000, -100));
});

// Test 5: saldo sin abono
test("Sin abono el saldo permanece igual", () => {
    assertEqual(calcularSaldoConAbono(1000, 0), 1000);
});