---
name: volkern-crm-automation
description: "Automatiza Volkern CRM: gestión de leads, citas, catálogo de productos/servicios, cotizaciones, contratos, órdenes de venta, pipeline y tareas. Incluye integración con catálogo unificado como fuente única de verdad."
requires:
  mcp: [volkern-crm]
  credentials: [volkern-api-key]
---

# Volkern CRM Automation - Guía de Skill

Automatiza operaciones de Volkern CRM incluyendo gestión de leads, programación de citas, catálogo de productos/servicios, cotizaciones, contratos, órdenes de venta, pipeline de ventas y tareas.

## Prerequisitos

- MCP Volkern conectado (volkern-crm)
- API Key de Volkern configurada como Header Auth (`X-API-Key`)
- Base URL: `https://volkern.app/api`

## Autenticación

Todas las llamadas requieren el header:
```
X-API-Key: tu-api-key-aqui
```

---

## Módulo 1: Catálogo Unificado (Fuente Única de Verdad)

El catálogo centraliza todos los productos y servicios. Se usa como base para cotizaciones, contratos, órdenes y citas.

### 1.1 Listar Catálogo

**Cuándo usar**: Para buscar productos/servicios disponibles antes de crear documentos.

**Endpoint**: `GET /api/catalogo`

**Parámetros**:
- `search`: Buscar por nombre, descripción o SKU
- `tipo`: `producto` | `servicio`
- `activo`: `true` | `false`
- `limit`: Cantidad de resultados (default: 50)

**Respuesta incluye**:
- `id`: ID del item (para usar en documentos)
- `nombre`: Nombre del producto/servicio
- `precioBase`: Precio sin impuestos
- `moneda`: EUR, USD, MXN
- `tasaImpuesto`: Tasa de impuesto asociada (% y código)
- `duracionMinutos`: Para servicios con duración

### 1.2 Crear Item en Catálogo

**Cuándo usar**: Para registrar nuevos productos o servicios.

**Endpoint**: `POST /api/catalogo`

**Campos requeridos**:
- `nombre`: Nombre del item
- `precioBase`: Precio base

**Campos opcionales**:
- `tipo`: `producto` | `servicio` (default: servicio)
- `descripcion`: Descripción detallada
- `sku`: Código único
- `moneda`: EUR, USD, MXN
- `categoriaFiscal`: `general`, `reducido`, `super_reducido`, `exento`
- `duracionMinutos`: Para servicios (ej: 60)
- `tasaImpuestoId`: ID de la tasa de impuesto a aplicar

### 1.3 Actualizar Item

**Endpoint**: `PATCH /api/catalogo/{id}`

**Campos actualizables**: nombre, precioBase, descripcion, activo, etc.

---

## Módulo 2: Gestión de Leads

### 2.1 Crear/Actualizar Lead (Upsert)

**Cuándo usar**: Cuando llega un nuevo prospecto o se actualiza información.

**Endpoint**: `POST /api/leads`

**Comportamiento**: Si existe un lead con el mismo email o teléfono, lo actualiza. Si no, crea uno nuevo.

**Campos**:
- `nombre`: Nombre completo (requerido)
- `email`: Email del lead
- `telefono`: Con código de país (+34612345678)
- `empresa`: Nombre de la empresa
- `contextoProyecto`: Descripción de lo que busca el lead
- `canal`: `web`, `referido`, `whatsapp`, `telefono`, `email`, `otro`
- `estado`: `nuevo`, `contactado`, `calificado`, `negociacion`, `cliente`, `perdido`

### 2.2 Buscar Lead

**Endpoint**: `GET /api/leads?search={término}`

Busca por nombre, email o teléfono.

### 2.3 Listar Leads

**Endpoint**: `GET /api/leads`

**Filtros**: `estado`, `canal`, `limit`

### 2.4 Actualizar Lead

**Endpoint**: `PATCH /api/leads/{id}`

---

## Módulo 3: Gestión de Citas

### 3.1 Consultar Disponibilidad

**Cuándo usar**: SIEMPRE antes de crear una cita.

**Endpoint**: `GET /api/citas/disponibilidad`

**Parámetros**:
- `fecha`: Formato YYYY-MM-DD
- `duracion`: En minutos (default: 60)
- `timezone`: Europe/Madrid

**Respuesta**: Array de slots disponibles con horarios.

### 3.2 Crear Cita

**Endpoint**: `POST /api/citas`

**Campos**:
- `leadId`: ID del lead (requerido)
- `fechaHora`: ISO 8601 en UTC (ej: `2026-02-20T10:00:00Z`)
- `titulo`: Título de la cita
- `tipo`: `reunion`, `servicio`, `llamada`, `otro`
- `duracion`: En minutos
- `catalogoItemId`: Si es para un servicio del catálogo (auto-completa título y duración)

**Importante**: 
- Las fechas deben estar en UTC
- Si se usa `catalogoItemId`, hereda nombre y duración del catálogo

### 3.3 Listar Citas

**Endpoint**: `GET /api/citas`

**Filtros**:
- `estado`: `Pendiente`, `Confirmada`, `Completada`, `Cancelada`
- `fecha`: YYYY-MM-DD
- `fechaInicio`, `fechaFin`: Rango ISO 8601

### 3.4 Actualizar/Cancelar Cita

**Endpoint**: `PATCH /api/citas/{id}`

**Campos**:
- `estado`: `Confirmada`, `Cancelada`, `Completada`
- `fechaHora`: Para reprogramar
- `motivoCancelacion`: Si se cancela

