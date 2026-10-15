# Vitrina — ecommerce estático

Sitio multipágina en español, preparado para hosting estático. Incluye portada, catálogo, detalle, carrito, cuenta, formulario para vendedores y página 404. Abre `index.html` o publica el contenido de esta carpeta.

## Publicar

1. Descomprime `Ecommerce-hosting.zip` o abre esta carpeta.
2. Sube **todo el contenido** de `Ecommerce` a la carpeta pública del hosting (`public_html`, `www` o equivalente).
3. Confirma que `index.html` quede en la raíz del dominio. `assets/`, `Clothes/`, `Perfume/` y `Tecnology/` también deben quedar en esa raíz.
4. Abre el dominio y prueba navegación, imágenes y enlaces en móvil.

No hace falta configurar Node.js para publicar: CSS y JavaScript compilados ya están incluidos. Para editar estilos, instala dependencias con `npm install` y ejecuta `npm run build`.

## Estado de las funciones

La búsqueda y los filtros del catálogo funcionan sobre los productos de muestra. El menú, galería, controles visuales y favoritos tienen mejoras de interacción. El registro, acceso de demostración, panel del vendedor y publicaciones se guardan localmente en el navegador para probar la experiencia; no crean cuentas compartidas ni sincronizan productos entre dispositivos. La autenticación y publicación de producción requieren backend, almacenamiento de imágenes y configuración del negocio. El carrito persistente, inventario, pagos, pedidos, correo y políticas comerciales aún requieren integración; este paquete no procesa compras ni datos personales. Los productos, imágenes, precios, vendedores, reseñas y políticas visibles son de demostración.

Antes de vender, reemplaza el contenido de demostración, configura un backend con autenticación y base de datos, almacenamiento de imágenes y pasarela de pago, revisa privacidad y términos, y prueba el flujo de pedidos en un entorno seguro. No uses este acceso local para cuentas reales ni cargues datos personales sensibles.

La hoja de ruta para convertir esta demostración en una tienda real está en [README-FASES.md](README-FASES.md).

## Hosting compatible

Funciona en hosting compartido con soporte para archivos estáticos o servicios como GitHub Pages, Netlify y Cloudflare Pages. No depende de rutas de servidor ni de un proceso de compilación durante el despliegue.
