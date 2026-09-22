# Bitácora — Práctica 9 · Sesión agéntica documentada

**Feature:** abonos parciales que reducen el saldo pendiente antes de calcular la mora de la calculadora de fiados (P4).
**Asistente usado:** Claude (Claude Code, modelo Opus 5).
**Rama:** `feature/practica-9`

---

## 1. El contrato lo escribí yo, antes de pedir nada

Antes de abrir el asistente escribí 5 tests que definen el comportamiento esperado. Eso es
lo que en M4 llamamos el contrato: el test dice qué tiene que pasar, y recién después se
escribe el código que lo cumple.

| # | Test | Comportamiento que define |
|---|---|---|
| 1 | Un abono parcial reduce el saldo pendiente | `1000 - 300 = 700` |
| 2 | Un abono igual al saldo deja el saldo en cero | el saldo se cancela exacto |
| 3 | Un abono mayor al saldo no permite saldo negativo | se trunca en `0`, no hay saldo a favor |
| 4 | Un abono negativo genera un error | no se puede "abonar" en contra |
| 5 | Sin abono el saldo permanece igual | `abono = 0` es un caso válido, no un error |

**Prueba en la historia de commits:** los tests entraron en el commit `e3797c7`
*"test(practica-9): definir comportamiento de abonos parciales"*, que solo toca
`practica-9/abonos.test.js` (+55 líneas, 0 líneas de implementación). El archivo
`practica-9/abonos.js` no existía en ese commit.

---

## 2. Prompts clave

### Prompt 1 — implementación a partir del contrato

> Tengo estos 5 tests ya escritos en `practica-9/abonos.test.js` (te los paso completos).
> Implementá `practica-9/abonos.js` para que pasen. La feature es "abonos parciales que
> reducen el saldo antes de calcular la mora" de mi calculadora de fiados de la práctica 4.
> No modifiques los tests.

### Prompt 2 — forzar una alternativa

> Los tests pasan, pero no quiero quedarme con la primera respuesta. Dame una segunda
> implementación con un enfoque de diseño distinto al anterior, para poder comparar las dos.

### Prompt 3 — verificación, no confianza

> No me digas si pasan: corré los tests contra la propuesta A y contra la propuesta B y
> pegame la salida real de cada una.

---

## 3. Qué propuso la IA

### Propuesta A — funciones + integración con la mora

```js
const { calcularMora } = require("../practica-4/fiados");

const TASA_MORA = 0.05;

function calcularSaldoConAbono(saldo, abono) {
    if (typeof saldo !== "number" || typeof abono !== "number") {
        throw new Error("Saldo y abono deben ser números");
    }

    if (saldo < 0) {
        throw new Error("El saldo no puede ser negativo");
    }

    if (abono < 0) {
        throw new Error("El abono no puede ser negativo");
    }

    return Math.max(0, saldo - abono);
}

function calcularTotalConMora(saldo, abono, diasVencidos) {
    const saldoRestante = calcularSaldoConAbono(saldo, abono);
    const mora = calcularMora(saldoRestante, diasVencidos);

    return saldoRestante + mora;
}

module.exports = { calcularSaldoConAbono, calcularTotalConMora, TASA_MORA };
```

### Propuesta B — clase con estado

```js
class CuentaFiado {
    constructor(saldoInicial) {
        this.saldo = saldoInicial;
        this.abonos = [];
    }

    abonar(monto) {
        if (monto < 0) {
            throw new Error("El abono no puede ser negativo");
        }

        this.abonos.push({ monto, fecha: new Date() });
        this.saldo = Math.max(0, this.saldo - monto);

        return this.saldo;
    }

    saldoPendiente() {
        return this.saldo;
    }

    historial() {
        return this.abonos;
    }
}

module.exports = { CuentaFiado };
```

### Resultado real de correr mis tests contra cada una

```
===== PROPUESTA A =====
✅ Un abono parcial reduce el saldo pendiente
✅ Un abono igual al saldo deja el saldo en cero
✅ Un abono mayor al saldo no permite saldo negativo
✅ Un abono negativo genera un error
✅ Sin abono el saldo permanece igual

===== PROPUESTA B =====
❌ Un abono parcial reduce el saldo pendiente: calcularSaldoConAbono is not a function
❌ Un abono igual al saldo deja el saldo en cero: calcularSaldoConAbono is not a function
❌ Un abono mayor al saldo no permite saldo negativo: calcularSaldoConAbono is not a function
✅ Un abono negativo genera un error
❌ Sin abono el saldo permanece igual: calcularSaldoConAbono is not a function
```

---

## 4. Mi crítica del diff

### Crítica 1 — RECHAZADO: la IA se salió del contrato (M4)

La propuesta A agregó `calcularTotalConMora`, una función pública que **ningún test mío
cubre**. Yo pedí que pasaran 5 tests y me devolvió código de más.

Es un problema, no un regalo: en M4 el contrato es el test. Código sin test es código cuyo
comportamiento nadie fijó, que igual queda expuesto en `module.exports` y que alguien puede
empezar a usar creyendo que está verificado. La suite quedaría verde aunque
`calcularTotalConMora` estuviera mal.

**Qué hice:** lo saqué. Si quiero esa integración, primero escribo el test que la define y
después la implemento, igual que hice con los otros cinco. No al revés.

### Crítica 2 — RECHAZADO: `require("../practica-4/fiados")` acopla dos prácticas (Principio 9)

La propuesta A importa directamente el módulo de la P4 con una ruta relativa que sube de
carpeta. Eso viola el Principio 9 (diseñar para el cambio): `abonos.js` pasa a depender de
la ubicación física y de la firma exacta de un archivo de otra práctica. Si muevo o renombro
`practica-4/fiados.js`, se rompe la P9, que no tiene nada que ver.

