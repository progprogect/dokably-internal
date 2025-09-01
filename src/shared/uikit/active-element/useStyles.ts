import { ActiveElementProps, ElementSize, ElementVariant } from './props';
import { cn } from '@app/utils/cn';

const heightSizes: Record<ElementSize, string> = {
  l: 'h-9',
  m: 'h-7',
  s: 'h-6',
  xs: 'h-5',
};

const widthSizes: Record<ElementSize, string> = {
  l: 'w-9',
  m: 'w-7',
  s: 'w-6',
  xs: 'w-5',
};

const fontSizes: Record<ElementSize, string> = {
  l: 'text-sm',
  m: 'text-sm',
  s: 'text-xs',
  xs: 'text-xs',
};

const colors: Record<ElementVariant, { default: string; active: string }> = {
  filled: {
    active: 'bg-text10',
    default: `
          bg-text10 hover:bg-text20 focus:bg-text20 active:bg-text20 focus-within:bg-text20
          text-text50 hover:text-text60 focus:text-text60 active:text-text60 focus-within:text-text60
        `,
  },
  transparent: {
    active: 'bg-backgroundHover',
    default: `
          hover:bg-backgroundHover focus:bg-backgroundHover active:bg-backgroundHover focus-within:bg-backgroundHover
          hover:text-text focus:text-text active:text-text focus-within:text-text
          text-text70
        `,
  },
  active: {
    active: 'bg-bgBlue',
    default: `
          hover:bg-bgBlue focus:bg-bgBlue active:bg-bgBlue focus-within:bg-bgBlue
          text-fontBlue bg-backgroundActive
        `,
  },
  error: {
    active: 'bg-backgroundHover',
    default: `
          hover:bg-backgroundHover focus:bg-backgroundHover active:bg-backgroundHover focus-within:bg-backgroundHover
          text-errorText
        `,
  },
};

export function useStyles({
  size,
  isIcon,
  variant,
  active,
}: Pick<ActiveElementProps, 'isIcon' | 'className' | 'active'> &
  Pick<Required<ActiveElementProps>, 'size' | 'variant'>) {
  const height = heightSizes[size];
  const width = isIcon ? widthSizes[size] : '';
  const fontSize = fontSizes[size];
  const _colors = colors[variant];

  return {
    width,
    height,
    fontSize,
    colors: cn(_colors.default, { [_colors.active]: active }),
  };
}
