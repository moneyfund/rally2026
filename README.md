# Rally 2026 — Del hobby al negocio

Primera versión de una plataforma digital enfocada en visibilizar las habilidades, servicios y emprendimientos de jóvenes y emprendedores en Nicaragua.

## Propósito

Rally conecta dos públicos:

1. **Talento y emprendimientos** que necesitan una vitrina digital para mostrar qué hacen, dónde están y cómo pueden ser contactados.
2. **Empresas, clientes y personas** que buscan talento, servicios, proveedores o colaboradores locales.

La experiencia está diseñada para evolucionar hacia un sistema de promoción y descubrimiento con perfiles, ubicación, reputación, búsqueda, contacto y herramientas de crecimiento.

## Primera versión

Esta entrega incluye:

- Landing profesional en blanco y azul marino.
- Diseño responsive para escritorio, tablet y móvil.
- Animaciones y microinteracciones.
- Buscador de talento y servicios.
- Filtros por categorías.
- Perfiles demostrativos de distintos departamentos de Nicaragua.
- Vista detallada de perfiles.
- Mapa conceptual interactivo con perfiles ubicados por zona.
- Flujo inicial para crear perfil como talento o negocio.
- Sección enfocada en empresas que buscan talento.
- Estructura preparada para conectar Firebase y desplegar en Vercel.

> Los datos de perfiles actuales son ficticios y se utilizan únicamente para prototipar la experiencia.

## Stack

- Next.js (App Router)
- React
- TypeScript
- CSS nativo con sistema de diseño propio
- Lucide React para iconografía

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Próxima etapa sugerida

### Firebase

- Firebase Authentication para registro e inicio de sesión.
- Firestore para perfiles, negocios, categorías, favoritos y contactos.
- Firebase Storage para fotografías, logos y portafolios.
- Roles iniciales: `talent`, `business`, `admin`.

### Perfil real

- Foto o logo.
- Nombre y descripción.
- Habilidades/categorías.
- Departamento y municipio.
- Ubicación aproximada para el mapa.
- Portafolio de imágenes.
- Redes sociales y contacto.
- Estado de disponibilidad.
- Verificación y reputación.

### Descubrimiento

- Búsqueda real sobre Firestore.
- Filtros por ubicación, categoría y disponibilidad.
- Mapa con proveedor geográfico real.
- Favoritos y perfiles guardados.
- Ranking/recomendaciones.

### Empresas

- Cuenta empresarial.
- Búsqueda avanzada de talento.
- Solicitudes de contacto.
- Publicación de oportunidades o necesidades.
- Listas de candidatos/proveedores favoritos.

## Variables de entorno

Copiar `.env.example` a `.env.local` cuando se creen las credenciales de Firebase y del proveedor de mapas.

## Diseño

La identidad visual base utiliza blanco, azul marino y azules secundarios. Los estilos se concentran en `app/globals.css` para que el sistema visual pueda evolucionar rápidamente durante el desarrollo del reto.
