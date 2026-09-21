function calcularSaldoConAbono(saldo, abono) {
    if (abono < 0) {
        throw new Error("El abono no puede ser negativo");
    }

    // Un abono mayor al saldo lo deja en cero, nunca en negativo
    return Math.max(0, saldo - abono);
}

module.exports = { calcularSaldoConAbono };