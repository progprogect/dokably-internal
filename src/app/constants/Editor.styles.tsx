export const colorStyleMap = {
  'text-text': { color: '#29282C' },
  'text-fontPurple': { color: '#7B44F0' },
  'text-fontDarkBlue': { color: '#4E5AD7' },
  'text-fontBlue': { color: '#4A86FF' },
  'text-fontGreen': { color: '#1FCC78' },
  'text-fontRed': { color: '#FF5065' },
  'text-fontYellow': { color: '#FFD600' },
  'text-fontGray': { color: '#A9A9AB' },
  'text-fontLink': { color: '#2554f6' },
};

export const bgColorStyleMap = {
  'bg-bgBlue': { background: '#d1e0ff' },
  'bg-bgRed': { background: '#ffdce0' },
  'bg-bgOrange': { background: '#FFD4BE' },
  'bg-bgYellow': { background: '#FFF7B3' },
  'bg-bgGreen': { background: '#DDF7EB' },
};

export const blockStyles = {
  'block': {
    height: '36px'
  }
}

export const toolbarStyleMap = {
  'bold': {
    fontWeight: 600,
  },
  'underline': {
    textDecoration: 'underline',
    textDecorationThickness: 'from-font',
    textUnderlinePosition: 'under'
  },
  italic: {
    fontStyle: 'italic',
  },
  'strikethrough': {
    textDecorationLine: 'line-through',
  },
  link: {
    color: '#2554f6',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  code: {
    background: '#EDEDEE',
    padding: '2px',
    borderRadius: '4px',
    fontFamily: 'Source Code Pro',
  },
  ...colorStyleMap,
  ...bgColorStyleMap,
  ...blockStyles
};
