export const mentionInputStyles = {
  control: {
    backgroundColor: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
  },
  '&multiLine': {
    control: {
      minHeight: 40,
    },
    highlighter: {
      padding: '8px',
      paddingLeft: '15px',
      border: '1px solid transparent',
    },
    input: {
      marginTop: 9,
      marginBottom: 9,
      marginLeft: 16,
      marginRight: 16,
      width: "calc(100% - 32px)",
      alignSelf: 'center',
      outline: 'none',
    },
  },
  '&singleLine': {
    display: 'inline-block',
    width: 180,
    highlighter: {
      padding: 1,
      border: '2px inset transparent',
    },
    input: {
      padding: 1,
      border: '2px inset',
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      position: 'absolute',
    },
    item: {
      padding: '5px 15px',
      backgroundColor: 'white',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: 'var(--text5)',
      },
    },
  },
};
