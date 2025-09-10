import * as pdfMake from 'pdfmake/build/pdfmake';

/**
 * Este archivo tiene un único propósito: asegurar que pdfMake esté disponible
 * globalmente para que el script 'vfs_fonts.js' (cargado a través de project.json)
 * pueda adjuntarle el Sistema de Archivos Virtual (VFS) con las fuentes.
 *
 * Los empaquetadores modernos como Webpack aíslan los módulos, por lo que debemos
 * colocar explícitamente la instancia de pdfMake en el objeto 'window'.
 */

// Declaramos la propiedad en la interfaz global de Window para que TypeScript no genere errores.
declare global {
  interface Window {
    pdfMake: any;
  }
}

// Asignamos el módulo importado a la propiedad de la ventana.
// Esto debe hacerse ANTES de que se cargue vfs_fonts.js.
window.pdfMake = pdfMake;
