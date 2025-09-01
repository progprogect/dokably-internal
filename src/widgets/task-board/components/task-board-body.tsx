import { FC } from 'react';
import 'tippy.js/animations/scale.css';
import { KanbanBody } from './kanban/kanban-body';
import ListView from './list-view/list-view';
import { TaskBoardView } from '../types';
import BlockType from '@entities/enums/BlockType';

export interface IKanbanBody {
  view: TaskBoardView;
}

export const TaskBoardBody: FC<IKanbanBody> = ({ view }) => {
  if (view === BlockType.Kanban) {
    return <KanbanBody />;
  }

  if (view === BlockType.ListView) {
    return <ListView variant='list-view' />;
  }

  if (view === BlockType.TableView) {
    return <ListView variant='table-view' />;
  }

  return null;
};
