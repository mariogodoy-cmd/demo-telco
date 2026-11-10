#!/usr/bin/env node
// API de una telco de práctica: verificación de número por OTP y portabilidad numérica.
// Sin dependencias, en memoria. Se usa para demostrar Orbitta: no es un sistema real.
import { createServer } from 'node:http';
import { send } from './shared/http.mjs';
import { verifyNumber } from './verification/numbers.mjs';
import { sendOtp, verifyOtp } from './verification/otp.mjs';
import { createPortRequest, getPortRequest } from './portability/requests.mjs';

const PORT = Number(process.env.PORT ?? 4010);

const routes = [
  ['GET', /^\/health$/, (_req, res) => send(res, 200, { ok: true })],
  ['POST', /^\/v1\/numbers\/verify$/, verifyNumber],
  ['POST', /^\/v1\/otp\/send$/, sendOtp],
  ['POST', /^\/v1\/otp\/verify$/, verifyOtp],
  ['POST', /^\/v1\/portability\/requests$/, createPortRequest],
  ['GET', /^\/v1\/portability\/requests\/([\w-]+)$/, getPortRequest],
];

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  for (const [method, re, handler] of routes) {
    const match = re.exec(pathname);
    if (match && req.method === method) {
      try {
        return await handler(req, res, match);
      } catch (err) {
        return send(res, 500, { error: 'INTERNAL', message: String(err) });
      }
    }
  }
  send(res, 404, { error: 'NOT_FOUND' });
}).listen(PORT, () => console.log(`API telco en http://localhost:${PORT}`));
