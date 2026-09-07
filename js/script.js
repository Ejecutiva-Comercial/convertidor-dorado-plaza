/* ===========================================================
   CONVERTIDOR USD ⇄ COP — Hoteles Dorado Plaza
   Archivo: js/script.js
   Qué contiene: TODA la lógica del proyecto, con UNA excepción: cada
                 HTML lleva en su <head> un <script> mínimo que aplica
                 el tema antes de pintar, para que no haya un fogonazo
                 blanco al abrir en modo oscuro. Está explicado allí.
   Bloques, en orden:
     1. Configuración y utilidades
     2. Obtención de la tasa (TRM oficial + respaldo de mercado)
     3. Caché local (para que la página nunca quede sin número)
     4. Conversión y pintado del resultado
     5. Equivalencias rápidas
     6. Historial de 7 días (gráfico SVG)
     7. Consentimiento de cookies + Google Analytics
     8. Reloj de consulta (fecha y hora de Colombia, en vivo)
     9. Tema claro / oscuro
    10. Arranque
   Relación con los demás archivos:
     - Usa los IDs que están en index.html / en/index.html.
     - Las clases que agrega (.is-ok, .is-error, .is-visible…) y el
       atributo data-tema del <html> están definidos en css/styles.css.
   =========================================================== */

(function () {
  "use strict";

  /* =========================================================
     1. CONFIGURACIÓN Y UTILIDADES
     Qué hace: centraliza los valores que podrían cambiar algún día
     (endpoints, minutos de caché, montos de la tabla) para no tener
     que buscarlos regados por el archivo.
     ========================================================= */

  var CFG = {
    // TRM oficial de Colombia. Dataset público de Datos Abiertos
    // (Superintendencia Financiera). Es la tasa que rige para facturar.
    TRM_ULTIMA:   "https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC",
    TRM_HISTORIAL:"https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=10&$order=vigenciadesde%20DESC",
    // Respaldo: si la fuente oficial no responde, se usa esta tasa de
    // mercado para que la herramienta nunca quede muda. Se avisa en pantalla.
    RESPALDO:     "https://open.er-api.com/v6/latest/USD",
    // Si una petición se demora más que esto, se corta y pasa al respaldo.
    TIMEOUT_MS:   8000,
    // La caché solo se usa si las dos fuentes fallan. 24 h es suficiente
    // porque la TRM cambia una vez por día hábil.
    CACHE_HORAS:  24,
    CACHE_KEY:    "dp_tasa_v1",
    COOKIE_KEY:   "dp_cookies_v1",
    IDIOMA_KEY:   "dp_idioma_v1",
    // ⚠ Esta clave está DUPLICADA a propósito en el <script> en línea del
    // <head> de cada HTML (el anti-parpadeo del tema). Si se cambia aquí,
    // hay que cambiarla también allá o el tema dejará de recordarse.
    TEMA_KEY:     "dp_tema_v1",
    // Zona horaria de referencia del reloj de consulta. Se fija a Colombia
    // a propósito: si alguien abre esto desde un equipo configurado en otro
    // país, la hora que ve sigue siendo la que vale para la contabilidad.
    ZONA:         "America/Bogota",
    // Montos de la tabla de equivalencias rápidas.
    MONTOS_USD:   [1, 5, 10, 20, 50, 100, 200, 500],
    MONTOS_COP:   [10000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000],
    // ID de medición de Google Analytics 4.
    // {POR CONFIRMAR} — cuando JX lo tenga, se reemplaza aquí y nada más.
    GA_ID:        "{POR CONFIRMAR}"
  };

  // Idioma de la página: se lee del <html lang>. La versión inglesa vive
  // en /en/ y tiene lang="en". No hay redirección automática por idioma:
  // el visitante siempre llega al español y cambia a mano si quiere.
  var ES = document.documentElement.lang !== "en";

  // Textos que el JS necesita escribir. Los que ya están en el HTML no
  // se repiten aquí: solo lo que se genera dinámicamente.
  var T = ES ? {
    cargando:   "Consultando la tasa del día…",
    oficial:    "TRM oficial · vigente el ",
    mercado:    "Tasa de mercado · actualizada el ",
    guardada:   "Sin conexión con la fuente · último dato guardado del ",
    error:      "No se pudo obtener la tasa. Revisa tu conexión y recarga la página.",
    equivale:   "equivalen a",
    copiado:    "Copiado",
    copiar:     "Copiar resultado",
    sinHist:    "El historial no está disponible en este momento. La conversión de arriba sigue funcionando con normalidad.",
    unDolar:    "1 dólar estadounidense (USD) = ",
    unPeso:     "1 peso colombiano (COP) = ",
    consultado: "Consulta hecha el ",
    horaCol:    ", hora de Colombia: ",
    horaLocal:  ", hora del equipo: ",
    temaOscuro: "Activar el modo oscuro",
    temaClaro:  "Activar el modo claro",
    etqOrigenUSD:  "Monto (dólares)",
    etqOrigenCOP:  "Monto (pesos colombianos)",
    etqDestinoUSD: "Equivale a (dólares)",
    etqDestinoCOP: "Equivale a (pesos colombianos)"
  } : {
    cargando:   "Checking today's rate…",
    oficial:    "Official TRM · effective ",
    mercado:    "Market rate · updated ",
    guardada:   "No connection to the source · last saved figure from ",
    error:      "The rate could not be retrieved. Check your connection and reload the page.",
    equivale:   "equals",
    copiado:    "Copied",
    copiar:     "Copy result",
    sinHist:    "History is unavailable right now. The converter above still works normally.",
    unDolar:    "1 US dollar (USD) = ",
    unPeso:     "1 Colombian peso (COP) = ",
    consultado: "Checked on ",
    horaCol:    ", Colombia time: ",
    horaLocal:  ", device time: ",
    temaOscuro: "Switch to dark mode",
    temaClaro:  "Switch to light mode",
    etqOrigenUSD:  "Amount (US dollars)",
    etqOrigenCOP:  "Amount (Colombian pesos)",
    etqDestinoUSD: "Equals (US dollars)",
    etqDestinoCOP: "Equals (Colombian pesos)"
  };

  var LOCALE = ES ? "es-CO" : "en-US";

  /**
   * Atajo de document.querySelector, solo para no repetirlo 40 veces.
   */
  function $(sel) { return document.querySelector(sel); }

  /**
   * Formatea un número de pesos colombianos.
   * Por qué sin decimales: en Colombia los centavos de peso no se usan
   * en la práctica y mostrarlos hace ver el número más confuso.
   */
  function fmtCOP(n) {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency", currency: "COP",
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n);
  }

  /**
   * Formatea un número de dólares, siempre con 2 decimales.
   */
  function fmtUSD(n) {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency", currency: "USD",
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n);
  }

  /**
   * Formatea la tasa suelta (sin símbolo de moneda), con 2 decimales.
   */
  function fmtNum(n, dec) {
    return new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: dec === undefined ? 2 : dec,
      maximumFractionDigits: dec === undefined ? 2 : dec
    }).format(n);
  }

  /**
   * Convierte "2026-09-04" o una fecha ISO en algo legible.
   * Ojo: se parte el texto a mano en vez de usar new Date(cadena)
   * porque el navegador interpreta las fechas sin hora como UTC y
   * en Colombia (UTC-5) eso muestra el día anterior. Es un bug clásico.
   */
  function fechaLegible(iso) {
    if (!iso) return "";
    var soloFecha = String(iso).slice(0, 10).split("-");
    if (soloFecha.length !== 3) return String(iso);
    var d = new Date(+soloFecha[0], +soloFecha[1] - 1, +soloFecha[2]);
    return d.toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" });
  }

  /**
   * Versión larga con día de la semana: "viernes 5 de septiembre de 2026".
   * Se usa en la píldora de estado, donde interesa la fecha completa de
   * vigencia de la tasa. En el historial NO se usa: ahí sería un ladrillo.
   * Ojo: aquí no se fija zona horaria, y es correcto. La fecha ya viene
   * partida a mano (año, mes, día), así que el objeto Date se construye
   * en horario local sin riesgo del desfase de UTC.
   */
  function fechaLarga(iso) {
    if (!iso) return "";
    var p = String(iso).slice(0, 10).split("-");
    if (p.length !== 3) return String(iso);
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString(LOCALE, {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }

  /** Versión corta para el historial: "4 sep". */
  function fechaCorta(iso) {
    var p = String(iso).slice(0, 10).split("-");
    if (p.length !== 3) return String(iso);
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
  }

  /* ---------------------------------------------------------
     RELOJ DE CONSULTA (hora de Colombia)
     Qué es: la línea de debajo de la píldora, con la fecha completa
     y la hora exacta, corriendo segundo a segundo.
     Para qué: cuando el área contable adjunta una conversión a un
     soporte, queda constancia de a qué hora exacta se consultó.
     Por qué la hora de Colombia y no la del equipo: si alguien abre
     esto desde un portátil configurado en otro huso, la hora que
     vale para la contabilidad del hotel sigue siendo la de Bogotá.
     --------------------------------------------------------- */

  /**
   * ¿El navegador sabe convertir a la zona horaria de Colombia?
   * Los navegadores muy viejos no traen la base de zonas horarias y
   * lanzan excepción. Se comprueba una sola vez, al arrancar.
   */
  var HAY_ZONA = (function () {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: CFG.ZONA }).format(new Date());
      return true;
    } catch (e) { return false; }
  })();

  /** Fecha completa de HOY en Colombia: "viernes, 5 de septiembre de 2026". */
  function fechaLargaAhora(d) {
    var op = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    if (HAY_ZONA) op.timeZone = CFG.ZONA;
    return new Intl.DateTimeFormat(LOCALE, op).format(d);
  }

  /** Hora exacta de AHORA en Colombia, con segundos. */
  function horaAhora(d) {
    var op = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
    if (HAY_ZONA) op.timeZone = CFG.ZONA;
    return new Intl.DateTimeFormat(LOCALE, op).format(d);
  }

  /**
   * fetch con límite de tiempo.
   * Por qué: si la API oficial se queda colgada, sin esto la página se
   * quedaría esperando para siempre y el visitante vería "Consultando…".
   */
  function traer(url) {
    var ctrl = new AbortController();
    var reloj = setTimeout(function () { ctrl.abort(); }, CFG.TIMEOUT_MS);
    return fetch(url, { signal: ctrl.signal, cache: "no-store" })
      .then(function (r) {
        clearTimeout(reloj);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .catch(function (e) { clearTimeout(reloj); throw e; });
  }

  /* =========================================================
     2. OBTENCIÓN DE LA TASA
     Qué hace: pide la TRM oficial y, si falla, la tasa de mercado.
     Devuelve siempre el mismo objeto: { valor, fecha, fuente }.
     ========================================================= */

  /**
   * TRM oficial (Datos Abiertos Colombia).
   * Campos del dataset: valor, unidad, vigenciadesde, vigenciahasta.
   */
  function tasaOficial() {
    return traer(CFG.TRM_ULTIMA).then(function (datos) {
      if (!Array.isArray(datos) || !datos.length) throw new Error("Sin datos");
      var v = parseFloat(datos[0].valor);
      if (!isFinite(v) || v <= 0) throw new Error("Valor inválido");
      return { valor: v, fecha: datos[0].vigenciadesde, fuente: "oficial" };
    });
  }

  /**
   * Respaldo de mercado (ExchangeRate-API, plan abierto sin llave).
   * Solo entra en juego si la oficial no respondió.
   */
  function tasaRespaldo() {
    return traer(CFG.RESPALDO).then(function (d) {
      var v = d && d.rates ? parseFloat(d.rates.COP) : NaN;
      if (!isFinite(v) || v <= 0) throw new Error("Valor inválido");
      var f = d.time_last_update_utc ? new Date(d.time_last_update_utc).toISOString() : new Date().toISOString();
      return { valor: v, fecha: f, fuente: "mercado" };
    });
  }

  /* =========================================================
     3. CACHÉ LOCAL
     Qué hace: guarda la última tasa buena en el navegador.
     Para qué: si el visitante entra sin señal o las dos APIs están
     caídas, la herramienta sigue dando un número (marcado como
     guardado, nunca disfrazado de dato fresco).
     ========================================================= */

  function guardarCache(t) {
    try {
      localStorage.setItem(CFG.CACHE_KEY, JSON.stringify({
        valor: t.valor, fecha: t.fecha, fuente: t.fuente, guardado: Date.now()
      }));
    } catch (e) { /* modo incógnito o almacenamiento lleno: se ignora */ }
  }

  function leerCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CFG.CACHE_KEY) || "null");
      if (!c || !c.valor) return null;
      if (Date.now() - c.guardado > CFG.CACHE_HORAS * 3600000) return null;
      return c;
    } catch (e) { return null; }
  }

  /* =========================================================
     4. CONVERSIÓN Y PINTADO
     Qué hace: mantiene el estado (tasa y sentido de la conversión),
     recalcula al escribir y actualiza el resultado grande.
     ========================================================= */

  var estado = {
    tasa: null,      // cuántos COP vale 1 USD
    fecha: null,
    fuente: null,    // "oficial" | "mercado" | "cache"
    // Sentido inicial SEGÚN EL IDIOMA. "USD" = de dólares a pesos;
    // "COP" = al revés.
    //   · Español  → arranca en COP → USD. Quien trabaja en el hotel
    //     piensa en pesos: tiene una cifra en COP y necesita el dólar.
    //   · Inglés   → arranca en USD → COP, que es como llega quien
    //     consulta en inglés.
    // ⚠ Esto TIENE que coincidir con las monedas y el valor que trae
    // escritos cada HTML en el campo de entrada. Si se cambia aquí, hay
    // que cambiar index.html y en/index.html también.
    sentido: ES ? "COP" : "USD"
  };

  var elMonto, elResultado, elDetalle, elEstado, elEstadoTexto,
      elMonedaOrigen, elMonedaDestino, elEtqOrigen, elEtqDestino, elBtnCopiar;

  /**
   * Lee lo que el visitante escribió y lo vuelve número.
   *
   * El problema de fondo: "1.500" significa cosas distintas según quién
   * escriba. Un colombiano quiere decir mil quinientos (punto = miles);
   * un gringo quiere decir uno con cinco (punto = decimal). Y la página
   * la usan los dos. Reglas, en orden:
   *
   *   1. Si trae coma Y punto, el ÚLTIMO que aparece es el decimal.
   *      "1.234,56" → 1234.56   ·   "1,234.56" → 1234.56
   *   2. Si trae un solo tipo de separador:
   *      - repetido ("1.500.000") → es separador de miles.
   *      - una vez y seguido de EXACTAMENTE 3 cifras ("1.500", "10,000")
   *        → es separador de miles. Nadie escribe 3 decimales en dinero.
   *      - en cualquier otro caso ("1,5", "1.75", "2,5000") → es decimal.
   *      Excepción: si delante va un 0 o nada ("0.500", ".5"), no puede
   *      ser un grupo de miles, así que es decimal.
   *   3. Lo que no sea un número válido o sea negativo se toma como 0.
   */
  function montoEscrito() {
    var crudo = (elMonto.value || "").trim().replace(/\s/g, "");
    if (!crudo) return 0;

    var tieneComa  = crudo.indexOf(",") > -1;
    var tienePunto = crudo.indexOf(".") > -1;

    if (tieneComa && tienePunto) {
      crudo = crudo.lastIndexOf(",") > crudo.lastIndexOf(".")
        ? crudo.replace(/\./g, "").replace(",", ".")
        : crudo.replace(/,/g, "");
    } else if (tieneComa || tienePunto) {
      var sep = tieneComa ? "," : ".";
      var partes = crudo.split(sep);
      var esMiles = partes.length > 2 || (
        partes.length === 2 &&
        /^\d{3}$/.test(partes[1]) &&
        partes[0] !== "" && partes[0] !== "0"
      );
      crudo = esMiles ? partes.join("") : crudo.replace(sep, ".");
    }

    var n = parseFloat(crudo);
    return isFinite(n) && n >= 0 ? n : 0;
  }

  /**
   * Recalcula y pinta el resultado.
   * Se llama al escribir, al invertir monedas y cuando llega la tasa.
   */
  function calcular() {
    if (!estado.tasa) return;
    var monto = montoEscrito();
    var salida, detalle;

    if (estado.sentido === "USD") {
      salida  = fmtCOP(monto * estado.tasa);
      detalle = fmtUSD(monto) + " " + T.equivale + " " + salida;
    } else {
      salida  = fmtUSD(monto / estado.tasa);
      detalle = fmtCOP(monto) + " " + T.equivale + " " + salida;
    }

    elResultado.textContent = salida;
    elDetalle.textContent = detalle;
    // data-copiar guarda el texto que se lleva el botón de copiar.
    elBtnCopiar.setAttribute("data-copiar", detalle);
  }

  /**
   * Cambia el sentido de la conversión (USD→COP o COP→USD).
   * Además ajusta etiquetas, símbolos y el placeholder del campo.
   */
  function invertir() {
    // Antes de invertir se guarda el resultado actual para dejarlo como
    // nuevo monto de entrada. Así, si el visitante convirtió 100 USD y
    // obtuvo 401.255 COP, al invertir ve "401255 COP → 100 USD" en vez
    // de que se le borre lo que venía haciendo. Es como funcionan los
    // conversores de los bancos y evita tener que reescribir el monto.
    var traspaso = null;
    if (estado.tasa) {
      var m = montoEscrito();
      if (m > 0) {
        traspaso = estado.sentido === "USD"
          ? Math.round(m * estado.tasa)          // pasa a pesos: sin decimales
          : Math.round((m / estado.tasa) * 100) / 100; // pasa a dólares: 2 decimales
      }
    }

    estado.sentido = estado.sentido === "USD" ? "COP" : "USD";
    var esUSD = estado.sentido === "USD";

    elMonedaOrigen.innerHTML  = esUSD ? '<span class="campo__bandera" aria-hidden="true">🇺🇸</span> USD'
                                      : '<span class="campo__bandera" aria-hidden="true">🇨🇴</span> COP';
    elMonedaDestino.innerHTML = esUSD ? '<span class="campo__bandera" aria-hidden="true">🇨🇴</span> COP'
                                      : '<span class="campo__bandera" aria-hidden="true">🇺🇸</span> USD';
    elEtqOrigen.textContent  = esUSD ? T.etqOrigenUSD  : T.etqOrigenCOP;
    elEtqDestino.textContent = esUSD ? T.etqDestinoCOP : T.etqDestinoUSD;
    elMonto.setAttribute("placeholder", esUSD ? "100" : "400000");
    // Si había un resultado, se traspasa; si no, se deja el valor de ejemplo.
    elMonto.value = traspaso !== null ? String(traspaso) : (esUSD ? "100" : "400000");

    calcular();
    pintarEquivalencias();
    // Aquí antes se ponía un aria-label en #resultado con el detalle del
    // momento. Se quitó porque quedaba congelado: al seguir escribiendo, el
    // número cambiaba pero el lector de pantalla seguía leyendo el viejo.
    // El <output> ya tiene aria-live="polite" y las etiquetas de los dos
    // campos se actualizan solas, así que el cambio de sentido se anuncia
    // igual y sin riesgo de quedar desfasado.
  }

  /**
   * Escribe la píldora de estado: qué tasa se está usando y de cuándo es.
   * Es la parte que da transparencia; sin esto el número sería "mágico".
   */
  function pintarEstado() {
    elEstado.className = "estado";
    if (estado.fuente === "oficial") {
      elEstado.classList.add("is-ok");
      elEstadoTexto.textContent = T.oficial + fechaLarga(estado.fecha) +
        " · 1 USD = " + fmtNum(estado.tasa) + " COP";
    } else if (estado.fuente === "mercado") {
      elEstado.classList.add("is-respaldo");
      elEstadoTexto.textContent = T.mercado + fechaLarga(estado.fecha) +
        " · 1 USD = " + fmtNum(estado.tasa) + " COP";
    } else if (estado.fuente === "cache") {
      elEstado.classList.add("is-stale");
      elEstadoTexto.textContent = T.guardada + fechaLarga(estado.fecha) +
        " · 1 USD = " + fmtNum(estado.tasa) + " COP";
    }
    // Referencias inversas debajo del conversor (texto fijo del HTML).
    var r1 = $("#ref-usd"), r2 = $("#ref-cop");
    if (r1) r1.textContent = T.unDolar + fmtNum(estado.tasa) + " COP";
    if (r2) r2.textContent = T.unPeso + fmtNum(1 / estado.tasa, 6) + " USD";
  }

  /* =========================================================
     5. EQUIVALENCIAS RÁPIDAS
     Qué hace: rellena la lista de montos frecuentes ya convertidos.
     Por qué existe: resuelve la duda típica sin escribir nada.
     Depende de: #tabla-equivalencias en el HTML.
     ========================================================= */

  function pintarEquivalencias() {
    var cont = $("#tabla-equivalencias");
    if (!cont || !estado.tasa) return;
    var esUSD = estado.sentido === "USD";
    var montos = esUSD ? CFG.MONTOS_USD : CFG.MONTOS_COP;
    var html = "";

    for (var i = 0; i < montos.length; i++) {
      var m = montos[i];
      var origen  = esUSD ? fmtUSD(m) : fmtCOP(m);
      var destino = esUSD ? fmtCOP(m * estado.tasa) : fmtUSD(m / estado.tasa);
      html += '<li class="equivalencia">' +
                '<span class="equivalencia__origen">' + origen + '</span>' +
                '<span class="equivalencia__destino">' + destino + '</span>' +
              '</li>';
    }
    cont.innerHTML = html;
  }

  /* =========================================================
     6. HISTORIAL DE 7 DÍAS
     Qué hace: dibuja un gráfico de línea con los últimos valores de
     la TRM y los lista debajo en texto.
     Por qué en SVG hecho a mano: no vale la pena cargar una librería
     de gráficos (100+ KB) para siete puntos.
     Ojo: solo la fuente oficial tiene historial. Si no responde, se
     muestra una nota y la conversión sigue funcionando igual.
     ========================================================= */

  function pintarHistorial(filas) {
    var caja = $("#historial-caja");
    var svgCont = $("#grafico-historial");
    var lista = $("#lista-historial");
    if (!caja || !svgCont || !lista) return;

    // Solo días distintos, del más viejo al más nuevo, máximo 7.
    var vistos = {}, datos = [];
    for (var i = 0; i < filas.length && datos.length < 7; i++) {
      var f = String(filas[i].vigenciadesde).slice(0, 10);
      var v = parseFloat(filas[i].valor);
      if (!vistos[f] && isFinite(v)) { vistos[f] = 1; datos.push({ fecha: f, valor: v }); }
    }
    datos.reverse();
    if (datos.length < 2) { mostrarNotaHistorial(); return; }

    // Escala: se deja un 8% de margen arriba y abajo para que la línea
    // no quede pegada al borde del gráfico.
    var W = 700, H = 260, PX = 12, PY = 22;
    var vals = datos.map(function (d) { return d.valor; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var margen = (max - min) * 0.08 || Math.max(max * 0.002, 1);
    min -= margen; max += margen;

    var puntos = datos.map(function (d, i) {
      var x = PX + (i * (W - PX * 2)) / (datos.length - 1);
      var y = PY + (H - PY * 2) * (1 - (d.valor - min) / (max - min));
      return { x: x, y: y, d: d };
    });

    var linea = puntos.map(function (p, i) { return (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1); }).join(" ");
    var area  = "M" + puntos[0].x.toFixed(1) + " " + (H - PY) + " " +
                puntos.map(function (p) { return "L" + p.x.toFixed(1) + " " + p.y.toFixed(1); }).join(" ") +
                " L" + puntos[puntos.length - 1].x.toFixed(1) + " " + (H - PY) + " Z";

    var circulos = puntos.map(function (p) {
      return '<circle class="historial__punto" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3.5"><title>' +
             fechaCorta(p.d.fecha) + ": " + fmtNum(p.d.valor) + " COP</title></circle>";
    }).join("");

    svgCont.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      (ES ? "Evolución de la TRM en los últimos días" : "TRM trend over recent days") + '">' +
      '<path class="historial__area" d="' + area + '"/>' +
      '<path class="historial__linea" d="' + linea + '"/>' + circulos +
      '</svg>';

    // Lista en texto: el gráfico solo no es accesible ni indexable.
    var html = "";
    for (var j = datos.length - 1; j >= 0; j--) {
      html += '<li class="historial__item">' +
                '<span class="historial__fecha">' + fechaLegible(datos[j].fecha) + '</span>' +
                '<span class="historial__valor">' + fmtNum(datos[j].valor) + ' COP</span>' +
              '</li>';
    }
    lista.innerHTML = html;
  }

  /** Nota cuando el historial no está disponible. */
  function mostrarNotaHistorial() {
    var caja = $("#historial-caja");
    if (!caja) return;
    caja.innerHTML = '<p class="nota">' + T.sinHist + '</p>';
  }

  /* =========================================================
     7. CONSENTIMIENTO DE COOKIES + GOOGLE ANALYTICS
     Qué hace: muestra el banner, guarda la decisión y SOLO carga GA4
     si el visitante acepta.
     Por qué así: la Resolución 32.126 de 2022 de la SIC exige
     consentimiento previo, expreso e informado. Cargar GA y mostrar
     el banner de adorno sería incumplir.
     ========================================================= */

  function cargarAnalytics() {
    if (window.__gaCargado) return;
    if (!CFG.GA_ID || CFG.GA_ID.indexOf("POR CONFIRMAR") > -1) return; // sin ID no se carga nada
    window.__gaCargado = true;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + CFG.GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CFG.GA_ID, { anonymize_ip: true });
  }

  /**
   * Registra un evento en GA4 si está cargado.
   * Eventos de esta herramienta: conversión hecha, cambio de sentido,
   * copia del resultado y salida hacia la web del hotel.
   */
  function evento(nombre, params) {
    if (typeof window.gtag === "function") window.gtag("event", nombre, params || {});
  }

  function iniciarCookies() {
    var banner = $("#cookies");
    var btnOk = $("#cookies-aceptar");
    var btnNo = $("#cookies-rechazar");
    var btnCfg = document.querySelectorAll(".js-config-cookies");
    if (!banner) return;

    function decidir(valor) {
      try { localStorage.setItem(CFG.COOKIE_KEY, valor); } catch (e) {}
      banner.classList.remove("is-visible");
      banner.setAttribute("aria-hidden", "true");
      if (valor === "aceptado") cargarAnalytics();
    }

    function mostrar() {
      banner.classList.add("is-visible");
      banner.setAttribute("aria-hidden", "false");
    }

    var guardado = null;
    try { guardado = localStorage.getItem(CFG.COOKIE_KEY); } catch (e) {}

    if (guardado === "aceptado") cargarAnalytics();
    else if (guardado !== "rechazado") setTimeout(mostrar, 900); // deja ver la página primero

    if (btnOk) btnOk.addEventListener("click", function () { decidir("aceptado"); });
    if (btnNo) btnNo.addEventListener("click", function () { decidir("rechazado"); });
    for (var i = 0; i < btnCfg.length; i++) {
      btnCfg[i].addEventListener("click", function (e) { e.preventDefault(); mostrar(); });
    }
  }

  /* =========================================================
     8. RELOJ DE CONSULTA
     Qué hace: escribe debajo de la píldora la fecha completa y la
     hora exacta de Colombia, y la refresca cada segundo.
     Dónde: solo en las dos páginas del conversor. Las legales y la
     404 no tienen estos elementos y la función se sale sola.
     ========================================================= */

  var relojId = null;

  function iniciarReloj() {
    var elEtq = $("#hora-etiqueta");
    var elRel = $("#hora-reloj");
    if (!elEtq || !elRel) return;

    function pintar() {
      var ahora = new Date();
      // Si el navegador no trae la base de zonas horarias, se dice
      // claramente que la hora es la del equipo, no la de Colombia.
      // Nunca etiquetar como "hora de Colombia" algo que no lo es.
      elEtq.textContent = T.consultado + fechaLargaAhora(ahora) +
                          (HAY_ZONA ? T.horaCol : T.horaLocal);
      elRel.textContent = horaAhora(ahora);
    }

    pintar();
    relojId = setInterval(pintar, 1000);

    // Con la pestaña en segundo plano el reloj se detiene: no tiene
    // sentido gastar batería redibujando algo que nadie está viendo.
    // Al volver se repinta de inmediato, así que nunca se ve la hora
    // congelada del momento en que se fue.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        clearInterval(relojId);
        relojId = null;
      } else if (relojId === null) {
        pintar();
        relojId = setInterval(pintar, 1000);
      }
    });
  }

  /* =========================================================
     9. TEMA CLARO / OSCURO
     Qué hace: gestiona el botón de la cabecera y recuerda la elección.
     Ojo: el tema ya viene puesto desde el <script> en línea del <head>
     de cada HTML, que corre antes de pintar para que no haya un
     fogonazo blanco. Aquí solo se sincroniza el botón y se engancha
     el clic. Los colores viven en css/styles.css, no aquí.
     Por defecto SIEMPRE claro: no se mira prefers-color-scheme, es
     una decisión de marca de JX.
     ========================================================= */

  /**
   * Pinta el tema y, solo si se le pide, lo guarda.
   * El segundo parámetro existe para no escribir en el navegador del
   * visitante una preferencia que nunca eligió: al cargar la página se
   * llama sin guardar, y solo se guarda cuando pulsa el botón.
   */
  function aplicarTema(tema, guardar) {
    var oscuro = tema === "oscuro";

    if (oscuro) document.documentElement.setAttribute("data-tema", "oscuro");
    else document.documentElement.removeAttribute("data-tema");

    // Color de la barra del navegador en móvil, para que no quede
    // una franja blanca encima de la página en oscuro (y al revés).
    var meta = $("#meta-tema");
    if (meta) meta.setAttribute("content", oscuro ? "#0E0E10" : "#FFFFFF");

    var btn = $("#btn-tema");
    if (btn) {
      // aria-pressed dice si el modo oscuro está activado; el aria-label
      // dice qué va a pasar al pulsar. Los dos juntos son lo que hace
      // que el botón se entienda con lector de pantalla.
      btn.setAttribute("aria-pressed", oscuro ? "true" : "false");
      btn.setAttribute("aria-label", oscuro ? T.temaClaro : T.temaOscuro);
    }

    if (guardar) {
      try { localStorage.setItem(CFG.TEMA_KEY, oscuro ? "oscuro" : "claro"); } catch (e) {}
    }
  }

  function iniciarTema() {
    var guardado = null;
    try { guardado = localStorage.getItem(CFG.TEMA_KEY); } catch (e) {}
    // Sin guardar: aquí solo se sincroniza lo que ya hizo el script del
    // <head>. Cualquier valor que no sea "oscuro" cae en claro, que es
    // el tema por defecto de la web.
    aplicarTema(guardado === "oscuro" ? "oscuro" : "claro", false);

    var btn = $("#btn-tema");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var seraOscuro = document.documentElement.getAttribute("data-tema") !== "oscuro";
      aplicarTema(seraOscuro ? "oscuro" : "claro", true);
      evento("cambiar_tema", { tema: seraOscuro ? "oscuro" : "claro" });
    });
  }

  /* =========================================================
     10. ARRANQUE
     Qué hace: engancha los elementos, pide la tasa y deja todo listo.
     Orden pensado a propósito: primero se muestra "consultando",
     luego llega el dato y recién ahí se habilita el resultado.
     ========================================================= */

  function iniciarIdioma() {
    // Guarda el idioma que el visitante eligió a mano, para que al
    // volver desde un enlace interno se respete su elección.
    // NO redirige automáticamente: el español siempre es la entrada.
    var links = document.querySelectorAll(".idioma__link");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        try { localStorage.setItem(CFG.IDIOMA_KEY, this.getAttribute("data-idioma")); } catch (e) {}
      });
    }
  }

  function iniciarCopiar() {
    if (!elBtnCopiar) return;
    elBtnCopiar.addEventListener("click", function () {
      var txt = elBtnCopiar.getAttribute("data-copiar") || "";
      // Mientras no haya llegado la tasa no hay nada que copiar. Sin esto,
      // pulsar el botón en los primeros segundos copiaba una cadena vacía
      // y aun así decía "Copiado".
      if (!txt) return;
      var listo = function () {
        var previo = elBtnCopiar.querySelector(".btn-sec__txt").textContent;
        elBtnCopiar.querySelector(".btn-sec__txt").textContent = T.copiado;
        elBtnCopiar.classList.add("is-hecho");
        setTimeout(function () {
          elBtnCopiar.querySelector(".btn-sec__txt").textContent = previo;
          elBtnCopiar.classList.remove("is-hecho");
        }, 1800);
        evento("copiar_resultado", { sentido: estado.sentido });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(listo).catch(function () {});
      } else {
        // Respaldo para navegadores viejos sin API de portapapeles.
        var ta = document.createElement("textarea");
        ta.value = txt; ta.setAttribute("readonly", "");
        ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); listo(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  function aplicarTasa(t, fuente) {
    estado.tasa = t.valor;
    estado.fecha = t.fecha;
    estado.fuente = fuente || t.fuente;
    pintarEstado();
    calcular();
    pintarEquivalencias();
    elMonto.removeAttribute("disabled");
    evento("tasa_cargada", { fuente: estado.fuente });
  }

  function pedirTasa() {
    elEstado.className = "estado is-cargando";
    elEstadoTexto.textContent = T.cargando;

    // 1º la oficial; 2º el respaldo de mercado; 3º la caché local.
    tasaOficial()
      .then(function (t) { guardarCache(t); aplicarTasa(t); cargarHistorial(); })
      .catch(function () {
        return tasaRespaldo().then(function (t) {
          guardarCache(t); aplicarTasa(t); mostrarNotaHistorial();
        });
      })
      .catch(function () {
        var c = leerCache();
        if (c) { aplicarTasa(c, "cache"); mostrarNotaHistorial(); return; }
        elEstado.className = "estado is-error";
        elEstadoTexto.textContent = T.error;
        elResultado.textContent = "—";
        elDetalle.textContent = "";
        mostrarNotaHistorial();
      });
  }

  function cargarHistorial() {
    traer(CFG.TRM_HISTORIAL)
      .then(pintarHistorial)
      .catch(mostrarNotaHistorial);
  }

  function iniciar() {
    elMonto        = $("#monto");
    elResultado    = $("#resultado");
    elDetalle      = $("#resultado-detalle");
    elEstado       = $("#estado");
    elEstadoTexto  = $("#estado-texto");
    elMonedaOrigen = $("#moneda-origen");
    elMonedaDestino= $("#moneda-destino");
    elEtqOrigen    = $("#etiqueta-origen");
    elEtqDestino   = $("#etiqueta-destino");
    elBtnCopiar    = $("#btn-copiar");

    // Año del aviso de copyright: se pone solo para que no quede
    // desactualizado cuando cambie el año.
    var anio = $("#anio");
    if (anio) anio.textContent = new Date().getFullYear();

    // Estos tres van ANTES del corte de abajo, porque también aplican a
    // las páginas legales y a la 404: todas llevan cabecera con botón de
    // tema, selector de idioma y banner de cookies.
    iniciarTema();
    iniciarCookies();
    iniciarIdioma();

    // Las páginas legales y la 404 comparten este script pero no tienen
    // conversor: si no está el campo, no se sigue.
    if (!elMonto) return;

    iniciarReloj();

    iniciarCopiar();

    elMonto.addEventListener("input", calcular);
    // Evita que el visitante escriba un signo menos o notación científica.
    elMonto.addEventListener("keydown", function (e) {
      if (["-", "+", "e", "E"].indexOf(e.key) > -1) e.preventDefault();
    });

    var btnInv = $("#btn-invertir");
    if (btnInv) btnInv.addEventListener("click", function () {
      invertir();
      evento("invertir_monedas", { sentido: estado.sentido });
    });

    // Marca el clic hacia la web del hotel como evento de salida.
    var salidas = document.querySelectorAll(".js-salida-hotel");
    for (var i = 0; i < salidas.length; i++) {
      salidas[i].addEventListener("click", function () { evento("clic_web_hotel", {}); });
    }

    pedirTasa();
  }

  // Se arranca cuando el HTML ya está armado. El script va con defer,
  // así que en la práctica esto ya se cumple; el listener es la red
  // de seguridad por si algún día se carga de otra forma.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
