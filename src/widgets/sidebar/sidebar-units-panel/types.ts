import { Unit } from '@entities/models/unit';

export type TreeNodeMetadata = {
  id: Unit['id'];
  name: Unit['name'];
  type: Unit['type'];
  color: Unit['color'];
  hasChildren?: boolean;
  order: Unit['order'];
  level: number;
  parent: TreeNode<TreeNodeMetadata> | null;
  emoji: Unit['emoji'];
};

export type TreeNode<M extends TreeNodeMetadata = TreeNodeMetadata> = {
  id?: string;
  name: string;
  children: TreeNode<M>[];
  metadata?: M;
};
