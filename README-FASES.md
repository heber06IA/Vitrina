# Vitrina: fases de maduración

Hoja de ruta para llevar Vitrina de una demostración estática (HTML, Bootstrap 5.3 con Sass y JavaScript puro) a un ecommerce y marketplace listo para operar con clientes reales.

Cada fase tiene un **objetivo**, sus **tareas** y un **criterio de salida**. Una fase se considera terminada cuando se cumple su criterio de salida, no cuando se acaban las tareas. Las fases se recorren en orden. Dentro de una fase, las tareas pueden avanzar en paralelo.

| Fase | Nombre | Resultado |
|---|---|---|
| 1 | Demo estática | ✅ Sitio navegable con datos de muestra (estado actual) |
| 2 | Base técnica | Repositorio, calidad de código y build confiables |
| 3 | Frontend funcional | Catálogo, producto y carrito dinámicos sin backend |
| 4 | Backend y datos | Cuentas, productos e imágenes reales en la nube |
| 5 | Comercio | Pedidos, pagos, inventario y correos |
| 6 | Marketplace | Vendedores verificados, comisiones y reseñas |
| 7 | Producción | Seguridad, legal, monitoreo y lanzamiento |
| 8 | Crecimiento | SEO, analítica, PWA y mejoras continuas |

---

## Fase 1: Demo estática ✅ (estado actual)

**Objetivo:** mostrar la experiencia completa de compra y venta sin infraestructura.

Ya existe:

- [x] Páginas `index`, `product`, `cart`, `account`, `sell`, `seller` y `404`.
- [x] Bootstrap 5.3.8 personalizado con Sass (`scss/`), con el CSS compilado incluido en `assets/css/main.css`.
- [x] `assets/js/main.js`: menú móvil, galería, selectores de cantidad, favoritos visuales, búsqueda y filtros por URL, y avisos en los formularios de demostración.
- [x] `assets/js/marketplace.js`: registro e inicio de sesión locales (`localStorage` y `sessionStorage`), roles de comprador y vendedor, y publicación de artículos por parte de los vendedores.
- [x] Publicación en hosting estático (ver `README-HOSTING.md`).

Limitaciones conocidas:

- Los productos están escritos a mano en el HTML. Agregar uno nuevo obliga a editar varias páginas.
- El carrito, los cupones y el boletín no funcionan.
- Las cuentas y los productos solo existen en el navegador de cada persona.

---

## Fase 2: Base técnica

**Objetivo:** que el proyecto se pueda modificar sin miedo a romperlo.

### Control de versiones
- [ ] `git init`, `.gitignore` (`node_modules/`, `.env`, `*.zip`) y un primer commit.
- [ ] Repositorio remoto (GitHub o GitLab) con una rama `main` protegida.
- [ ] Convención de commits (por ejemplo, Conventional Commits).

### Calidad de código
- [ ] Prettier para formatear HTML, SCSS, JS y MD.
- [ ] ESLint para el JavaScript y Stylelint para el SCSS.
- [ ] Script `npm run lint` que ejecute los tres.
- [ ] Separar en varias líneas el código compactado de `marketplace.js` y de `seller.html`.

### Sass
- [ ] Migrar de `@import` a `@use`/`@forward`. Hoy el build oculta esas advertencias con `--silence-deprecation=import`, y `@import` dejará de funcionar en Dart Sass 3.
- [ ] Revisar las advertencias de `color-functions` y `global-builtin` en lugar de silenciarlas.

### JavaScript
- [ ] Convertir los scripts en módulos ES (`<script type="module">`), con un módulo por responsabilidad: `storage`, `auth`, `catalog`, `cart` y `ui`.
- [ ] Primeras pruebas con `node --test`. El script `npm test` ya existe, pero todavía no hay pruebas. Conviene empezar por las funciones puras: filtros, ordenamiento y formato de precios.

### Integración continua
- [ ] Un workflow de CI que en cada push ejecute `npm ci`, `npm run lint`, `npm test` y `npm run build`.

**Criterio de salida:** el código vive en git, la CI pasa en verde y el build no se apoya en advertencias silenciadas.

---

## Fase 3: Frontend funcional (sin backend)

**Objetivo:** que toda la experiencia del comprador funcione en el navegador, con los datos separados del HTML. El sitio se sigue publicando en un hosting estático.

