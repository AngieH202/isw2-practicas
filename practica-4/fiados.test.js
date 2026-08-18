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

test("lanza error si el monto es negativo", () => {
    let error = false;

    try {
        calcularMora(-100, 5);
    } catch (e) {
        error = true;
    }

    assertEqual(error, true);
});