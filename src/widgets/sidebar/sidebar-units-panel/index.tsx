import { useCallback, useEffect, useMemo, useState } from 'react';
import TreeView, { flattenTree } from 'react-accessible-treeview';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { track } from '@amplitude/analytics-browser';
import { DragEndEvent } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';

import { Unit, UnitType } from '@entities/models/unit';
import { createWhiteboard } from '@app/services/whiteboard.service';
import { createDocument } from '@app/services/document.service';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import CreateChannel from '@widgets/components/Modals/CreateChannel/CreateChannel';
import Tooltip from '@shared/uikit/tooltip';
import IconButton from '@shared/uikit/icon-button';
import { useChangeUnitOrder } from '@app/queries/workspace/unit/useChangeUnitOrder';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { setUnits } from '@app/redux/features/unitsSlice';
import { cn } from '@app/utils/cn';

import UnitsDndContext from './ui/units-dnd/units-dnd-context';
import UnitElement from './ui/unit-element';
import UnitDndDragOverlay from './ui/units-dnd/units-dnd-drag-overlay';
import UnitsDndElement from './ui/units-dnd/units-dnd-element';
import UnitsDndSideEffects from './ui/units-dnd/units-dnd-side-effects';
import { calculateNodeIndent } from './utils/calculate-node-indent';
import { dndUnitGetter } from './utils/dnd-unit-getter';
import { moveUnit } from './utils/move-unit';
import { traverseTreeInDepth } from './utils/traverse-tree-in-depth';
import { TreeNode, TreeNodeMetadata } from './types';
import Modal from '@shared/common/Modal';
import { useSubscriptionContext } from '@app/context/subscriptionContext/subscriptionContext';
import Button from '@shared/uikit/button';

import { ReactComponent as Plus } from '@images/plus.svg';
import styles from './style.module.scss';

const buildUnitsTree = function buildTree(units: Unit[], _parentNode?: TreeNode | null, _level = 0): TreeNode[] {
  const sordtedUnits = [...units].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    if (a.name === "Private" && b.name !== "Private") {
      return 1;
    }
    if (a.name !== "Private" && b.name === "Private") {
      return -1;
    }
    return 0;
  });
  const childs = _parentNode
    ? sordtedUnits.filter((unit) => unit.parentUnit?.id === _parentNode.id && unit.type !== 'task_board')
    : sordtedUnits.filter((unit) => unit.parentUnit === null && unit.type !== 'task_board');

  const level = (_level += 1);
  return childs.map((unit: Unit) => {
    const node: TreeNode = {
      id: unit.id,
      name: unit.name,
      metadata: {
        type: unit.type,
        name: unit.name,
        id: unit.id,
        order: unit.order,
        color: unit.color,
        hasChildren: false,
        level,
        emoji: unit.emoji,
        parent: _parentNode ?? null,
      },
      children: [],
    };
    const children = buildTree(units, node, level);

    node.children = children;
    if (node.metadata) node.metadata.hasChildren = children.length > 0;
    return node;
  });
};

