# Práctica 1 - Limpieza de Código

## Código original

```html
<div class="modal-overlay" id="modal-diag" onclick="cerrarModal(event)">
  <div class="modal-sheet">
    <div class="modal-handle"></div>
    <div class="modal-title" id="modal-pac-nombre">Registrar visita</div>
    <div class="modal-sub" id="modal-pac-sub"></div>
    <div class="form-group">
      <label>Diagnóstico</label>
      <textarea id="m-diagnostico"></textarea>
    </div>
    <div class="tratamiento-tags">
      <button class="trat-tag" onclick="toggleTrat(this)">Limpieza</button>
      <button class="trat-tag" onclick="toggleTrat(this)">Extracción</button>
      <button class="trat-tag" onclick="toggleTrat(this)">Empaste</button>
      <button class="trat-tag" onclick="toggleTrat(this)">Endodoncia</button>
    </div>
  </div>
</div>
```

## Smells identificados

1. **Duplicación de código (Duplicate Code)**: todos los botones de tratamiento tienen la misma estructura.
2. **Manejo de eventos inline (Inline Event Handlers)**: uso de `onclick` directamente en el HTML.
3. **Hardcoded Values**: los nombres de los tratamientos están escritos manualmente dentro del HTML.
4. **Baja mantenibilidad**: agregar un nuevo tratamiento requiere modificar varias líneas del HTML.

## Versión refactorizada

```html
<div class="modal-overlay" id="modal-diag">
  <div class="modal-sheet">
    <div class="modal-handle"></div>
    <div class="modal-title" id="modal-pac-nombre">Registrar visita</div>

    <div class="form-group">
      <label>Diagnóstico</label>
      <textarea id="m-diagnostico"></textarea>
    </div>

    <div class="tratamiento-tags" id="tratamientos"></div>
  </div>
</div>
```

```javascript
const tratamientos = [
  "Limpieza",
  "Extracción",
  "Empaste",
  "Endodoncia"
];

const contenedor = document.getElementById("tratamientos");

tratamientos.forEach(tratamiento => {
  const boton = document.createElement("button");
  boton.className = "trat-tag";
  boton.textContent = tratamiento;
  boton.addEventListener("click", () => toggleTrat(boton));
  contenedor.appendChild(boton);
});
```
