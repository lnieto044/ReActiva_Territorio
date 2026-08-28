import { describe, expect, it } from 'vitest';
import {
  puedeAvanzarEntrega,
  puedeCrearCoincidencia,
  puedePublicarOferta,
  puedeReportarCaso,
  puedeVerificarCaso,
} from './permissions';

describe('permisos por rol', () => {
  it('solo líder comunitario o admin pueden reportar/verificar casos', () => {
    expect(puedeReportarCaso('lider_comunitario')).toBe(true);
    expect(puedeReportarCaso('admin')).toBe(true);
    expect(puedeReportarCaso('organizacion')).toBe(false);
    expect(puedeVerificarCaso('organizacion')).toBe(false);
    expect(puedeVerificarCaso(null)).toBe(false);
  });

  it('solo organización o admin pueden publicar ofertas', () => {
    expect(puedePublicarOferta('organizacion')).toBe(true);
    expect(puedePublicarOferta('admin')).toBe(true);
    expect(puedePublicarOferta('lider_comunitario')).toBe(false);
  });

  it('cualquier rol autenticado puede crear una coincidencia', () => {
    expect(puedeCrearCoincidencia('lider_comunitario')).toBe(true);
    expect(puedeCrearCoincidencia('organizacion')).toBe(true);
    expect(puedeCrearCoincidencia('admin')).toBe(true);
    expect(puedeCrearCoincidencia(null)).toBe(false);
  });

  it('solo la organización ejecuta la entrega hasta "entregada"', () => {
    expect(puedeAvanzarEntrega('organizacion', 'en_preparacion')).toBe(true);
    expect(puedeAvanzarEntrega('organizacion', 'entregada')).toBe(true);
    expect(puedeAvanzarEntrega('lider_comunitario', 'en_preparacion')).toBe(false);
  });

  it('solo el líder comunitario confirma "verificada"/"cerrada"', () => {
    expect(puedeAvanzarEntrega('lider_comunitario', 'verificada')).toBe(true);
    expect(puedeAvanzarEntrega('organizacion', 'verificada')).toBe(false);
    expect(puedeAvanzarEntrega('lider_comunitario', 'cerrada')).toBe(true);
  });

  it('admin puede avanzar cualquier paso', () => {
    expect(puedeAvanzarEntrega('admin', 'en_preparacion')).toBe(true);
    expect(puedeAvanzarEntrega('admin', 'verificada')).toBe(true);
  });
});
