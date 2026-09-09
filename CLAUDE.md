# CLAUDE.md — Convertidor USD ⇄ COP · Hoteles Dorado Plaza

Contexto completo del proyecto para que cualquier chat futuro lo retome sin adivinar nada.

---

## 📌 De qué se trata

Herramienta web que convierte **dólares estadounidenses (USD) a pesos colombianos (COP) y
viceversa**, usando la **TRM oficial de Colombia**. Está publicada por **Hoteles Dorado Plaza**
(cadena hotelera con sedes en Cartagena de Indias y Barranquilla).

## 🎯 PARA QUIÉN ES — corregido el 5 sep 2026, leer antes de tocar textos

**NO es para huéspedes.** La primera versión se escribió entera dirigida al huésped
("Tengo / Recibo", "puesta a disposición de nuestros huéspedes y visitantes", "el valor que
recibas al cambiar dinero"). **Eso estaba mal y JX lo corrigió.**

El público real son las **áreas ejecutiva, comercial, contable y administrativa del propio
hotel**. Es un **instrumento de trabajo interno**: sirve para facturar, cotizar y cuadrar
cuentas con la tasa oficial del día.

Consecuencias que hay que respetar al escribir cualquier texto nuevo:

- Se habla de **montos**, no de "lo que tengo" o "lo que recibo". Las etiquetas del conversor
  son «Monto (…)» y «Equivale a (…)».
- Nada de lenguaje de atención al huésped, ni de turismo, ni de viaje.
- El marco es contable: *referencia oficial para facturar*, no *cuánto te van a dar en la
  casa de cambio*.
- El contacto es **web@doradoplaza.com (Ejecutiva Comercial)**.

**Importante — esto NO es una landing de venta.** JX lo dijo expresamente: es un *instrumento*
funcional, no una pieza comercial. Por eso:

- **No lleva botón de WhatsApp** ni ningún CTA de ventas.
- **No lleva mapa de ubicación** (no promociona una sede concreta; es de la cadena en general).
- **No lleva crédito de JX Company en el footer** — JX pidió quitarlo para este proyecto.
  En su lugar va el copyright de Hoteles Dorado Plaza.
- El único enlace externo hacia el negocio es `doradoplaza.com`, discreto, en el pie.

Si un chat futuro va a ampliar esto, **respetar ese criterio**: nada de secciones de venta,
promociones ni botones de contacto, salvo que JX lo pida.

---

## 🗺️ Estructura de archivos

```
convertidor-dorado-plaza/
├── index.html          ← herramienta en ESPAÑOL (versión prioritaria)
├── en/index.html       ← misma herramienta en INGLÉS
├── 404.html            ← página de error con el diseño del sitio
├── privacidad.html     ← política de privacidad (Ley 1581 de 2012)
├── cookies.html        ← política de cookies (Resolución 32.126 de 2022 SIC)
├── terminos.html       ← términos, condiciones y propiedad intelectual
├── _headers            ← cache, seguridad y X-Robots-Tag (Cloudflare)
├── robots.txt          ← deja pasar a buscadores (para que lean el noindex) y bloquea bots de IA
├── site.webmanifest    ← nombre, iconos y theme-color
├── .gitignore          ← qué NO se sube al repositorio
├── css/styles.css      ← TODO el CSS
├── js/script.js        ← TODO el JS
├── img/                ← logo y og-image en WebP + favicons
├── CLAUDE.md           ← este archivo
└── README.md           ← manual para JX y para el cliente
```

**Retirados el 9 sep 2026** al pasar la web a `noindex`: `sitemap.xml` y `llms.txt`. Los dos
servían para que buscadores y agentes de IA encontraran e indexaran la herramienta, que es justo
lo contrario de lo que se quiere ahora que es de uso interno. Hay copia en el respaldo de la
sesión por si algún día se revierte la decisión.

---

## 🖼️ REGLA DE IMÁGENES — SIEMPRE WebP

Todas las imágenes de este proyecto van en **WebP**, sin excepción. Cualquier foto nueva que JX
entregue (JPG, PNG, HEIC, capturas, lo que sea) se **convierte a WebP de inmediato** antes de
meterla al proyecto, conservando resolución y calidad originales, y se guarda en `img/`. Nunca
dejar JPG/PNG en el proyecto ni entregar copias de respaldo en otros formatos.
**Única excepción técnica**: `favicon` (`.ico`/`.png`/`.svg`) y `apple-touch-icon.png`, porque
ningún navegador soporta favicons en WebP.

---

## 🎨 REGLA DE DISEÑO — TODO LO NUEVO USA ESTE MISMO DISEÑO

Cualquier sección, componente, botón o página que se agregue a futuro debe usar **exactamente**
el diseño de esta web: mismos colores, mismas tipografías, mismos tamaños, radios, sombras y
espaciados, y los mismos patrones de componente que ya existen. **Nunca un diseño distinto.**
Si algo no alcanza con lo que hay, preguntarle a JX antes de inventar.

**Ficha de diseño de este proyecto:**

- **Modo de diseño usado**: **Modo 2 — diseño libre a partir de imagen de referencia.**
  La paleta se extrajo del **logo oficial de Dorado Plaza** (degradado dorado).

- **DOS TEMAS (desde el 5 sep 2026).** El **claro (blanco + dorado) es el primordial**: la web
  abre siempre en blanco. El oscuro es opcional, con el botón de la cabecera, y se recuerda.
  ⚠ **A propósito NO se usa `prefers-color-scheme`**: aunque el sistema del visitante esté en
  oscuro, la web abre en blanco. Es decisión de marca de JX, no un descuido.

- **Paleta** (variables de `css/styles.css`: `:root` = claro, `[data-tema="oscuro"]` = oscuro):

  | Variable | Claro (por defecto) | Oscuro | Uso |
  |---|---|---|---|
  | `--oro-claro` | `#E8C86A` | `#E8C86A` | alto del degradado, solo decorativo |
  | `--oro` | `#B08D2E` | `#C9A84C` | dorado principal, rellenos de botón |
  | `--oro-hondo` | `#6E4E14` | `#8A5A22` | bajo del degradado; bordes y detalles |
  | `--oro-texto` | `#866616` | `#E8C86A` | **dorado para TEXTO** (el que cumple contraste) |
  | `--grad-oro-1` / `--grad-oro-2` | `#A88121` / `#6E4E14` | `#E8C86A` / `#C9A84C` | degradado del h1 y del resultado grande |
  | `--sobre-oro` | `#241B06` | `#14100A` | texto encima de un relleno dorado |
  | `--fondo` | `#FCFAF5` | `#0E0E10` | fondo general |
  | `--fondo-alt` | `#F5F0E4` | `#131315` | franjas alternas (ritmo entre secciones) |
  | `--superficie` | `#FFFFFF` | `#1A1A1D` | tarjetas y cajas |
  | `--superficie-2` | `#F7F3EA` | `#212125` | inputs y elementos internos |
  | `--borde` | `#E7DFCC` | `#2A2A2F` | bordes sutiles |
  | `--texto` | `#17140F` | `#F2EFE9` | texto principal |
  | `--texto-suave` | `#5A5348` | `#A8A29A` | texto secundario |
  | `--texto-tenue` | `#6E675C` | `#8F8A81` | reloj, legales y notas al pie |
  | `--cabecera` | `rgba(252,250,245,.88)` | `rgba(14,14,16,.9)` | barra superior translúcida |
  | `--ok` / `--alerta` / `--error` | `#2E7D4F` / `#9A6B12` / `#B03A32` | `#6FBF8B` / `#E0A94B` / `#D9736B` | estados de la píldora |

  ⚠ **Dos trampas del tema claro, ya resueltas — no deshacerlas:**
  1. `--fondo` **no es blanco puro** y `--superficie` **sí**. Si los dos fueran `#FFFFFF`, la
     tarjeta del conversor quedaría invisible (solo el borde de 1px).
  2. El dorado del logo (`#C9A84C`) **no se lee sobre blanco** (≈2:1). Por eso existe
     `--oro-texto`, que es el mismo dorado más hondo. **Para texto se usa `--oro-texto`,
     nunca `--oro` ni `--oro-claro`.**

  Toda la paleta está medida contra los cuatro fondos de cada tema (página, franja, tarjeta e
  input) y **cumple WCAG AA en los dos temas**. Si se cambia un color, volver a medirlo.

- **Tipografías** (Google Fonts, carga no bloqueante):
  - Títulos y cifras: **Jost** (400/500/600) — geométrica, del mismo aire que el logo.
  - Texto corrido: **Inter** (400/500/600).
  - Los números usan `font-variant-numeric: tabular-nums` para que no "bailen" al escribir.

- **Escala de tamaños**: fluida con `clamp()`. `--t-display`, `--t-h2`, `--t-h3`, `--t-base`,
  `--t-chico`, `--t-mini`, `--t-resultado`. Escala sola de 380 px a TV sin media queries extra.

- **Radios**: `--r-chico 8px`, `--r-medio 14px`, `--r-grande 22px`.
- **Sombras**: `--sombra` (tarjetas normales) y `--sombra-alta` (tarjeta del conversor y banner).
- **Espaciados**: `--gap 1rem`, `--gap-2 1.5rem`, `--seccion` (padding vertical fluido),
  `--ancho 1120px` (1200px desde 1440px de viewport).

- **Patrones de componente**:
  - *Tarjeta*: fondo `--superficie`, borde `--borde`, radio `--r-medio` (o `--r-grande` en la
    del conversor), sombra suave. La del conversor lleva un filete dorado de 2 px arriba.
  - *Botón principal*: degradado dorado, texto oscuro `#14100A`, radio 999px, alto ≥52px.
  - *Botón secundario*: transparente con borde `--borde`, alto ≥48px.
  - *Sección*: `.bloque`, alternando `.bloque--alt` para dar ritmo (no todas iguales).

- **Prohibido** (regla de JX): neón, glows, degradados morado-azul, blobs, glassmorphism,
  animaciones que pulsan o rebotan. Todo el movimiento es una transición de 180 ms.

---

## 🗂️ ÍNDICE DE ZONAS EDITABLES

Solo hay **2 zonas**, porque esta herramienta casi no tiene contenido variable (el dato que
cambia todos los días llega solo, desde la API).

| Zona | Archivo | Qué contiene | ¿Se repite en otro lugar? |
|---|---|---|---|
| `ZONA EDITABLE · TEXTOS` | `index.html` (hero) | Título `h1` y párrafo de bajada | Sí: `<title>`, `meta description` y `og:title` del `<head>` del mismo archivo |
| `ZONA EDITABLE · CONTACTO` | `index.html` (pie) | Enlace a `doradoplaza.com` y correo de contacto | Sí: JSON-LD `Organization.url` en `index.html` y `en/index.html`, y las tres páginas legales |

**Reglas al ampliar**: respetar estos nombres, no crear marcadores nuevos ni duplicar una zona.
Las imágenes, el CSS, el JS y el `<head>` **nunca** llevan zonas editables.

⚠️ La versión inglesa (`en/index.html`) **no lleva marcadores de zona**: se edita a la par de la
española, manteniendo la equivalencia de textos.

---

## 🧭 MAPA DEL CÓDIGO

Registro de todo el código del proyecto. **Cada vez que se agregue o modifique algo, se anota
aquí.** Se suma, nunca se borra lo anterior.

### `css/styles.css` — versión inicial (4 sep 2026)

Bloques, en orden de aparición:

1. **Variables `:root`** — la fuente única de verdad del diseño. Nada de hex sueltos fuera de aquí.
2. **Reset y base** — normaliza, fija fondo/color/tipografía y añade dos halos dorados muy tenues
   en `body` (`radial-gradient` al 5% de opacidad) para que el negro no quede plano. *No es un
   glow*: es una textura de fondo, apenas perceptible.
3. **`.contenedor` / `.sr-only` / `.skip-link`** — utilidades de layout y accesibilidad.
4. **`.cabecera`** — barra sticky con logo y selector ES|EN. Respeta `env(safe-area-inset-top)`.
5. **`.hero` y `.estado`** — título y píldora de estado de la tasa. Las clases `is-ok`,
   `is-respaldo`, `is-stale`, `is-error` y `is-cargando` las pone el JS y cambian el color del punto.
6. **`.tarjeta`, `.campo`, `.btn-invertir`, `.campo__salida`** — el conversor. El input tiene
   `font-size` ≥16px obligatorio (si baja, iOS hace zoom automático al enfocarlo).
7. **`.equivalencias`** — grid de 2 → 3 → 4 columnas según el ancho.
8. **`.historial__*`** — caja, gráfico SVG y lista. El SVG lo inyecta el JS; aquí solo van los
   estilos de línea, área y puntos.
9. **`.info`** — tarjetas de explicación (qué es la TRM, de dónde sale el dato, alcance).
10. **`.pie`** — pie con enlaces legales y copyright.
11. **`.cookies`** — banner de consentimiento. Los dos botones tienen el mismo tamaño a propósito:
    la norma colombiana prohíbe esconder el "Rechazar".
12. **`.texto`, `.error404`** — layout de lectura para legales y 404.
13. **`@media (hover: hover)`** — todos los hover viven aquí, para que en táctil no queden pegados.
14. **Responsive** — 600 / 700 / 900 / 1440 px hacia arriba, y 420 / 380 px hacia abajo.
    En ≤420px la moneda pasa encima del número para que el input no quede espichado.
15. **`prefers-reduced-motion`** y **`@media print`**.

### `js/script.js` — versión inicial (4 sep 2026)

Todo va dentro de una IIFE en modo estricto, para no ensuciar el ámbito global.

1. **`CFG`** — configuración centralizada: endpoints, timeout, horas de caché, montos de la tabla
   y `GA_ID`. **Si hay que cambiar un endpoint o el ID de Analytics, se cambia solo aquí.**
2. **Idioma** — se lee de `<html lang>`; el objeto `T` guarda los textos que el JS escribe.
   Los textos que ya están en el HTML no se duplican aquí.
3. **Utilidades** — `fmtCOP` (sin decimales, porque los centavos de peso no se usan), `fmtUSD`
   (2 decimales), `fmtNum`, `fechaLegible` y `fechaCorta`.
   ⚠️ **Punto delicado**: las fechas se parten a mano (`"2026-09-04".split("-")`) en vez de usar
   `new Date(cadena)`. Motivo: el navegador interpreta las fechas sin hora como UTC y en Colombia
   (UTC−5) eso mostraría el día anterior. **No cambiar esto.**
4. **`traer(url)`** — `fetch` con `AbortController` y timeout de 8 s. Sin esto, si la API oficial
   se cuelga, la página se quedaría en "Consultando…" para siempre.
5. **`tasaOficial()`** — TRM de Datos Abiertos Colombia (dataset `32sa-8pi3`).
   Campos usados: `valor` y `vigenciadesde`.
6. **`tasaRespaldo()`** — ExchangeRate-API (`open.er-api.com`), plan abierto sin llave.
   Solo entra si la oficial falló.
7. **Caché** — guarda la última tasa buena en `localStorage` (24 h). Solo se usa si las dos APIs
   fallan, y en pantalla se marca claramente como dato guardado.
8. **Conversión** — `montoEscrito()` acepta coma o punto como decimal (en Colombia se escribe
   "1,5" y en inglés "1.5"; ambos deben funcionar). `calcular()` recalcula al escribir.
9. **`invertir()`** — cambia el sentido, las etiquetas y las banderas. **Traspasa el resultado
    al campo de entrada**: si había 100 USD → 401.255 COP, al invertir queda 401.255 COP → 100 USD,
    en vez de borrarse. Es como funcionan los conversores de los bancos y evita reescribir el monto.
10. **`pintarEquivalencias()`** — rellena la tabla de montos frecuentes; cambia al invertir.
11. **`pintarHistorial()`** — dibuja un SVG a mano con los últimos 7 valores. Se hizo así a
    propósito: cargar una librería de gráficos (100+ KB) para 7 puntos no se justifica.
    Si la fuente oficial no responde, muestra una nota y **la conversión sigue funcionando**.
12. **Cookies + GA4** — `cargarAnalytics()` **solo se ejecuta después de aceptar**, y además
    no hace nada mientras `GA_ID` siga en `{POR CONFIRMAR}`.
13. **Eventos GA4 configurados**: `tasa_cargada`, `invertir_monedas`, `copiar_resultado`,
    `clic_web_hotel`.

### Revisión de cierre (5 sep 2026) — cambios sobre la versión inicial

Repaso completo antes de publicar. Lo que se tocó y por qué:

1. **Se eliminó la sección de preguntas frecuentes.** Decisión de JX: en una herramienta de un
   solo uso no aportaba y alargaba la página. Se quitó de los dos idiomas, junto con el bloque
   `FAQPage` del JSON-LD (dejarlo sin las preguntas visibles en la página sería marcado engañoso
   y Google lo penaliza) y con todo el CSS `.faq*`. **No volver a agregarla sin que JX lo pida.**

2. **Todos los enlaces internos pasaron de ruta absoluta a ruta relativa.**
   Antes: `href="/"` y `href="/en/"`. Ahora: `index.html`, `en/index.html`, `../index.html`.
   *Motivo*: con ruta absoluta la barra `/` apunta a la raíz del servidor, así que el botón EN
   solo funcionaba si el proyecto estaba publicado exactamente en la raíz del dominio. Abierto
   desde una carpeta local o desde una subcarpeta, el cambio de idioma llevaba a un 404.
   Este era el fallo de "la página en inglés no funciona".
   La URL canónica para buscadores la sigue fijando el `canonical` del `<head>`, que es absoluto.

3. **`404.html` es la excepción: ahí TODO va en ruta absoluta** (`/css/…`, `/img/…`, `/js/…`,
   `/privacidad.html`). *Motivo*: el servidor muestra el 404 en la dirección que el visitante
   escribió mal. Con rutas relativas, un error en `/promociones/verano` buscaba
   `/promociones/css/styles.css` y la página de error salía sin estilos ni logo.

4. **`montoEscrito()` ahora distingue separador de miles de separador decimal.**
   Antes, escribir `1.500` en la versión española daba **1,5** en vez de **1.500**. La regla
   nueva está documentada en el propio archivo. Validada con 23 casos, incluidos `1,5`, `1.5`,
   `1.500`, `1.500.000`, `1.234,56`, `1,234.56`, `0.500` y `.5`.

5. **El botón de copiar ya no responde mientras no haya tasa.** Antes, pulsarlo en los primeros
   segundos copiaba una cadena vacía y decía "Copiado" igual.

6. **`aria-current`**: `page` en el convertidor (esa sí es la página actual) y `true` en legales
   y 404 (ahí solo marca el idioma). El CSS contempla los dos valores.

7. **El pie pasó de `--fondo-alt` a `--fondo`.** Al quitar las preguntas frecuentes, la última
   sección quedó siendo una franja alterna y se fundía con el pie en una sola mancha.

8. **`_headers`**: se sumaron `Strict-Transport-Security`, `Content-Security-Policy:
   frame-ancestors 'self'` y `Cache-Control: no-cache` explícito para el HTML.

9. **`site.webmanifest`**: rutas relativas, `id`, icono `maskable` (Android recorta el icono en
   círculo; sin `maskable` se ve el logo cortado), `orientation` y `categories`.

### Segunda revisión (5 sep 2026) — cambios pedidos por JX

1. **Reloj de consulta.** Debajo de la píldora se añadió una línea con la **fecha completa
   (con día de la semana) y la hora exacta, corriendo segundo a segundo**. La píldora también
   pasó a mostrar la fecha de vigencia completa (`fechaLarga`, con día de la semana).
   *Por qué la hora de Colombia y no la del equipo*: si alguien abre esto desde un portátil
   configurado en otro huso, la hora que vale para la contabilidad del hotel sigue siendo la
   de Bogotá. Se fija con `timeZone: "America/Bogota"` (`CFG.ZONA`). Si el navegador es tan
   viejo que no trae la base de zonas horarias, se dice «hora del equipo» en vez de mentir.
   El reloj **se detiene con la pestaña en segundo plano** y se repinta al volver.

2. **El sentido del conversor ahora depende del idioma.**
   - Español → arranca en **COP → USD** (quien trabaja en el hotel piensa en pesos).
   - Inglés  → arranca en **USD → COP**.
   Está en `estado.sentido` (`ES ? "COP" : "USD"`). ⚠ **Tiene que coincidir con las monedas y
   el valor de ejemplo escritos en cada HTML**; si se cambia en un lado, cambiar en el otro.

   **Los `h1` dicen el sentido de cada idioma** (JX lo pidió expresamente):
   - ES: «Convertidor de *pesos colombianos a dólares*»
   - EN: «*US dollars to Colombian pesos* converter»

   ⚠ **El `<title>` español dice lo contrario a propósito** («dólares a pesos colombianos»):
   ese es el término por el que la gente busca en Google y la herramienta convierte en los
   dos sentidos, así que las dos frases son ciertas. **No "corregir" esa diferencia.** En
   inglés sí coinciden `h1` y `<title>`, porque ahí el sentido y el término buscado son el
   mismo. Si algún día se cierra la web a buscadores, el `<title>` español se puede alinear
   con el `h1` sin perder nada.

3. **Tema claro por defecto + oscuro opcional.** Ver la ficha de diseño de arriba. Detalles
   de implementación:
   - Botón de tema en la cabecera de **las seis páginas**, dentro de `.acciones-cabecera`.
   - Cada HTML lleva en el `<head>` un `<script>` de 8 líneas que aplica el tema **antes de
     pintar**. Es la **única excepción** a la regla de "todo el JS va en `js/script.js`", y
     existe porque `script.js` va con `defer`: sin esto, quien tenga el modo oscuro activado
     vería medio segundo de pantalla blanca al abrir. ⚠ La clave `dp_tema_v1` está duplicada
     ahí y en `CFG.TEMA_KEY`: si se cambia, cambiarla en los dos sitios.
   - El tema **solo se guarda cuando el usuario pulsa el botón**, no en cada carga.
   - `<meta name="theme-color">` se actualiza junto con el tema, y `color-scheme` hace que las
     barras de scroll del navegador acompañen.
   - `dp_tema_v1` quedó **declarada en `cookies.html` y en `privacidad.html`**. Cualquier clave
     nueva de almacenamiento hay que declararla ahí: es obligación legal, no un detalle.

4. **Público corregido en todo el proyecto** (ver la sección "PARA QUIÉN ES" arriba) y **correo
   real puesto**: `web@doradoplaza.com` en los pies de las seis páginas, en el cuerpo de
   `privacidad.html` y `terminos.html`, en el JSON-LD (`Organization.email` + `contactPoint`)
   y en `llms.txt`.

5. **El pie volvió a `--fondo`** y la última sección sigue siendo `bloque--alt`, así que el
   ritmo claro/oscuro se mantiene hasta abajo.

### Tercera revisión (9 sep 2026) — aviso de última actualización y cierre de pendientes

1. **Aviso de última actualización.** Lo pidió JX: un panel que entra **por la derecha** en
   cuanto llega la tasa, con la **fecha de vigencia**, la **hora exacta de la consulta** y una
   línea que confirma que ese es el dato más reciente. **Se cierra solo a los 10 segundos.**
   - Archivos: `.aviso-tasa*` en `css/styles.css`, bloque 9 de `js/script.js`, y el `<aside
     id="aviso-tasa">` de `index.html` y `en/index.html` (solo las páginas del conversor).
   - **El texto cambia según la fuente**, igual que la píldora: con la TRM oficial dice «Estás
     viendo la TRM más reciente publicada en Colombia»; con el respaldo de mercado o con la
     caché dice que la fuente oficial no respondió. Decir «la más reciente» cuando el dato
     salió del respaldo sería mentir, y esa es la regla número uno del proyecto.
   - **La hora va congelada**, no corre. Es un sello de «a qué hora se consultó». El reloj que
     corre segundo a segundo es el de debajo de la píldora, y son cosas distintas.
   - **No lleva `aria-live` ni `role="status"`** a propósito: la píldora del hero ya anuncia lo
     mismo y se oiría dos veces seguidas.
   - La cuenta atrás se **congela con el puntero encima o el foco dentro**. Sin eso el aviso se
     cerraría en la cara de quien lo está leyendo, y si el foco estaba en el botón de cerrar se
     perdería a mitad de la navegación por teclado.
   - En móvil entra desde arriba y ocupa el ancho; desde 700px se va a la derecha (340px).
   - ⚠ Los 10 s están en **dos sitios**: `CFG.AVISO_MS` y la animación `.aviso-tasa__barra`
     del CSS (la barrita dorada es la cuenta atrás visible). Si se cambia uno, cambiar el otro.

2. **El consentimiento de cookies ahora caduca de verdad a los 12 meses.**
   `cookies.html` prometía 12 meses pero el código lo guardaba en `localStorage` sin fecha, o
   sea para siempre. Ahora se guarda `{v, t}` con sello de fecha y `leerDecision()` lo caduca a
   los `CFG.CONSENT_DIAS` (365), tras los cuales el banner vuelve a salir. Un texto legal que
   promete un plazo que el código no cumple es un incumplimiento, no un detalle.

3. **Corregidas las duraciones de `dp_idioma_v1` y `dp_tema_v1`** en `cookies.html`: decían
   «12 meses» y en realidad duran hasta que se borren los datos del navegador. Ahora lo dice.
   `dp_tasa_v1` ya era correcto (24 h) y `dp_cookies_v1` pasó a serlo con el punto 2.

4. **Datos de la empresa completados** en las dos legales y el JSON-LD (ver la sección de
   pendientes). Las tres páginas legales pasaron a «Última actualización: 9 de septiembre
   de 2026».

5. **Google Analytics retirado por completo, y con él el banner de cookies.** Decisión de JX:
   siendo una herramienta interna para cuatro áreas, la analítica no aportaba y obligaba a
   pedir consentimiento previo. Al quitarla, la web **no recoge ningún dato**, así que no hay
   nada que consentir y el banner sobraba.
   - Se fue: `cargarAnalytics()`, `evento()` y todas sus llamadas, `iniciarCookies()`,
     `CFG.GA_ID`, `CFG.COOKIE_KEY`, `CFG.CONSENT_DIAS`, la clave `dp_cookies_v1`, todo el CSS
     `.cookies*`, el `<aside>` del banner en las seis páginas, el botón «Configuración de
     cookies» del pie y la clase `js-salida-hotel`.
   - Se reescribieron `cookies.html` (ahora explica que no hay cookies y qué guarda el
     navegador) y `privacidad.html` (ahora dice que no se recoge ningún dato; se renumeraron
     sus apartados de 9 a 8).
   - Quedan solo tres claves de `localStorage`, todas funcionales: `dp_idioma_v1`,
     `dp_tema_v1` y `dp_tasa_v1`.
   - ⚠ **Si JX quiere analítica en el futuro, no basta con volver a meter el script**: hay que
     reponer el banner, la clave con su caducidad y reescribir las dos legales. Cargar
     analítica sin consentimiento previo es incumplir la Resolución 32.126.

6. **Dominio definitivo:** `https://hotel.doradoplaza-convertidor.workers.dev/`
   Sustituido en las 30 URL de `index.html` y `en/index.html` y en `robots.txt`.
   ⚠ Es Cloudflare **Workers**, no Pages. Workers sí lee `_headers`, pero solo si se despliega
   como *Worker con static assets* y el archivo está dentro de la carpeta de assets. Está
   explicado en el propio `_headers`, con el `curl` para comprobarlo tras publicar.

7. **Toda la web pasó a `noindex`** (decisión de JX: es interna).
   - `noindex, follow` en las seis páginas, más la cabecera `X-Robots-Tag` en `_headers`.
   - **Retirados `sitemap.xml` y `llms.txt`**, y con ellos la línea `Sitemap:` de `robots.txt`
     y las etiquetas `<link rel="sitemap">`.
   - `robots.txt` reescrito. ⚠ **No lleva `Disallow: /` para los buscadores a propósito**, y
     eso no es un descuido: un `Disallow` impediría que Google entrara a leer el `noindex`, y
     entonces la URL podría acabar indexada igual desde un enlace externo, sin forma limpia de
     retirarla. A los bots de IA sí se les bloquea, porque no obedecen `noindex` y robots.txt
     es el único mecanismo que respetan.
   - **El Open Graph se conserva**: no sirve para posicionar (eso lo corta el `noindex`), sino
     para que el enlace se vea decente cuando alguien del hotel lo comparte por chat o correo.
     La imagen sigue en WebP, sin excepción de JPG: decisión de JX del 9 sep 2026.

### Cadena de respaldo de la tasa (decisión de diseño importante)

```
TRM oficial (datos.gov.co)
      ↓ si falla
Tasa de mercado (open.er-api.com)   → se avisa en pantalla: "Tasa de mercado"
      ↓ si falla
Última tasa guardada (localStorage) → se avisa: "último dato guardado del …"
      ↓ si no hay
Mensaje de error claro, sin inventar ningún número
```

**Por qué así**: la herramienta nunca debe mostrar una cifra sin decir de dónde salió, y nunca
debe quedarse en blanco si una API se cae.

---

## ⚠️ Pendientes `{POR CONFIRMAR}`

Ninguno inventado. Todos deben completarse antes de publicar:

**Ya no queda ningún `{POR CONFIRMAR}` en el código.** Los cuatro que había se cerraron el
9 de septiembre de 2026:

| Dato | Cómo se cerró |
|---|---|
| **Dominio definitivo** | `https://hotel.doradoplaza-convertidor.workers.dev/` (lo dio JX). |
| **Measurement ID de GA4** | Ya no aplica: se retiró toda la analítica. |
| **Razón social / NIT / Dirección** | Buscados en registros públicos y contrastados en dos fuentes (ver abajo). |
| **Correo de contacto** | `web@doradoplaza.com` (resuelto el 5 sep). |

✅ **Resuelto el 9 sep 2026** — los datos de la empresa ya no están pendientes. Se buscaron en
registros públicos y se contrastaron en dos fuentes independientes (La República / RUES e
InformaColombia):

| Dato | Valor |
|---|---|
| Razón social | Hoteles Dorado Plaza Colombia S.A.S. |
| NIT | 901.403.268-5 (el dígito de verificación se calculó y coincide con el publicado) |
| Dirección | Avenida San Martín (Carrera 2) N.º 4-41, Bocagrande, Cartagena de Indias, Bolívar |

Puestos en: `privacidad.html` (responsable del tratamiento), `terminos.html` (quién ofrece la
herramienta y titular de la marca), `llms.txt` y el JSON-LD `Organization` de las dos páginas
del conversor (`legalName`, `taxID` y `address`).

⚠️ **Falta que el cliente los ratifique por escrito.** Son datos de directorios públicos, no del
certificado de existencia y representación. Dos cosas concretas que confirmar: (1) uno de los
directorios muestra el estado RUES como «cancelado», que suele ser matrícula no renovada pero
hay que descartarlo; (2) si la sede de Barranquilla factura con otro NIT, el responsable del
tratamiento podría no ser esta sociedad. **No publicar las páginas legales sin ese visto bueno.**

✅ **Resuelto el 5 sep 2026** — el correo de contacto ya no está pendiente:
`web@doradoplaza.com` (Ejecutiva Comercial), puesto en los pies de las seis páginas, en el
cuerpo de `privacidad.html` y `terminos.html`, en el JSON-LD y en `llms.txt`.

⚠️ **Decisión pendiente de JX, no técnica**: siendo una herramienta **interna**, hoy está
igualmente **indexable** en Google (tiene `robots.txt` abierto, `sitemap.xml`, Open Graph y
`llms.txt` para bots de IA). Si JX quiere que sea solo para el personal, hay que poner
`noindex` y retirar sitemap/llms/OG. No se tocó porque nadie lo pidió.

---

## 🔧 Decisiones tomadas y por qué

- **TRM oficial como fuente principal**: es la tasa que rige para facturar en Colombia y la que
  le sirve al huésped que va a pagar. La de mercado quedó como respaldo. Lo decidió JX.
- **"Tiempo real" honesto**: la TRM cambia una vez por día hábil; no existe fuente gratuita
  minuto a minuto. La herramienta consulta en cada carga y muestra la fecha del dato. Esto se
  le explicó a JX antes de construir.
- **Sin librerías externas**: vanilla puro. El gráfico es SVG generado a mano.
- **Sin mapa ni WhatsApp**: decisión explícita de JX (es una herramienta, no una pieza de venta).
- **Sin crédito de JX Company**: JX lo pidió expresamente para este proyecto.
- **Páginas legales solo en español**: es la versión con validez legal en Colombia. Se enlazan
  desde las dos versiones, y en la inglesa se avisa que están en español.
- **El español siempre es la entrada**: no hay redirección automática por idioma del navegador.
  El botón EN es la única forma de llegar al inglés.

---

## 🧪 Cómo se probó

Se montó un banco de pruebas en Node con un DOM simulado (`js/script.js` se ejecuta tal cual)
y se verificaron estos escenarios:

- Conversión USD→COP y COP→USD con tasa conocida.
- Entradas con coma, con punto, con separador de miles, vacías y con texto basura.
- Fecha correcta (sin el desfase de zona horaria que muestra el día anterior).
- Fuente oficial caída → entra el respaldo de mercado y se avisa.
- Las dos APIs caídas con dato guardado → sigue funcionando y avisa que el dato es viejo.
- Todo caído y sin caché → mensaje de error, sin inventar cifras.
- Banner de cookies: GA4 **no** se carga antes de aceptar; sí se carga después (probado con un
  ID de prueba).

En la revisión del **5 sep 2026** se volvió a probar el parser de montos con 23 casos
(`1,5`, `1.5`, `1.500`, `1,500`, `10.000`, `1.500.000`, `1.234,56`, `1,234.56`, `0.500`, `.5`,
`2,5000`, espacios, texto basura, negativos): 23/23 correctos. Además se validó que el JSON-LD
de las dos páginas siga siendo JSON válido tras quitar el `FAQPage`, que `site.webmanifest` sea
JSON válido, que `sitemap.xml` sea XML válido, y que las etiquetas HTML de las seis páginas
cierren bien.

**Lo que NO se pudo probar aquí**: el render visual, porque el entorno no tiene navegador.
Queda pendiente que JX lo abra y revise en pantalla real (ver checklist del README).
