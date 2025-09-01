import cn from 'classnames';
import { ReactComponent as MindMap } from '@icons/Mindmap.svg';
import {
  TLParentId,
  createShapeId,
  useEditor,
  useValue,
  TLEventInfo,
  IndexKey,
} from '@tldraw/editor';
import { useClickOutside } from '@app/hooks/useClickOutside';
import Tippy from '@tippyjs/react';
import { useTools } from '@tldraw/tldraw';
import {
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
  MIND_MAP_SOFT_ARROW_SHAPE_ID,
  MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE,
  MIND_MAP_SQUARE_ARROW_SHAPE_ID_TYPE,
  MIND_MAP_SQUARE_ARROW_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { ReactComponent as MindMapTemplateCurvedDown } from '@images/mind-map-bottom-curved.svg';
import { ReactComponent as MindMapTemplateCurvedRight } from '@images/mind-map-right-curved.svg';
import { ReactComponent as MindMapTemplateRightStraight } from '@images/mind-map-right-straight.svg';
import { ReactComponent as MindMapTemplateDownStraight } from '@images/mind-map-bottom-straight.svg';
import { useCallback, useState, useEffect } from 'react';
import { IMindMapChildInput } from '../mindmap/child-input/mind-map-child-input-types';
import { IMindMapMainInput } from '../mindmap/main-input/mind-map-main-input-types';
import {
  MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
  MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
  MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
  MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH,
} from '@app/constants/whiteboard/constants';
import {
  DocablyMindMapBorder,
  DokablyTextColor,
} from '@app/constants/whiteboard/whiteboard-styles';

type TemplateType =
  | 'bottomCurve'
  | 'bottomStraight'
  | 'rightCurve'
  | 'rightStraight'
  | null;

const MindMapTool = () => {
  const editor = useEditor();
  const tools = useTools();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const {
    ref,
    isVisible: isOpen,
    setIsVisible: setOpen,
  } = useClickOutside(false);

  const chooseMindMapTool = () => {
    tools[MIND_MAP_MAIN_INPUT_SHAPE_ID] = {
      id: MIND_MAP_MAIN_INPUT_SHAPE_ID,
      icon: 'color',
      label: 'Mind map' as any,
      kbd: 'n,r',
      readonlyOk: false,
      onSelect: () => {
        editor.selectNone();
        editor.setStyleForNextShapes(DocablyMindMapBorder, 'round');
        editor.setCurrentTool(MIND_MAP_MAIN_INPUT_SHAPE_ID);
      },
    };
    tools[MIND_MAP_MAIN_INPUT_SHAPE_ID].onSelect('toolbar');
  };

  const handleClick = () => {
    chooseMindMapTool();
    setOpen(!isOpen);
  };

  const [events, setEvents] = useState<any[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(null);

  const handleClickCanvasEvent = useCallback(
    (data: TLEventInfo) => {
      if (data.name !== 'pointer_down' || !selectedTemplate) return;

      const canvasPoints = editor.screenToPage(data.point);

      switch (selectedTemplate) {
        case 'bottomCurve':
          templateBottomCurve(canvasPoints.x, canvasPoints.y);
          break;
        case 'bottomStraight':
          templateBottomStraight(canvasPoints.x, canvasPoints.y);
          break;
        case 'rightCurve':
          templateRightCurve(canvasPoints.x, canvasPoints.y);
          break;
        case 'rightStraight':
          templateRightStraight(canvasPoints.x, canvasPoints.y);
          break;
      }

      setSelectedTemplate(null);
    },
    [editor, selectedTemplate]
  );

  useEffect(() => {
    if (!editor) return;

    editor.on('event', handleClickCanvasEvent);
    return () => {
      editor.off('event', handleClickCanvasEvent);
    };
  }, [editor, handleClickCanvasEvent]);

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  type Side = 'top' | 'right' | 'bottom' | 'left';
  const VERTICAL_GAP_BTW_INPUTS = 50;
  const HORIZONTAL_GAP_BTW_INPUTS = 50;

  const getChildrenInputs = (
    shape: IMindMapChildInput | IMindMapMainInput,
    side: Side
  ) => {
    const childrenIds = editor.getSortedChildIdsForParent(shape.id) || [];
    const childrenInputs = childrenIds
      .map((id) => editor.getShape(id))
      .filter(
        (shape) => shape?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID
      ) as IMindMapChildInput[];

    const existingRightSideInputs = childrenInputs.filter(
      (shape: IMindMapChildInput) => shape?.props.side === side
    );
    return existingRightSideInputs;
  };

  const createBottomChildToMain = useCallback(
    (
      side: Side,
      mainInput: IMindMapMainInput,
      arrowId:
        | MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE
        | MIND_MAP_SQUARE_ARROW_SHAPE_ID_TYPE
    ) => {
      if (!mainInput) return;

      const currentShape = mainInput;
      const existingThisSideInputs = getChildrenInputs(currentShape, side);

      const isFirstChild = existingThisSideInputs.length === 0;
      const newInputId = createShapeId();

      const newInputY = currentShape.props.h + VERTICAL_GAP_BTW_INPUTS;

      if (isFirstChild) {
        const newInputX =
          currentShape.props.w / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH / 2;

        const createBottomInput = () => {
          editor.createShape({
            ...currentShape,
            id: newInputId,
            x: newInputX,
            y: newInputY,
            parentId: currentShape.id,
            type: MIND_MAP_CHILD_INPUT_SHAPE_ID,
            props: {
              ...currentShape.props,
              side,
              w: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              h: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              heightWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              widthWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              text: '',
              index: existingThisSideInputs.length,
              maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              border: 'none',
            },
          });
        };
        createBottomInput();

        const createArrowToBottomInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: 'a2' as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              startingAnchorOrientation: 'top',
              endingAnchorOrientation: 'bottom',
              arrowheadEnd: 'none',
              arrowheadStart: 'none',
              bend: 0,
              color: '#FF6CA1',
              dash: 'draw',
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: { x: 0.5, y: 0 },
                type: 'binding',
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: { x: 0.5, y: 1 },
                type: 'binding',
              },
            },
          });
        };

        createArrowToBottomInput();

        const updateCurrentShapeSide = () => {
          editor.updateShape({
            ...currentShape,
            props: {
              ...currentShape.props,
              side,
            },
          });
        };

        updateCurrentShapeSide();
        return;
      }

      const updateCurrentChildren = () => {
        const updatedInputs = existingThisSideInputs.map((shape) => {
          return {
            ...shape,
            x: shape.x - (MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2,
            props: {
              ...shape.props,
              maxXWithChildren:
                shape.props.maxXWithChildren -
                (MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2,
            },
          };
        });
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      };

      const updatedCurrentChildren = updateCurrentChildren();

      const lastChild = updatedCurrentChildren.reduce((acc, currVal) => {
        if (acc.props.index > currVal.props.index) return acc;
        return currVal;
      });

      const newInputX = lastChild.props.maxXWithChildren + 20;

      const createOneMoreBottomInput = () => {
        editor.createShape({
          ...currentShape,
          id: newInputId,
          x: newInputX,
          y: newInputY,
          parentId: currentShape.id,
          type: MIND_MAP_CHILD_INPUT_SHAPE_ID,
          props: {
            ...currentShape.props,
            side,
            w: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            h: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            heightWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            widthWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            text: '',
            index: existingThisSideInputs.length,
            maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            border: 'none',
          },
        });
      };
      createOneMoreBottomInput();

      const createArrowToOneMoreBottomInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: 'a2' as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            startingAnchorOrientation: 'top',
            endingAnchorOrientation: 'bottom',
            arrowheadEnd: 'none',
            arrowheadStart: 'none',
            bend: 0,
            color: '#FF6CA1',
            dash: 'draw',
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: { x: 0.5, y: 0 },
              type: 'binding',
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: { x: 0.5, y: 1 },
              type: 'binding',
            },
          },
        });
      };

      createArrowToOneMoreBottomInput();
    },
    [selectedShapes, editor]
  );

  const createRightChildToMain = useCallback(
    (
      side: Side,
      mainInput: IMindMapMainInput,
      arrowId:
        | MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE
        | MIND_MAP_SQUARE_ARROW_SHAPE_ID_TYPE
    ) => {
      const currentShape = mainInput;
      const existingRightSideInputs = getChildrenInputs(currentShape, side);

      const isFirstChild = existingRightSideInputs.length === 0;
      const newInputId = createShapeId();
      const newInputX =
        (currentShape.props as any).w + HORIZONTAL_GAP_BTW_INPUTS;

      if (isFirstChild) {
        const newInputY =
          currentShape.props.h / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT / 2;

        const createRightInput = () => {
          editor.createShape({
            ...currentShape,
            id: newInputId,
            x: newInputX,
            y: newInputY,
            parentId: currentShape.id,
            type: MIND_MAP_CHILD_INPUT_SHAPE_ID,
            props: {
              ...currentShape.props,
              side,
              w: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              h: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              heightWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              widthWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              text: '',
              index: existingRightSideInputs.length,
              maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              border: 'none',
            },
          });
        };
        createRightInput();

        const createArrowToRightInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: 'a2' as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              startingAnchorOrientation: 'left',
              endingAnchorOrientation: 'right',
              arrowheadEnd: 'none',
              arrowheadStart: 'none',
              bend: 0,
              color: '#FF6CA1',
              dash: 'draw',
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: { x: 0, y: 0.5 },
                type: 'binding',
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: { x: 1, y: 0.5 },
                type: 'binding',
              },
            },
          });
        };

        createArrowToRightInput();

        const updateCurrentShapeSide = () => {
          editor.updateShape({
            ...currentShape,
            props: {
              ...currentShape.props,
              side,
            },
          });
        };

        updateCurrentShapeSide();
        return;
      }

      const updateCurrentChildren = () => {
        const updatedInputs = existingRightSideInputs.map((shape) => {
          return {
            ...shape,
            y: shape.y - (MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2,
            props: {
              ...shape.props,
              maxYWithChildren:
                shape.props.maxYWithChildren -
                (MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2,
            },
          };
        });
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      };

      const updatedlastChildren = updateCurrentChildren();
      const lastChild = updatedlastChildren.reduce((acc, currVal) => {
        if (acc.props.index > currVal.props.index) return acc;
        return currVal;
      });

      const nextInputY = lastChild.props.maxYWithChildren + 20;

      const createOneMoreRightInput = () => {
        editor.createShape({
          ...currentShape,
          id: newInputId,
          x: newInputX,
          y: nextInputY,
          parentId: currentShape.id,
          type: MIND_MAP_CHILD_INPUT_SHAPE_ID,
          props: {
            ...currentShape.props,
            side,
            w: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            h: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            heightWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            widthWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            text: '',
            index: existingRightSideInputs.length,
            maxYWithChildren: nextInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            border: 'none',
          },
        });
      };
      createOneMoreRightInput();

      const createArrowToOneMoreRightInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: 'a2' as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            startingAnchorOrientation: 'left',
            endingAnchorOrientation: 'right',
            arrowheadEnd: 'none',
            arrowheadStart: 'none',
            bend: 0,
            color: '#FF6CA1',
            dash: 'draw',
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: { x: 0, y: 0.5 },
              type: 'binding',
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: { x: 1, y: 0.5 },
              type: 'binding',
            },
          },
        });
      };

      createArrowToOneMoreRightInput();
    },
    [selectedShapes, editor]
  );

  const createMindMapMainInput = useCallback(
    (
      side: Side,
      arrowId:
        | MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE
        | MIND_MAP_SQUARE_ARROW_SHAPE_ID_TYPE,
      x: number,
      y: number
    ) => {
      const mainInputShapeId = createShapeId();

      editor.createShape({
        id: mainInputShapeId,
        index: 'a1' as IndexKey,
        isLocked: false,
        meta: {},
        opacity: 1,
        parentId: 'page:page' as TLParentId,
        rotation: 0,
        type: MIND_MAP_MAIN_INPUT_SHAPE_ID,
        typeName: 'shape',
        x,
        y,
        props: {
          border: 'round',
          arrowId,
          w: MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH,
          h: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
          heightWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
          widthWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH,
          color: DokablyTextColor.defaultValue,
          borderColor: '#FF6CA1',
          fill: 'transparent',
          size: 's',
          fontFamily: 'Euclid Circular A',
          fontSize: 14,
          text: '',
          align: 'middle',
          verticalAlign: 'middle',
          url: '',
          side,
          maxYWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT / 2,
          maxXWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH / 2,
        },
      });

      const shape = editor.getShape(mainInputShapeId);
      return shape;
    },
    [selectedShapes, editor]
  );

  const templateBottomCurve = (x: number, y: number) => {
    const mainInput = createMindMapMainInput(
      'bottom',
      MIND_MAP_SOFT_ARROW_SHAPE_ID,
      x,
      y
    );

    if (!mainInput) return;

    createBottomChildToMain(
      'bottom',
      mainInput as IMindMapMainInput,
      MIND_MAP_SOFT_ARROW_SHAPE_ID
    );
    createBottomChildToMain(
      'bottom',
      mainInput as IMindMapMainInput,
      MIND_MAP_SOFT_ARROW_SHAPE_ID
    );

    setOpen(false);
    tools['select'].onSelect('toolbar');
    editor.setSelectedShapes([mainInput.id]);
  };

  const templateBottomStraight = (x: number, y: number) => {
    const mainInput = createMindMapMainInput(
      'bottom',
      MIND_MAP_SQUARE_ARROW_SHAPE_ID,
      x,
      y
    );

    if (!mainInput) return;

    createBottomChildToMain(
      'bottom',
      mainInput as IMindMapMainInput,
      MIND_MAP_SQUARE_ARROW_SHAPE_ID
    );
    createBottomChildToMain(
      'bottom',
      mainInput as IMindMapMainInput,
      MIND_MAP_SQUARE_ARROW_SHAPE_ID
    );
    setOpen(false);
    tools['select'].onSelect('toolbar');
    editor.setSelectedShapes([mainInput.id]);
  };

  const templateRightCurve = (x: number, y: number) => {
    const mainInput = createMindMapMainInput(
      'right',
      MIND_MAP_SOFT_ARROW_SHAPE_ID,
      x,
      y
    );

    if (!mainInput) return;

    createRightChildToMain(
      'right',
      mainInput as IMindMapMainInput,
      MIND_MAP_SOFT_ARROW_SHAPE_ID
    );
    createRightChildToMain(
      'right',
      mainInput as IMindMapMainInput,
      MIND_MAP_SOFT_ARROW_SHAPE_ID
    );

    setOpen(false);
    tools['select'].onSelect('toolbar');
    editor.setSelectedShapes([mainInput.id]);
  };

  const templateRightStraight = (x: number, y: number) => {
    const mainInput = createMindMapMainInput(
      'right',
      MIND_MAP_SQUARE_ARROW_SHAPE_ID,
      x,
      y
    );

    if (!mainInput) return;

    createRightChildToMain(
      'right',
      mainInput as IMindMapMainInput,
      MIND_MAP_SQUARE_ARROW_SHAPE_ID
    );

    createRightChildToMain(
      'right',
      mainInput as IMindMapMainInput,
      MIND_MAP_SQUARE_ARROW_SHAPE_ID
    );

    setOpen(false);
    tools['select'].onSelect('toolbar');
    editor.setSelectedShapes([mainInput.id]);
  };

  const changeStrokeColor = (e: React.MouseEvent) => {
    const elems = e.currentTarget.querySelectorAll('path, rect');
    elems.forEach((elem) => {
      if (elem.hasAttribute('stroke')) {
        (elem as SVGElement).style.stroke = '#4A86FF';
      }
    });
  };

  const changeBgColor = (e: React.MouseEvent) => {
    const elems = e.currentTarget.querySelectorAll('rect');
    elems.forEach((elem) => {
      if (elem.hasAttribute('fill')) {
        (elem as SVGElement).style.fill = '#ECF0FB';
      }
    });
  };

  const reverseChangeStrokeColor = (e: React.MouseEvent ) => {
         const elems =
        e.currentTarget.querySelectorAll('path, rect');
      elems.forEach((elem) => {
        if (
          elem.hasAttribute('stroke') &&
          elem.getAttribute('stroke') === '#FF6CA1'
        ) {
          (elem as SVGElement).style.stroke = '#FF6CA1';
        } else if (
          elem.hasAttribute('stroke') &&
          elem.getAttribute('stroke') === '#949395'
        ) {
          (elem as SVGElement).style.stroke = '#949395';
        } else {
          (elem as SVGElement).style.stroke = '';
        }
      });
  };

  const reverseChangeBgColor = (e: React.MouseEvent) => {
    const elems = e.currentTarget.querySelectorAll('rect');
    elems.forEach((elem) => {
      if (elem.hasAttribute('fill')) {
        (elem as SVGElement).style.fill = '#F4F4F4';
      }
    });
  };

