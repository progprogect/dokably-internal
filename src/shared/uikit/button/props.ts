type buttonStyle =
  | 'transparent'
  | 'primary'
  | 'black'
  | 'gray'
  | 'dark-gray'
  | 'white'
  | 'red'
  | 'custom';

export interface IButton {
  buttonType: buttonStyle;
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}
