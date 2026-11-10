import { randomInt, randomUUID } from 'node:crypto';
import { readJson, send } from '../shared/http.mjs';
import { isValidMsisdn } from './numbers.mjs';

const MAX_ATTEMPTS = 3;
const TTL_MS = 5 * 60_000;
const otps = new Map();

/** POST /v1/otp/send — envía un código de 6 dígitos por SMS (en el sandbox, lo devuelve). */
export async function sendOtp(req, res) {
  const body = await readJson(req);
  const msisdn = String(body?.msisdn ?? '');
  if (!isValidMsisdn(msisdn)) return send(res, 422, { error: 'INVALID_MSISDN' });
  const requestId = randomUUID();
  const code = String(randomInt(100000, 999999));
  otps.set(requestId, { msisdn, code, attempts: 0, expiresAt: Date.now() + TTL_MS });
  send(res, 201, { requestId, channel: 'SMS', expiresInSeconds: TTL_MS / 1000, demoCode: code });
}

/** POST /v1/otp/verify — confirma el código; tras 3 intentos fallidos se bloquea. */
export async function verifyOtp(req, res) {
  const body = await readJson(req);
  const requestId = String(body?.requestId ?? '');
  const otp = otps.get(requestId);
  if (!otp) return send(res, 404, { error: 'OTP_NOT_FOUND' });
  if (Date.now() > otp.expiresAt) return send(res, 410, { error: 'OTP_EXPIRED' });
  if (otp.attempts >= MAX_ATTEMPTS) return send(res, 429, { error: 'OTP_LOCKED', message: 'Demasiados intentos; pide un código nuevo' });
  if (String(body?.code ?? '') !== otp.code) {
    otp.attempts++;
    return send(res, 401, { error: 'OTP_MISMATCH', attemptsLeft: MAX_ATTEMPTS - otp.attempts });
  }
  otps.delete(requestId);
  send(res, 200, { verified: true, msisdn: otp.msisdn });
}