### Catálogo basado en datos
- [ ] Crear `data/products.json` con `id`, `slug`, `title`, `category`, `price`, `currency`, `images[]`, `variants[]`, `stock`, `seller` y `description`.
- [ ] Generar las tarjetas de `index.html` desde ese JSON.
- [ ] Hacer `product.html` dinámico con `?id=`, para que una sola plantilla sirva a todos los productos.
- [ ] Cambiar los filtros de `main.js` para que trabajen sobre los datos. Hoy leen el texto de las tarjetas y obtienen el precio con una expresión regular.
- [ ] Unificar los productos de la comunidad (`vitrina.products.v1`) con el catálogo base.

### Carrito
- [ ] Botón "Agregar al carrito" en el producto, con variante y cantidad.
- [ ] Carrito persistente en `localStorage` (`vitrina.cart.v1`).
- [ ] `cart.html` dinámico: líneas, cantidades, eliminación, subtotal, envío estimado y total.
- [ ] Contador del carrito en el encabezado.
- [ ] Validación de cupones con una lista local de demostración.

### Favoritos
- [ ] Guardar los favoritos en `localStorage` y agregar una vista "Mis favoritos".

### Experiencia, accesibilidad y rendimiento
- [ ] Estados de carga, de lista vacía y de error en cada lista.
- [ ] Imágenes en WebP o AVIF, `srcset` y `loading="lazy"`.
- [ ] Auditoría con Lighthouse y axe con una meta de 90 o más en Rendimiento, Accesibilidad, Buenas prácticas y SEO.
- [ ] Metadatos por página: `title`, `description`, Open Graph y `schema.org/Product`.

**Criterio de salida:** un comprador puede buscar, filtrar, ver un producto, agregarlo al carrito y ver el total correcto. Agregar un producto nuevo solo requiere editar `products.json`.

---

## Fase 4: Backend y datos

**Objetivo:** que las cuentas, los productos y las imágenes sean reales y estén compartidos entre todos los dispositivos.

### Decisión de arquitectura

**Recomendación: Supabase** (PostgreSQL, Auth, Storage y Row Level Security). Permite conservar el frontend estático, no exige administrar servidores y tiene un plan gratuito para desarrollo.

**Alternativa:** una API propia con Node.js (Express o Fastify) y PostgreSQL, publicada en Render o Railway. Da más control a cambio de más mantenimiento.

- [ ] Registrar la decisión elegida y sus motivos en `docs/decisiones.md`.

### Modelo de datos
- [ ] `profiles`: id, nombre, rol (`buyer` o `seller`) y fecha de alta.
- [ ] `stores`: tienda del vendedor, con nombre, slug, descripción y estado.
- [ ] `products`: tienda, título, slug, descripción, categoría, precio en centavos, moneda, estado (`draft`, `active` o `archived`) y fechas.
- [ ] `product_images` y `product_variants` (talla, color o presentación, con su SKU y su stock).
- [ ] `categories`.
- [ ] `carts` y `cart_items` para el carrito de usuarios con sesión.

### Autenticación
- [ ] Reemplazar el registro y el inicio de sesión de `marketplace.js` por el proveedor de autenticación. Ninguna contraseña debe hashearse ni guardarse en el cliente.
- [ ] Verificación de correo, recuperación de contraseña y cierre de sesión.
- [ ] Reglas de acceso (RLS): cada vendedor solo puede editar los productos de su tienda.

### Imágenes
- [ ] Subir las imágenes a Storage en lugar de guardarlas en base64 en `localStorage`.
- [ ] Validar el tipo y el tamaño en el servidor y generar miniaturas.

### Migración del frontend
- [ ] Una capa `api/` en el JavaScript que oculte si los datos vienen de `products.json` o del backend.
- [ ] Al iniciar sesión, fusionar el carrito local con el del servidor.
- [ ] Variables de entorno (`.env`) fuera de git. En el cliente solo debe quedar la clave pública.

**Criterio de salida:** una persona se registra en su teléfono, publica un producto con foto y otra persona lo ve desde otra computadora. No queda nada sensible en `localStorage`.

---

## Fase 5: Comercio

**Objetivo:** cobrar y entregar pedidos reales.

### Pedidos
- [ ] Tablas `orders`, `order_items` y `addresses`. Los ítems guardan una copia del precio y del título al momento de la compra.
- [ ] Estados del pedido: `pending` → `paid` → `shipped` → `delivered` y `cancelled`/`refunded`.
- [ ] Checkout con dirección, método de envío y resumen del pedido.
- [ ] Historial de pedidos en `account.html`.

### Pagos
- [ ] Pasarela con soporte para MXN: **Mercado Pago** o **Stripe** (tarjeta, OXXO y SPEI).
- [ ] Hacer el cobro desde el servidor. El cliente nunca debe decidir el monto.
- [ ] Webhook de confirmación de pago que sea idempotente.
- [ ] Pruebas completas en el modo sandbox de la pasarela.

