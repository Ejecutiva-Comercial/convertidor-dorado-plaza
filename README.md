# Convertidor USD ⇄ COP · Hoteles Dorado Plaza

Herramienta web que convierte **dólares estadounidenses a pesos colombianos** y al revés,
usando la **TRM oficial de Colombia**. Sin registro y sin publicidad.

**Para quién es:** las áreas **ejecutiva, comercial, contable y administrativa** del hotel.
Es un instrumento de trabajo interno para facturar, cotizar y cuadrar cuentas con la tasa
oficial del día. **No está dirigida a huéspedes**, y por eso los textos hablan de *montos*
y de *referencia para facturar*, no de "lo que te dan en la casa de cambio".

Disponible en **español** (versión principal) e **inglés**.

---

## Qué hace

- Convierte en los dos sentidos: USD → COP y COP → USD. El botón de invertir **arrastra el resultado**: si convertiste 400.000 pesos, al invertir queda ese mismo monto en dólares listo para la vuelta.
- **Arranca en el sentido que corresponde al idioma**: en español empieza en pesos → dólares, y en inglés en dólares → pesos.
- Consulta la tasa **cada vez que alguien abre la página** y muestra la **fecha completa de vigencia**.
- Muestra la **fecha y la hora exacta de la consulta**, con el reloj corriendo, en **hora de Colombia** aunque el computador esté configurado en otro país. Sirve como respaldo cuando se adjunta una conversión a un soporte contable.
- Tabla de **equivalencias rápidas** con los montos que más se repiten.
- **Historial de los últimos 7 días** con un mini gráfico, para ver si el dólar sube o baja.
- Botón para **copiar el resultado** y pegarlo en un correo o un documento.
- **Modo claro y modo oscuro.** Abre siempre en claro; el botón de la cabecera cambia a oscuro y lo recuerda.
- Funciona **sin conexión** con el último dato guardado, avisando que es un dato viejo.

---

## Los dos modos de color

La web **siempre abre en el modo claro** (blanco con el dorado del logo). Es el modo
principal y no cambia solo, ni siquiera si el computador está configurado en modo oscuro.

Para cambiar al modo oscuro está el **botón redondo de la cabecera**, al lado del selector de
idioma: muestra una **luna** cuando estás en claro y un **sol** cuando estás en oscuro. La
elección **se recuerda** en ese navegador hasta que se borren los datos del sitio.

Al imprimir, siempre sale en blanco y negro, aunque la pantalla esté en oscuro.

---

## De dónde sale la tasa

