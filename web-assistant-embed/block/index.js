( function( blocks, element, blockEditor, components ) {
  const el = element.createElement;
  const { useState } = element;
  const { InspectorControls } = blockEditor;
  const { PanelBody, TextControl, SelectControl } = components;

  blocks.registerBlockType('chisxe187/web-assistant', {
    title: 'Web Assistant',
    icon: 'format-chat',
    category: 'widgets',
    attributes: {
      width: { type: 'string', default: '100%' },
      height: { type: 'string', default: '600px' },
      theme: { type: 'string', default: 'light' },
      lang: { type: 'string', default: 'de' },
      welcome: { type: 'string', default: 'Wie kann ich helfen?' },
      session: { type: 'string', default: 'global' }
    },
    edit: (props) => {
      const { attributes, setAttributes } = props;
      const { width, height, theme, lang, welcome, session } = attributes;
      return el('div', {},
        el(InspectorControls, {},
          el(PanelBody, { title: 'Web Assistant Einstellungen' },
            el(TextControl, { label: 'Breite', value: width, onChange: v => setAttributes({ width: v }) }),
            el(TextControl, { label: 'Höhe', value: height, onChange: v => setAttributes({ height: v }) }),
            el(SelectControl, { label: 'Theme', value: theme, options: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ], onChange: v => setAttributes({ theme: v }) }),
            el(SelectControl, { label: 'Sprache', value: lang, options: [
              { label: 'Deutsch', value: 'de' },
              { label: 'Italienisch', value: 'it' }
            ], onChange: v => setAttributes({ lang: v }) }),
            el(TextControl, { label: 'Begrüßung', value: welcome, onChange: v => setAttributes({ welcome: v }) }),
            el(TextControl, { label: 'Session-Key', value: session, onChange: v => setAttributes({ session: v }) })
          )
        ),
        el('p', {}, 'Web Assistant Vorschau (iframe wird im Frontend angezeigt)')
      );
    },
    save: () => null
  });
})( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components );
