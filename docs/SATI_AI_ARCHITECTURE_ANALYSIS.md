# SATI • Sistema de Alerta Temprana & Cumplimiento Normativo KHDA
## Arquitectura Integral y Análisis de Uso de Inteligencia Artificial

---

### 1. Resumen Ejecutivo
**SATI** (Sistema de Alerta Temprana e Inteligente) es una plataforma de gestión preventiva y cumplimiento regulatorio diseñada para supervisar **37 campus escolares en Dubái, Emiratos Árabes Unidos**. Su objetivo central es mitigar riesgos de sanciones económicas (multas de KHDA de hasta AED 50,000 por docente no regulado), garantizar la vigencia de permisos de enseñanza (*KHDA Permits*), visados de residencia, *Emirates ID*, certificados de aptitud médica y títulos apostillados por el Ministerio de Educación de EAU.

---

### 2. Estructura General de la Aplicación

```
/SATI
├── assets/                    # Identidad gráfica corporativa y logos
├── public/                    # Archivos estáticos servidos en producción
├── services/
│   ├── geminiService.ts       # SDK Google GenAI, OCR Multimodal, Smart RAG Context Engine
│   └── geminiLiveWebSocket.ts # Conexión bidireccional streaming en tiempo real
├── components/
│   ├── AIAssistantDrawer.tsx  # Copilot conversacional, auditor de campus y visor de chat
│   ├── AIPromptHero.tsx       # Banner de acceso rápido e interacción con IA
│   ├── DocumentUpload.tsx     # Modal de carga y escaneo OCR inteligente
│   ├── DocumentDetailModal.tsx# Expediente digital de cumplimiento del empleado
│   ├── NotificationDraftModal.tsx # Redactor y reescritor de alertas multicanal
│   ├── SettingsModal.tsx      # Configuración de umbrales y API Keys
│   ├── Header.tsx             # Barra superior con selector de idioma (ES/EN/AR) y campus
│   ├── Sidebar.tsx            # Navegación principal con estados colapsables
│   └── Icons.tsx              # Iconografía vectorial optimizada
├── types.ts                   # Modelos de datos TypeScript (Employee, Document, Alert)
├── constants.ts               # Diccionario de traducción universal (ES, EN, AR) y datos semilla
├── App.tsx                    # Orquestador principal de estado y vistas
├── index.tsx / index.html     # Puntos de entrada Vite React
└── vite.config.ts             # Configuración de compilación y empaquetado
```

---

### 3. Matriz de Análisis de IA: Necesidad Real vs. Lógica Determinista

| Módulo / Funcionalidad | ¿Requiere IA? | Nivel de Necesidad | Justificación Arquitectónica |
| :--- | :---: | :---: | :--- |
| **SATI Copilot (Chat en Vivo / Auditor)** | **SÍ** | **Crítica (100%)** | Interpretar lenguaje natural libre, responder dudas complejas de normativas KHDA, auditar campus individuales a demanda y asesorar a directivos en 3 idiomas. |
| **Escáner OCR Multimodal (`DocumentUpload`)** | **SÍ** | **Alta (95%)** | Extraer automáticamente texto estructurado (`employeeName`, `documentType`, `expiryDate`) de imágenes escaneadas o PDFs. |
| **Redacción de Notificaciones Multicanal** | **SÍ** | **Media-Alta (85%)** | Adaptar el tono, longitud y formato del mensaje según el canal de entrega (WhatsApp, Email formal, Discord, Guion telefónico). |
| **Cálculo de Días Restantes y Semáforo** | **NO** | **0% (Lógica Pura)** | Debe ser exacto matemáticamente (`expiryDate - today`). Los LLMs no deben calcular fechas numéricas en tiempo real para evitar alucinaciones. |
| **Filtrado y Búsqueda en Tablas** | **NO** | **0% (Lógica Pura)** | Procesamiento instantáneo en memoria (<1ms) sin consumo de tokens de API. |
| **Disparadores de Alerta Temprana** | **NO** | **0% (Lógica Pura)** | Basado en matriz de umbrales configurables (120d, 90d, 60d, 30d, 15d, 7d). |

---

### 4. Arquitectura de Resiliencia del Asistente IA (3 Niveles de Operación)

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO / CONSULTA                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │ ¿API Key válida y WebSocket online? │
            └──────────┬──────────────────┬───────┘
                    SÍ │                  │ NO
                       │                  │
        ┌──────────────▼──────────┐ ┌─────▼────────────────────────┐
        │  Nivel 1: WebSocket     │ │  Nivel 2: Google GenAI REST  │
        │  Gemini Live Streaming  │ │  (gemini-2.5-flash)          │
        │  (BidiGenerateContent)  │ └─────┬────────────────────────┘
        └─────────────────────────┘       │ Fallo de red / cuota
                                          ▼
                                ┌──────────────────────────────────┐
                                │ Nivel 3: Smart RAG Engine Local  │
                                │ • Analiza 37 campus en memoria   │
                                │ • Filtra docentes y vencimientos │
                                │ • Genera informe dinámico en     │
                                │   ES, EN o AR con datos reales   │
                                └──────────────────────────────────┘
```

1. **Nivel 1 (Gemini Live WebSocket)**: Transmisión de respuesta palabra por palabra para una interacción conversacional inmediata.
2. **Nivel 2 (Google GenAI REST API - `gemini-2.5-flash`)**: Procesamiento con modelo de última generación e inyección del contexto operativo completo de los 37 campus.
3. **Nivel 3 (Smart RAG Context Engine Local)**: Si no hay conexión o no hay API Key activa, un motor semántico local analiza el estado real de la base de datos de SATI y responde con datos precisos (nombres de docentes, campus, fechas exactas y recomendaciones normativas) evitando cualquier respuesta estática genérica.

---

### 5. Guía de Configuración de API Key
- La clave puede suministrarse vía variables de entorno en el servidor (`GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`).
- O configurarse dinámicamente por el usuario directamente en el modal de **Configuración / Copilot** y almacenarse de forma segura en el `localStorage` del navegador (`SATI_GEMINI_API_KEY`).
