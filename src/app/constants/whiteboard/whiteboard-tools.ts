import { CustomRectangleTool } from './../../../widgets/whiteboard/custom-shapes/custom-rectangle/CustomRectangleTool';
import { CustomPolygonTool } from './../../../widgets/whiteboard/custom-shapes/custom-polygon/CustomPolygonTool';
import { CustomParallelogramTool } from './../../../widgets/whiteboard/custom-shapes/custom-parallelogram/CustomParallelogramTool';
import { CustomEllipseTool } from './../../../widgets/whiteboard/custom-shapes/custom-ellipse/CustomEllipseTool';
import { CustomArrowRightTool } from './../../../widgets/whiteboard/custom-shapes/custom-arrow-right/CustomArrowRightTool';
import { CustomBubbleTool } from '@widgets/whiteboard/custom-shapes/custom-bubble/CustomBubbleTool';
import { CustomNoteTool } from '@widgets/whiteboard/custom-shapes/custom-note/CustomNoteTool';
import { CustomRectangleSoftTool } from '@widgets/whiteboard/custom-shapes/custom-rectangle-soft/CustomRectangleSoftTool';
import { CustomRhombusTool } from '@widgets/whiteboard/custom-shapes/custom-rhombus/CustomRhombusTool';
import { CustomSexagonTool } from '@widgets/whiteboard/custom-shapes/custom-sexagon/CustomSexagonTool';
import { CustomStarTool } from '@widgets/whiteboard/custom-shapes/custom-star/CustomStarTool';
import { CustomTextTool } from '@widgets/whiteboard/custom-shapes/custom-text/CustomTextTool';
import { CustomPenTool } from '@widgets/whiteboard/custom-shapes/custom-pen/custom-pen-tool';
import { CustomHighlightTool } from '@widgets/whiteboard/custom-shapes/custom-highlight/custom-highlight-tool';
import { defaultShapeTools, defaultTools } from '@tldraw/tldraw';
import { CustomSquareArrowTool } from '@widgets/whiteboard/custom-shapes/custom-square-arrow/CustomSquareArrowTool';
import { CustomStraightArrowTool } from '@widgets/whiteboard/custom-shapes/custom-straight-arrow/CustomStraightArrowTool';
import { CustomLineTool } from '@widgets/whiteboard/custom-shapes/custom-line/CustomLineTool';
import { CustomSoftArrowTool } from '@widgets/whiteboard/custom-shapes/custom-soft-arrow/CustomSoftArrowTool';
import { MindMapChildInputTool } from '@widgets/whiteboard/mindmap/child-input/MindMapChildInputTool';
import { MindMapMainInputTool } from '@widgets/whiteboard/mindmap/main-input/MindMapMainInputTool';
import { MindMapSoftArrowTool } from '@widgets/whiteboard/mindmap/mind-map-soft-arrow/tool';
import { MindMapSquareArrowTool } from '@widgets/whiteboard/mindmap/mind-map-square-arrow/tool';
import { CustomEmojiTool } from '@widgets/whiteboard/custom-shapes/custom-emoji/CustomEmojiTool';

export const whiteboardTools = [
  ...defaultTools,
  ...defaultShapeTools,
  CustomNoteTool,
  CustomArrowRightTool,
  CustomBubbleTool,
  CustomEllipseTool,
  CustomParallelogramTool,
  CustomPolygonTool,
  CustomRectangleTool,
  CustomRectangleSoftTool,
  CustomRhombusTool,
  CustomSexagonTool,
  CustomStarTool,
  CustomTextTool,
  CustomPenTool,
  CustomHighlightTool,
  CustomSquareArrowTool,
  CustomStraightArrowTool,
  CustomLineTool,
  CustomSoftArrowTool,
  MindMapChildInputTool,
  MindMapMainInputTool,
  MindMapSoftArrowTool,
  MindMapSquareArrowTool,
  CustomEmojiTool,
];
