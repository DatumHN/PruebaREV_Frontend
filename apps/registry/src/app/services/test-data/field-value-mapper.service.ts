import { Injectable, inject } from '@angular/core';
import { TestDataService } from './test-data.service';

@Injectable({
  providedIn: 'root',
})
export class FieldValueMapperService {
  private testDataService = inject(TestDataService);

  getTestValueForField(fieldLabel: string, fieldType?: string): unknown {
    const label = fieldLabel.toLowerCase();

    // Personal Information
    if (
      label.includes('parentesco con el inscrito') ||
      label.includes('parentesco')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.parentescos,
      );
    }

    // Names
    if (label.includes('primer nombre')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.nombres,
      );
    }
    if (label.includes('segundo nombre')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.nombres,
      );
    }
    if (label.includes('tercer nombre')) {
      return Math.random() > 0.5
        ? this.testDataService.getRandomFromArray(this.testDataService.nombres)
        : '';
    }

    // Surnames
    if (label.includes('primer apellido')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.apellidos,
      );
    }
    if (label.includes('segundo apellido')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.apellidos,
      );
    }
    if (label.includes('preposición del apellido de casada')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.preposicionesCasada,
      );
    }
    if (label.includes('apellido de casada')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.apellidos,
      );
    }

    // Dates
    if (
      label.includes('fecha de nacimiento') ||
      (fieldType === 'datepicker' && label.includes('nacimiento'))
    ) {
      return this.testDataService.generateRandomBirthDate();
    }
    if (
      label.includes('fecha de registro') ||
      (fieldType === 'datepicker' && label.includes('registro'))
    ) {
      return this.testDataService.generateTodayDate();
    }

    // Location fields - Birth
    if (label.includes('lugar de nacimiento')) {
      return (
        this.testDataService.getRandomFromArray(
          this.testDataService.municipios,
        ) +
        ', ' +
        this.testDataService.getRandomFromArray(
          this.testDataService.departamentos,
        )
      );
    }
    if (
      label.includes('país de nacimiento') ||
      label.includes('pais de nacimiento')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.paises,
      );
    }
    if (label.includes('departamento de nacimiento')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.departamentos,
      );
    }
    if (label.includes('municipio de nacimiento')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.municipios,
      );
    }
    if (label.includes('distrito de nacimiento')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.distritos,
      );
    }
    if (
      label.includes('cantón de nacimiento') ||
      label.includes('canton de nacimiento')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.cantones,
      );
    }
    if (
      label.includes('dirección específica de nacimiento') ||
      label.includes('direccion especifica de nacimiento')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.direccionesEspecificas,
      );
    }

    // Location fields - Residence
    if (
      label.includes('país de residencia') ||
      label.includes('pais de residencia')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.paises,
      );
    }
    if (label.includes('departamento de residencia según dui')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.departamentos,
      );
    }
    if (label.includes('distrito o ciudad de residencia según dui')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.municipios,
      );
    }
    if (label.includes('departamento de residencia')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.departamentos,
      );
    }
    if (label.includes('municipio de residencia')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.municipios,
      );
    }
    if (label.includes('distrito de residencia')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.distritos,
      );
    }
    if (
      label.includes('cantón de residencia') ||
      label.includes('canton de residencia')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.cantones,
      );
    }

    // Address and Registry
    if (label.includes('dirección específica')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.direccionesEspecificas,
      );
    }
    if (label.includes('oficina de registro')) {
      return (
        'Oficina Regional ' +
        this.testDataService.getRandomFromArray(this.testDataService.municipios)
      );
    }
    if (label.includes('distrito de registro')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.distritos,
      );
    }

    // Document Information
    if (label.includes('nui')) {
      return this.testDataService.generateRandomNUI();
    }
    if (label.includes('tipo de documento')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.documentos,
      );
    }
    if (
      label.includes('numero de documento') ||
      label.includes('número de documento')
    ) {
      return this.testDataService.generateRandomDUI();
    }

    // Personal Characteristics
    if (label.includes('edad')) {
      return this.testDataService.generateRandomAge();
    }
    if (label.includes('nacionalidad')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.nacionalidades,
      );
    }
    if (label.includes('estado familiar') || label.includes('estado civil')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.estadosFamiliares,
      );
    }
    if (
      label.includes('genero') ||
      label.includes('género') ||
      label.includes('sexo')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.generos,
      );
    }

    // Professional Information
    if (
      label.includes('profesión u oficio') ||
      label.includes('profesion u oficio')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.profesiones,
      );
    }
    if (
      label.includes('ocupación actual') ||
      label.includes('ocupacion actual')
    ) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.ocupaciones,
      );
    }
    if (label.includes('profesion') || label.includes('profesión')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.profesiones,
      );
    }

    // Education
    if (label.includes('sabe leer y escribir')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.respuestasSiNo,
      );
    }
    if (label.includes('grado aprobado')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.gradosEducativos,
      );
    }

    // Family Information
    if (
      label.includes('número de hijos') ||
      label.includes('numero de hijos')
    ) {
      return this.testDataService.generateRandomChildrenCount();
    }
    if (label.includes('nacidos vivos que continuan vivos')) {
      return Math.floor(Math.random() * 5) + 1;
    }
    if (label.includes('nacidos vivos que han fallecido')) {
      return Math.floor(Math.random() * 3);
    }
    if (label.includes('nacieron muertos')) {
      return Math.floor(Math.random() * 2);
    }

    // Birth Information
    if (label.includes('tipo de parto')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.tiposParto,
      );
    }
    if (label.includes('clase de parto')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.clasesParto,
      );
    }
    if (
      label.includes('duración de embarazo en semanas') ||
      label.includes('duracion de embarazo en semanas')
    ) {
      return this.testDataService.generateRandomWeeks();
    }
    if (label.includes('tipo de asistencia')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.tiposAsistencia,
      );
    }
    if (label.includes('nombre del asistente')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.nombresAsistentes,
      );
    }
    if (label.includes('tipo de centro de salud')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.tiposCentroSalud,
      );
    }

    // Physical Measurements
    if (label.includes('peso al nacer en gramos')) {
      return this.testDataService.generateRandomWeight();
    }
    if (
      label.includes('talla al nacer en centimetros') ||
      label.includes('talla al nacer en centímetros')
    ) {
      return this.testDataService.generateRandomHeight();
    }
    if (label.includes('hora de nacimiento')) {
      return this.testDataService.generateRandomTime();
    }

    // Administrative
    if (
      label.includes('número de boleta') ||
      label.includes('numero de boleta')
    ) {
      return this.testDataService.generateRandomBoleta();
    }

    // General Location (fallbacks)
    if (label.includes('país') || label.includes('pais')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.paises,
      );
    }
    if (label.includes('departamento')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.departamentos,
      );
    }
    if (label.includes('municipio')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.municipios,
      );
    }
    if (label.includes('cantón') || label.includes('canton')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.cantones,
      );
    }
    if (label.includes('distrito')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.distritos,
      );
    }
    if (label.includes('direccion') || label.includes('dirección')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.direcciones,
      );
    }

    // Field type-based fallbacks
    if (fieldType === 'input' && label.includes('nombre')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.nombres,
      );
    }
    if (fieldType === 'input' && label.includes('apellido')) {
      return this.testDataService.getRandomFromArray(
        this.testDataService.apellidos,
      );
    }
    if (
      fieldType === 'number' ||
      label.includes('numero') ||
      label.includes('número')
    ) {
      return this.testDataService.generateRandomNumber();
    }
    if (fieldType === 'input' && !label.includes('fecha')) {
      return 'Dato de prueba';
    }

    return null;
  }
}
