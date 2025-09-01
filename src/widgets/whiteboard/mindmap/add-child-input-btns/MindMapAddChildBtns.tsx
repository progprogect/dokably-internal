import { useLayoutEffect, useRef, useState, useMemo, useCallback } from 'react';
import type * as CSS from 'csstype';
import {
  Box,
  IndexKey,
  TLShapeId,
  createShapeId,
  useEditor,
  useValue,
} from '@tldraw/editor';
import styles from './style.module.scss';
import {
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_CHILD_INPUT_SHAPE_ID_TYPE,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import {
  MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
  MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
} from '@app/constants/whiteboard/constants';
import { IMindMapChildInput } from '../child-input/mind-map-child-input-types';
import { IMindMapMainInput } from '../main-input/mind-map-main-input-types';
import { Plus } from 'lucide-react';

const ADD_CHILD_BTN_WIDTH = 20;
const HORIZONTAL_GAP_BTW_INPUTS = 50;
const VERTICAL_GAP_BTW_INPUTS = 50;

const MindMapAddChildInputBtns: React.FC = () => {
  const editor = useEditor();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const selectionPageBounds = useValue(
    'selectionPageBounds',
    () => editor.getSelectionPageBounds() as Box,
    [editor]
  );

  const [topBtnStyle, setTopBtnStyle] = useState<CSS.Properties>({
    visibility: 'hidden',
  });

  const [rightBtnStyle, setRightBtnStyle] = useState<CSS.Properties>({
    visibility: 'hidden',
  });

  const [bottomBtnStyle, setBottomBtnStyle] = useState<CSS.Properties>({
    visibility: 'hidden',
  });

  const [leftBtnStyle, setLeftBtnStyle] = useState<CSS.Properties>({
    visibility: 'hidden',
  });

  const rHtmlLayer = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const showBtns = useMemo(() => {
    if (!selectedShapes) return false;
    if (!selectedShapes.length) return false;
    if (selectedShapes.length > 1) return false;
    if (!selectionPageBounds) return false;

    return (
      [MIND_MAP_CHILD_INPUT_SHAPE_ID, MIND_MAP_MAIN_INPUT_SHAPE_ID] as string[]
    ).includes(selectedShapes[0].type);
  }, [selectedShapes, selectionPageBounds]);

  const buttonsToShow = useMemo(() => {
    if (!showBtns) return [];

    if (selectedShapes?.[0]?.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) {
      switch ((selectedShapes?.[0] as IMindMapMainInput).props.side) {
        case 'bottom':
        case 'top':
          return ['top', 'bottom'];
        case 'left':
        case 'right':
          return ['left', 'right'];
        default:
          return ['top', 'right', 'bottom', 'left'];
      }
    }

    if (selectedShapes?.[0]?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) {
      switch ((selectedShapes?.[0] as IMindMapChildInput).props.side) {
        case 'bottom':
          return ['bottom'];
        case 'top':
          return ['top'];
        case 'left':
          return ['left'];
        case 'right':
          return ['right'];
        default:
          return [];
      }
    }

    return [];
  }, [selectedShapes, showBtns]);

  useLayoutEffect(() => {
    const calculateTopBtnStyle = () => {
      if (!showBtns) {
        return setTopBtnStyle({ visibility: 'hidden' });
      }

      const { x, y, z } = editor.getCamera();
      const left = (x + selectionPageBounds.center.x) * z - 20 - ADD_CHILD_BTN_WIDTH / 2;

      const abovePositionY = (y + selectionPageBounds.minY) * z - 46;
      const belowPositionY = (y + selectionPageBounds.maxY) * z - 10;
      const top = abovePositionY < 0 ? belowPositionY : abovePositionY;

      setTopBtnStyle({
        top: `${top}px`,
        left: `${left}px`,
      });
    };

    const calculateRightBtnStyle = () => {
      if (!showBtns) {
        return setRightBtnStyle({ visibility: 'hidden' });
      }

      const { x, y, z } = editor.getCamera();
      const left = (x + selectionPageBounds.maxX) * z - 10;
      const top = (y + selectionPageBounds.center.y) * z - 10;

      setRightBtnStyle({
        top: `${top}px`,
        left: `${left}px`,
        padding: '0 20px'
      });
    };

    const calculateBottomBtnStyle = () => {
      if (!showBtns) {
        return setBottomBtnStyle({ visibility: 'hidden' });
      }

      const { x, y, z } = editor.getCamera();
      const left = (x + selectionPageBounds.center.x) * z - 20 - ADD_CHILD_BTN_WIDTH / 2;
      const belowPositionY = (y + selectionPageBounds.maxY) * z - 10;

      setBottomBtnStyle({
        top: `${belowPositionY}px`,
        left: `${left}px`,
      });
    };

    const calculateLeftBtnStyle = () => {
      if (!showBtns) {
        return setLeftBtnStyle({ visibility: 'hidden' });
      }

      const { x, y, z } = editor.getCamera();
      const left = (x + selectionPageBounds.minX) * z - ADD_CHILD_BTN_WIDTH - 30;
      const top = (y + selectionPageBounds.center.y) * z - 10;

      setLeftBtnStyle({
        top: `${top}px`,
        left: `${left}px`,
        padding: '0 20px'
      });
    };

    calculateTopBtnStyle();
    calculateRightBtnStyle();
    calculateBottomBtnStyle();
    calculateLeftBtnStyle();
  }, [
    selectionPageBounds,
    editor.getCamera().x,
    editor.getCamera().z,
    editor.getCamera().y,
    showBtns,
  ]);

  const commonBtnStyle = useMemo<CSS.Properties>(
    () => ({
      position: 'fixed',
      opacity: 1,
      zIndex: 3004,
    }),
    []
  );

  type Side = 'top' | 'right' | 'bottom' | 'left';

  const calculateInputWithChildrenHeight = (inputShapeId: MIND_MAP_CHILD_INPUT_SHAPE_ID_TYPE): number => {
    const input = editor.getShape(inputShapeId as TLShapeId) as IMindMapChildInput;
    if (!input) return 0;

    const childrenIds = editor.getSortedChildIdsForParent(input.id) || [];
    if (!childrenIds.length) return input.props.h;

    const children = childrenIds.map((id) => editor.getShape(id))
    const childrenInputs = children.filter((shape) => shape?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) as IMindMapChildInput[];

    if (!childrenInputs.length) return input.props.h;
    const childrenInputsHeights = childrenInputs.map((shape) => calculateInputWithChildrenHeight(shape.id as MIND_MAP_CHILD_INPUT_SHAPE_ID_TYPE))

    const heightOfAllChildren = childrenInputsHeights.reduce((acc, currVal) => (acc + currVal), 0) + 20 * (childrenInputs.length - 1);
    const resultHeight = input.props.h > heightOfAllChildren ? input.props.h : heightOfAllChildren;

    return resultHeight;
  };

  const getHeightWithChildren = (shape: IMindMapMainInput | IMindMapChildInput): number => {
    const childrenIds = editor.getSortedChildIdsForParent(shape.id) || [];

    if (!childrenIds.length) return shape.props.h;

    const children = childrenIds.map((id) => editor.getShape(id)) as IMindMapChildInput[];

    const childrenInputs = children.filter(
      (item) => item?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID && item?.props?.side === shape.props.side
    );

    if (!childrenInputs.length) return shape.props.h;
    const childrenInputsHeights = childrenInputs.map((shape) =>
      getHeightWithChildren(shape)
    );

    const heightOfAllChildren =
      childrenInputsHeights.reduce((acc, currVal) => acc + currVal, 0) +
      20 * (childrenInputs.length - 1);
    const resultHeight =
      shape.props.h > heightOfAllChildren ? shape.props.h : heightOfAllChildren;

    return resultHeight;
  };

  const getWidthWithChildren = (shape: IMindMapMainInput | IMindMapChildInput): number => {
    const childrenIds = editor.getSortedChildIdsForParent(shape.id) || [];

    if (!childrenIds.length) return shape.props.w;

    const children = childrenIds.map((id) => editor.getShape(id)) as IMindMapChildInput[];

    const childrenInputs = children.filter(
      (item) => item?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID && item?.props?.side === shape.props.side
    );

    if (!childrenInputs.length) return shape.props.w;

    const childrenInputsWidths = childrenInputs.map((shape) =>
      getWidthWithChildren(shape)
    );


    const widthOfAllChildren =
      childrenInputsWidths.reduce((acc, currVal) => acc + currVal, 0) +
      20 * (childrenInputs.length - 1);

    const resultWidth =
      shape.props.w > widthOfAllChildren ? shape.props.w : widthOfAllChildren;

    return resultWidth;
  }

  const getChildrenInputs = (shape: IMindMapChildInput | IMindMapMainInput, side: Side) => {
    const childrenIds = editor.getSortedChildIdsForParent(shape.id) || [];
    const childrenInputs = childrenIds.map((id) => editor.getShape(id)).filter((shape) => shape?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) as IMindMapChildInput[];

    const existingRightSideInputs = childrenInputs.filter((shape: IMindMapChildInput) => shape?.props.side === side);
    return existingRightSideInputs;
  }

  const createRightChildToMain = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput;
      const existingRightSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingRightSideInputs.length === 0;
      const newInputId = createShapeId();
      const newInputX = (currentShape.props as any).w  + HORIZONTAL_GAP_BTW_INPUTS;

      if (isFirstChild) {
        const newInputY = currentShape.props.h / 2 -  MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT / 2;

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
              textContents: ''
            },
          });
        }
        createRightInput();

        const createArrowToRightInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              startingAnchorOrientation: 'left',
              endingAnchorOrientation: 'right',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0, y: 0.5},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 1, y: 0.5},
                type: "binding",
              },
            }
          });
        }

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
        const updatedInputs = existingRightSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            y: shape.y - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            props: {
              ...shape.props,
              maxYWithChildren: shape.props.maxYWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

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
            textContents: ''
          },
        });
      }
      createOneMoreRightInput();

      const createArrowToOneMoreRightInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            endingAnchorOrientation: 'right',
            startingAnchorOrientation: 'left',
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0, y: 0.5},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 1, y: 0.5},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreRightInput();
    },
    [selectedShapes, editor],
  )

  const createRightChildToChild = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      const existingRightSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingRightSideInputs.length === 0;
      const newInputId = createShapeId();
      const newInputX = (currentShape.props as any).w  + HORIZONTAL_GAP_BTW_INPUTS;

      if (isFirstChild) {
        const newInputY = currentShape.props.h / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT / 2;

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
              textContents: ''
            },
          });
        }
        createRightInput();

        const createArrowToRightInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              endingAnchorOrientation: 'right',
              startingAnchorOrientation: 'left',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0, y: 0.5},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 1, y: 0.5},
                type: "binding",
              },
            }
          });
        }

        createArrowToRightInput();
        return;
      }

      const updateCurrentChildren = () => {
        const updatedInputs = existingRightSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            y: shape.y - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            props: {
              ...shape.props,
              maxYWithChildren: shape.props.maxYWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

      const updatedChildren = updateCurrentChildren();

      const lastChild = updatedChildren.reduce((acc, currVal) => {
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
            textContents: ''
          },
        });
      }

      createOneMoreRightInput();
      const createArrowToOneMoreRightInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            endingAnchorOrientation: 'right',
            startingAnchorOrientation: 'left',
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0, y: 0.5},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 1, y: 0.5},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreRightInput();

      const updateCurrentShapeMaxH = () => {
        const heightWithChildren = getHeightWithChildren(currentShape);
        editor.updateShape({
          ...currentShape,
          props: {
            ...currentShape.props,
            side,
            heightWithChildren,
          },
        });
      };

      updateCurrentShapeMaxH();

      const moveAllInputsDueToMaxHChange = () => {
        setTimeout(() => {
          const parentInput = editor.getShapeParent(currentShape.id) as IMindMapChildInput;
          if (!parentInput) return;
          const childrenInputs = getChildrenInputs(parentInput, side)
          if (childrenInputs.length === 0) return;

          if (childrenInputs.length === 1) {
            const updatedChildren = childrenInputs.map(item => {
              const updatedItem = {
                ...item,
                props: {
                  ...item.props,
                  maxYWithChildren: item.y + item.props.heightWithChildren,
                }
              };

              return updatedItem;
            })
            editor.updateShapes(updatedChildren);
            return
          };

          const allChildrenInputsHeight = childrenInputs.reduce((acc, currVal) => {
            return acc + currVal.props.heightWithChildren + 20;
          }, 0) - 20;

          let highestPoint = parentInput.props.h / 2 -(allChildrenInputsHeight / 2);

          const updatedChildren = childrenInputs.map(item => {
            const updatedItem = {
              ...item,
              y: highestPoint + item.props.heightWithChildren / 2 - item.props.h / 2,
              props: {
                ...item.props,
                maxYWithChildren: highestPoint + item.props.heightWithChildren,
              }
            };
            const nextItemY = highestPoint + item.props.heightWithChildren + 20;
            highestPoint = nextItemY;

            return updatedItem;
          })

          editor.updateShapes(updatedChildren);
        }, 0)
      }
      moveAllInputsDueToMaxHChange();
    },
    [selectedShapes, editor],
  )
  const createRightChildInput = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      if (currentShape.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) return createRightChildToMain(side);
      if (currentShape.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) return createRightChildToChild(side);
    },
    [selectedShapes, editor],
  )

  const createLeftChildToMain = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput;
      const existingRightSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingRightSideInputs.length === 0;
      const newInputId = createShapeId();
      const newInputX = - HORIZONTAL_GAP_BTW_INPUTS - MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH;

      if (isFirstChild) {
        const newInputY = currentShape.props.h / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT / 2;

        const createLeftInput = () => {
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
              textContents: ''
            },
          });
        }
        createLeftInput();

        const createArrowToLeftInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              endingAnchorOrientation: 'left',
              startingAnchorOrientation: 'right',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 1, y: 0.5},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0, y: 0.5},
                type: "binding",
              },
            }
          });
        }

        createArrowToLeftInput();

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
        const updatedInputs = existingRightSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            y: shape.y - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            props: {
              ...shape.props,
              maxYWithChildren: shape.props.maxYWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

      const updatedlastChildren = updateCurrentChildren();
      const lastChild = updatedlastChildren.reduce((acc, currVal) => {
        if (acc.props.index > currVal.props.index) return acc;
        return currVal;
      });

      const nextInputY = lastChild.props.maxYWithChildren + 20;

      const createOneMoreLeftInput = () => {
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
            textContents: ''
          },
        });
      }
      createOneMoreLeftInput();

      const createArrowToOneMoreLeftInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            endingAnchorOrientation: 'left',
            startingAnchorOrientation: 'right',
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 1, y: 0.5},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0, y: 0.5},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreLeftInput();
    },
    [selectedShapes, editor],
  )

  const createLeftChildToChild = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      const existingLeftSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingLeftSideInputs.length === 0;
      const newInputId = createShapeId();
      const newInputX = - HORIZONTAL_GAP_BTW_INPUTS - MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH;

      if (isFirstChild) {
        const newInputY = currentShape.props.h / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT / 2;

        const createLeftInput = () => {
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
              index: existingLeftSideInputs.length,
              maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              border: 'none',
              textContents: ''
            },
          });
        }
        createLeftInput();

        const createArrowToLeftInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              endingAnchorOrientation: 'left',
              startingAnchorOrientation: 'right',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 1, y: 0.5},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0, y: 0.5},
                type: "binding",
              },
            }
          });
        }

        createArrowToLeftInput();
        return;
      }

      const updateCurrentChildren = () => {
        const updatedInputs = existingLeftSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            y: shape.y - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            props: {
              ...shape.props,
              maxYWithChildren: shape.props.maxYWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT + 20) / 2),
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

      const updatedChildren = updateCurrentChildren();

      const lastChild = updatedChildren.reduce((acc, currVal) => {
        if (acc.props.index > currVal.props.index) return acc;
        return currVal;
      });

      const nextInputY = lastChild.props.maxYWithChildren + 20;

      const createOneMoreLeftInput = () => {
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
            index: existingLeftSideInputs.length,
            maxYWithChildren: nextInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            border: 'none',
            textContents: ''
          },
        });
      }

      createOneMoreLeftInput();
      const createArrowToOneMoreLeftInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            endingAnchorOrientation: 'left',
            startingAnchorOrientation: 'right',
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 1, y: 0.5},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0, y: 0.5},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreLeftInput();

      const updateCurrentShapeMaxH = () => {
        const heightWithChildren = getHeightWithChildren(currentShape);
        editor.updateShape({
          ...currentShape,
          props: {
            ...currentShape.props,
            side,
            heightWithChildren,
          },
        });
      };

      updateCurrentShapeMaxH();

      const moveAllInputsDueToMaxHChange = () => {
        setTimeout(() => {
          const parentInput = editor.getShapeParent(currentShape.id) as IMindMapChildInput;
          if (!parentInput) return;
          const childrenInputs = getChildrenInputs(parentInput, side)
          if (childrenInputs.length === 0) return;

          if (childrenInputs.length === 1) {
            const updatedChildren = childrenInputs.map(item => {
              const updatedItem = {
                ...item,
                props: {
                  ...item.props,
                  maxYWithChildren: item.y + item.props.heightWithChildren,
                }
              };

              return updatedItem;
            })
            editor.updateShapes(updatedChildren);
            return
          };

          const allChildrenInputsHeight = childrenInputs.reduce((acc, currVal) => {
            return acc + currVal.props.heightWithChildren + 20;
          }, 0) - 20;

          let highestPoint = parentInput.props.h / 2 -(allChildrenInputsHeight / 2);

          const updatedChildren = childrenInputs.map(item => {
            const updatedItem = {
              ...item,
              y: highestPoint + item.props.heightWithChildren / 2 - item.props.h / 2,
              props: {
                ...item.props,
                maxYWithChildren: highestPoint + item.props.heightWithChildren,
              }
            };
            const nextItemY = highestPoint + item.props.heightWithChildren + 20;
            highestPoint = nextItemY;

            return updatedItem;
          })

          editor.updateShapes(updatedChildren);
        }, 0)
      }
      moveAllInputsDueToMaxHChange();
    },
    [selectedShapes, editor],
  )

  const createLeftChildInput = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      if (currentShape.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) return createLeftChildToMain(side);
      if (currentShape.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) return createLeftChildToChild(side);
    },
    [selectedShapes, editor],
  )

  const createTopChildToMain = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput;
      const existingRightSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingRightSideInputs.length === 0;
      const newInputId = createShapeId();

      const newInputY = - VERTICAL_GAP_BTW_INPUTS - MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT;

      if (isFirstChild) {
        const newInputX = currentShape.props.w / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH / 2;

        const createTopInput = () => {
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
              maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              border: 'none',
              textContents: ''
            },
          });
        }
        createTopInput();

        const createArrowToTopInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              endingAnchorOrientation: 'top',
              startingAnchorOrientation: 'bottom',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 1},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 0},
                type: "binding",
              },
            }
          });
        }

        createArrowToTopInput();

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
        const updatedInputs = existingRightSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            x: shape.x - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2),
            props: {
              ...shape.props,
              maxXWithChildren: shape.props.maxXWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2)
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

      const updatedCurrentChildren = updateCurrentChildren();

      const lastChild = updatedCurrentChildren.reduce((acc, currVal) => {
        if (acc.props.index > currVal.props.index) return acc;
        return currVal;
      });

        const newInputX = lastChild.props.maxXWithChildren + 20;

      const createOneMoreTopInput = () => {
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
            maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            border: 'none',
            textContents: ''
          },
        });
      }
      createOneMoreTopInput();

      const createArrowToOneMoreTopInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            endingAnchorOrientation: 'top',
            startingAnchorOrientation: 'bottom',
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 1},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 0},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreTopInput();
    },
    [selectedShapes, editor],
  )

  const createTopChildToChild = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      const existingLeftSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingLeftSideInputs.length === 0;
      const newInputId = createShapeId();
      const newInputY = - VERTICAL_GAP_BTW_INPUTS - MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT;

      if (isFirstChild) {
        const newInputX = currentShape.props.w / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH / 2;

        const createTopInput = () => {
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
              index: existingLeftSideInputs.length,
              maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              border: 'none',
              textContents: ''
            },
          });
        }
        createTopInput();

        const createArrowToTopInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              endingAnchorOrientation: 'top',
              startingAnchorOrientation: 'bottom',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 1},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 0},
                type: "binding",
              },
            }
          });
        }

        createArrowToTopInput();
        return;
      }

      const updateCurrentChildren = () => {
        const updatedInputs = existingLeftSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            x: shape.x - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2),
            props: {
              ...shape.props,
              maxXWithChildren: shape.props.maxXWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2)
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

      const updatedChildren = updateCurrentChildren();

      const lastChild = updatedChildren.reduce((acc, currVal) => {
        if (acc.props.index > currVal.props.index) return acc;
        return currVal;
      });

      const newInputX = lastChild.props.maxXWithChildren + 20;

      const createOneMoreTopInput = () => {
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
            index: existingLeftSideInputs.length,
            maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            border: 'none',
            textContents: ''
          },
        });
      }

      createOneMoreTopInput();
      const createArrowToOneMoreTopInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            endingAnchorOrientation: 'top',
            startingAnchorOrientation: 'bottom',
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 1},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 0},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreTopInput();

      const updateCurrentShapeMaxWidth = () => {
        const widthWithChildren = getWidthWithChildren(currentShape);
        editor.updateShape({
          ...currentShape,
          props: {
            ...currentShape.props,
            side,
            widthWithChildren,
          },
        });
      };

      updateCurrentShapeMaxWidth();

      const moveAllInputsDueToMaxWidthChange = () => {
        setTimeout(() => {
          const parentInput = editor.getShapeParent(currentShape.id) as IMindMapChildInput;
          if (!parentInput) return;
          const childrenInputs = getChildrenInputs(parentInput, side)
          if (childrenInputs.length === 0) return;

          if (childrenInputs.length === 1) {
            const updatedChildren = childrenInputs.map(item => {
              const updatedItem = {
                ...item,
                props: {
                  ...item.props,
                  maxXWithChildren: item.x + item.props.widthWithChildren,
                }
              };

              return updatedItem;
            })
            editor.updateShapes(updatedChildren);
            return
          };

          const allChildrenInputsWidth = childrenInputs.reduce((acc, currVal) => {
            return acc + currVal.props.widthWithChildren + 20;
          }, 0) - 20;

          let mostLeftPoint = parentInput.props.w / 2 -(allChildrenInputsWidth / 2);

          const updatedChildren = childrenInputs.map(item => {
            const updatedItem = {
              ...item,
              x: mostLeftPoint + item.props.widthWithChildren / 2 - item.props.w / 2,
              props: {
                ...item.props,
                maxXWithChildren: mostLeftPoint + item.props.widthWithChildren,
              }
            };
            const nextItemX = mostLeftPoint + item.props.widthWithChildren + 20;
            mostLeftPoint = nextItemX;

            return updatedItem;
          })

          editor.updateShapes(updatedChildren);
        }, 0)
      }
      moveAllInputsDueToMaxWidthChange();
    },
    [selectedShapes, editor],
  )

  const createTopChildInput = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      if (currentShape.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) return createTopChildToMain(side);
      if (currentShape.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) return createTopChildToChild(side);
    },
    [selectedShapes, editor],
  )

  const createBottomChildToMain = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput;
      const existingThisSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingThisSideInputs.length === 0;
      const newInputId = createShapeId();

      const newInputY = currentShape.props.h + VERTICAL_GAP_BTW_INPUTS;

      if (isFirstChild) {
        const newInputX = currentShape.props.w / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH / 2;

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
              textContents: ''
            },
          });
        }
        createBottomInput();

        const createArrowToBottomInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              endingAnchorOrientation: 'bottom',
              startingAnchorOrientation: 'top',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 0},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 1},
                type: "binding",
              },
            }
          });
        }

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
        const updatedInputs = existingThisSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            x: shape.x - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2),
            props: {
              ...shape.props,
              maxXWithChildren: shape.props.maxXWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2)
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

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
            textContents: ''
          },
        });
      }
      createOneMoreBottomInput();

      const createArrowToOneMoreBottomInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            startingAnchorOrientation: 'top',
            endingAnchorOrientation: 'bottom',
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 0},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 1},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreBottomInput();
    },
    [selectedShapes, editor],
  )

  const createBottomChildToChild = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      const existingLeftSideInputs = getChildrenInputs(currentShape, side)

      const isFirstChild = existingLeftSideInputs.length === 0;
      const newInputId = createShapeId();

      const newInputY = currentShape.props.h + VERTICAL_GAP_BTW_INPUTS;

      if (isFirstChild) {
        const newInputX = currentShape.props.w / 2 - MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH / 2;

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
              index: existingLeftSideInputs.length,
              maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
              border: 'none',
              textContents: ''
            },
          });
        }
        createBottomInput();

        const createArrowToTopInput = () => {
          editor.createShape({
            id: createShapeId(),
            index: "a2" as IndexKey,
            isLocked: false,
            meta: {},
            opacity: 1,
            parentId: currentShape.id,
            rotation: 0,
            type: currentShape.props.arrowId,
            typeName: 'shape',
            x: currentShape.x,
            y: currentShape.y,
            props: {
              startingAnchorOrientation: 'bottom',
              endingAnchorOrientation: 'top',
              arrowheadEnd: "none",
              arrowheadStart: "none",
              bend: 0,
              color: currentShape.props.borderColor,
              dash: "draw",
              end: {
                boundShapeId: newInputId,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 0},
                type: "binding",
              },
              size: 1,
              start: {
                boundShapeId: currentShape.id,
                isExact: false,
                isPrecise: true,
                normalizedAnchor: {x: 0.5, y: 1},
                type: "binding",
              },
            }
          });
        }

        createArrowToTopInput();
        return;
      }

      const updateCurrentChildren = () => {
        const updatedInputs = existingLeftSideInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((shape) => {
          return {
            ...shape,
            x: shape.x - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2),
            props: {
              ...shape.props,
              maxXWithChildren: shape.props.maxXWithChildren - ((MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH + 20) / 2)
            }
          }
        })
        editor.updateShapes(updatedInputs);
        return updatedInputs;
      }

      const updatedChildren = updateCurrentChildren();

      const lastChild = updatedChildren.reduce((acc, currVal) => {
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
            index: existingLeftSideInputs.length,
            maxYWithChildren: newInputY + MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
            maxXWithChildren: newInputX + MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
            border: 'none',
            textContents: ''
          },
        });
      }

      createOneMoreBottomInput();
      const createArrowToOneMoreTopInput = () => {
        editor.createShape({
          id: createShapeId(),
          index: "a2" as IndexKey,
          isLocked: false,
          meta: {},
          opacity: 1,
          parentId: currentShape.id,
          rotation: 0,
          type: currentShape.props.arrowId,
          typeName: 'shape',
          x: currentShape.x,
          y: currentShape.y,
          props: {
            endingAnchorOrientation: 'top',
            startingAnchorOrientation: 'bottom',
            arrowheadEnd: "none",
            arrowheadStart: "none",
            bend: 0,
            color: currentShape.props.borderColor,
            dash: "draw",
            end: {
              boundShapeId: newInputId,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 0},
              type: "binding",
            },
            size: 1,
            start: {
              boundShapeId: currentShape.id,
              isExact: false,
              isPrecise: true,
              normalizedAnchor: {x: 0.5, y: 1},
              type: "binding",
            },
          }
        });
      }

      createArrowToOneMoreTopInput();

      const updateCurrentShapeMaxWidth = () => {
        const widthWithChildren = getWidthWithChildren(currentShape);
        editor.updateShape({
          ...currentShape,
          props: {
            ...currentShape.props,
            side,
            widthWithChildren,
          },
        });
      };

      updateCurrentShapeMaxWidth();

      const moveAllInputsDueToMaxWidthChange = () => {
        setTimeout(() => {
          const parentInput = editor.getShapeParent(currentShape.id) as IMindMapChildInput;
          if (!parentInput) return;
          const childrenInputs = getChildrenInputs(parentInput, side)
          if (childrenInputs.length === 0) return;

          if (childrenInputs.length === 1) {
            const updatedChildren = childrenInputs.map(item => {
              const updatedItem = {
                ...item,
                props: {
                  ...item.props,
                  maxXWithChildren: item.x + item.props.widthWithChildren,
                }
              };

              return updatedItem;
            })
            editor.updateShapes(updatedChildren);
            return
          };

          const allChildrenInputsWidth = childrenInputs.reduce((acc, currVal) => {
            return acc + currVal.props.widthWithChildren + 20;
          }, 0) - 20;

          let mostLeftPoint = parentInput.props.w / 2 -(allChildrenInputsWidth / 2);

          const updatedChildren = childrenInputs.map(item => {
            const updatedItem = {
              ...item,
              x: mostLeftPoint + item.props.widthWithChildren / 2 - item.props.w / 2,
              props: {
                ...item.props,
                maxXWithChildren: mostLeftPoint + item.props.widthWithChildren,
              }
            };
            const nextItemX = mostLeftPoint + item.props.widthWithChildren + 20;
            mostLeftPoint = nextItemX;

            return updatedItem;
          })

          editor.updateShapes(updatedChildren);
        }, 0)
      }
      moveAllInputsDueToMaxWidthChange();
    },
    [selectedShapes, editor],
  )

  const createBottomChildInput = useCallback(
    (side: Side) => {
      const currentShape = selectedShapes[0] as IMindMapChildInput | IMindMapMainInput;
      if (currentShape.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) return createBottomChildToMain(side);
      if (currentShape.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) return createBottomChildToChild(side);
    },
    [selectedShapes, editor],
  )

  const createChildInput = useCallback(
    (side: Side) => {
      switch (side) {
        case 'right':
          createRightChildInput(side)
          break;
        case 'left':
          createLeftChildInput(side)
          break;
        case 'top':
          createTopChildInput(side)
          break;
        case 'bottom':
          createBottomChildInput(side)
          break;
        default:
          break;
      }
    },
    [selectedShapes, editor],
  )

  return (
    <div className='tl-html-layer' ref={rHtmlLayer}>
      {buttonsToShow.includes('top') && (
        <div
          className={styles.addChildInputBtn}
          onClick={() => createChildInput('top')}
          style={{
            ...commonBtnStyle,
            ...topBtnStyle,
          }}
          ref={toolbarRef}
        >
          <div className={styles.sidebarUnitsPanelChannelIcon}>
            <Plus />
          </div>
        </div>
      )}
      {buttonsToShow.includes('right') && (
        <div
          className={styles.addChildInputBtn}
          onClick={() => createChildInput('right')}
          style={{
            ...commonBtnStyle,
            ...rightBtnStyle,
          }}
        >
          <div className={styles.sidebarUnitsPanelChannelIcon}>
            <Plus />
          </div>
        </div>
      )}
      {buttonsToShow.includes('bottom') && (
        <div
          className={styles.addChildInputBtn}
          onClick={() => createChildInput('bottom')}
          style={{
            ...commonBtnStyle,
            ...bottomBtnStyle,
          }}
        >
          <div className={styles.sidebarUnitsPanelChannelIcon}>
            <Plus />
          </div>
        </div>
      )}
      {buttonsToShow.includes('left') && (
        <div
          className={styles.addChildInputBtn}
          onClick={() => createChildInput('left')}
          style={{
            ...commonBtnStyle,
            ...leftBtnStyle,
          }}
        >
          <div className={styles.sidebarUnitsPanelChannelIcon}>
            <Plus />
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapAddChildInputBtns;
