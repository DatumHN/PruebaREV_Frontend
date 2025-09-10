import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

import { convertDateToWords, convertTimeToWords } from './convertDateToString';
import { convertNumberToWords } from './convertNumberToWords';
import {
  convertAgeToWords,
  convertNumberToString,
} from './convertNumbersToString';

function getInscritoSection(inscrito: any) {
  if (!inscrito) return [];

  const bodyLeft: any[] = [];
  const bodyRight: any[] = [];

  if (inscrito.nui) {
    bodyLeft.push([
      { text: 'NÚMERO ÚNICO DE IDENTIDAD:' },
      {
        text: convertNumberToWords(inscrito.nui).toUpperCase(),
        bold: true,
      },
    ]);
  }
  if (inscrito.nombre) {
    bodyLeft.push([
      { text: 'NOMBRE:' },
      { text: inscrito.nombre.toUpperCase(), bold: true },
    ]);
  }
  if (inscrito.sexo) {
    bodyLeft.push([
      { text: 'SEXO:' },
      { text: inscrito.sexo.toUpperCase(), bold: true },
    ]);
  }
  if (inscrito.fechaNacimiento) {
    bodyRight.push([
      { text: 'FECHA DE NACIMIENTO:' },
      {
        text: convertDateToWords(inscrito.fechaNacimiento).toUpperCase(),
        bold: true,
      },
    ]);
  }
  if (inscrito.hora) {
    bodyRight.push([
      { text: 'HORA:' },
      { text: convertTimeToWords(inscrito.hora).toUpperCase(), bold: true },
    ]);
  }
  if (inscrito.lugarNacimiento) {
    bodyRight.push([
      { text: 'LUGAR DE NACIMIENTO:' },
      { text: inscrito.lugarNacimiento.toUpperCase(), bold: true },
    ]);
  }

  return [
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: 'DATOS DEL INSCRITO',
              style: 'sectionHeader',
              alignment: 'left',
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 3, 0, 0] as [number, number, number, number],
    },
    {
      columns: [
        { table: { widths: [70, '*'], body: bodyLeft }, layout: 'noBorders' },
        { table: { widths: [70, '*'], body: bodyRight }, layout: 'noBorders' },
      ],
      columnGap: 10,
      margin: [0, 0, 0, 0] as [number, number, number, number],
    },
  ];
}

function getPersonSection(personData: any, title: string) {
  if (!personData) return [];

  const bodyLeft: any[] = [];
  const bodyRight: any[] = [];

  if (personData.dui) {
    bodyLeft.push([
      { text: 'DOCUMENTO ÚNICO DE IDENTIDAD:' },
      {
        text: convertNumberToWords(personData.dui).toUpperCase(),
        bold: true,
      },
    ]);
  }
  if (personData.nombre) {
    bodyLeft.push([
      { text: 'NOMBRE COMPLETO:' },
      { text: personData.nombre.toUpperCase(), bold: true },
    ]);
  }
  if (personData.edad) {
    bodyLeft.push([
      { text: 'EDAD:' },
      { text: convertAgeToWords(personData.edad).toUpperCase(), bold: true },
    ]);
  }
  if (personData.domicilio) {
    bodyLeft.push([
      { text: 'LUGAR DE DOMICILIO:' },
      { text: personData.domicilio.toUpperCase(), bold: true },
    ]);
  }
  if (personData.nacionalidad) {
    bodyRight.push([
      { text: 'NACIONALIDAD:' },
      { text: personData.nacionalidad.toUpperCase(), bold: true },
    ]);
  }
  if (personData.oficio) {
    bodyRight.push([
      { text: 'PROFESIÓN U OFICIO:' },
      { text: personData.oficio.toUpperCase(), bold: true },
    ]);
  }
  if (personData.lugarNacimiento) {
    bodyRight.push([
      { text: 'LUGAR DE NACIMIENTO:' },
      { text: personData.lugarNacimiento.toUpperCase(), bold: true },
    ]);
  }
  if (personData.parentesco) {
    bodyLeft.push([
      { text: 'PARENTESCO:' },
      { text: personData.parentesco.toUpperCase(), bold: true },
    ]);
  }

  return [
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: title.toUpperCase(),
              style: 'sectionHeader',
              alignment: 'left',
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 3, 0, 0] as [number, number, number, number],
    },
    {
      columns: [
        { table: { widths: [70, '*'], body: bodyLeft }, layout: 'noBorders' },
        { table: { widths: [70, '*'], body: bodyRight }, layout: 'noBorders' },
      ],
      columnGap: 10,
      margin: [0, 0, 0, 0] as [number, number, number, number],
    },
  ];
}

