import { Injectable } from '@angular/core';

interface TestDataCollections {
  nombres: string[];
  apellidos: string[];
  parentescos: string[];
  profesiones: string[];
  ocupaciones: string[];
  nacionalidades: string[];
  paises: string[];
  departamentos: string[];
  municipios: string[];
  cantones: string[];
  distritos: string[];
  documentos: string[];
  estadosFamiliares: string[];
  generos: string[];
  direcciones: string[];
  direccionesEspecificas: string[];
  gradosEducativos: string[];
  respuestasSiNo: string[];
  tiposParto: string[];
  clasesParto: string[];
  tiposAsistencia: string[];
  nombresAsistentes: string[];
  preposicionesCasada: string[];
  tiposCentroSalud: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TestDataService {
  private readonly testDataCollections: TestDataCollections = {
    nombres: [
      'Carlos',
      'María',
      'José',
      'Ana',
      'Juan',
      'Sofía',
      'Luis',
      'Elena',
    ],
    apellidos: [
      'Hernández',
      'Rivera',
      'Martínez',
      'García',
      'López',
      'Pérez',
      'Flores',
    ],
    parentescos: [
      'Padre',
      'Madre',
      'Abuelo(a)',
      'Tío(a)',
      'Representante Legal',
    ],
    profesiones: [
      'Doctor(a)',
      'Ingeniero(a)',
      'Abogado(a)',
      'Estudiante',
      'Contador(a)',
      'Oficios Domésticos',
      'Comerciante',
      'Agricultor(a)',
      'Mecánico(a)',
    ],
    ocupaciones: [
      'Empleado(a) público',
      'Trabajador(a) independiente',
      'Ama de casa',
      'Empleado(a) privado',
      'Jubilado(a)',
      'Desempleado(a)',
    ],
    nacionalidades: [
      'Salvadoreña',
      'Guatemalteca',
      'Hondureña',
      'Estadounidense',
    ],
    paises: [
      'El Salvador',
      'Guatemala',
      'Honduras',
      'Estados Unidos',
      'Nicaragua',
    ],
    departamentos: [
      'Santa Ana',
      'San Salvador',
      'San Miguel',
      'La Libertad',
      'Sonsonate',
      'Ahuachapán',
    ],
    municipios: [
      'Santa Ana',
      'Chalchuapa',
      'Metapán',
      'Soyapango',
      'Ilopango',
      'Mejicanos',
    ],
    cantones: [
      'El Brazo',
      'Las Flores',
      'San Antonio',
      'El Portezuelo',
      'La Esperanza',
      'Monte Verde',
    ],
    distritos: [
      'Distrito Centro',
      'Distrito Norte',
      'Distrito Sur',
      'Distrito Este',
      'Distrito Oeste',
    ],
    documentos: ['DUI', 'Pasaporte', 'Carné de Residente'],
    estadosFamiliares: [
      'Soltero(a)',
      'Casado(a)',
      'Acompañado(a)',
      'Divorciado(a)',
    ],
    generos: ['Masculino', 'Femenino'],
    direcciones: [
      'Colonia San Benito, Pasaje 1, Casa #5',
      'Residencial Las Arboledas, Polígono D, Casa #12',
      'Cantón El Portezuelo, Calle Principal',
      'Barrio San Jacinto, 10a Avenida Sur',
    ],
    direccionesEspecificas: [
      'Casa #15, Calle Los Almendros',
      'Apartamento 2B, Edificio Central',
      'Km 12.5 Carretera a San Miguel',
      'Final 25 Avenida Norte, #245',
      'Condominio Las Palmeras, Casa 8',
    ],
    gradosEducativos: [
      'Ninguno',
      '1° a 3° grado',
      '4° a 6° grado',
      '7° a 9° grado',
      'Bachillerato',
      'Técnico',
      'Universitario',
      'Postgrado',
    ],
    respuestasSiNo: ['Sí', 'No'],
    tiposParto: ['Simple', 'Múltiple'],
    clasesParto: ['Natural', 'Cesárea'],
    tiposAsistencia: [
      'Médico',
      'Enfermera',
      'Partera',
      'Comadrona',
      'Sin asistencia',
    ],
    nombresAsistentes: [
      'Dr. José Antonio Martínez',
      'Dra. María Elena Rodríguez',
      'Enfermera Carmen López',
      'Partera Rosa Hernández',
      'Dr. Luis Alberto Gómez',
    ],
    preposicionesCasada: ['de', 'del', 'de la', 'vda. de', 'viuda de'],
    tiposCentroSalud: [
      'Hospital Nacional',
      'Clínica Comunal',
      'Unidad de Salud',
      'Hospital Privado',
      'Centro de Salud Rural',
      'Dispensario Médico',
    ],
  };

  getRandomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateRandomBirthDate(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2010, 11, 31);
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    const month = (randomDate.getMonth() + 1).toString().padStart(2, '0');
    const day = randomDate.getDate().toString().padStart(2, '0');
    const year = randomDate.getFullYear().toString();
    return `${month}/${day}/${year}`;
  }