| Orden | Fuente | Qué es | Cuándo se usa |
|---|---|---|---|
| 1º | **TRM oficial** — [Datos Abiertos Colombia](https://www.datos.gov.co/), dataset `32sa-8pi3` (Superintendencia Financiera) | Tasa de cambio oficial del país, la que usan bancos y empresas para facturar | Siempre que responda |
| 2º | **[ExchangeRate-API](https://www.exchangerate-api.com)** (`open.er-api.com`) | Tasa de mercado internacional | Solo si la oficial no responde |
| 3º | Último dato guardado en el navegador | La última tasa buena que se consultó | Solo si las dos anteriores fallan |

En pantalla siempre se indica **cuál de las tres se está usando** y de qué fecha es el dato.

### Sobre el "tiempo real"

La **TRM cambia una sola vez por día hábil**: no existe una fuente oficial gratuita que se
actualice minuto a minuto. Lo que hace esta herramienta es consultar la fuente **en cada visita**,
así que siempre muestra el valor más reciente publicado. Si algún día se quiere una tasa que
cambie cada hora, hay que contratar un plan pago de un proveedor de datos financieros.

---

## Estructura de archivos

```
convertidor-dorado-plaza/
├── index.html          ← la herramienta en español
├── en/index.html       ← la herramienta en inglés
├── 404.html            ← página de error
├── privacidad.html     ← política de privacidad
├── cookies.html        ← política de cookies
├── terminos.html       ← términos y condiciones
├── _headers            ← cache y seguridad (Cloudflare Pages)
├── robots.txt          ← indexación
├── sitemap.xml         ← mapa para buscadores
├── llms.txt            ← mapa para asistentes de IA
├── site.webmanifest    ← nombre e iconos si se guarda en el celular
├── css/styles.css      ← todos los estilos
├── js/script.js        ← toda la lógica
├── img/                ← logo y og-image en WebP + favicons
├── CLAUDE.md           ← contexto técnico del proyecto
└── README.md           ← este archivo
```

---

## Cómo verlo en el computador

Con **doble clic sobre `index.html`** ya se ve el diseño completo y se puede navegar entre
español, inglés, las páginas legales y la 404. Lo que **no** funciona así es la tasa: el
navegador bloquea las llamadas a las APIs cuando la página se abre como archivo suelto, así
que el número saldrá en error. Para probarlo entero hay que levantar un servidor, que es un
solo comando:

```bash
# Con Python (viene en Mac y Linux; en Windows se instala desde python.org)
cd convertidor-dorado-plaza
python -m http.server 8080
```

Y abrir en el navegador: **http://localhost:8080**

> **Ojo con la carpeta.** El comando hay que ejecutarlo **dentro** de la carpeta que contiene
> `index.html`, no en la carpeta de arriba. Si se ejecuta un nivel más arriba, el sitio se
> sirve en `http://localhost:8080/Convertidor%20Dorado%20Plaza/` y la página 404 se ve sin
> estilos (es la única del proyecto que depende de estar en la raíz).

---

## Cómo publicarlo (Cloudflare Pages)

1. Entrar a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages**.
2. **Upload assets** (o conectar el repositorio de GitHub, que es mejor porque cada cambio se
   publica solo).
3. Subir **el contenido de la carpeta**, no la carpeta comprimida.
4. Cloudflare da una URL tipo `nombre.pages.dev`. Esa es la provisional.
5. Cuando haya dominio propio: **Custom domains** → agregar el dominio → seguir los pasos de DNS.

### ⚠️ Al poner el dominio definitivo hay que actualizarlo en 6 sitios

Hoy todo apunta a `https://convertidor-dorado-plaza.pages.dev`. Buscar y reemplazar esa dirección en:

1. `index.html` — `canonical`, `og:url`, `hreflang` y el JSON-LD.
2. `en/index.html` — lo mismo.
3. `sitemap.xml`
4. `robots.txt` (la línea `Sitemap:`)
5. `llms.txt`
6. Y crear `functions/_middleware.js` para redirigir el `.pages.dev` viejo al dominio nuevo:

```js
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "convertidor-dorado-plaza.pages.dev") {
    url.hostname = "eldominionuevo.com";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
```

⚠️ **Nunca usar `_redirects` con `/*`** como regla general: causa un bucle infinito.

### Otros hostings

- **Netlify**: funciona igual, mismo formato del archivo `_headers`.
- **GitHub Pages**: funciona, pero ignora `_headers` (no habría control de caché).
- **Hostinger / Apache**: hay que traducir el `_headers` a un `.htaccess`.

---

## Qué se puede editar y dónde

Dentro de `index.html` hay **zonas marcadas con comentarios** que se encuentran buscando
`ZONA EDITABLE` con Ctrl+F. Cada una explica qué cambiar, cómo y cuál es el límite.

| Zona | Qué cambia | Archivo | ¿Se repite en otro lado? |
|---|---|---|---|
| `ZONA EDITABLE · TEXTOS` | Título y frase del inicio | `index.html` | Sí — si cambia el mensaje, revisar el `<title>`, la `description` y el `og:title` del `<head>` |
| `ZONA EDITABLE · CONTACTO` | Enlace a `doradoplaza.com` y correo | `index.html` | Sí — también en el JSON-LD y en las tres páginas legales |

**Cómo se hace, paso a paso:**

1. Abrir el archivo con el Bloc de notas, VS Code o directamente en GitHub.
2. Buscar `ZONA EDITABLE` con Ctrl+F.
3. Cambiar **solo el texto que está entre `>` y `<`**. No tocar nada más.
4. Guardar. Si está en GitHub: *Commit changes* y Cloudflare republica solo en 1–2 minutos.

**Lo que NO se toca desde ahí**: las imágenes (las convierte y reemplaza JX, siempre a WebP),
el CSS, el JS y el `<head>`.

### Cambiar la versión en inglés

`en/index.html` no lleva marcadores de zona. Si se cambia un texto en español, hay que cambiar
su equivalente en inglés a mano, en el mismo lugar del archivo.

### Cambiar los montos de las equivalencias rápidas

En `js/script.js`, arriba del todo, dentro de `CFG`:

```js
MONTOS_USD:   [1, 5, 10, 20, 50, 100, 200, 500],
MONTOS_COP:   [10000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000],
```

Son ocho por lista para que la cuadrícula quede pareja (4 columnas × 2 filas en computador).

### Cambiar los colores

Todos están en `css/styles.css`, en el bloque `:root` del principio. Cambiando ahí, cambia toda
la página de una vez. **No poner colores sueltos** en otras partes del archivo.

---

## Google Analytics

El código ya está puesto pero **desactivado**, porque falta el identificador.

**Cómo activarlo:**

1. Entrar a [analytics.google.com](https://analytics.google.com) y crear una propiedad GA4.
2. Copiar el *Measurement ID*, que tiene forma `G-XXXXXXXXXX`.
3. Abrir `js/script.js`, buscar `GA_ID` (está dentro de `CFG`, en las primeras líneas) y
   reemplazar `"{POR CONFIRMAR}"` por el ID entre comillas.
4. Guardar y volver a publicar.

**Importante — cómo funciona el consentimiento:** el script de Google **no se carga** hasta que
el visitante pulse "Aceptar" en el aviso de cookies. Esto no es opcional: la Resolución 32.126 de
2022 de la SIC exige autorización previa y expresa en Colombia. No quitar esa condición.

**Dónde ver el tráfico** (en lenguaje simple): dentro de Analytics, en *Informes → Adquisición*
se ve cuánta gente entró y de dónde llegó (Google, un enlace, directo). En *Informes → Interacción*
se ven las acciones que hace la gente dentro de la herramienta. Están medidas estas cuatro:

| Evento | Qué significa |
|---|---|
| `tasa_cargada` | Se cargó la tasa y desde qué fuente (oficial, mercado o guardada) |
| `invertir_monedas` | Alguien cambió el sentido de la conversión |
| `copiar_resultado` | Alguien copió el resultado |
| `clic_web_hotel` | Alguien salió hacia `doradoplaza.com` |

---

## Google Search Console

Al publicar (y de nuevo si cambia el dominio):

1. Entrar a [search.google.com/search-console](https://search.google.com/search-console).
2. Agregar la propiedad y verificarla.
3. En *Sitemaps*, enviar `sitemap.xml`.
4. **El archivo HTML de verificación que descarga Google no se borra nunca del proyecto.**

---

## Datos que faltan por confirmar

Están marcados en el código como `{POR CONFIRMAR}` y **no se inventó ninguno**:

| Dato | Dónde hay que ponerlo |
|---|---|
| Dominio definitivo | 6 sitios (ver arriba) |
| Razón social | `privacidad.html`, `terminos.html` |
| NIT | `privacidad.html`, `terminos.html` |
| Dirección | `privacidad.html`, `terminos.html` |
| Measurement ID de GA4 | `js/script.js` → `CFG.GA_ID` |

✅ El **correo de contacto** ya está puesto: `web@doradoplaza.com` (Ejecutiva Comercial).

### Una decisión que hay que tomar

Siendo una herramienta **interna**, hoy está igualmente **abierta a Google**: cualquiera puede
encontrarla buscando. Si se prefiere que solo la use el personal, hay que marcarla como no
indexable y quitar el sitemap. Es un cambio de 10 minutos, pero **es una decisión del hotel**,
no técnica, así que se dejó como estaba. Avisar si se quiere cerrar.

---

## Revisión antes de publicar

Esto no se pudo verificar en pantalla al construirlo, porque el entorno de desarrollo no tenía
navegador. **Conviene abrirlo y revisar:**

- [ ] La tasa carga y el número aparece en dorado (probar en móvil y en computador).
- [ ] El botón de invertir cambia las etiquetas y el resultado.
- [ ] Escribir `1,5` y `1.5` da lo mismo.
- [ ] La tabla de equivalencias se llena y cambia al invertir.
- [ ] El gráfico de 7 días se dibuja.
- [ ] El aviso de cookies aparece, y "Rechazar" y "Aceptar" se ven del mismo tamaño.
- [ ] En un teléfono pequeño (380 px) nada se sale ni se corta y no hay scroll horizontal.
- [ ] El botón EN lleva a la versión en inglés y el ES devuelve al español.
- [ ] Las tres páginas legales y la 404 abren bien y se ven con el mismo diseño.
- [ ] La consola del navegador (F12) no muestra errores ni advertencias.
- [ ] Compartir el enlace por WhatsApp y comprobar que sale la imagen de vista previa.
- [ ] Pasar la URL por [PageSpeed Insights](https://pagespeed.web.dev/) y anotar el resultado.
- [ ] Escribir una dirección inventada (por ejemplo `/algoquenoexiste`) y comprobar que la
      página 404 aparece **con estilos y con logo**.
- [ ] Escribir `1.500` y comprobar que da mil quinientos, no uno con cinco.
- [ ] La web abre **en blanco**, aunque el computador esté en modo oscuro.
- [ ] El botón de la luna cambia a oscuro, y al **recargar sigue en oscuro y sin parpadeo blanco**.
- [ ] El botón del sol devuelve a claro, y al recargar sigue en claro.
- [ ] El reloj de la hora **avanza solo** y marca la hora de Colombia.
- [ ] En español el conversor abre en **pesos → dólares**; en inglés, en **dólares → pesos**.
- [ ] El correo `web@doradoplaza.com` abre el gestor de correo al pulsarlo.
- [ ] Revisar los dos modos en las seis páginas (las 2 del conversor, las 3 legales y la 404).

---

## Propiedad

El código fuente, el diseño y el contenido de esta herramienta son **propiedad de Hoteles Dorado
Plaza**. Se entrega completo, sin minificar y listo para editar. La marca y el logotipo son del
cliente.

Los datos de la TRM son información pública del Estado colombiano. Las tasas de respaldo provienen
de ExchangeRate-API y se acreditan en el pie de página, tal como exigen sus condiciones de uso.

---

## Cómo hacer una copia de seguridad

Guardar una copia comprimida de la carpeta completa cada vez que se hagan cambios importantes.
Si el proyecto está en GitHub, el historial ya es la copia de seguridad: cada cambio queda
registrado y se puede volver atrás.

---

## Aviso legal

Los textos de `privacidad.html`, `cookies.html` y `terminos.html` se redactaron siguiendo el
marco colombiano vigente (Ley 1581 de 2012, Decreto 1377 de 2013 y Resolución 32.126 de 2022 de
la SIC), pero **no son asesoría legal**. Se recomienda que un abogado los revise antes de
publicarlos, y completar los datos marcados como `{POR CONFIRMAR}`.