---

## Módulo 4: Cotizaciones (Presupuestos)

### 4.1 Crear Cotización

**Endpoint**: `POST /api/cotizaciones`

**Campos**:
- `titulo`: Título (requerido)
- `leadId` o `dealId`: Asociación
- `moneda`: EUR, USD, MXN
- `validezDias`: Días de validez (default: 30)
- `items`: Array de líneas:
  ```json
  [{
    "catalogoItemId": "id-del-catalogo",  // Opcional pero recomendado
    "concepto": "Nombre del item",
    "cantidad": 1,
    "precioUnitario": 100.00
  }]
  ```
- `clienteNombre`, `clienteEmail`: Datos del cliente

**Tip**: Usar `catalogoItemId` garantiza precios consistentes.

### 4.2 Enviar Cotización

**Endpoint**: `POST /api/cotizaciones/{id}/send`

Envía la cotización por email al cliente con link para aceptar/rechazar.

---

## Módulo 5: Contratos

### 5.1 Crear Contrato

**Endpoint**: `POST /api/contratos`

**Campos**:
- `titulo`: Título (requerido)
- `tipo`: `servicio`, `venta`, `suscripcion`, `otro`
- `moneda`: EUR, USD, MXN
- `items`: Array de líneas (igual que cotizaciones)
- `cotizacionId`: Para crear desde cotización aceptada
- `clienteNombre`, `clienteEmail`, `clienteIdFiscal`
- `fechaInicio`, `fechaFin`: Vigencia del contrato
- `clausulas`: Cláusulas legales

### 5.2 Enviar para Firma

**Endpoint**: `POST /api/contratos/{id}/send`

Envía el contrato con link de firma digital.

---

## Módulo 6: Órdenes de Venta

### 6.1 Crear Orden de Venta

**Endpoint**: `POST /api/ventas/ordenes`

**Campos**:
- `moneda`: EUR, USD, MXN
- `leadId` o `contactId`: Cliente
- `cotizacionId` o `contratoId`: Documento origen
- `items`: Array de líneas
- `notas`, `notasCliente`

### 6.2 Listar Órdenes

**Endpoint**: `GET /api/ventas/ordenes`

**Filtros**: `estado`, `leadId`, `contactId`

---

## Módulo 7: Pipeline de Ventas (Deals)

### 7.1 Crear Deal

**Endpoint**: `POST /api/deals`

**Campos**:
- `titulo`: Nombre del deal
- `valor`: Valor estimado
- `leadId` o `contactId`: Cliente
- `etapa`: Etapa del pipeline
- `probabilidad`: 0-100
- `fechaCierreEstimada`: ISO 8601

### 7.2 Listar Deals

**Endpoint**: `GET /api/deals`

**Filtros**: `estado` (abierto, ganado, perdido), `etapa`

---

## Módulo 8: Tareas

### 8.1 Crear Tarea

**Endpoint**: `POST /api/tasks`

**Campos**:
- `titulo`: Título (requerido)
- `descripcion`: Descripción
- `prioridad`: `baja`, `media`, `alta`, `urgente`
- `fechaVencimiento`: ISO 8601
- `leadId`, `dealId`: Asociaciones

### 8.2 Listar Tareas

**Endpoint**: `GET /api/tasks`

**Filtros**: `estado`, `prioridad`

---

## Flujos de Trabajo Recomendados

### Flujo 1: Lead → Cita → Cotización → Contrato

1. **Crear Lead**: `POST /api/leads`
2. **Consultar Disponibilidad**: `GET /api/citas/disponibilidad`
3. **Crear Cita**: `POST /api/citas` con `catalogoItemId` del servicio
4. **Crear Cotización**: `POST /api/cotizaciones` con items del catálogo
5. **Enviar Cotización**: `POST /api/cotizaciones/{id}/send`
6. (Cliente acepta)
7. **Crear Contrato**: `POST /api/contratos` con `cotizacionId`
8. **Enviar Contrato**: `POST /api/contratos/{id}/send`

### Flujo 2: Venta Rápida

1. **Buscar Lead**: `GET /api/leads?search=email@cliente.com`
2. **Buscar Item Catálogo**: `GET /api/catalogo?search=servicio`
3. **Crear Orden de Venta**: `POST /api/ventas/ordenes` con `catalogoItemId`

---

## Notas Importantes

1. **Catálogo es la fuente de verdad**: Siempre usar `catalogoItemId` cuando sea posible para mantener consistencia de precios e impuestos.

2. **Fechas en UTC**: Todas las fechas/horas deben enviarse en formato ISO 8601 UTC.

3. **Moneda**: Especificar siempre la moneda (EUR, USD, MXN) para evitar errores.

4. **Upsert de Leads**: El endpoint `POST /api/leads` hace upsert automático por email/teléfono.

5. **Permisos API Key**: Verificar que la API Key tenga los scopes necesarios:
   - `leads:read`, `leads:write`
   - `citas:read`, `citas:write`
   - `config:read`, `config:write` (para catálogo)
   - `contacts:read`, `contacts:write`

---

## Manejo de Errores

| Código | Significado |
|--------|-------------|
| 400 | Datos inválidos o faltantes |
| 401 | API Key inválida o expirada |
| 403 | Sin permisos para la operación |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: horario no disponible) |
| 500 | Error interno del servidor |

---

**Versión**: 2.0.0  
**Última actualización**: 2026-02-16
