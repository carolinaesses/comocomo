# 🤖 Comocomo - IA Completa para WhatsApp

Aplicación web que utiliza **Gemini AI como motor completo** para procesar archivos de exportación de WhatsApp y extraer información nutricional automáticamente.

## 🚀 Características Principales

- **🤖 IA Completa**: Gemini hace TODO el trabajo - desde leer archivos hasta clasificar nutricionalmente
- **🍽️ Análisis Nutricional**: Detecta carbohidratos, proteínas y verduras automáticamente
- **📊 Datos Estructurados**: Convierte conversaciones en datos listos para análisis
- **🗄️ Google Sheets**: Almacenamiento automático en hojas de cálculo
- **🧠 Dos Modos**: Estándar (rápido) y Adaptativo (ultra-inteligente)
- **🥗 Seguimiento de Comidas**: Gestión completa de dieta con scoring automático
- **📅 Calendario de Scores**: Vista mensual con badges de cumplimiento
- **📈 Analytics de Nutrición**: Estadísticas detalladas de hábitos alimenticios

## 🍽️ **Nuevas Funcionalidades: Seguimiento de Dieta**

### Características de Seguimiento
- **Registro de comidas**: Añade comidas manualmente o importa desde JSON
- **Dieta Ideal**: Define objetivos diarios y reglas por tipo de comida
- **Scoring diario**: Calcula puntuaciones basadas en cumplimiento de dieta
- **Calendario**: Vista mensual con badges de scores y detalle por día
- **Resumen**: Estadísticas de cumplimiento de ejes y reglas por comida

### Páginas Principales
- **`/meals`** - Gestión de comidas (listado, filtros, añadir, importar)
- **`/diet`** - Configuración de dieta ideal con toggles y reglas
- **`/calendar`** - Calendario mensual con scores diarios
- **`/summary`** - Dashboard con métricas y estadísticas

### Sistema de Scoring
- **Ejes diarios**: +10 puntos cada uno (carb, protein, veggies) - máx 30
- **Reglas por comida**: +5 puntos por comida que cumple lo esperado - máx 20
- **Bonus variedad**: +10 puntos si dos comidas cubren todos los ejes
- **Penalizaciones**: -10 puntos si ningún eje se cumple
- **Total máximo diario**: 60 puntos

### API Endpoints

#### Meals Management
- `POST /api/meals` - Crear comida individual
- `GET /api/meals?userId=...&from=...&to=...` - Listar comidas por rango
- `POST /api/meals/bulk` - Importar comidas desde JSON array

#### Diet Configuration
- `GET /api/ideal-diet?userId=...` - Obtener dieta ideal actual
- `POST /api/ideal-diet` - Crear/actualizar dieta ideal con reglas

#### Scoring & Analytics
- `POST /api/scoring/recalculate?userId=...&from=...&to=...` - Recalcular scores
- `GET /api/scoring/daily?userId=...&from=...&to=...` - Obtener scores diarios

## 🏗️ Arquitectura

```
🌐 Frontend (Next.js + React)
    ↓
🤖 IA COMPLETA (Gemini) + 🗄️ PostgreSQL (Meals/Scoring)
    ↓
📊 Datos Procesados + 🗄️ Google Sheets (Legacy)
```

La **IA es el corazón completo** de la aplicación, manejando:
- ✅ Lectura y análisis de archivos WhatsApp
- ✅ Identificación de mensajes de comida
- ✅ Extracción de información (usuario, fecha, hora)
- ✅ Análisis nutricional detallado
- ✅ Clasificación por tipo de comida
- ✅ Estandarización de datos
- ✅ Filtrado de mensajes irrelevantes

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copiar el archivo de ejemplo
cp env-example.txt .env.local
```

Contenido completo del archivo `.env.local`:

```env
# 🤖 IA - Motor Principal de la Aplicación
GEMINI_API_KEY=tu_clave_de_gemini_aqui

# 🗄️ Google Sheets - Almacenamiento Legacy
GOOGLE_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_clave_privada_aqui\n-----END PRIVATE KEY-----"
SHEET_ID=tu_id_de_hoja_de_calculo

