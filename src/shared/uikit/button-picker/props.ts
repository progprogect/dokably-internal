import type * as CSS from 'csstype';

type position = 'left' | 'top' | 'right' | 'bottom';
type childrensAlign = CSS.Property.JustifyContent;

export interface ButtonPickerItem
  extends React.HTMLAttributes<HTMLButtonElement> {
  icon: JSX.Element;
  onClick?: (ev?: React.MouseEvent<HTMLElement>) => void;
  isActive?: boolean;
  title?: string;
  height?: number;
  width?: number;
  displayText?: string;
  className?: string;
  listClassName?: string;
}

interface ButtonPickerListProps extends ButtonPickerItem {
  childrens?: ButtonPickerItem[];
  position?: position;
  rowCount?: number;
  columnCount?: number;
  childrensAlign?: childrensAlign;
  forceVisible?: boolean;
}

export default ButtonPickerListProps;