### Inventario
- [ ] Reservar o descontar el stock al confirmar el pago, dentro de una transacción.
- [ ] Bloquear la compra de productos agotados y avisar al vendedor cuando el stock esté bajo.

### Envíos e impuestos
- [ ] Tarifas de envío fijas por zona en una primera etapa. Más adelante, integración con una paquetería.
- [ ] Mostrar los precios con IVA incluido.
- [ ] Evaluar la facturación electrónica (CFDI) por medio de un PAC si se va a facturar.

### Correos transaccionales
- [ ] Un proveedor de correo (Resend, SendGrid o similar) con dominio verificado (SPF y DKIM).
- [ ] Correos de bienvenida, confirmación de pedido, pago recibido, envío y recuperación de contraseña.

**Criterio de salida:** una compra real de prueba (con un monto mínimo) recorre todos los estados: pago, descuento de stock, correos enviados y pedido visible para el comprador y para el vendedor.

---

## Fase 6: Marketplace

**Objetivo:** que terceros puedan vender con reglas claras.

- [ ] Alta del vendedor con datos fiscales, cuenta bancaria y aceptación de términos (`sell.html`).
- [ ] Verificación y aprobación de tiendas por parte de un administrador.
- [ ] Panel del vendedor (`seller.html`) con edición de productos, variantes, stock, pedidos y cambio de estado de los envíos.
- [ ] Comisiones y pagos a vendedores mediante **Stripe Connect** o **Mercado Pago Marketplace**.
- [ ] Panel de administración con moderación de productos, usuarios, reportes y reembolsos.
- [ ] Reseñas y calificaciones que solo puedan dejar quienes compraron el producto.
- [ ] Página pública de cada tienda.

**Criterio de salida:** un vendedor externo se registra, es aprobado, vende y recibe su pago menos la comisión, sin intervención manual.

---

## Fase 7: Producción

**Objetivo:** operar con seguridad y cumpliendo la ley.

### Seguridad
- [ ] HTTPS obligatorio y encabezados de seguridad: CSP, HSTS, `X-Content-Type-Options` y `Referrer-Policy`.
- [ ] Revisión de reglas RLS y permisos, y protección CSRF y XSS (el código ya usa `textContent`; hay que mantenerlo así).
- [ ] Límites de peticiones en el inicio de sesión, el registro y el checkout. Captcha si hace falta.
- [ ] Auditoría de dependencias (`npm audit`, Dependabot).
- [ ] Respaldos automáticos de la base de datos con una prueba de restauración.

### Legal (México)
- [ ] Aviso de privacidad conforme a la LFPDPPP.
- [ ] Términos y condiciones, política de devoluciones, envíos y garantías (PROFECO).
- [ ] Datos de contacto y razón social visibles.
- [ ] Aviso de cookies si se usa analítica.

### Operación
- [ ] Dominio propio, entornos separados de `staging` y `production`, y despliegue automático desde `main`.
- [ ] Monitoreo de errores (Sentry o similar) y de disponibilidad.
- [ ] Reemplazar todo el contenido de demostración: productos, imágenes, reseñas y vendedores.
- [ ] Retirar o actualizar los avisos de "demostración" (`data-demo-form` y `README-HOSTING.md`).

**Criterio de salida:** una checklist de lanzamiento revisada y firmada, más una semana en `staging` sin errores críticos.

---

## Fase 8: Crecimiento

**Objetivo:** mejorar la conversión y la retención.

- [ ] Analítica de embudo: visita → producto → carrito → pago.
- [ ] SEO: sitemap, URLs amigables (`/producto/mi-producto`), datos estructurados y blog o guías.
- [ ] Búsqueda avanzada con tolerancia a errores de escritura y facetas (Postgres full-text, Meilisearch o Algolia).
- [ ] PWA: instalable, con caché del catálogo y notificaciones.
- [ ] Boletín real, cupones administrables y carritos abandonados.
- [ ] Recomendaciones ("también te puede gustar").
- [ ] Evaluar un framework (Astro o Next.js) si el número de páginas y la interactividad lo justifican.

---

## Cómo trabajar esta hoja de ruta

1. Convierte cada casilla en un issue y agrúpalas en un tablero por fase.
2. Marca `[x]` aquí al cerrar cada tarea para que este documento refleje el estado real.
3. No empieces una fase sin cumplir el criterio de salida de la anterior, salvo para investigar o hacer prototipos.
4. Al cerrar una fase, actualiza `README-HOSTING.md` con lo que cambió en la publicación.
