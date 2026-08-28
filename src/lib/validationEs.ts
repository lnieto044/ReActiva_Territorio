// Traduce los mensajes nativos de validación HTML5 (que el navegador muestra
// en su propio idioma, normalmente inglés si el sistema operativo o el
// navegador están en inglés) a mensajes en español. Se aplica a nivel de
// <form> con onInvalidCapture/onChangeCapture porque el evento "invalid" no
// hace bubbling — la fase de captura es la forma estándar de interceptarlo
// desde un ancestro sin tener que instrumentar cada <input> individualmente.
import type { FormEvent } from 'react';

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isValidatable(el: EventTarget | null): el is ValidatableElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
}

function mensajeValidezEs(el: ValidatableElement): string {
  const v = el.validity;
  const tipo = 'type' in el ? el.type : undefined;

  if (v.valueMissing) return 'Este campo es obligatorio.';
  if (v.typeMismatch) {
    if (tipo === 'email') return 'Ingresa un correo electrónico válido (por ejemplo: nombre@correo.com).';
    if (tipo === 'url') return 'Ingresa una dirección web válida.';
    return 'El valor ingresado no tiene el formato esperado.';
  }
  if (v.tooShort) return `Debe tener al menos ${'minLength' in el ? el.minLength : ''} caracteres.`;
  if (v.tooLong) return `Debe tener como máximo ${'maxLength' in el ? el.maxLength : ''} caracteres.`;
  if (v.rangeUnderflow) return `El valor debe ser mayor o igual a ${'min' in el ? el.min : ''}.`;
  if (v.rangeOverflow) return `El valor debe ser menor o igual a ${'max' in el ? el.max : ''}.`;
  if (v.stepMismatch) return 'El valor ingresado no es válido para este campo.';
  if (v.patternMismatch) return el.title || 'El formato ingresado no es válido.';
  if (v.badInput) return 'El valor ingresado no es válido.';
  return 'El valor ingresado no es válido.';
}

function onInvalidCapture(e: FormEvent<HTMLFormElement>) {
  const el = e.target;
  if (isValidatable(el)) el.setCustomValidity(mensajeValidezEs(el));
}

function onChangeCapture(e: FormEvent<HTMLFormElement>) {
  const el = e.target;
  if (isValidatable(el)) el.setCustomValidity('');
}

/** Spread esto sobre cualquier <form> para que los mensajes de validación
 * nativos (campo obligatorio, correo inválido, etc.) aparezcan en español
 * sin importar el idioma del navegador. */
export const validacionEsProps = {
  onInvalidCapture,
  onChangeCapture,
};
