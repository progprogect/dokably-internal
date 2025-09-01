import { CustomNoteUtil } from '@widgets/whiteboard/custom-shapes/custom-note/CustomNoteUtil';
import { CustomRectangleUtil } from '@widgets/whiteboard/custom-shapes/custom-rectangle/CustomRectangleUtil';
import { CustomRectangleSoftUtil } from '@widgets/whiteboard/custom-shapes/custom-rectangle-soft/CustomRectangleSoftUtil';
import { CustomArrowRightUtil } from '@widgets/whiteboard/custom-shapes/custom-arrow-right/CustomArrowRightUtil';
import { CustomBubbleUtil } from '@widgets/whiteboard/custom-shapes/custom-bubble/CustomBubbleUtil';
import { CustomEllipseUtil } from '@widgets/whiteboard/custom-shapes/custom-ellipse/CustomEllipseUtil';
import { CustomParallelogramUtil } from '@widgets/whiteboard/custom-shapes/custom-parallelogram/CustomParallelogramUtil';
import { CustomPolygonUtil } from '@widgets/whiteboard/custom-shapes/custom-polygon/CustomPolygonUtil';
import { CustomStarUtil } from '@widgets/whiteboard/custom-shapes/custom-star/CustomStarUtil';
import { CustomRhombusUtil } from '@widgets/whiteboard/custom-shapes/custom-rhombus/CustomRhombusUtil';
import { CustomSexagonUtil } from '@widgets/whiteboard/custom-shapes/custom-sexagon/CustomSexagonUtil';
import { CustomTextUtil } from '@widgets/whiteboard/custom-shapes/custom-text/CustomTextUtil';
import { CustomPenUtil } from '@widgets/whiteboard/custom-shapes/custom-pen/custom-pen-util';
import { CustomHighlightUtil } from '@widgets/whiteboard/custom-shapes/custom-highlight/custom-highlight-util';
import { defaultShapeUtils } from '@tldraw/tldraw';
import { CustomSquareArrowUtil } from '@widgets/whiteboard/custom-shapes/custom-square-arrow/CustomSquareArrowUtil';
import { CustomStraightArrowUtil } from '@widgets/whiteboard/custom-shapes/custom-straight-arrow/CustomStraightArrowUtil';
import { CustomLineUtil } from '@widgets/whiteboard/custom-shapes/custom-line/CustomLineUtil';
import { CustomSoftArrowUtil } from '@widgets/whiteboard/custom-shapes/custom-soft-arrow/CustomSoftArrowUtil';
import { MindMapChildInputUtil } from '@widgets/whiteboard/mindmap/child-input/MindMapChildInputUtil';
import { MindMapMainInputUtil } from '@widgets/whiteboard/mindmap/main-input/MindMapMainInputUtil';
import { MindMapSoftArrowUtil } from '@widgets/whiteboard/mindmap/mind-map-soft-arrow/util';
import { MindMapSquareArrowUtil } from '@widgets/whiteboard/mindmap/mind-map-square-arrow/util';
import { CustomEmojiUtil } from '@widgets/whiteboard/custom-shapes/custom-emoji/CustomEmojiUtil';

export const customShapeUtils = [
  ...defaultShapeUtils,
  CustomNoteUtil,
  CustomRectangleUtil,
  CustomRectangleSoftUtil,
  CustomArrowRightUtil,
  CustomBubbleUtil,
  CustomEllipseUtil,
  CustomParallelogramUtil,
  CustomPolygonUtil,
  CustomStarUtil,
  CustomRhombusUtil,
  CustomSexagonUtil,
  CustomTextUtil,
  CustomPenUtil,
  CustomHighlightUtil,
  CustomSquareArrowUtil,
  CustomStraightArrowUtil,
  CustomLineUtil,
  CustomSoftArrowUtil,
  MindMapChildInputUtil,
  MindMapMainInputUtil,
  MindMapSoftArrowUtil,
  MindMapSquareArrowUtil,
  CustomEmojiUtil,
];
