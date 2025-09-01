import {
  CUSTOM_ARROW_RIGHT_SHAPE_ID,
  CUSTOM_BUBBLE_SHAPE_ID,
  CUSTOM_ELLIPSE_SHAPE_ID,
  CUSTOM_PARALLELOGRAM_SHAPE_ID,
  CUSTOM_POLYGON_SHAPE_ID,
  CUSTOM_RHOMBUS_SHAPE_ID,
  CUSTOM_SEXAGON_SHAPE_ID,
  CUSTOM_SHAPE_ID_TYPES,
  CUSTOM_STAR_SHAPE_ID,
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { useCallback, useState } from 'react';

export const useTextMesurements = ({
  shapeHeight,
  shapeWidth,
  shape,
}: {
  shape: CUSTOM_SHAPE_ID_TYPES;
  shapeHeight: number;
  shapeWidth: number;
}) => {
  const [textHeight, setTextHeight] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);

  const [svgWidth, setSvgWidth] = useState<number>(0);
  const [svgHeight, setSvgHeight] = useState<number>(0);

  const onHiddenSvgForMesurementsRefChange = useCallback(
    (svg: SVGSVGElement) => {
      let width;
      let height;

      switch (shape) {
        case CUSTOM_POLYGON_SHAPE_ID:
        case CUSTOM_STAR_SHAPE_ID:
        case CUSTOM_RHOMBUS_SHAPE_ID:
          width = svg ? svg.clientWidth * 0.5 : shapeWidth * 0.5;
          height = svg ? svg.clientHeight * 0.5 - 5 : shapeHeight * 0.5;
          break;
        case CUSTOM_ELLIPSE_SHAPE_ID:
          width = svg ? svg.clientWidth * 0.65 : shapeWidth * 0.65;
          height = svg ? svg.clientHeight * 0.65 : shapeHeight * 0.65;
          break;
        case CUSTOM_BUBBLE_SHAPE_ID:
          width = svg ? svg.clientWidth * 0.9 : shapeWidth * 0.9;
          height = svg ? svg.clientHeight * 0.65 : shapeHeight * 0.65;
          break;
        case CUSTOM_PARALLELOGRAM_SHAPE_ID:
          width = svg ? svg.clientWidth * 0.7 : shapeWidth * 0.7;
          height = svg ? svg.clientHeight * 0.96 : shapeHeight * 0.96;
          break;
        case CUSTOM_ARROW_RIGHT_SHAPE_ID:
          width = svg ? svg.clientWidth * 0.6 : shapeWidth * 0.6;
          height = svg ? svg.clientHeight * 0.5 : shapeHeight * 0.5;
          break;
        case CUSTOM_SEXAGON_SHAPE_ID:
          width = svg ? svg.clientWidth * 0.8 : shapeWidth * 0.8;
          height = svg ? svg.clientHeight * 0.5 : shapeHeight * 0.5;
          break;
        case MIND_MAP_CHILD_INPUT_SHAPE_ID:
        case MIND_MAP_MAIN_INPUT_SHAPE_ID:
        default:
          width = svg ? svg.clientWidth : shapeWidth;
          height = svg ? svg.clientHeight : shapeHeight;
          break;
      }

      setTextHeight(height);
      setTextWidth(width);

      if (svg) {
        setSvgWidth(svg.clientWidth);
        setSvgHeight(svg.clientHeight);
      }
    },
    [shapeHeight, shapeWidth, shape]
  );

  return {
    onRefChange: onHiddenSvgForMesurementsRefChange,
    textHeight,
    textWidth,
    svgWidth,
    svgHeight,
  };
};
