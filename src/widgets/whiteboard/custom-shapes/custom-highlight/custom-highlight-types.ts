import { Expand, T, TLBaseShape } from '@tldraw/editor';
import { customHighlightProps } from './custom-highlight-props';
import { CUSTOM_HIGHLIGHT_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';

export type ShapePropsType<Config extends Record<string, T.Validatable<any>>> =
  Expand<{
    [K in keyof Config]: T.TypeOf<Config[K]>;
  }>;

export type ICustomHighlightProps = ShapePropsType<typeof customHighlightProps>;

export type ICustomHighlight = TLBaseShape<
  CUSTOM_HIGHLIGHT_SHAPE_ID_TYPE,
  ICustomHighlightProps
>;
