# Hoja Verde

## Current State
- ClientesPage: tiene botones de eliminar con AlertDialog, pero el botón no tiene `disabled={!actor}` y las mutaciones de eliminar no tienen toast.
- FinanzasPage: tiene botones de eliminar con AlertDialog pero sin toast en onSuccess/onError del deleteMutation.
- CalendarioPage: muestra trabajos del día seleccionado pero NO tiene botones de eliminar ni funcionalidad de borrado.
- TrabajosPage: funcionalidad de eliminar trabajos completa y correcta.
- AjustesPage: solo tiene perfil y cerrar sesión, sin opción de resetear datos.

## Requested Changes (Diff)

### Add
- CalendarioPage: botones de eliminar en cada trabajo del día, con AlertDialog de confirmación.
- AjustesPage: sección "Zona de peligro" con botón "Limpiar todos los datos" que elimina todos los clientes, trabajos, transacciones, facturas, jardines, prospectos y cotizaciones con un diálogo de confirmación.
- Toast notifications en delete de FinanzasPage.

### Modify
- CalendarioPage: importar useMutation, useQueryClient, AlertDialog, Button, toast; agregar lógica de eliminar trabajo.
- FinanzasPage: agregar toast.success y toast.error en deleteMutation.
- AjustesPage: agregar función de reset total con confirmación.

### Remove
- Nada.

## Implementation Plan
1. CalendarioPage: agregar deleteJob mutation con toast, AlertDialog de confirmación, botón Trash2 en cada job card.
2. FinanzasPage: agregar toast.success/toast.error al deleteMutation existente.
3. AjustesPage: agregar función resetAllData que llama a getAllX y deleteX para todas las entidades, con AlertDialog de confirmación doble.
