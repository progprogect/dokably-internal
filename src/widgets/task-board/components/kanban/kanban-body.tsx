import { FC, useCallback, useEffect, useState } from 'react';
import 'tippy.js/animations/scale.css';
import { ISelectOption, ITask } from '../../types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './kanban-column';
import { CreateStatus } from '../../modals/CreateStatus';
import { useTaskBoard } from '@widgets/task-board/task-board-context';

export interface IColumn extends ISelectOption {
  cards: ITask[];
}

export const KanbanBody: FC = () => {
  const { tasks, statusOptions, addStatus, taskboardConfig, editTaskboardConfig } = useTaskBoard();
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const infoKey = "kanban-taskboard-cardsOrder";
  const existedConfig: any = taskboardConfig.find((t: any) => t.infoKey === infoKey);

  const onCreateStatus = async (name: string, select: string) => {
    await addStatus(name, select);
  };

  const getTasks = (property: ISelectOption) => {
    if (property.name === 'None') {
      return tasks.filter((task) => {
        const statusProperty = task.properties.find(
          (property) => property.type === 'status',
        );
        if (statusProperty) {
          if (statusProperty.value === property.id) {
            return task;
          }
        } else {
          return task;
        }
      });
    }

    return tasks.filter((task) => {
      const statusProperty = task.properties.find(
        (property) => property.type === 'status',
      );
      if (statusProperty) {
        if (statusProperty.value === property.id) {
          return task;
        }
      }
    });
  };

  const saveTaskboardConfig = useCallback((columns: IColumn[]) => {
    const cardsState = columns.map(column => ({ id: column.id, cards: column.cards.map(card => card.id) }));
    if (!!existedConfig) {
      editTaskboardConfig(taskboardConfig.map((t: any) => t.infoKey === infoKey ? { ...t, state: cardsState } : t));
    } else {
      editTaskboardConfig([...taskboardConfig, { infoKey, state: cardsState }]);
    }
  }, [existedConfig]);

  useEffect(() => {
    // console.log("TUT 111100: ", statusOptions, existedConfig?.state);
    
    const initColumns = statusOptions
      .sort((a, b) => {
        // console.log("TUT: ", existedConfig);
        if (existedConfig) {
          const columnsOrder = existedConfig?.state?.map((item: IColumn) => item.id);
          // console.log("TUT2: ", columnsOrder);
          const indexA = columnsOrder?.indexOf(a.id);
          const indexB = columnsOrder?.indexOf(b.id);
        
          const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
          const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
        
          return safeIndexA - safeIndexB;
          // const columnsOrder = existedConfig?.state?.map((item: IColumn) => item.id);
          // return columnsOrder.indexOf(a.id) - columnsOrder.indexOf(b.id);
        } else {
          return 0;
        }
      })
      .map(option => ({
        ...option,
        cards: getTasks(option).sort((a, b) => {
          if (existedConfig) {
            const cardsOrder = existedConfig?.state.find((s: any) => s.id === option.id)?.cards;
            const indexA = cardsOrder?.indexOf(a.id);
            const indexB = cardsOrder?.indexOf(b.id);
        
            const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
            const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
            return safeIndexA - safeIndexB;
            // return cardsOrder.indexOf(a.id) - cardsOrder.indexOf(b.id);
          } else {
            return a.order - b.order;
          }
        }),
      }));

    setColumns(initColumns);
  }, [statusOptions, tasks, existedConfig]);

  const moveColumn = (fromId: string, toId: string) => {
    const updatedColumns = [...columns];
    const fromIndex = updatedColumns.findIndex(col => col.id === fromId);
    const toIndex = updatedColumns.findIndex(col => col.id === toId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return updatedColumns;
    const updated = [...updatedColumns];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setColumns(updated);
    saveTaskboardConfig(updated);
  };

  const moveCard = (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
    const updatedColumns = [...columns];
    const newColumns = updatedColumns.map((col) => {
      if (col.id === fromColumnId) {
        return { ...col, cards: col.cards.filter((card) => card.id !== cardId) };
      }
      return col;
    });
    const movedCard = updatedColumns.find((col) => col.id === fromColumnId)?.cards.find((card) => card.id === cardId);
    if (movedCard) {
      const targetColumn = newColumns.find((col) => col.id === toColumnId);
      if (targetColumn) {
        targetColumn.cards.splice(toIndex, 0, movedCard);
      }
    }
    setColumns(newColumns);
    saveTaskboardConfig(newColumns);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='min-h-[480px] max-w-[720px] max-h-[700px] overflow-x-auto flex gap-4'>
        {columns.map((column: IColumn) => (
          <KanbanColumn
            key={column.id}
            column={column}
            moveColumn={moveColumn}
            moveCard={moveCard}
            draggedCardId={draggedCardId}
            setDraggedCardId={setDraggedCardId}
          />
        ))}
        <CreateStatus
          statusOptions={statusOptions}
          onCreateStatus={onCreateStatus}
        />
      </div>
    </DndProvider>
  );
};
