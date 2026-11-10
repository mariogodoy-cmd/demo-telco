import { randomInt } from 'node:crypto';
import { readJson, send } from '../shared/http.mjs';
import { validatePortRequest } from './donor-validation.mjs';
import { nextPortWindow } from './window.mjs';

const ports = new Map();

/** POST /v1/portability/requests — agenda la portación en la próxima ventana. */
export async function createPortRequest(req, res) {
  const body = (await readJson(req)) ?? {};
  const invalid = validatePortRequest(body);
  if (invalid) {
    const { status, ...rest } = invalid;
    return send(res, status, rest);
  }
  const port = {
    portId: `PORT-${randomInt(100000, 999999)}`,
    msisdn: body.msisdn,
    donor: body.donor,
    recipient: body.recipient,
    status: 'PENDING',
    scheduledAt: nextPortWindow().toISOString(),
    createdAt: new Date().toISOString(),
  };
  ports.set(port.portId, port);
  send(res, 201, port);
}

/** GET /v1/portability/requests/:id */
export function getPortRequest(_req, res, [, id]) {
  const port = ports.get(id);
  if (!port) return send(res, 404, { error: 'PORT_NOT_FOUND' });
  send(res, 200, port);
}
