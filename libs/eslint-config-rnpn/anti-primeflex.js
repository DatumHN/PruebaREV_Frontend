/**
 * ESLint Plugin Anti-PrimeFlex para RNPN
 * Previene el uso de clases PrimeFlex en templates y estilos
 * Fase 2 de migración PrimeNG → Tailwind
 */

const primeFlex_classes = [
  // Layout classes
  'p-d-flex',
  'p-d-inline-flex',
  'p-d-block',
  'p-d-inline-block',
  'p-d-grid',
  'p-d-inline-grid',
  'p-d-none',
  'p-d-hidden',

  // Flex classes
  'p-flex-row',
  'p-flex-column',
  'p-flex-row-reverse',
  'p-flex-column-reverse',
  'p-flex-wrap',
  'p-flex-nowrap',
  'p-flex-wrap-reverse',

  // Justify content
  'p-jc-start',
  'p-jc-end',
  'p-jc-center',
  'p-jc-between',
  'p-jc-around',
  'p-jc-evenly',

  // Align items
  'p-ai-start',
  'p-ai-end',
  'p-ai-center',
  'p-ai-baseline',
  'p-ai-stretch',

  // Grid system
  'p-grid',
  'p-nogutter',
  'p-col',
  'p-col-1',
  'p-col-2',
  'p-col-3',
  'p-col-4',
  'p-col-5',
  'p-col-6',
  'p-col-7',
  'p-col-8',
  'p-col-9',
  'p-col-10',
  'p-col-11',
  'p-col-12',

  // Margin
  'p-m-0',
  'p-m-1',
  'p-m-2',
  'p-m-3',
  'p-m-4',
  'p-m-5',
  'p-m-6',
  'p-mt-0',
  'p-mt-1',
  'p-mt-2',
  'p-mt-3',
  'p-mt-4',
  'p-mt-5',
  'p-mt-6',
  'p-mr-0',
  'p-mr-1',
  'p-mr-2',
  'p-mr-3',
  'p-mr-4',
  'p-mr-5',
  'p-mr-6',
  'p-mb-0',
  'p-mb-1',
  'p-mb-2',
  'p-mb-3',
  'p-mb-4',
  'p-mb-5',
  'p-mb-6',
  'p-ml-0',
  'p-ml-1',
  'p-ml-2',
  'p-ml-3',
  'p-ml-4',
  'p-ml-5',
  'p-ml-6',
  'p-mx-0',
  'p-mx-1',
  'p-mx-2',
  'p-mx-3',
  'p-mx-4',
  'p-mx-5',
  'p-mx-6',
  'p-my-0',
  'p-my-1',
  'p-my-2',
  'p-my-3',
  'p-my-4',
  'p-my-5',
  'p-my-6',

  // Padding
  'p-p-0',
  'p-p-1',
  'p-p-2',
  'p-p-3',
  'p-p-4',
  'p-p-5',
  'p-p-6',
  'p-pt-0',
  'p-pt-1',
  'p-pt-2',
  'p-pt-3',
  'p-pt-4',
  'p-pt-5',
  'p-pt-6',
  'p-pr-0',
  'p-pr-1',
  'p-pr-2',
  'p-pr-3',
  'p-pr-4',
  'p-pr-5',
  'p-pr-6',
  'p-pb-0',
  'p-pb-1',
  'p-pb-2',
  'p-pb-3',
  'p-pb-4',
  'p-pb-5',
  'p-pb-6',
  'p-pl-0',
  'p-pl-1',
  'p-pl-2',
  'p-pl-3',
  'p-pl-4',
  'p-pl-5',
  'p-pl-6',
  'p-px-0',
  'p-px-1',
  'p-px-2',
  'p-px-3',
  'p-px-4',
  'p-px-5',
  'p-px-6',
  'p-py-0',
  'p-py-1',
  'p-py-2',
  'p-py-3',
  'p-py-4',
  'p-py-5',
  'p-py-6',
];

