# Funcionalidades principales de 4all.tools

4all.tools es un sitio web estático multilingüe construido con Astro. El proyecto combina herramientas web ejecutables en el navegador, contenido editorial, rutas localizadas y una arquitectura orientada a tipos.

## 1. Página principal

- Página de inicio en inglés, español, portugués y francés.
- Estructura para mostrar categorías, herramientas y contenido editorial.
- Inglés sin prefijo (`/`); los demás idiomas usan `/es/`, `/pt/` y `/fr/`.

## 2. JSON Validator

La primera herramienta productiva del proyecto es el JSON Validator. Sus acciones principales son:

- validar JSON;
- detectar errores de sintaxis indicando línea y columna;
- formatear JSON con indentación;
- minificar JSON;
- copiar el contenido al portapapeles;
- limpiar el editor;
- mostrar estados y mensajes localizados.

La lógica se ejecuta completamente en el navegador y las acciones principales no realizan solicitudes de red.

Código principal: `src/features/tools/developer/json-validator/`.

## 3. Internacionalización

El sitio soporta cuatro idiomas:

- inglés (`en`);
- español (`es`);
- portugués (`pt`);
- francés (`fr`).

La internacionalización cubre navegación, mensajes globales, mensajes específicos de las herramientas, contenido editorial, slugs y metadatos SEO.

Ejemplo de rutas localizadas del JSON Validator:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

El sistema no sustituye silenciosamente una traducción ausente por la versión inglesa.

## 4. Sistema de herramientas

Cada herramienta se registra mediante:

- un identificador estable;
- una definición de dominio;
- una categoría raíz y una clasificación taxonómica;
- slugs localizados;
- una estrategia de routing;
- un componente visual;
- mensajes específicos por idioma;
- un estado de publicación.

El registro tipado valida que la definición, el componente y los mensajes pertenezcan a la misma herramienta.

Código principal: `src/features/tools/` y `src/domain/tools/`.

## 5. Taxonomías y categorías

El proyecto mantiene árboles taxonómicos independientes para herramientas y blog.

La taxonomía permite consultar:

- nodos raíz;
- padres e hijos;
- ancestros;
- descendientes;
- rutas conceptuales;
- etiquetas localizadas.

Los nodos de clasificación no generan automáticamente URLs públicas. Una categoría solo se publica cuando existe una definición explícita de ruta y contenido publicado.

Código principal: `src/domain/taxonomy/`.

## 6. Gestión de contenido

El contenido se escribe en Markdown y se carga mediante Astro Content Collections. Existen cuatro colecciones:

- `tools`: contenido editorial de las herramientas;
- `toolCategories`: categorías de herramientas;
- `blog`: artículos;
- `blogCategories`: categorías del blog.

Los esquemas validan el frontmatter, los identificadores, los idiomas, la publicación, las relaciones y los datos SEO.

La capa de consultas también proporciona:

- búsquedas exactas por identificador e idioma;
- índices de contenido publicado;
- detección de contenido duplicado;
- errores explícitos para contenido ausente o ambiguo;
- disponibilidad de contenido para el sistema de routing.

Punto de entrada: `src/content.config.ts`.

## 7. Routing estático y URLs localizadas

El routing genera páginas estáticas para:

- herramientas;
- categorías de herramientas;
- artículos;
- categorías del blog.

El sistema se encarga de:

- construir slugs localizados;
- conservar la identidad estable de cada entidad;
- filtrar contenido no publicado;
- detectar rutas duplicadas o en conflicto;
- respetar namespaces reservados;
- evitar la generación de rutas para traducciones inexistentes.

Las páginas Astro funcionan como adaptadores delgados: obtienen un destino estable, solicitan el modelo de página y delegan el renderizado a un template común.

Código principal: `src/routing/` y `src/pages/`.

## 8. Blog multilingüe

El blog incluye:

- índice general;
- categorías jerárquicas;
- listados de artículos por categoría;
- páginas individuales de artículos;
- contenido localizado en los cuatro idiomas;
- fechas, breadcrumbs y metadatos específicos del artículo.

El contenido actual incluye el artículo “What is JSON?” y las categorías `development` y `json-guides`.

Ejemplos de rutas:

```text
/blog/development/json-guides/what-is-json/
/es/blog/desarrollo/guias-json/que-es-json/
/pt/blog/desenvolvimento/guias-json/o-que-e-json/
/fr/blog/developpement/guides-json/qu-est-ce-que-json/
```

Código principal: `src/templates/composers/blog/`, `src/templates/*Blog*` y `src/content/blog/`.

## 9. SEO

El proyecto centraliza la generación de metadatos SEO, incluyendo:

- título y descripción;
- URL canónica;
- enlaces `hreflang`;
- `x-default`;
- metadatos Open Graph;
- páginas `noindex`;
- reglas de indexabilidad según disponibilidad y publicación.

Las variantes localizadas se agrupan por una identidad estable. El sistema no inventa URLs para idiomas que no tienen una ruta pública.

Código principal: `src/seo/` y `src/components/seo/SeoHead.astro`.

## 10. Navegación y accesibilidad

La interfaz incluye:

- selector de idioma;
- breadcrumbs semánticos;
- estados accesibles para idiomas no disponibles;
- etiquetas para lectores de pantalla;
- navegación estática entre variantes localizadas;
- landmarks HTML como `main` y navegación de breadcrumbs.

Los breadcrumbs enlazan únicamente categorías con rutas públicas explícitas; los nodos meramente clasificatorios se muestran como texto.

Código principal: `src/components/navigation/` y `src/templates/`.

## 11. Layouts y templates reutilizables

El renderizado se organiza mediante layouts y templates compartidos:

- `BaseLayout`: estructura HTML común;
- `HomeTemplate`: página principal;
- `ToolTemplate`: páginas de herramientas;
- `CategoryTemplate`: categorías de herramientas;
- `BlogIndexTemplate`: índice del blog;
- `BlogCategoryTemplate`: categorías del blog;
- `ArticleTemplate`: artículos.

Los composers convierten identidad, contenido, routing y SEO en modelos preparados para esos templates.

## 12. Verificación automatizada

El proyecto incluye varios niveles de pruebas:

- comprobaciones de Astro y TypeScript;
- pruebas unitarias con Vitest;
- pruebas de integración;
- pruebas del output estático generado;
- pruebas de navegador con Playwright;
- validación de rutas, SEO, contenido, accesibilidad y comportamiento del JSON Validator.

La verificación completa se ejecuta con:

```text
npm run verify
```

Este comando ejecuta los checks, las pruebas unitarias y de integración, el build, las pruebas del output estático y las pruebas E2E.

## Alcance actual

Actualmente el JSON Validator es la herramienta productiva implementada. La infraestructura de routing, contenido, taxonomías, SEO, templates y blog está preparada para incorporar más herramientas y contenido sin crear una página específica para cada herramienta.

Los directorios `src/components/`, `src/services/` y `src/server/` permanecen como límites arquitectónicos reservados para futuras funcionalidades compartidas, integraciones o lógica de servidor.
