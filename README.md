# Plantilla Web Interactiva

Plantilla de página única (one-page) con scroll cinematográfico: fondo animado sincronizado con el scroll, galerías animadas, carrusel y formulario de contacto. Lista para personalizar y ofrecer a clientes.

## Cómo verla

```bash
node server.js
# abre http://localhost:8000
```

## Fondos animados (avanzan y retroceden con el scroll)

La plantilla incluye **dos fondos generativos de ejemplo**, dibujados en canvas sin necesidad de imágenes ni video, e intercambiables con el selector flotante "Fondo" (abajo a la derecha):

- **Aurora** — cintas de aurora, orbes de luz y estrellas que titilan. Se personaliza en `drawAuroraFrame()` dentro de `js/app.js` (colores, ondas, orbes).
- **Cosmos** — viaje estelar con efecto túnel: las estrellas avanzan hacia el espectador al bajar y retroceden al subir, con anillos y una nebulosa. Se personaliza en `drawCosmosFrame()`.

Ambos derivan toda su animación del progreso del scroll, así que el movimiento es totalmente reversible. Para crear más variantes basta con añadir otra función de dibujo y un botón al selector (`#bg-switcher` en `index.html`, `renderBackground()` en `js/app.js`).

El modo por defecto se cambia en `js/app.js` → `let bgMode = 'aurora'`.

## Personalización rápida

| Qué | Dónde |
|---|---|
| Título, textos y secciones | `index.html` (busca "TU MARCA", "TU LOGO" y los textos de ejemplo) |
| Fotos de ejemplo | `images/demo_*.jpg` — reemplázalas por las tuyas con el mismo nombre, o cambia las rutas en `index.html` |
| Colores y tipografías | Variables al inicio de `css/style.css` |
| Velocidad del fondo vs. scroll | `js/app.js` → `FRAME_SPEED` |
| Tarjetas de proyectos/servicios | `index.html`, sección `#proyectos` (9 tarjetas con reverso de detalles) |

## Formulario de contacto

El formulario (`#contacto`) valida y confirma el envío localmente. Para envíos reales hay que conectar un servicio (Formspree, email backend, Supabase, etc.) en `initContactForm()` de `js/app.js`.
