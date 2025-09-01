import { StyleProp } from '@tldraw/editor';
import {
  SHAPE_BORDER_COLORS,
  CustomColors,
  SHAPE_BACKGROUND_COLORS,
  TEXT_COLORS,
  NOTE_COLORS,
  ARROW_COLORS,
  MIND_MAP_BORDER_COLORS,
  MIND_MAP_LINE_COLORS,
} from './whiteboard-colors';
import { T } from '@tldraw/validate';

//@ts-ignore
export const DokablyColor = StyleProp.defineEnum('dokably:colors', {
  //@ts-ignore
  defaultValue: '#29282C',
  values: [...CustomColors],
});
export type TLDokablyColor = T.TypeOf<typeof DokablyColor>;

//@ts-ignore
export const DocablyArrowColor = StyleProp.defineEnum('dokably:arrow-color', {
  //@ts-ignore
  defaultValue: ARROW_COLORS[0],
  values: ARROW_COLORS,
});
export type TLDokablyArrowColor = T.TypeOf<typeof DocablyArrowColor>;

//@ts-ignore
export const DokablyTextColor = StyleProp.defineEnum('dokably:text-colors', {
  //@ts-ignore
  defaultValue: TEXT_COLORS[0],
  values: TEXT_COLORS,
});
export type TLDokablyTextColor = T.TypeOf<typeof DokablyTextColor>;

//@ts-ignore
export const DocablyBorderColor = StyleProp.defineEnum('dokably:border', {
  //@ts-ignore
  defaultValue: SHAPE_BORDER_COLORS[0],
  values: SHAPE_BORDER_COLORS,
});
export type TLDokablyBorderColor = T.TypeOf<typeof DocablyBorderColor>;

//@ts-ignore
export const DocablyMindMapBorderColor = StyleProp.defineEnum('dokably:mind-map-border-color', {
  //@ts-ignore
  defaultValue: MIND_MAP_BORDER_COLORS[7],
  values: MIND_MAP_BORDER_COLORS,
});
export type TLDokablyMindMapBorderColor = T.TypeOf<typeof DocablyMindMapBorderColor>;

//@ts-ignore
export const DocablyMindMapLineColor = StyleProp.defineEnum('dokably:mind-map-line-color', {
  //@ts-ignore
  defaultValue: MIND_MAP_LINE_COLORS[0],
  values: MIND_MAP_LINE_COLORS,
});
export type TLDocablyMindMapLineColor = T.TypeOf<typeof DocablyMindMapLineColor>;

//@ts-ignore
export const DocablyMindMapBorder = StyleProp.defineEnum('dokably:mind-map-border', {
  //@ts-ignore
  defaultValue: 'none',
  values: ['none', 'round'],
});
export type TLDokablyMindMapBorder = T.TypeOf<typeof DocablyMindMapBorder>;

//@ts-ignore
export const DocablyBgColor = StyleProp.defineEnum('dokably:bg', {
  //@ts-ignore
  defaultValue: SHAPE_BACKGROUND_COLORS[SHAPE_BACKGROUND_COLORS.length - 1],
  values: SHAPE_BACKGROUND_COLORS,
});
export type TLDokablyBgColor = T.TypeOf<typeof DocablyBgColor>;

//@ts-ignore
export const DocablyMindMapSide = StyleProp.defineEnum('dokably:mind-map-side', {
  //@ts-ignore
  defaultValue: 'all',
  values: ['top', 'right', 'bottom', 'left', 'all'],
});
export type TLDokablyMindMapSide = T.TypeOf<typeof DocablyMindMapSide>;

//@ts-ignore
export const DokablyFill = StyleProp.defineEnum('dokably:fill', {
  //@ts-ignore
  defaultValue: 'transparent',
  values: [...CustomColors],
});
export type TLDokablyFill = T.TypeOf<typeof DokablyFill>;

//@ts-ignore
export const DokablyNoteBgColor = StyleProp.defineEnum('dokably:noteBg', {
  //@ts-ignore
  defaultValue: NOTE_COLORS[0],
  values: NOTE_COLORS,
});
export type TLDokablyNoteBgColor = T.TypeOf<typeof DokablyNoteBgColor>;

//@ts-ignore
export const DokablySize = StyleProp.defineEnum('dokably:size', {
  //@ts-ignore
  defaultValue: 'm',
  values: ['s', 'm', 'l', 'custom'],
});
export type TLDokablySize = T.TypeOf<typeof DokablySize>;