const SidebarUnitsPanel = () => {
  const { units, addUnit } = useUnitsContext();
  const { documentId } = useParams();
  const { activeWorkspace } = useWorkspaceContext();
  const { limitModalIsVisible, showLimitModal, hideLimitModal } = useSubscriptionContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCreateChannelModalOpen, setCreateChannelModalState] = useState<boolean>(false);
  const activeUnit = units.find((unit) => unit.id === documentId);

  const unitsTree = useMemo(() => buildUnitsTree(units), [units]);
  const unitsFaltten = useMemo(
    // @ts-ignore Lack of boolean type in IFlatMetadata interface
    () => flattenTree<TreeNodeMetadata>({ name: '', children: unitsTree }),
    [unitsTree],
  );

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { changeUnitsOrder } = useChangeUnitOrder();

  const validExpandedIds = useMemo(() => {
    const idsSet = new Set(expandedIds);
    return unitsFaltten.reduce<string[]>((acc, unit) => {
      const unitId = unit.id.toString();
      if (idsSet.has(unitId)) acc.push(unitId);
      return acc;
    }, []);
  }, [unitsFaltten, expandedIds]);

  const openUnit = (id: string) => {
    navigate(`/workspace/${id}`);
  };

  const handleCreateChannel = () => {
    track('create_channel_popup_opened');
    setCreateChannelModalState(true);
  };

  const handleExpand = useCallback((isExpanded: boolean, elementId: string) => {
    setExpandedIds((ids) => {
      const idsSet = new Set(ids);
      if (isExpanded) idsSet.add(elementId);
      else idsSet.delete(elementId);
      return Array.from(idsSet);
    });
  }, []);

  const handleDragEnd = async (event: DragEndEvent, { canInsert }: { canInsert: boolean }) => {
    if (!canInsert) return;
    const activeUnit = dndUnitGetter<TreeNodeMetadata>(event.active);
    const overUnit = dndUnitGetter<TreeNodeMetadata>(event.over);
    const newParent = overUnit?.parent;

    if (!activeUnit || !activeWorkspace || !newParent || overUnit.id === activeUnit.id) return;

    const newOrder = moveUnit(
      newParent.children.map((child) => child.metadata!),
      activeUnit,
      overUnit,
      event.delta.y,
    );

    const newOrderMap = newOrder.reduce<Map<string, number>>(
      (acc, order) => acc.set(order.id, order.order),
      new Map<string, number>(),
    );

    const newUnits = units.map((unit) => {
      const order = newOrderMap.get(unit.id);
      if (order === undefined) return unit;
      return { ...unit, parentUnit: { id: newParent.id }, order };
    });

    dispatch(setUnits(newUnits));

    await changeUnitsOrder({
      workspaceId: activeWorkspace.id,
      unitpParentId: newParent.id,
      unitOrders: newOrder,
    });
  };

  const createUnit = async (unit: { type: 'document' | 'whiteboard'; parentId: string }) => {
    const newUnit = await getCreateQuery(unit.type, unit.parentId, uuidv4());
    if (newUnit && Object.keys(newUnit).length === 1 && Object.keys(newUnit)[0] === 'message') {
      // @TODO: add type of limit
      showLimitModal();
    } else if (newUnit) {
      await addUnit(newUnit);
      openUnit(newUnit.id);
    }
  };

  const getCreateQuery = (type: UnitType, parentId: string, id: string) => {
    switch (type) {
      case 'document':
        return createDocument(parentId, id);
      case 'whiteboard':
        return createWhiteboard(parentId, id);
      default:
        return createDocument(parentId, id);
    }
  };

  useEffect(() => {
    traverseTreeInDepth(unitsTree, (node, stackTrace, breakLoop) => {
      if (node.id !== documentId) return;
      setExpandedIds((ids) => {
        const idsSet = new Set(ids);
        stackTrace.forEach((element) => {
          if (element.id) idsSet.add(element.id);
        });
        return Array.from(idsSet);
      });
      breakLoop();
    });
  }, [unitsTree, documentId]);

  useEffect(() => {
    setExpandedIds([]);
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (!activeUnit) return;

    setSelectedIds([activeUnit.id]);
  }, [activeUnit]);

  const canCreateChannel = activeWorkspace?.userRole !== 'guest';

  return (
    <div className={styles.sidebarUnitsPanel}>
      <div className={styles.sidebarUnitsPanelRow}>
        <span className={styles.sidebarUnitsPanelChannelTitle}>Channels</span>

        {canCreateChannel && (
          <Tooltip
            placement='right'
            content='Create a Channel'
          >
            <IconButton
              aria-label='Create a channel'
              onClick={handleCreateChannel}
            >
              <Plus />
            </IconButton>
          </Tooltip>
        )}

        <CreateChannel
          handleClose={() => {
            track('channel_create_closed');
            setCreateChannelModalState(false);
          }}
          isOpen={isCreateChannelModalOpen}
        />
      </div>
      <UnitsDndContext
        data={unitsFaltten}
        onDragEnd={handleDragEnd}
      >
        {({ activeUnit, overUnit, parentUnit, disabled, canInsert, readonly }) => (
          <>
            <TreeView
              // @ts-ignore Lack of boolean type in IFlatMetadata interface
              data={unitsFaltten}
              className={styles.sidebarUnitsPanelTree}
              selectedIds={selectedIds}
              expandedIds={validExpandedIds}
              clickAction='FOCUS'
              nodeRenderer={({ element, getNodeProps, isExpanded, isBranch }) => {
                const { onClick: _, ...nodeProps } = getNodeProps();
                const unit = element.metadata as unknown as TreeNodeMetadata;

                return (
                  <div {...nodeProps}>
                    <UnitsDndElement
                      style={{
                        paddingLeft: calculateNodeIndent(
                          unit.id === activeUnit?.id && overUnit && !disabled.has(overUnit.id)
                            ? overUnit.level
                            : unit.level,
                        ),
                      }}
                      readonly={readonly.has(unit.id)}
                      disabled={disabled.has(unit.id)}
                      unit={unit}
                      className={cn(
                        parentUnit?.id === element.id && canInsert ? 'border-purple' : 'border-transparent',
                        'transition-all border-solid border',
                      )}
                    >
                      <UnitElement
                        className={cn({
                          'opacity-70': activeUnit?.id === element.id,
                          'opacity-100': activeUnit?.id !== element.id,
                          'opacity-30': disabled.has(element.id),
                        })}
                        showExpandCollapseButton={isBranch}
                        onExpand={handleExpand}
                        onCreateUnit={createUnit}
                        isExpanded={isExpanded}
                        unit={unit}
                        isActive={element.id === documentId}
                      />
                    </UnitsDndElement>
                  </div>
                );
              }}
            />
            <UnitDndDragOverlay
              unit={activeUnit}
              style={{
                paddingLeft: activeUnit ? calculateNodeIndent(activeUnit.level) : undefined,
              }}
              isActive={documentId === activeUnit?.id}
            />
            <UnitsDndSideEffects
              expanded={expandedIds}
              overUnit={overUnit}
              activeUnit={activeUnit}
              onExpand={handleExpand}
              onExpandSet={setExpandedIds}
            />
          </>
        )}
      </UnitsDndContext>

      <Modal
        title={'You’ve reached the limit'}
        closeModal={hideLimitModal}
        modalIsOpen={limitModalIsVisible}
        wrapChildren={false}
        userClassName='w-[560px] !p-10 !animate-none'
        titleClassName='!text-20-16 !font-medium'
        closeBtnClassName='absolute top-6 right-6'
      >
        <div
          className='flex flex-col full-width mt-6 z-0 text-[#69696B]'
          contentEditable={false}
        >
          {/* You've reached the maximum number of documents allowed on your current plan.<br />
          To create new docs, please upgrade your plan or delete existing ones. */}
          You reached the limit for doc/whiteboard creation/file storage in the Free plan.
        </div>
				<Button
					buttonType="custom"
					onClick={() => navigate('/settings/upgrade')}
					className='mt-8 w-full text-[#6598FF] bg-[#CFDFFF]'
				>
					Upgrade
				</Button>
      </Modal>
    </div>
  );
};

export default SidebarUnitsPanel;
