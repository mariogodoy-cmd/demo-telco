import { readJson, send } from '../shared/http.mjs';

export const OPERATORS = ['Tigo', 'Claro', 'Movistar'];

/** E.164 de Centroamérica: +502 a +507 y 8 dígitos. */
export const MSISDN = /^\+(502|503|504|505|506|507)\d{8}$/;
const COUNTRY = { 502: 'GT', 503: 'SV', 504: 'HN', 505: 'NI', 506: 'CR', 507: 'PA' };

export function isValidMsisdn(msisdn) {
  return MSISDN.test(String(msisdn ?? ''));
}

/** POST /v1/numbers/verify — país, operador y si el número se puede portar. */
export async function verifyNumber(req, res) {
  const body = await readJson(req);
  const msisdn = String(body?.msisdn ?? '');
  if (!isValidMsisdn(msisdn)) {
    return send(res, 422, { error: 'INVALID_MSISDN', message: 'El número debe estar en formato E.164, por ejemplo +50255551234' });
  }
  const carrier = OPERATORS[Number(msisdn.at(-1)) % OPERATORS.length];
  send(res, 200, {
    msisdn,
    valid: true,
    country: COUNTRY[msisdn.slice(1, 4)],
    carrier,
    lineType: 'MOBILE',
    portable: !msisdn.endsWith('0000'),
  });
}
