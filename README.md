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
├── _headers            ← cache y seguridad (Cloudflare)
├── robots.txt          ← indexación (ver la nota de abajo)
├── site.webmanifest    ← nombre e iconos si se guarda en el celular
├── .gitignore          ← qué no se sube al repositorio
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

## Cómo publicarlo

**Dirección actual:** <https://hotel.doradoplaza-convertidor.workers.dev/>
**Repositorio:** <https://github.com/Ejecutiva-Comercial/convertidor-dorado-plaza>

El sitio vive en **Cloudflare Workers** (no en Pages) y se publica desde GitHub. Con el
repositorio conectado a Cloudflare, el flujo del día a día es solo esto:

```bash
git add -A
git commit -m "Descripción corta de lo que se cambió"
git push
```

Cloudflare detecta el `push` y publica solo. No hay que subir archivos a mano.

### ⚠️ Lo único delicado del despliegue: el archivo `_headers`

`_headers` es lo que pone el control de caché, las cabeceras de seguridad y el `noindex`.
Cloudflare Workers **sí** lo lee, pero solo si se cumplen dos condiciones:

1. El proyecto se despliega como **Worker con static assets** (no como Worker de solo código).
2. El archivo `_headers` está **dentro de la carpeta de assets** que declara la configuración.

Si algo de eso falla, Cloudflare lo ignora **en silencio**: la web se ve perfecta, pero se
pierden el `noindex`, el HSTS y el control de caché sin ningún aviso. Para comprobarlo después
de publicar, desde una terminal:

```bash
curl -I https://hotel.doradoplaza-convertidor.workers.dev/
```

En la respuesta tienen que aparecer `x-robots-tag` y `x-content-type-options`. Si no están, el
`_headers` no se está aplicando.

### Si algún día cambia el dominio

Buscar y reemplazar `hotel.doradoplaza-convertidor.workers.dev` en:

1. `index.html` — `canonical`, `og:url`, `hreflang` y el JSON-LD.
2. `en/index.html` — lo mismo.
3. `robots.txt` y el ejemplo de `curl` dentro de `_headers`.

### Otros hostings

- **Cloudflare Pages / Netlify**: funcionan igual, mismo formato del archivo `_headers`.
- **GitHub Pages**: funciona, pero ignora `_headers` (se perderían caché, `noindex` y seguridad).
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

## Analítica: no hay, y es a propósito

Esta herramienta **no lleva Google Analytics ni ninguna otra medición**. Se retiró el 9 de
septiembre de 2026 por decisión de JX: siendo un instrumento interno para cuatro áreas del
hotel, la analítica no aportaba y obligaba a pedir consentimiento de cookies.

La consecuencia buena es que **la web no recoge ningún dato**: no hay cookies, no hay
identificadores, no hay seguimiento. Por eso tampoco hay aviso de cookies que aceptar — no hay
nada que consentir.

Lo único que se guarda es almacenamiento local del navegador, que nunca sale del equipo:
el idioma elegido, el tema claro u oscuro y la última tasa consultada.

> ⚠️ **Si algún día se quiere activar analítica, no basta con pegar el script.** Hay que volver
> a montar el aviso de consentimiento con sus dos botones, guardar la decisión con caducidad y
> reescribir `privacidad.html` y `cookies.html`. En Colombia, cargar analítica sin autorización
> previa y expresa incumple la Resolución 32.126 de 2022 de la SIC. Pedirlo y se hace bien.

---

## Buscadores: la web está cerrada a propósito

Siendo una herramienta interna, JX decidió el 9 de septiembre de 2026 que **no aparezca en
Google**. Está hecho así:

- `noindex` en las seis páginas, y además la cabecera `X-Robots-Tag` desde `_headers`.
- Se retiraron `sitemap.xml` y `llms.txt` (servían para lo contrario: para que la encontraran).
- `robots.txt` bloquea a los bots de IA (ChatGPT, Claude, Perplexity y demás).

**Por eso no hay que dar de alta el sitio en Google Search Console.** Y hay un detalle que
parece un error y no lo es: `robots.txt` **no** bloquea a Google. Es deliberado. Un bloqueo ahí
significa «no entres», no «no indexes»: si Google no entra, nunca lee el `noindex` y la
dirección podría acabar apareciendo igual si alguien la enlaza desde fuera. Dejándole entrar,
lee el `noindex` y la retira. Está explicado dentro del propio `robots.txt`.

Si algún día se quiere abrir al público, hay que deshacer los tres puntos de arriba. Avisar.

---

## Datos de la empresa

Ya no queda ningún `{POR CONFIRMAR}` en el proyecto. Los datos publicados son:

| Dato | Valor |
|---|---|
| Razón social | Hoteles Dorado Plaza Colombia S.A.S. |
| NIT | 901.403.268-5 |
| Dirección | Avenida San Martín (Carrera 2) N.º 4-41, Bocagrande, Cartagena de Indias |
| Correo | web@doradoplaza.com (Ejecutiva Comercial) |

⚠️ **Estos datos se tomaron de directorios públicos de registro mercantil, no de un certificado
de existencia y representación.** Aparecen como responsable del tratamiento en la política de
privacidad, así que **conviene que el hotel los ratifique antes de darlos por definitivos**. Dos
cosas concretas que confirmar: que la matrícula mercantil esté vigente (un directorio la muestra
como no renovada) y que la sede de Barranquilla no facture bajo otro NIT.

---

## Revisión antes de publicar

Esto no se pudo verificar en pantalla al construirlo, porque el entorno de desarrollo no tenía
navegador. **Conviene abrirlo y revisar:**

- [ ] La tasa carga y el número aparece en dorado (probar en móvil y en computador).
- [ ] El botón de invertir cambia las etiquetas y el resultado.
- [ ] Escribir `1,5` y `1.5` da lo mismo.
- [ ] La tabla de equivalencias se llena y cambia al invertir.
- [ ] El gráfico de 7 días se dibuja.
- [ ] **El aviso de última actualización** entra por la derecha, muestra la fecha de vigencia y
      la hora exacta, y **se cierra solo a los 10 segundos**. Con el ratón encima no se cierra.
- [ ] **No aparece ningún aviso de cookies** (ya no existe: no hay analítica que consentir).
- [ ] El botón de tema cambia entre claro y oscuro, y al recargar recuerda el elegido.
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
la SIC), pero **no son asesoría legal**. Se recomienda que un abogado los revise antes de darlos
por definitivos, junto con la ratificación de los datos de la sociedad que se menciona arriba.

Las tres páginas se actualizaron el 9 de septiembre de 2026 al retirarse la analítica: ahora
declaran que la herramienta no recoge ningún dato personal. Si algún día vuelve la analítica,
**los tres textos hay que reescribirlos otra vez**.