//@ts-ignore
export const DokablyStartAnchorPosition = StyleProp.defineEnum('dokably:start-anchor-position', {
  //@ts-ignore
  defaultValue: 'middle',
  values: ['top', 'bottom', 'left', 'right', 'middle'],
});
export type TLStartAnchorPosition = T.TypeOf<typeof DokablyStartAnchorPosition>;

//@ts-ignore
export const DokablyEndAnchorPosition = StyleProp.defineEnum('dokably:end-anchor-position', {
  //@ts-ignore
  defaultValue: 'middle',
  values: ['top', 'bottom', 'left', 'right', 'middle'],
});
export type TLEndAnchorPosition = T.TypeOf<typeof DokablyEndAnchorPosition>;

//@ts-ignore
export const DokablyAlign = StyleProp.defineEnum('dokably:align', {
  //@ts-ignore
  defaultValue: 'middle',
  values: ['left', 'middle', 'right'],
});
export type TLDokablyAlign = T.TypeOf<typeof DokablyAlign>;

//@ts-ignore
export const DokablyVerticalAlign = StyleProp.defineEnum(
  //@ts-ignore
  'dokably:verticalAlign',
  {
    //@ts-ignore
    defaultValue: 'middle',
    values: ['top', 'middle', 'bottom'],
  }
);
export type TLDokablyVerticalAlign = T.TypeOf<typeof DokablyVerticalAlign>;

//@ts-ignore
export const DokablyPenSize = StyleProp.defineEnum(
  //@ts-ignore
  'dokably:pen-size',
  {
    //@ts-ignore
    defaultValue: 6,
    values: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
  }
);
export type TLDokablyPenSize = T.TypeOf<typeof DokablyPenSize>;

//@ts-ignore
export const DokablyHighlightSize = StyleProp.defineEnum(
  //@ts-ignore
  'dokably:highlight-size',
  {
    //@ts-ignore
    defaultValue: 20,
    values: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
  }
);
export type TLDokablyHighlightSize = T.TypeOf<typeof DokablyHighlightSize>;

//@ts-ignore
export const DokablyDashStyle = StyleProp.defineEnum('dokably:dash', {
	defaultValue: 'draw',
	values: ['draw', 'solid', 'dashed', 'dotted'],
})

/** @public */
export type TLDokablyDashStyle = T.TypeOf<typeof DokablyDashStyle>

const arrowheadTypes = [
	'arrow',
	'triangle',
	'square',
	'dot',
	'pipe',
	'diamond',
	'inverted',
	'bar',
	'none',
] as const

//@ts-ignore
export const ArrowShapeArrowheadStartStyle = StyleProp.defineEnum('dokably:arrowheadStart', {
	defaultValue: 'none',
	values: arrowheadTypes,
})

//@ts-ignore
export const ArrowShapeArrowheadEndStyle = StyleProp.defineEnum('dokably:arrowheadEnd', {
	defaultValue: 'arrow',
	values: arrowheadTypes,
})

//@ts-ignore
export const DefaultSizeStyle = StyleProp.defineEnum('dokably:arrow-size', {
	defaultValue: 'm',
	values: ['s', 'm', 'l', 'xl'],
})

/** @public */
export type TLDefaultSizeStyle = T.TypeOf<typeof DefaultSizeStyle>


//@ts-ignore
export const DefaultDashStyle = StyleProp.defineEnum('dokably:dash', {
	defaultValue: 'draw',
	values: ['draw', 'solid', 'dashed', 'dotted'],
})

/** @public */
export type TLDefaultDashStyle = T.TypeOf<typeof DefaultDashStyle>

//@ts-ignore
export const DokablyLineShapeSplineStyle = StyleProp.defineEnum('dokably:spline', {
	defaultValue: 'line',
	values: ['cubic', 'line'],
})

/** @public */
export type TLLineShapeSplineStyle = T.TypeOf<typeof DokablyLineShapeSplineStyle>

//@ts-ignore
export const DokablyTextShapeAlign = StyleProp.defineEnum('dokably:text-shape-align', {
  //@ts-ignore
  defaultValue: 'left',
  values: ['left', 'middle', 'right'],
});
export type TLDokablyTextShapeAlign = T.TypeOf<typeof DokablyTextShapeAlign>;
