import { Box, BoxModel, Editor, TLBaseShape, TLDefaultHorizontalAlignStyle } from '@tldraw/editor';
import { createTextSvgElementFromSpans } from './createTextSvgElementFromSpans';

export function getLegacyOffsetX(
  align: TLDefaultHorizontalAlignStyle | string,
  padding: number,
  spans: { text: string; box: BoxModel }[],
  totalWidth: number
): number | undefined {
  if (
    (align === 'start-legacy' || align === 'end-legacy') &&
    spans.length !== 0
  ) {
    const spansBounds = Box.From(spans[0].box);
    for (const { box } of spans) {
      spansBounds.union(box);
    }
    if (align === 'start-legacy') {
      return (totalWidth - 2 * padding - spansBounds.width) / 2;
    } else if (align === 'end-legacy') {
      return -(totalWidth - 2 * padding - spansBounds.width) / 2;
    }
  }
}

// sneaky TLDefaultHorizontalAlignStyle for legacies
export function isLegacyAlign(
  align: TLDefaultHorizontalAlignStyle | string
): boolean {
  return (
    align === 'start-legacy' ||
    align === 'middle-legacy' ||
    align === 'end-legacy'
  );
}

export function getTextLabelSvgElement({
  bounds,
  editor,
  font,
  shape,
}: {
  bounds: Box;
  editor: Editor;
  font: string;
  shape: any;
}) {
  const padding = 16;

  const fontSize =
    shape.props.height < 200 ? 10 : shape.props.height < 300 ? 14 : 24;
  const lineHeight =
    shape.props.height < 200 ? 15 : shape.props.height < 300 ? 19 : 36;

  const opts = {
    fontSize: fontSize,
    fontFamily: font,
    textAlign: shape.props.align,
    verticalTextAlign: shape.props.verticalAlign,
    width: Math.ceil(bounds.width),
    height: Math.ceil(bounds.height),
    padding: 16,
    lineHeight: lineHeight,
    fontStyle: 'normal',
    fontWeight: 'normal',
    overflow: 'wrap' as const,
    offsetX: 0,
  };

  //@ts-ignore
  const spans = editor.textMeasure.measureTextSpans(shape.props.text, opts);

  const textElm = createTextSvgElementFromSpans(editor, spans, opts);
  return textElm;
}
