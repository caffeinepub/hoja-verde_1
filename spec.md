# Hoja Verde - App de Gestión para Jardinería y Paisajismo

## Current State
Proyecto nuevo sin código existente.

## Requested Changes (Diff)

### Add
- Sistema de autenticación con login y PIN opcional
- Dashboard principal con métricas del negocio y acciones rápidas
- CRM de clientes: crear, editar, eliminar, ver perfil, llamar, WhatsApp
- Control de jardines por cliente: tamaño, tipo de grama, herramientas, fotos, observaciones
- Gestión de trabajos: agendar, estados (Pendiente/En Progreso/Completado/Cancelado)
- Mantenimientos recurrentes: semanal, quincenal, mensual
- Calendario visual con trabajos del día y visitas de mantenimiento
- Cotizaciones profesionales con estados y envío por WhatsApp
- Seguimiento de prospectos con conversión a clientes
- Facturas con numeración HV-001, exportar/compartir por WhatsApp
- Planificador de rutas con lista ordenada de trabajos del día
- Módulo financiero privado: ingresos, gastos, gráficas mensuales
- Estadísticas del negocio: trabajos, clientes activos, cotizaciones
- Panel de configuración

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- Actor principal con autenticación basada en usuario/contraseña
- Entidades: Client, Garden, Job, Quote, Prospect, Invoice, Transaction, MaintenanceSchedule
- CRUD completo para cada entidad
- Contadores para numeración de facturas (HV-001 etc.)
- Consultas: trabajos por fecha, por cliente, finanzas por mes
- Estadísticas agregadas del negocio

### Frontend (React + TypeScript)
- Pantalla de login con diseño Hoja Verde
- Navegación inferior: Dashboard, Clientes, Calendario, Trabajos, Finanzas
- Menú lateral: Cotizaciones, Facturas, Prospectos, Control de Jardines, Planificador de Rutas, Ajustes
- Diseño responsivo optimizado para móvil (táctil, botones grandes)
- Tema verde oscuro/claro, cards con sombras y bordes redondeados
- Moneda en colones costarricenses (₡)
- Idioma español
- Confirmaciones antes de eliminar registros
- Integración con tel: y wa.me para llamadas y WhatsApp
