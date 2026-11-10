# demo-telco

API de una telco **de práctica** para demostrar Orbitta: verificación de
número por OTP y portabilidad numérica entre operadores, con datos de Guatemala (+502). Sin dependencias
y en memoria; no es un sistema real.

```bash
npm start          # http://localhost:4010
```

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/v1/numbers/verify` | Valida un número E.164 y devuelve país, operador y si se puede portar |
| POST | `/v1/otp/send` | Envía un código OTP por SMS (en el sandbox lo devuelve en `demoCode`) |
| POST | `/v1/otp/verify` | Confirma el OTP; se bloquea tras 3 intentos fallidos |
| POST | `/v1/portability/requests` | Solicita una portación (`msisdn`, `donor`, `recipient`, `documentId`) |
| GET | `/v1/portability/requests/:id` | Consulta una portación |

Reglas de portabilidad (`src/portability/donor-validation.mjs`): no se porta al mismo operador, el DPI debe
tener 13 dígitos y un número con deuda (termina en `0000`) se rechaza.

## Cómo lo valida Orbitta en cada PR

El workflow [`.github/workflows/orbitta.yml`](.github/workflows/orbitta.yml) corre en un runner self-hosted:

1. Levanta la API **con el código del PR**.
2. Le avisa a Orbitta qué archivos cambiaron.
3. Orbitta cruza el cambio con sus casos (`src/portability/**`, `src/verification/**`), el Agente redacta los
   que faltan, corre las pruebas automatizadas de lo que cambió y decide con la puerta de liberación.
4. Si la puerta no está lista, el check del PR falla.

Necesita el secreto `ORBITTA_TOKEN` (token de CI de Orbitta con «Ejecutar pipelines»).
