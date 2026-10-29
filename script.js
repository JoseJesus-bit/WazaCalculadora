// ===== Estado de la calculadora =====
let actual = "0";        // número que se está escribiendo
let anterior = null;     // número guardado antes de elegir un operador
let operador = null;     // "+", "−", "×" o "÷"
let reiniciar = false;   // true cuando el siguiente dígito debe empezar de nuevo

const pantallaResultado = document.getElementById("resultado");
const pantallaOperacion = document.getElementById("operacion");

// ===== Funciones principales =====
function agregarNumero(digito) {
  if (actual === "0" || reiniciar) {
    actual = digito;
    reiniciar = false;
  } else if (actual.replace(/[-.]/g, "").length < 12) {
    actual += digito;
  }
}

function agregarDecimal() {
  if (reiniciar) {
    actual = "0";
    reiniciar = false;
  }
  if (!actual.includes(".")) actual += ".";
}

function elegirOperador(nuevoOperador) {
  // Si ya había una operación pendiente, se resuelve primero (ej: 2 + 3 + ...)
  if (operador && !reiniciar) calcular();
  anterior = actual;
  operador = nuevoOperador;
  reiniciar = true;
}

function calcular() {
  if (operador === null || anterior === null) return;

  const a = parseFloat(anterior);
  const b = parseFloat(actual);
  let resultado;

  switch (operador) {
    case "+": resultado = a + b; break;
    case "−": resultado = a - b; break;
    case "×": resultado = a * b; break;
    case "÷":
      if (b === 0) {
        mostrarError("No se puede dividir entre 0");
        return;
      }
      resultado = a / b;
      break;
  }

  pantallaOperacion.textContent = `${formatear(anterior)} ${operador} ${formatear(actual)} =`;
  // toPrecision evita errores como 0.1 + 0.2 = 0.30000000000000004
  actual = String(parseFloat(resultado.toPrecision(12)));
  anterior = null;
  operador = null;
  reiniciar = true;
}

function limpiar() {
  actual = "0";
  anterior = null;
  operador = null;
  reiniciar = false;
  pantallaOperacion.textContent = "";
}

function borrar() {
  if (reiniciar) return;
  actual = actual.length > 1 && actual !== "-0" ? actual.slice(0, -1) : "0";
  if (actual === "-") actual = "0";
}

function cambiarSigno() {
  if (actual === "0") return;
  actual = actual.startsWith("-") ? actual.slice(1) : "-" + actual;
}

function porcentaje() {
  actual = String(parseFloat((parseFloat(actual) / 100).toPrecision(12)));
}

function mostrarError(mensaje) {
  limpiar();
  pantallaOperacion.textContent = mensaje;
}

// ===== Pantalla =====
function formatear(numeroTexto) {
  const [entero, decimales] = numeroTexto.split(".");
  const conComas = Number(entero).toLocaleString("en-US");
  const signo = entero === "-0" ? "-" : "";
  const base = entero === "-0" ? signo + "0" : conComas;
  return decimales !== undefined ? `${base}.${decimales}` : base;
}

function actualizarPantalla() {
  pantallaResultado.textContent = formatear(actual);
  if (operador && anterior !== null) {
    pantallaOperacion.textContent = `${formatear(anterior)} ${operador}`;
  }
  document.querySelectorAll(".operador").forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.operador === operador && reiniciar);
  });
}

// ===== Eventos: clics =====
document.querySelector(".teclas").addEventListener("click", (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  if (boton.dataset.numero) agregarNumero(boton.dataset.numero);
  else if (boton.dataset.operador) elegirOperador(boton.dataset.operador);
  else {
    switch (boton.dataset.accion) {
      case "decimal": agregarDecimal(); break;
      case "igual": calcular(); break;
      case "limpiar": limpiar(); break;
      case "borrar": borrar(); break;
      case "signo": cambiarSigno(); break;
      case "porcentaje": porcentaje(); break;
    }
  }
  actualizarPantalla();
});

// ===== Eventos: teclado =====
document.addEventListener("keydown", (evento) => {
  const tecla = evento.key;
  const operadores = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  if (/^[0-9]$/.test(tecla)) agregarNumero(tecla);
  else if (tecla === "." || tecla === ",") agregarDecimal();
  else if (operadores[tecla]) { evento.preventDefault(); elegirOperador(operadores[tecla]); }
  else if (tecla === "Enter" || tecla === "=") { evento.preventDefault(); calcular(); }
  else if (tecla === "Backspace") borrar();
  else if (tecla === "Escape") limpiar();
  else if (tecla === "%") porcentaje();
  else return;

  actualizarPantalla();
});

actualizarPantalla();
