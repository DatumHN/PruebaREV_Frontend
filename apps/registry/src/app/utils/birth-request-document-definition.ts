import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

const svgUnchecked =
  '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#2E4A8B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-square-rounded-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" /></svg>';
const svgChecked =
  '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="#2E4A8B" class="icon icon-tabler icons-tabler-filled icon-tabler-square-rounded-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z" fill="#2E4A8B" stroke-width="0" /></svg>';
const svgRadioUnchecked =
  '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#2E4A8B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>';
const svgRadioChecked =
  '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="#2E4A8B" class="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>';

const dottedSeparator: Content = {
  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 515,
      y2: 0,
      dash: { length: 2 },
      lineWidth: 1,
      lineColor: '#2E4A8B',
    },
  ],
  margin: [0, 0, 0, 15],
};

function createCheckboxRow(label: string, checked: boolean): Content {
  return {
    columns: [
      { svg: checked ? svgChecked : svgUnchecked, width: 12 },
      { text: label, margin: [5, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 4],
  };
}

function getHeaderSection(
  headerData: any,
  logoBase64: string | null,
): Content[] {
  if (!headerData) return [];

  const logoContent = logoBase64
    ? { image: logoBase64, width: 100 } // Usa la imagen si existe
    : { text: 'RNPN', fontSize: 24, bold: true }; // Usa texto si no hay logo

  return [
    {
      table: {
        widths: ['20%', '50%', '30%'],
        body: [
          [
            {
              stack: [logoContent],
              border: [true, true, false, true],
              margin: [10, 0, 0, 0],
            },
            {
              stack: [
                { text: '', margin: [0, 10, 0, 0] },
                {
                  text: 'FORMULARIO ÚNICO DE SOLICITUD',
                  fontSize: 16,
                  bold: true,
                  alignment: 'center',
                },
              ],
              border: [false, true, false, true],
            },
            {
              stack: [
                {
                  text: headerData.lugarFechaHora || '',
                  fontSize: 9,
                  alignment: 'right',
                  margin: [0, 5, 10, 0],
                },
                {
                  text: `Presentación: ${headerData.codigoPresentacion || ''}`,
                  fontSize: 9,
                  alignment: 'right',
                  bold: true,
                  margin: [0, 5, 10, 0],
                },
                {
                  text: `Contacto para consultar trámite: ${headerData.emailContacto || ''}`,
                  fontSize: 9,
                  alignment: 'right',
                  margin: [0, 5, 10, 0],
                },
                {
                  text: `Plazo de respuesta: ${headerData.plazoRespuesta || ''}`,
                  fontSize: 9,
                  alignment: 'right',
                  margin: [0, 5, 10, 0],
                },
              ],
              border: [false, true, true, true],
              margin: [0, 0, 0, 10],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 2,
        vLineWidth: () => 2,
        hLineColor: () => '#2E4A8B',
        vLineColor: () => '#2E4A8B',
      },
      margin: [0, 0, 0, 20],
    },
  ];
}

function getSolicitanteSection(solicitanteData: any): Content[] {
  if (!solicitanteData) return [];
  return [
    {
      text: 'Datos del Solicitante',
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    {
      columns: [
        {
          columns: [
            {
              svg:
                solicitanteData.tipoPersona === 'natural'
                  ? svgChecked
                  : svgUnchecked,
              width: 12,
            },
            { text: 'Persona Natural', margin: [5, 1, 0, 0] },
          ],
        },
        {
          columns: [
            {
              svg:
                solicitanteData.tipoPersona === 'juridica'
                  ? svgChecked
                  : svgUnchecked,
              width: 12,
            },
            { text: 'Persona Jurídica', margin: [5, 1, 0, 0] },
          ],
        },
      ],
      margin: [0, 0, 0, 15],
    },
    {
      columns: [
        {
          stack: [
            {
              columns: [
                { text: 'Tipo de Documento:', width: 'auto' },
                {
                  text: solicitanteData.documentoTipo || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: 'Domicilio:', width: 'auto' },
                {
                  text: solicitanteData.domicilio || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
            },
          ],
        },
        {
          stack: [
            {
              columns: [
                { text: 'No. de Documento:', width: 'auto' },
                {
                  text: solicitanteData.documentoNumero || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: 'Nombre Completo:', width: 'auto' },
                {
                  text: solicitanteData.nombreCompleto || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
            },
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 15],
    },
    {
      columns: [
        { text: '¿Es el titular del asiento?', width: 'auto' },
        {
          columns: [
            {
              svg: solicitanteData.esTitular
                ? svgRadioChecked
                : svgRadioUnchecked,
              width: 12,
            },
            { text: 'Si', margin: [5, 1, 0, 0] },
          ],
          width: 'auto',
          margin: [10, 0, 0, 0],
        },
        {
          columns: [
            {
              svg: !solicitanteData.esTitular
                ? svgRadioChecked
                : svgRadioUnchecked,
              width: 12,
            },
            { text: 'No', margin: [5, 1, 0, 0] },
          ],
          width: 'auto',
          margin: [10, 0, 0, 0],
        },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      columns: [
        { text: 'Carácter en que comparece:', width: 'auto' },
        {
          columns: [
            {
              svg:
                solicitanteData.caracter === 'informante'
                  ? svgChecked
                  : svgUnchecked,
              width: 12,
            },
            { text: 'Informante', margin: [5, 1, 0, 0] },
          ],
          width: 'auto',
          margin: [10, 0, 0, 0],
        },
        {
          columns: [
            {
              svg:
                solicitanteData.caracter === 'padre'
                  ? svgChecked
                  : svgUnchecked,
              width: 12,
            },
            { text: 'Padre', margin: [5, 1, 0, 0] },
          ],
          width: 'auto',
          margin: [10, 0, 0, 0],
        },
        {
          columns: [
            {
              svg:
                solicitanteData.caracter === 'madre'
                  ? svgChecked
                  : svgUnchecked,
              width: 12,
            },
            { text: 'Madre', margin: [5, 1, 0, 0] },
          ],
          width: 'auto',
          margin: [10, 0, 0, 0],
        },
      ],
      margin: [0, 0, 0, 20],
    },
  ];
}

function getTitularSection(titularData: any): Content[] {
  if (!titularData) return [];
  return [
    {
      text: 'Titular del Asiento',
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 15],
    },
    {
      columns: [
        {
          stack: [
            {
              columns: [
                { text: 'Tipo de Documento:', width: 'auto' },
                {
                  text: titularData.documentoTipo || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: 'Fecha del hecho ó acto jurídico:', width: 'auto' },
                {
                  text: titularData.fechaHecho || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: 'Nombre de la madre:', width: 'auto' },
                {
                  text: titularData.nombreMadre || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
            },
          ],
        },
        {
          stack: [
            {
              columns: [
                { text: 'No. de Documento:', width: 'auto' },
                {
                  text: titularData.documentoNumero || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: 'Lugar del hecho acto jurídico:', width: 'auto' },
                {
                  text: titularData.lugarHecho || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: 'Nombre del padre:', width: 'auto' },
                {
                  text: titularData.nombrePadre || '',
                  bold: true,
                  margin: [5, 0, 0, 0],
                },
              ],
            },
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 8],
    },
    {
      columns: [
        { text: 'Nombre Completo:', width: 'auto' },
        {
          text: titularData.nombreCompleto || '',
          bold: true,
          margin: [5, 0, 0, 0],
        },
      ],
      margin: [0, 8, 0, 20],
    },
  ];
}

function getDeclaracionSection(declaracionData: any): Content[] {
  if (!declaracionData) return [];
  const inscripciones = [
    { key: 'nacimiento', label: 'Nacimiento' },
    { key: 'matrimonio', label: 'Matrimonio' },
    { key: 'union', label: 'Unión no matrimonial' },
    { key: 'defuncion', label: 'Defunción' },
    { key: 'defuncion_fetal', label: 'Registro de defunción fetal' },
    { key: 'extranjero', label: 'Estado familiar adquirido en el extranjero' },
    { key: 'nacionalizacion', label: 'Nacionalización' },
    { key: 'reposicion', label: 'Reposición' },
  ];
  const anotaciones = [
    { key: 'cancelacion', label: 'Cancelación' },
    { key: 'adecuacion', label: 'Adecuación' },
    { key: 'cambio_apellidos', label: 'Cambio de apellidos' },
    { key: 'identidad', label: 'Identidad Personal' },
    {
      key: 'modificacion_regimen',
      label: 'Modificación o sustitución del Régimen Patrimonial',
    },
    { key: 'rectificaciones', label: 'Rectificaciones' },
    { key: 'subsanaciones', label: 'Subsanaciones' },
    {
      key: 'anotaciones_posteriores',
      label: 'Anotaciones necesarias a un asiento posterior',
    },
  ];
  return [
    {
      text: 'Declaración de la solicitud',
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    {
      columns: [
        {
          stack: [
            {
              text: 'Inscripciones principales:',
              bold: true,
              margin: [0, 0, 0, 8],
            },
            ...inscripciones.map((item) =>
              createCheckboxRow(
                item.label,
                declaracionData.inscripcionPrincipal === item.key,
              ),
            ),
          ],
        },
        {
          stack: [
            {
              text: 'Anotaciones marginales:',
              bold: true,
              margin: [0, 0, 0, 8],
            },
            ...anotaciones.map((item) =>
              createCheckboxRow(
                item.label,
                declaracionData.anotacionMarginal === item.key,
              ),
            ),
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 20],
    },
  ];
}

function getDocumentacionSection(documentos: string[]): Content[] {
  if (!documentos || documentos.length === 0) return [];
  return [
    {
      text: 'Documentación presentada',
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    { ul: documentos, margin: [0, 0, 0, 40] },
  ];
}

function getFirmasSection(firmasData: any): Content[] {
  if (!firmasData) return [];
  return [
    {
      columns: [
        {
          stack: [
            { text: '________________________________', alignment: 'center' },
            {
              text: firmasData.nombreSolicitante || '',
              alignment: 'center',
              bold: true,
              margin: [0, 5, 0, 0],
            },
            { text: '(Firma o huella)', alignment: 'center', italics: true },
          ],
        },
        {
          stack: [
            { text: '________________________________', alignment: 'center' },
            {
              text: firmasData.nombreRef || '',
              alignment: 'center',
              bold: true,
              margin: [0, 5, 0, 0],
            },
            { text: '(Nombre y firma)', alignment: 'center', italics: true },
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 30],
    },
  ];
}

export function getRequestDocumentDefinition(
  formData: any,
  logo: string | null,
): TDocumentDefinitions {
  const content: Content[] = [
    ...getHeaderSection(formData.header, logo),
    dottedSeparator,
    ...getSolicitanteSection(formData.solicitante),
    dottedSeparator,

    ...(!formData.solicitante.esTitular
      ? [...getTitularSection(formData.titular), dottedSeparator]
      : []),

    ...getDeclaracionSection(formData.declaracion),
    dottedSeparator,
    ...getDocumentacionSection(formData.documentacion.presentada),
    dottedSeparator,
    ...getFirmasSection(formData.firmas),
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: 'La información contenida en esta solicitud es de exclusiva responsabilidad de quien la complete, en los casos donde la persona no supiese leer ni escribir, la persona que ayude a completarlo lo hará conforme a lo expresado por el interesado; quien debera en todo caso estampar la huella o firma.',
              fontSize: 10,
              alignment: 'justify',
              margin: [8, 8, 8, 8],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#2E4A8B',
        vLineColor: () => '#2E4A8B',
      },
    },
  ];

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 40],
    content,
    defaultStyle: {
      fontSize: 10,
      color: '#2E4A8B',
    },
  };
}