const tailwindEquivalents = {
  // Display
  'p-d-flex': 'tw-flex',
  'p-d-inline-flex': 'tw-inline-flex',
  'p-d-block': 'tw-block',
  'p-d-inline-block': 'tw-inline-block',
  'p-d-grid': 'tw-grid',
  'p-d-none': 'tw-hidden',

  // Flex direction
  'p-flex-row': 'tw-flex-row',
  'p-flex-column': 'tw-flex-col',
  'p-flex-row-reverse': 'tw-flex-row-reverse',
  'p-flex-column-reverse': 'tw-flex-col-reverse',

  // Flex wrap
  'p-flex-wrap': 'tw-flex-wrap',
  'p-flex-nowrap': 'tw-flex-nowrap',
  'p-flex-wrap-reverse': 'tw-flex-wrap-reverse',

  // Justify content
  'p-jc-start': 'tw-justify-start',
  'p-jc-end': 'tw-justify-end',
  'p-jc-center': 'tw-justify-center',
  'p-jc-between': 'tw-justify-between',
  'p-jc-around': 'tw-justify-around',
  'p-jc-evenly': 'tw-justify-evenly',

  // Align items
  'p-ai-start': 'tw-items-start',
  'p-ai-end': 'tw-items-end',
  'p-ai-center': 'tw-items-center',
  'p-ai-baseline': 'tw-items-baseline',
  'p-ai-stretch': 'tw-items-stretch',

  // Grid system
  'p-grid': 'tw-grid tw-grid-cols-12',
  'p-col': 'tw-col-span-1',
  'p-col-1': 'tw-col-span-1',
  'p-col-2': 'tw-col-span-2',
  'p-col-3': 'tw-col-span-3',
  'p-col-4': 'tw-col-span-4',
  'p-col-5': 'tw-col-span-5',
  'p-col-6': 'tw-col-span-6',
  'p-col-7': 'tw-col-span-7',
  'p-col-8': 'tw-col-span-8',
  'p-col-9': 'tw-col-span-9',
  'p-col-10': 'tw-col-span-10',
  'p-col-11': 'tw-col-span-11',
  'p-col-12': 'tw-col-span-12',
};

// Generar equivalentes de spacing
for (let i = 0; i <= 6; i++) {
  // Margin
  tailwindEquivalents[`p-m-${i}`] = `tw-m-${i}`;
  tailwindEquivalents[`p-mt-${i}`] = `tw-mt-${i}`;
  tailwindEquivalents[`p-mr-${i}`] = `tw-mr-${i}`;
  tailwindEquivalents[`p-mb-${i}`] = `tw-mb-${i}`;
  tailwindEquivalents[`p-ml-${i}`] = `tw-ml-${i}`;
  tailwindEquivalents[`p-mx-${i}`] = `tw-mx-${i}`;
  tailwindEquivalents[`p-my-${i}`] = `tw-my-${i}`;

  // Padding
  tailwindEquivalents[`p-p-${i}`] = `tw-p-${i}`;
  tailwindEquivalents[`p-pt-${i}`] = `tw-pt-${i}`;
  tailwindEquivalents[`p-pr-${i}`] = `tw-pr-${i}`;
  tailwindEquivalents[`p-pb-${i}`] = `tw-pb-${i}`;
  tailwindEquivalents[`p-pl-${i}`] = `tw-pl-${i}`;
  tailwindEquivalents[`p-px-${i}`] = `tw-px-${i}`;
  tailwindEquivalents[`p-py-${i}`] = `tw-py-${i}`;
}

module.exports = {
  rules: {
    'no-primeflex-classes': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Prohibir uso de clases PrimeFlex en favor de Tailwind prefijado',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          noPrimeFlex:
            'No uses la clase PrimeFlex "{{className}}". Usa "{{suggested}}" en su lugar.',
          noPrimeFlexGeneric:
            'No uses clases PrimeFlex. Usa clases Tailwind prefijadas con "tw-" en su lugar.',
        },
      },
      create(context) {
        function checkStringLiteral(node) {
          if (node.type !== 'Literal' || typeof node.value !== 'string') return;

          const classString = node.value;
          const classes = classString.split(/\\s+/);

          classes.forEach((className) => {
            if (primeFlex_classes.includes(className)) {
              const suggested =
                tailwindEquivalents[className] || 'tw-[equivalent]';
              context.report({
                node,
                messageId: 'noPrimeFlex',
                data: {
                  className,
                  suggested,
                },
                fix(fixer) {
                  if (tailwindEquivalents[className]) {
                    const newValue = classString.replace(
                      className,
                      tailwindEquivalents[className],
                    );
                    return fixer.replaceText(node, `"${newValue}"`);
                  }
                  return null;
                },
              });
            } else if (
              /^p-[a-z]/.test(className) &&
              !className.startsWith('p-button') &&
              !className.startsWith('p-input')
            ) {
              // Capturar otras clases p- que podrían ser PrimeFlex
              context.report({
                node,
                messageId: 'noPrimeFlexGeneric',
                data: { className },
              });
            }
          });
        }

        return {
          // Para templates HTML en strings
          Literal: checkStringLiteral,
          // Para template literals
          'TemplateLiteral > TemplateElement': (node) => {
            checkStringLiteral({ ...node, value: node.value.cooked });
          },
          // Para JSX className
          'JSXAttribute[name.name="className"] > Literal': checkStringLiteral,
          'JSXAttribute[name.name="class"] > Literal': checkStringLiteral,
        };
      },
    },
  },
};