const [activeTemplate, setActiveTemplate] = useState<TemplateType | null>(null);

const handleFocus = (e: React.FocusEvent, template: TemplateType) => {
  setActiveTemplate(template);
  changeStrokeColor(e as any);
  changeBgColor(e as any);
};

const handleMouseEnter = (e: React.MouseEvent, template: TemplateType) => {
  if (activeTemplate !== template || activeTemplate === template) {
    changeStrokeColor(e);
    changeBgColor(e);
  }
};

const handleMouseLeave = (e: React.MouseEvent, template: TemplateType) => {
  if (activeTemplate !== template) {
    reverseChangeStrokeColor(e);
    reverseChangeBgColor(e);
  }
};

const handleBlur = (e: React.FocusEvent, template: TemplateType) => {
  if (activeTemplate === template) {
    reverseChangeStrokeColor(e as any);
    reverseChangeBgColor(e as any);
    setActiveTemplate(null);
  }
};

  return (
    <Tippy
      duration={0}
      content={isOpen ? '' : 'Mind map'}
      className={
        isOpen
          ? ''
          : '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
      }
    >
      <div ref={ref} className='pointer-events-auto relative flex items-center'>
        <MindMap
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]':
                isOpen || activeTool === MIND_MAP_MAIN_INPUT_SHAPE_ID,
            }
          )}
          onClick={handleClick}
        />
        {isOpen && (
          <>
            <div
              style={{
                flexDirection: 'row',
              }}
              className='
                absolute
                flex
                flex-wrap
                gap-[8px]
                left-[44px]
                w-[296px]
                p-[10px]
                z-[var(--zIndexWhiteboard)]
                bg-[var(--white)]
                rounded-[var(--border-radius)]
                shadow-sh2
                items-center
                justify-center
                flex-col
              '
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#3E3E41',
                  width: '100%',
                }}
              >
                Mind Map templates
              </div>
              <div
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  height: 'auto',
                }}
                className='
                  flex
                  flex-wrap
                  gap-[8px]
                  items-center
                  justify-center
                  flex-col
                '
              >
                <div
                  tabIndex={1}
                  className={cn(
                    'cursor-pointer',
                    `fill-[var(--icon-fill)]`,
                    `[&>path]:stroke-[var(--stroke)]`,
                    'group-hover:[&>path]:stroke-[var(--hover-stroke)]'
                  )}
                  onMouseEnter={(e) => handleMouseEnter(e, 'rightCurve')}
                  onFocus={(e) => handleFocus(e, 'rightCurve')}
                  onMouseLeave={(e) => handleMouseLeave(e, 'rightCurve')}
                  onBlur={(e) => handleBlur(e, 'rightCurve')}
                  onClick={() => setSelectedTemplate('rightCurve')}
                >
                  <MindMapTemplateCurvedRight />
                </div>

                <div
                  tabIndex={2}
                  className={cn(
                    'cursor-pointer',
                    `fill-[var(--icon-fill)]`,
                    `[&>path]:stroke-[var(--stroke)]`,
                    'group-hover:[&>path]:stroke-[var(--hover-stroke)]'
                  )}
                  onMouseEnter={(e) => handleMouseEnter(e, 'bottomCurve')}
                  onFocus={(e) => handleFocus(e, 'bottomCurve')}
                  onMouseLeave={(e) => handleMouseLeave(e, 'bottomCurve')}
                  onBlur={(e) => handleBlur(e, 'bottomCurve')}
                  onClick={() => setSelectedTemplate('bottomCurve')}
                >
                  <MindMapTemplateCurvedDown />
                </div>

                <div
                  tabIndex={3}
                  className={cn(
                    'cursor-pointer',
                    `fill-[var(--icon-fill)]`,
                    `[&>path]:stroke-[var(--stroke)]`,
                    'group-hover:[&>path]:stroke-[var(--hover-stroke)]'
                  )}
                  onMouseEnter={(e) => handleMouseEnter(e, 'rightStraight')}
                  onFocus={(e) => handleFocus(e, 'rightStraight')}
                  onMouseLeave={(e) => handleMouseLeave(e, 'rightStraight')}
                  onBlur={(e) => handleBlur(e, 'rightStraight')}
                  onClick={() => setSelectedTemplate('rightStraight')}
                >
                  <MindMapTemplateRightStraight />
                </div>

                <div
                  tabIndex={4}
                  className={cn(
                    'cursor-pointer',
                    `fill-[var(--icon-fill)]`,
                    `[&>path]:stroke-[var(--stroke)]`,
                    'group-hover:[&>path]:stroke-[var(--hover-stroke)]'
                  )}
                  onMouseEnter={(e) => handleMouseEnter(e, 'bottomStraight')}
                  onFocus={(e) => handleFocus(e, 'bottomStraight')}
                  onMouseLeave={(e) => handleMouseLeave(e, 'bottomStraight')}
                  onBlur={(e) => handleBlur(e, 'bottomStraight')}
                  onClick={() => setSelectedTemplate('bottomStraight')}
                >
                  <MindMapTemplateDownStraight />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Tippy>
  );
};

export default MindMapTool;
