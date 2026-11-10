import { OPERATORS, isValidMsisdn } from '../verification/numbers.mjs';

/**
 * Reglas para aceptar una solicitud de portación. Devuelve el error (HTTP y código) o null.
 * Regla del regulador: no se porta un número al mismo operador que ya lo tiene.
 */
export function validatePortRequest({ msisdn, donor, recipient, documentId }) {
  if (!isValidMsisdn(msisdn)) return { status: 422, error: 'INVALID_MSISDN' };
  if (!OPERATORS.includes(donor) || !OPERATORS.includes(recipient)) {
    return { status: 422, error: 'UNKNOWN_OPERATOR', operators: OPERATORS };
  }
  if (donor === recipient) {
    return { status: 422, error: 'SAME_OPERATOR', message: 'El operador donante y el receptor no pueden ser el mismo' };
  }
  if (!/^\d{13}$/.test(String(documentId ?? ''))) {
    return { status: 422, error: 'INVALID_DOCUMENT', message: 'El DPI debe tener 13 dígitos' };
  }
  if (String(msisdn).endsWith('0000')) {
    return { status: 409, error: 'OUTSTANDING_DEBT', message: 'El número tiene saldo pendiente con el operador donante' };
  }
  return null;
}