  generateTodayDate(): string {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const year = today.getFullYear().toString();
    return `${month}/${day}/${year}`;
  }

  generateRandomDUI(): string {
    const randomNumber = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    return `${randomNumber.substring(0, 8)}-${Math.floor(Math.random() * 10)}`;
  }

  generateRandomNUI(): string {
    return Math.floor(Math.random() * 1000000000).toString();
  }

  generateRandomTime(): string {
    const hours = Math.floor(Math.random() * 24)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  generateRandomAge(): number {
    return Math.floor(Math.random() * 60) + 18;
  }

  generateRandomChildrenCount(): number {
    return Math.floor(Math.random() * 8) + 1;
  }

  generateRandomWeight(): number {
    return Math.floor(Math.random() * 2000) + 2500;
  }

  generateRandomHeight(): number {
    return Math.floor(Math.random() * 10) + 45;
  }

  generateRandomWeeks(): number {
    return Math.floor(Math.random() * 12) + 28;
  }

  generateRandomBoleta(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  generateRandomNumber(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  // Getters for test data collections
  get nombres(): string[] {
    return [...this.testDataCollections.nombres];
  }
  get apellidos(): string[] {
    return [...this.testDataCollections.apellidos];
  }
  get parentescos(): string[] {
    return [...this.testDataCollections.parentescos];
  }
  get profesiones(): string[] {
    return [...this.testDataCollections.profesiones];
  }
  get ocupaciones(): string[] {
    return [...this.testDataCollections.ocupaciones];
  }
  get nacionalidades(): string[] {
    return [...this.testDataCollections.nacionalidades];
  }
  get paises(): string[] {
    return [...this.testDataCollections.paises];
  }
  get departamentos(): string[] {
    return [...this.testDataCollections.departamentos];
  }
  get municipios(): string[] {
    return [...this.testDataCollections.municipios];
  }
  get cantones(): string[] {
    return [...this.testDataCollections.cantones];
  }
  get distritos(): string[] {
    return [...this.testDataCollections.distritos];
  }
  get documentos(): string[] {
    return [...this.testDataCollections.documentos];
  }
  get estadosFamiliares(): string[] {
    return [...this.testDataCollections.estadosFamiliares];
  }
  get generos(): string[] {
    return [...this.testDataCollections.generos];
  }
  get direcciones(): string[] {
    return [...this.testDataCollections.direcciones];
  }
  get direccionesEspecificas(): string[] {
    return [...this.testDataCollections.direccionesEspecificas];
  }
  get gradosEducativos(): string[] {
    return [...this.testDataCollections.gradosEducativos];
  }
  get respuestasSiNo(): string[] {
    return [...this.testDataCollections.respuestasSiNo];
  }
  get tiposParto(): string[] {
    return [...this.testDataCollections.tiposParto];
  }
  get clasesParto(): string[] {
    return [...this.testDataCollections.clasesParto];
  }
  get tiposAsistencia(): string[] {
    return [...this.testDataCollections.tiposAsistencia];
  }
  get nombresAsistentes(): string[] {
    return [...this.testDataCollections.nombresAsistentes];
  }
  get preposicionesCasada(): string[] {
    return [...this.testDataCollections.preposicionesCasada];
  }
  get tiposCentroSalud(): string[] {
    return [...this.testDataCollections.tiposCentroSalud];
  }
}
