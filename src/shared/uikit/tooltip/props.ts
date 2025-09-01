import { TippyProps } from '@tippyjs/react';
type TooltipVariant = 'default' | 'light';

export type TooltipProps = TippyProps & { variant?: TooltipVariant };
