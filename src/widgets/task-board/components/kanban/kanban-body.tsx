import { FC, useCallback, useEffect, useState } from 'react';
import 'tippy.js/animations/scale.css';
import { ISelectOption, ITask } from '../../types';
import { 
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  rectIntersection,
  MouseSensor
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { CreateStatus } from '../../modals/CreateStatus';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { TaskPriorityProperty } from '../properties/priority/task-priority-property';
import { TaskAssignProperty } from '../properties/assignee/task-assign-property';
import { TaskDateProperty } from '../properties/date/task-date-property';
import AddKanbanSubTask from '../list-view/components/shared/AddKanbanSubTask/AddKanbanSubTask';
import { DATE_PROPERTY_TYPE } from '../../constants';

export interface IColumn extends ISelectOption {
  cards: ITask[];
}

export const KanbanBody: FC = () => {
  const { tasks, statusOptions, addStatus, taskboardConfig, editTaskboardConfig, updateTaskStatus } = useTaskBoard();
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [originalColumnId, setOriginalColumnId] = useState<string | null>(null);

  const infoKey = "kanban-taskboard-cardsOrder";
  const existedConfig: any = taskboardConfig.find((t: any) => t.infoKey === infoKey);

  // Настройка сенсоров для @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor)
  );

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
      const updatedConfig = taskboardConfig.map((t: any) => t.infoKey === infoKey ? { ...t, state: cardsState } : t);
      editTaskboardConfig(updatedConfig);
    } else {
      const newConfig = [...taskboardConfig, { infoKey, state: cardsState }];
      editTaskboardConfig(newConfig);
    }
  }, [existedConfig, taskboardConfig, editTaskboardConfig, infoKey]);

  useEffect(() => {
    const initColumns = statusOptions
      .sort((a, b) => {
        if (existedConfig) {
          const columnsOrder = existedConfig?.state?.map((item: IColumn) => item.id);
          const indexA = columnsOrder?.indexOf(a.id);
          const indexB = columnsOrder?.indexOf(b.id);
        
          const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
          const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
        
          return safeIndexA - safeIndexB;
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

  // Handlers для @dnd-kit
    const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id as string);
    setDraggedCardId(active.id as string);

    // КРИТИЧЕСКИ ВАЖНО: Сохраняем исходную колонку!
    const activeData = active.data.current;
    setOriginalColumnId(activeData?.columnId);

    // Находим перетаскиваемую задачу
    const task = columns
      .flatMap(col => col.cards)
      .find(card => card.id === active.id);

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // В @dnd-kit handleDragOver должен быть легким - только для визуальных эффектов
    // Основную логику перемещения делаем в handleDragEnd
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Определяем типы элементов
    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === 'task';
    const isOverATask = overData?.type === 'task';
    const isOverAColumn = overData?.type === 'column';

    if (!isActiveATask) return;

    // Только для задач между разными колонками - делаем минимальные изменения
    if (isActiveATask && isOverAColumn) {
      const activeColumn = columns.find(col => 
        col.cards.some(card => card.id === activeId)
      );
      const overColumn = columns.find(col => col.id === overId);

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return;
      }

      // Простое перемещение между колонками
      setColumns((columns) => {
        const activeCards = activeColumn.cards.filter(card => card.id !== activeId);
        const movedCard = activeColumn.cards.find(card => card.id === activeId);
        
        if (!movedCard) return columns;
        
        const overCards = [...overColumn.cards, movedCard];

        return columns.map(col => {
          if (col.id === activeColumn.id) {
            return { ...col, cards: activeCards };
          } else if (col.id === overColumn.id) {
            return { ...col, cards: overCards };
          }
          return col;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveTask(null);
    setDraggedCardId(null);
    setOriginalColumnId(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Определяем типы элементов
    const activeData = active.data.current;
    const overData = over.data.current;

    // Определяем overColumnId правильно
    let overColumnId;
    if (overData?.type === 'column') {
      overColumnId = overId; // Если over - это колонка, то overId и есть ID колонки
    } else if (overData?.type === 'task') {
      overColumnId = overData?.columnId; // Если over - это задача, берем columnId из данных
    }
    
    // Блокируем только если это та же карточка в той же колонке
    if (activeId === overId && originalColumnId === overColumnId) {
      return;
    }

    const isActiveATask = activeData?.type === 'task';
    const isOverATask = overData?.type === 'task';
    const isOverAColumn = overData?.type === 'column';

    // Используем существующие функции moveCard и moveColumn
    if (isActiveATask && isOverAColumn) {
      // Перемещение задачи в колонку
      const activeColumn = columns.find(col => col.id === originalColumnId);
      const overColumn = columns.find(col => col.id === overId);

      if (activeColumn && overColumn && originalColumnId !== overColumn.id) {
        // Используем существующую функцию moveCard
        moveCard(activeId, activeColumn.id, overColumn.id, overColumn.cards.length);
        
        // КРИТИЧЕСКИ ВАЖНО: Обновляем статус задачи на сервере!
        updateTaskStatus(activeId, overColumn.id);
      }
    } else if (isActiveATask && isOverATask) {
      // Перемещение задачи над другой задачей
      const activeColumn = columns.find(col => col.id === originalColumnId);
      const overColumn = columns.find(col => 
        col.cards.some(card => card.id === overId)
      );

      if (activeColumn && overColumn) {
        const overIndex = overColumn.cards.findIndex(card => card.id === overId);
        moveCard(activeId, activeColumn.id, overColumn.id, overIndex);
        
        // КРИТИЧЕСКИ ВАЖНО: Обновляем статус задачи на сервере если колонки разные!
        if (originalColumnId !== overColumn.id) {
          updateTaskStatus(activeId, overColumn.id);
        }
      }
    }

    // Конфигурация уже сохраняется в moveCard, дублирование не нужно
    
    // Очищаем состояние
    setActiveId(null);
    setActiveTask(null);
    setDraggedCardId(null);
    setOriginalColumnId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      autoScroll={{
        enabled: true,
        threshold: {
          x: 0.15, // Активация автоскролла при приближении к 15% от края по горизонтали
          y: 0.15, // Активация автоскролла при приближении к 15% от края по вертикали
        },
        acceleration: 20, // Скорость ускорения автоскролла
        interval: 5, // Интервал между шагами скролла (мс)
      }}
    >
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
      
      {/* Drag Overlay для visual feedback */}
      <DragOverlay>
        {activeTask ? (
          <div className="transform rotate-2 opacity-90 scale-105">
            {/* АБСОЛЮТНО ТОЧНАЯ КОПИЯ стиля оригинальной карточки */}
            <div className='flex flex-col justify-between cursor-pointer w-full p-3 rounded-md bg-white'>
              <div className='min-h-[100px] flex flex-col justify-between cursor-pointer w-full'>
                <div className='flex items-start justify-between w-full'>
                  <div className='text-sm/[18px] overflow-hidden break-words'>{activeTask.name}</div>
                  {/* Убираем DropdownMenu из overlay */}
                </div>
                
                {/* Дата - используем оригинальный компонент */}
                {(() => {
                  const dateProperty = activeTask.properties?.find((p) => p.type === DATE_PROPERTY_TYPE);
                  return dateProperty?.value ? (
                    <div className='flex mt-[18px]'>
                      <TaskDateProperty
                        task={activeTask}
                        property={dateProperty}
                        className='text-[12px]'
                      />
                    </div>
                  ) : null;
                })()}
                
                {/* Нижняя секция - используем оригинальные компоненты */}
                <div className='flex items-center justify-between mt-[11px]'>
                  <div className='flex items-center gap-1 flex-1'>
                    <TaskPriorityProperty task={activeTask} />
                    <TaskAssignProperty
                      task={activeTask}
                      iconClassName='opacity-0 group-hover/assignee:opacity-100 absolute top-[-4px] right-[-4px] bg-[#eaeaea]'
                    />
                    {(() => {
                      const dateProperty = activeTask.properties?.find((p) => p.type === DATE_PROPERTY_TYPE);
                      return dateProperty && !dateProperty?.value ? (
                        <TaskDateProperty
                          task={activeTask}
                          property={dateProperty}
                          className='text-[#a9a9ab]'
                        />
                      ) : null;
                    })()}
                  </div>
                  <div className='flex items-center gap-1'>
                    <AddKanbanSubTask
                      subtasksAmount={activeTask.subtasks?.length || 0}
                      expanded={false}
                      toggleExpand={() => {}}
                      onShowSubTaskTemplate={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