# 🗄️ PostgreSQL - Nueva Base de Datos
DATABASE_URL=postgresql://usuario:password@host:puerto/database

# 🕐 Zona Horaria - Para normalización de fechas
APP_TZ=America/Argentina/Buenos_Aires
```

### 🗄️ Configuración de Base de Datos

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con base de datos
npm run db:push
```

### 🔧 Configuración MCP (Model Context Protocol)

Si utilizas MCP servers para desarrollo, configura las variables de entorno:

```bash
# Copiar archivo de configuración MCP
cp mcp-config.env.example mcp-config.env

# Ejecutar script de configuración
./setup-mcp.sh
```

### 🔑 Obtener las Claves API

#### Gemini AI (Requerido)
1. Ve a [Google AI Studio](https://ai.google.dev/aistudio)
2. Crea una nueva API Key
3. Cópiala al archivo `.env.local`

#### Google Service Account (Requerido para legacy)
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto (o usa uno existente)
3. Habilita la API de Google Sheets
4. Crea una Service Account
5. Descarga el archivo JSON con las credenciales
6. Copia `client_email` y `private_key` al `.env.local`

#### PostgreSQL Database (Requerido para nuevas funcionalidades)
- **Opción 1**: Neon (recomendado) - https://neon.tech
- **Opción 2**: Supabase - https://supabase.com
- **Opción 3**: Local PostgreSQL

### 🚀 Uso

```bash
# Ejecutar en modo desarrollo
npm run dev

# Visitar las páginas principales:
# http://localhost:3000/meals     - Gestión de comidas
# http://localhost:3000/diet      - Configuración de dieta
# http://localhost:3000/calendar  - Calendario de scores
# http://localhost:3000/summary   - Analytics y estadísticas
```

### 🧪 Probar la Aplicación

1. **Archivo de Prueba**: Usa `sample-chat.txt` incluido en el proyecto
2. **Tu Archivo**: Exporta un chat de WhatsApp (sin multimedia)
3. **Procesamiento**: IA completa con prompt optimizado
4. **Seguimiento**: Configura tu dieta ideal y comienza a registrar comidas

## 🎯 Cómo Funciona

### Flujo de Trabajo Original
1. **📤 Subir**: Usuario sube archivo de exportación de WhatsApp
2. **🤖 Procesar**: Gemini AI analiza completamente el archivo
3. **🍽️ Extraer**: IA identifica comidas, horarios y componentes nutricionales
4. **📊 Estructurar**: Datos se convierten al formato requerido
5. **🗄️ Almacenar**: Información se guarda automáticamente en Google Sheets

### Flujo de Seguimiento de Dieta
1. **⚙️ Configurar**: Define tu dieta ideal en `/diet`
2. **➕ Registrar**: Añade comidas en `/meals` (manual o bulk import)
3. **📊 Visualizar**: Revisa tu progreso en `/calendar` y `/summary`
4. **🎯 Optimizar**: Ajusta reglas según tus hábitos y objetivos

## 🔧 Tecnologías Utilizadas

- **🤖 Gemini AI**: Motor de IA completo para procesamiento de WhatsApp
- **🌐 Next.js 15**: Framework React moderno con App Router
- **⚛️ React 19**: Interfaz de usuario interactiva
- **🎨 Tailwind CSS**: Estilos modernos y responsivos
- **🗄️ PostgreSQL + Prisma**: Base de datos principal para meals/scoring
- **🗄️ Google Sheets API**: Almacenamiento legacy de datos
- **📊 Date-fns**: Manejo avanzado de fechas y zonas horarias

## 📈 Próximas Mejoras

- [x] Soporte completo para seguimiento de dieta
- [x] Sistema de scoring automático
- [x] Calendario con visualización de progreso
- [x] Dashboard con métricas detalladas
- [ ] Soporte para múltiples idiomas en los mensajes
- [ ] Análisis de tendencias nutricionales avanzado
- [ ] Exportación de reportes en PDF
- [ ] Integración con apps de fitness
- [ ] Notificaciones push para recordatorios

## 🤝 Contribuir

Siéntete libre de contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ utilizando IA como motor principal y seguimiento nutricional avanzado**