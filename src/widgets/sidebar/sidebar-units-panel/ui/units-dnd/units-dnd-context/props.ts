import { DragEndEvent } from '@dnd-kit/core';
import { TreeNodeMetadata } from '@widgets/sidebar/sidebar-units-panel/types';
import { ReactElement } from 'react';
import { INode } from 'react-accessible-treeview';

export type UnitsDndContextProps = {
  // @ts-ignore Lack of boolean type in IFlatMetadata interface
  data: INode<TreeNodeMetadata>[];
  onDragEnd?: (event: DragEndEvent, options: { canInsert: boolean }) => void;
  children: (context: {
    activeUnit: TreeNodeMetadata | null;
    overUnit: TreeNodeMetadata | null;
    parentUnit: TreeNodeMetadata | null;
    disabled: Set<string | number>;
    readonly: Set<string | number>;
    canInsert: boolean;
  }) => ReactElement;
};
