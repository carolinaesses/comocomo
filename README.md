# 🤖 Comocomo - IA Completa para WhatsApp

Aplicación web que utiliza **Gemini AI como motor completo** para procesar archivos de exportación de WhatsApp y extraer información nutricional automáticamente.

## 🚀 Características Principales

- **🤖 IA Completa**: Gemini hace TODO el trabajo - desde leer archivos hasta clasificar nutricionalmente
- **🍽️ Análisis Nutricional**: Detecta carbohidratos, proteínas y verduras automáticamente
- **📊 Datos Estructurados**: Convierte conversaciones en datos listos para análisis
- **🗄️ Google Sheets**: Almacenamiento automático en hojas de cálculo
- **🧠 Dos Modos**: Estándar (rápido) y Adaptativo (ultra-inteligente)

## 🏗️ Arquitectura

```
🌐 Frontend (Next.js + React)
    ↓
🤖 IA COMPLETA (Gemini)
    ↓
📊 Datos Procesados
    ↓
🗄️ Google Sheets API
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

Contenido del archivo `.env.local`:

```env
# 🤖 IA - Motor Principal de la Aplicación
GEMINI_API_KEY=tu_clave_de_gemini_aqui

# 🗄️ Google Sheets - Almacenamiento de Datos
GOOGLE_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_clave_privada_aqui\n-----END PRIVATE KEY-----"
SHEET_ID=tu_id_de_hoja_de_calculo
```

### 🔑 Obtener las Claves API

#### Gemini AI (Requerido)
1. Ve a [Google AI Studio](https://ai.google.dev/aistudio)
2. Crea una nueva API Key
3. Cópiala al archivo `.env.local`

#### Google Service Account (Requerido)
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto (o usa uno existente)
3. Habilita la API de Google Sheets
4. Crea una Service Account
5. Descarga el archivo JSON con las credenciales
6. Copia `client_email` y `private_key` al `.env.local`

#### ID de Google Sheets
1. Crea una nueva hoja de cálculo en [Google Sheets](https://sheets.google.com)
2. Copia el ID de la URL (la parte entre `/d/` y `/edit`)
3. Ejemplo: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

### 🚀 Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Visitar http://localhost:3000
```

### 🧪 Probar la Aplicación

1. **Archivo de Prueba**: Usa `sample-chat.txt` incluido en el proyecto
2. **Tu Archivo**: Exporta un chat de WhatsApp (sin multimedia)
3. **Procesamiento**: IA completa con prompt optimizado

## 🎯 Cómo Funciona

### Flujo de Trabajo
1. **📤 Subir**: Usuario sube archivo de exportación de WhatsApp
2. **🤖 Procesar**: Gemini AI analiza completamente el archivo
3. **🍽️ Extraer**: IA identifica comidas, horarios y componentes nutricionales
4. **📊 Estructurar**: Datos se convierten al formato requerido
5. **🗄️ Almacenar**: Información se guarda automáticamente en Google Sheets

## 🔧 Tecnologías Utilizadas

- **🤖 Gemini AI**: Motor de IA completo para procesamiento
- **🌐 Next.js 15**: Framework React moderno
- **⚛️ React 19**: Interfaz de usuario interactiva
- **🎨 Tailwind CSS**: Estilos modernos y responsivos
- **🗄️ Google Sheets API**: Almacenamiento de datos estructurados

## 📈 Próximas Mejoras

- [ ] Soporte para múltiples idiomas en los mensajes
- [ ] Análisis de tendencias nutricionales
- [ ] Dashboard con gráficos de consumo
- [ ] Exportación a diferentes formatos
- [ ] Integración con más servicios de IA

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

**Desarrollado con ❤️ utilizando IA como motor principal**