export function getBirtDocumentDefinition(
  formData: any,
  logoBase64: string | null,
): TDocumentDefinitions {
  if (!logoBase64) {
    throw new Error('Logo no cargado.');
  }

  const content = [
    {
      columns: [
        {
          image: logoBase64,
          width: 60,
          height: 70,
          alignment: 'left',
          margin: [0, 0, 0, 0] as [number, number, number, number],
        },
        {
          width: '*',
          text: [
            'REPUBLICA DE EL SALVADOR\n',
            'DISTRITO DE SAN FERNANDO\n',
            'MUNICIPIO DE CHALATENANGO CENTRO\n',
            'DEPARTAMENTO DE CHALATENANGO\n\n',
          ],
          style: 'header',
          alignment: 'center',
        },
        {
          width: 60,
          text:
            'LIBRO: ' +
            convertNumberToString(formData.libro).toUpperCase() +
            '\n' +
            'FOLIO: ' +
            convertNumberToString(formData.folio).toUpperCase() +
            '\n' +
            'AÑO: ' +
            convertNumberToString(formData.anio).toUpperCase() +
            '\n',
          style: 'subsubTitle',
          margin: [0, 0, 0, 0] as [number, number, number, number],
          alignment: 'right',
        },
      ],
      columnGap: 10,
      margin: [0, 0, 0, 7] as [number, number, number, number],
    },
    { text: 'PARTIDA DE NACIMIENTO\n', style: 'title', alignment: 'center' },
    {
      columns: [
        { text: 'PARTIDA NÚMERO:', style: 'subTitle', width: 'auto' },
        {
          text: convertNumberToString(formData.partidaNo).toUpperCase(),
          style: 'subTitle',
          width: 'auto',
        },
      ],
      columnGap: 5,
      margin: [0, 0, 0, 0] as [number, number, number, number],
    },
    ...getInscritoSection(formData.inscrito),
    ...getPersonSection(formData.madre, 'DATOS DE LA MADRE'),
    ...getPersonSection(formData.padre, 'DATOS DEL PADRE'),
    ...getPersonSection(formData.informante, 'DATOS DEL INFORMANTE'),
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: 'DATOS GENERALES',
              style: 'sectionHeader',
              alignment: 'left',
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 3, 0, 0] as [number, number, number, number],
    },
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text:
                formData.general.DISTRITO.toUpperCase() +
                '  ' +
                convertDateToWords(formData.general.lugarFecha).toUpperCase(),
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 0] as [number, number, number, number],
    },
    {
      columns: [
        {
          stack: [
            {
              text: '______________________________________',
              alignment: 'center',
            },
            {
              text: formData.general.registrador.toUpperCase(),
              style: 'sigName',
              alignment: 'center',
            },
            {
              text: formData.general.registradorTitulo.toUpperCase(),
              style: 'sigTitle',
              alignment: 'center',
            },
          ],
          width: '*',
        },
        {
          stack: [{ text: 'SELLO', style: 'sigSello', alignment: 'center' }],
          width: 100,
        },
        {
          stack: [
            {
              text: '______________________________________',
              alignment: 'center',
            },
            {
              text: formData.informante
                ? formData.informante.nombre.toUpperCase()
                : '',
              style: 'sigName',
              alignment: 'center',
            },
            { text: 'INFORMANTE', style: 'sigTitle', alignment: 'center' },
          ],
          width: '*',
        },
      ],
      columnGap: 10,
      margin: [0, 35, 0, 0] as [number, number, number, number],
    },
    {
      columns: [
        {
          stack: [
            {
              text: '______________________________________',
              alignment: 'center',
            },
            {
              text: 'FREDIC PEDRI GARCIA PEREZ',
              style: 'sigName',
              alignment: 'center',
            },
            {
              text: 'TESTIGO DEL INFORMANTE',
              style: 'sigTitle',
              alignment: 'center',
            },
          ],
          width: '*',
        },
        {
          stack: [{ text: '', style: 'sigSello', alignment: 'center' }],
          width: 100,
        },
        {
          stack: [
            {
              text: '______________________________________',
              alignment: 'center',
            },
            {
              text: 'FRANCISCA PATRICIA PEÑA TAPIA',
              style: 'sigName',
              alignment: 'center',
            },
            {
              text: 'TESTIGO DEL HECHO',
              style: 'sigTitle',
              alignment: 'center',
            },
          ],
          width: '*',
        },
      ],
      columnGap: 10,
      margin: [0, 30, 0, 0] as [number, number, number, number],
    },
  ];

  return {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    content: content.flat() as Content[],
    styles: {
      header: { fontSize: 7, bold: true },
      title: { fontSize: 7, bold: true, margin: [0, 0, 0, 0] },
      subTitle: { fontSize: 7, bold: true },
      subsubTitle: { fontSize: 7, bold: true },
      sectionHeader: {
        fillColor: '#DDDDDD',
        color: '#000000',
        bold: true,
        fontSize: 7,
        margin: [0, 2, 0, 2],
      },
      sectionHeaderCentered: {
        fillColor: '#dddddd',
        bold: true,
        alignment: 'center',
        margin: [0, 4, 0, 4],
      },
      sigName: { fontSize: 7, bold: true, margin: [0, 4, 0, 0] },
      sigTitle: { fontSize: 7, margin: [0, 2, 0, 0] },
      sigSello: { fontSize: 7, italics: true, margin: [0, 20, 0, 0] },
    },
    defaultStyle: { fontSize: 7, noWrap: false },
  };
}