Es exactamente el problema que diagnostiqué en la P5 con `db` y `whatsapp` metidos adentro
de la lógica: dependencia directa en vez de recibida desde afuera.

**Qué hice:** lo rechacé. Si en una iteración futura necesito la mora acá, la voy a recibir
por inyección de dependencias (`calcularSaldoFinal(saldo, abono, dias, calculadoraDeMora)`),
no con un `require` que cruza carpetas.

### Crítica 3 — RECHAZADO: `TASA_MORA` es código muerto (M1)

La propuesta A declara y **exporta** `const TASA_MORA = 0.05`, pero no la usa en ninguna
línea. La tasa real sigue hardcodeada dentro de `calcularMora` en la P4.

Peor que inútil: es una constante que miente. Alguien que la lea va a creer que cambiando
ese `0.05` cambia la mora del sistema, y no cambia nada. En M1 (claridad) trabajamos el caso
inverso —el número mágico `0.15` que extraje a `TASA_IMPUESTO`—; acá la IA hizo el gesto de
extraer la constante sin conectarla, que es la peor de las dos versiones.

**Qué hice:** la borré.

### Crítica 4 — RECHAZADO: la propuesta B rompe el contrato y encima carga una responsabilidad de más (Principio 2)

La propuesta B no es una alternativa válida, es otra API: mis tests llaman a una función
`calcularSaldoConAbono(saldo, abono)` y la clase expone `new CuentaFiado(...).abonar(...)`.
4 de 5 tests fallan.

Además viola el Principio 2 (una responsabilidad): `CuentaFiado` calcula saldos **y** lleva
un historial de abonos con `new Date()`. Ese historial no lo pidió ningún test, y mete una
dependencia del reloj del sistema que vuelve la clase más difícil de testear. Es el mismo
error que la clase `Pedido` de la P3 antes de separarla.

Entre las dos, me quedo con el enfoque funcional: `calcularSaldoConAbono` es una función
pura —mismas entradas, misma salida, sin estado— y por eso se testea con una línea. La clase
solo agrega estado mutable a un cálculo que no lo necesita.

**Qué hice:** la descarté entera.

### Crítica 5 — HALLAZGO PROPIO: mi test 4 tiene un falso verde

Corriendo la propuesta B encontré algo que no esperaba y que no es culpa de la IA sino mía:

```
❌ Un abono parcial reduce el saldo pendiente: calcularSaldoConAbono is not a function
✅ Un abono negativo genera un error
```

El test 4 pasa **contra una implementación que ni siquiera existe**. Mi helper `assertThrows`
solo verifica que *algo* haya tirado una excepción, y ahí lo que tiró fue un `TypeError` por
llamar a `undefined`, no mi error de negocio "El abono no puede ser negativo". Verde por la
razón equivocada.

Es la lección de M4 llevada al extremo: un test que no distingue *qué* error se lanzó no está
verificando el contrato, está verificando que el programa se rompió. Lo dejo anotado como
deuda consciente: el próximo paso es que `assertThrows` reciba el mensaje esperado y lo
compare.

### Crítica 6 — ACEPTADO: `Math.max(0, saldo - abono)` (M1)

Lo único que me llevé de la IA. Mi versión original era:

```js
const saldoRestante = saldo - abono;

if (saldoRestante < 0) {
    return 0;
}

return saldoRestante;
```

La IA lo escribió como `return Math.max(0, saldo - abono)`. Cinco líneas y una variable
intermedia se vuelven una, y la intención ("el saldo nunca baja de cero") queda dicha en la
expresión misma en vez de tener que deducirla del `if`. Es claridad (M1) sin cambiar el
comportamiento: los 5 tests siguen verdes después del cambio.

También **rechacé** la validación de tipos (`typeof saldo !== "number"`) y la de `saldo < 0`
que venían en el mismo bloque: no las pide ningún test. Si decido que son parte del contrato,
las agrego escribiendo primero el test.

---

## 5. Implementación final

```js
function calcularSaldoConAbono(saldo, abono) {
    if (abono < 0) {
        throw new Error("El abono no puede ser negativo");
    }

    // Un abono mayor al saldo lo deja en cero, nunca en negativo
    return Math.max(0, saldo - abono);
}

module.exports = { calcularSaldoConAbono };
```

De la sesión sobrevivió una sola línea de la IA, y entró porque pude justificar por qué es
mejor. Todo lo demás lo rechacé con un motivo escrito.

## 6. Suite verde

```
$ node practica-9/abonos.test.js
✅ Un abono parcial reduce el saldo pendiente
✅ Un abono igual al saldo deja el saldo en cero
✅ Un abono mayor al saldo no permite saldo negativo
✅ Un abono negativo genera un error
✅ Sin abono el saldo permanece igual
```

Los tests de la P9 quedaron agregados al pipeline de CI (`.github/workflows/ci.yml`), así que
corren solos en cada push y en cada pull request.

---

## 7. Qué me llevo

La IA escribe código que compila y pasa los tests casi siempre. Lo que no hace es decidir
**qué** hay que construir: en la propuesta A me dio de más (una función sin test, un acople
a otra práctica, una constante muerta) y en la B me dio otra cosa. Las dos veces la que
tenía el criterio para cortar era yo, y el criterio salió de haber escrito los tests
primero: sin ese contrato no hubiera tenido con qué discutirle.

El hallazgo del falso verde en mi propio test 4 es lo mejor que me dejó la sesión, y no vino
de una respuesta de la IA sino de haber insistido en ver la salida real de correr las dos
propuestas en vez de creerle cuando dijo que funcionaban.
