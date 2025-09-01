import { Expand, T, TLBaseShape } from '@tldraw/editor';
import { customPenProps } from './custom-pen-props';
import { CUSTOM_DRAW_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';

export type ShapePropsType<Config extends Record<string, T.Validatable<any>>> =
  Expand<{
    [K in keyof Config]: T.TypeOf<Config[K]>;
  }>;


export type ICustomPenProps = ShapePropsType<typeof customPenProps>

export type ICustomPen = TLBaseShape<CUSTOM_DRAW_SHAPE_ID_TYPE, ICustomPenProps>
