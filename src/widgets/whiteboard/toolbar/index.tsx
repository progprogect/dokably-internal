import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from 'react';
import type * as CSS from 'csstype';
import { TLShape, useEditor, useValue } from '@tldraw/editor';
import FontFamily from './font-family';
import FontSize from './font-size';
import './style.css';
import FontStyle from './font-style';
import Alignment from './alignment';
import Lists from './lists';
import TextLinkButton from './text-link';
import TextColor from './text-color';
import TextHighlight from './text-highlight';
import Comment from './comment';
import Lock from './lock';
import More from './more';
import _ from 'lodash';
import FillingColor from './filling-color';
import BorderColor from './border-color';
import ChangeShape from './change-shape/ChangeShape';
import DrawColorPicker from './draw-color-picker';
import DrawThickness from './draw-thickness';
import { CUSTOM_DRAW_SHAPE_ID, CUSTOM_HIGHLIGHT_SHAPE_ID, MIND_MAP_SOFT_ARROW_SHAPE_ID, MIND_MAP_SQUARE_ARROW_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { Group } from './group';
import ArrowColor from './arrow-color';
import ChangeArrowType from './change-arrow-type';
import ArrowThickness from './arrow-thickness';
import ChangeMindMapShape from './change-mind-map-shape';
import MindMapArrowsType from './mind-map-arrows-type';
import MindMapBorderColor from './mind-map-border-color';
import ChangeEmoji from './change-emoji/ChangeEmoji';

interface ToolbarProps {
  openLinkPanel: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ openLinkPanel }) => {
  const editor = useEditor();
  const isReadOnly = editor.getInstanceState().isReadonly;

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const selectionPageBounds = useValue(
    'selectionPageBounds',
    () => editor.getSelectionPageBounds(),
    [editor]
  );

  const hoveredShape = useValue('hoveredShape', () => editor.getHoveredShape(), [
    editor,
  ]);

  const [toolbarStyles, setToolbarStyles] = useState<CSS.Properties>({
    visibility: 'hidden',
  });
  const [toolbarWidth, setToolbarWidth] = useState<number>(0);

  const onlySelectedShape = editor.getOnlySelectedShape() as TLShape | null;
  const isLocked = onlySelectedShape
    ? editor.isShapeOrAncestorLocked(onlySelectedShape)
    : false;

  useEffect(() => {
    window.addEventListener('mousedown', onLeftClick);
    return () => {
      window.removeEventListener('mousedown', onLeftClick);
    };
  }, [hoveredShape]);

  const onLeftClick = useCallback(
    (event: MouseEvent) => {
      if (
        event.button === 0 &&
        hoveredShape &&
        editor.isShapeOrAncestorLocked(hoveredShape)
      ) {
        const selectedIds = editor.getSelectedShapeIds();
        const targetShape = editor.getOutermostSelectableShape(hoveredShape);
        if (!selectedIds.includes(targetShape.id)) {
          editor.complete();
          editor.mark('selecting shape');
          editor.setSelectedShapes([targetShape.id]);
        }
      }
    },
    [hoveredShape, editor]
  );

  const rHtmlLayer = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const regularToolbarJSX = useMemo(() => (
    <>
      <ChangeMindMapShape />
      <MindMapArrowsType />
      <MindMapBorderColor />
      <ChangeShape />
      <FontFamily />
      <FontSize />
      <FontStyle />
      <Alignment />
      <Lists />
      <TextLinkButton openLinkPanel={openLinkPanel} />
      <TextColor />
      <ChangeEmoji />
      <TextHighlight />
      <BorderColor />
      <FillingColor />
      <ArrowThickness />
      <ChangeArrowType />
      <ArrowColor />
      {/* <Comment /> */}
      <Group />
      <Lock />
      <More />
    </>
  ), [openLinkPanel]);

  const drawingToolbarJSX = useMemo(() => (
    <>
      <DrawThickness />
      <DrawColorPicker />
      <Lock />
      <More />
    </>
  ), []);

  const unlockToolbarJSX = useMemo(() => (
    <>
      <Lock />
    </>
  ), []);

  const toolbar = useMemo(() => {
    if (isLocked) return unlockToolbarJSX;

    if (
      selectedShapes.every(
        (x) => x.type === CUSTOM_DRAW_SHAPE_ID || x.type === CUSTOM_HIGHLIGHT_SHAPE_ID
      )
    ) return drawingToolbarJSX;

    return regularToolbarJSX;
  }, [selectedShapes]);

  useEffect(() => {
    if (!toolbarRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!toolbarRef.current) return;

      const width = toolbarRef.current.getBoundingClientRect().width;
      setToolbarWidth(width);
    });
    resizeObserver.observe(toolbarRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const cameraState = useValue('cameraState', () => editor.getCameraState(), [
    editor,
  ]);

  const currentToolId = useValue(
    'currentToolId',
    () => editor.getCurrentTool().getCurrent()?.id,
    [editor]
  );

  const cameraX = useValue('cameraX', () => editor.getCamera().x, [editor]);

  const cameraZ = useValue('cameraZ', () => editor.getCamera().z, [editor]);

  const cameraY = useValue('cameraY', () => editor.getCamera().y, [editor]);

  const [isCameraMoving, setIsCameraMoving] = useState(false);

  const handler = useMemo(
    () => _.debounce((value) => setIsCameraMoving(value), 80),
    []
  );

  useEffect(() => {
    handler(cameraState === 'moving');
  }, [cameraState]);

  useLayoutEffect(() => {
    const calculateToolbarStyle = () => {
      if (
        !selectedShapes.length ||
        !selectionPageBounds ||
        (toolbarWidth < 90 && !isLocked) ||
        currentToolId === 'translating' ||
        currentToolId === 'resizing' ||
        isCameraMoving ||
        selectedShapes.every(item => ([MIND_MAP_SOFT_ARROW_SHAPE_ID, MIND_MAP_SQUARE_ARROW_SHAPE_ID] as string[]).includes(item.type))
      ) {
        return setToolbarStyles({ visibility: 'hidden' });
      }

      const x = cameraX;
      const z = cameraZ;
      const y = cameraY

      const left = (x + selectionPageBounds.center.x) * z - toolbarWidth / 2;
      const leftMax = (x + editor.getViewportPageBounds().maxX) * z - toolbarWidth - 20;

      let leftToUse = left;
      if (left > 70 && left < leftMax) {
        leftToUse = left
      } else if (left < 70) {
        leftToUse = 70
      } else if (left > leftMax) {
        leftToUse = leftMax;
      }

      const abovePositionY = (y + selectionPageBounds.minY) * z - 70;
      const belowPositionY = (y + selectionPageBounds.maxY) * z + 30;

      const top = abovePositionY < 70 ? belowPositionY : abovePositionY;

      setToolbarStyles({
        position: 'fixed',
        top: `${top}px`,
        left: `${leftToUse}px`,
        opacity: 1,
        zIndex: 2004,
      });
    };

    calculateToolbarStyle();
  }, [
    selectedShapes,
    selectionPageBounds,
    toolbarWidth,
    cameraX,
    cameraZ,
    cameraY,
    currentToolId,
    isCameraMoving,
  ]);

  if (isReadOnly) return null;

  return (
    <div className='tl-html-layer' ref={rHtmlLayer}>
      <div
        id='whiteboard-toolbar'
        className='toolbar'
        style={toolbarStyles}
        ref={toolbarRef}
      >
        {toolbar}
      </div>
    </div>
  );
};

export default memo(Toolbar);
