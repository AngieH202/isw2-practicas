const { calcularMora } = require("./fiados");

function assertEqual(actual, esperado) {
    if (actual !== esperado) {
        throw new Error(`Esperado ${esperado}, pero fue ${actual}`);
    }
}

function test(nombre, fn) {
    try {
        fn();
        console.log(`✅ ${nombre}`);
    } catch (error) {
        console.log(`❌ ${nombre}`);
        console.log(error.message);
    }
}

// Test 1: camino feliz — monto vencido calcula el 5%
test("calcula el 5% de mora si el monto está vencido", () => {
    // Arrange
    const monto = 100;
    const dias = 5;

    // Act
    const resultado = calcularMora(monto, dias);

    // Assert
    assertEqual(resultado, 5);
});

// Test 2: 0 días vencidos → no cobra mora
test("no cobra mora si los días vencidos son 0", () => {
    // Arrange
    const monto = 100;
    const dias = 0;

    // Act
    const resultado = calcularMora(monto, dias);

    // Assert
    assertEqual(resultado, 0);
});

// Test 3: monto 0 → mora 0
test("la mora es 0 si el monto es 0", () => {
    // Arrange
    const monto = 0;
    const dias = 5;

    // Act
    const resultado = calcularMora(monto, dias);

    // Assert
    assertEqual(resultado, 0);
});

// Test 4: monto negativo → lanza error
test("lanza error si el monto es negativo", () => {
    // Arrange
    const monto = -100;
    const dias = 5;
    let error = false;

    // Act
    try {
        calcularMora(monto, dias);
    } catch (e) {
        error = true;
    }

    // Assert
    assertEqual(error, true);
});

// Test 5: días no numéricos → lanza error
test("lanza error si los días vencidos no son un número", () => {
    // Arrange
    const monto = 100;
    const dias = "cinco";
    let error = false;

    // Act
    try {
        calcularMora(monto, dias);
    } catch (e) {
        error = true;
    }

    // Assert
    assertEqual(error, true);
});

// Test 6: otro cálculo válido con monto y días positivos
test("calcula correctamente el 5% con otro monto válido", () => {
    // Arrange
    const monto = 500;
    const dias = 10;

    // Act
    const resultado = calcularMora(monto, dias);

    // Assert
    assertEqual(resultado, 25);
});