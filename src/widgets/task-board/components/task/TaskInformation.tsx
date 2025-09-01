import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ISelectProperty, ITask } from '@widgets/task-board/types';
import React, { FC, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ReactComponent as DeleteIcon } from '@icons/trash-grey.svg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shared/uikit/dropdown-menu';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/uikit/dialog';
import { Button } from '@shared/uikit/button/button';
import { CreateTask } from '@widgets/task-board/modals/CreateTask';
import { useGetSubTasks } from '@app/queries/task/sub-task/useGetSubtasks';
import { SubTask } from '../subtask/SubTask';
import _ from 'lodash';
import { useSearchParams } from 'react-router-dom';
import { ASSIGNEE_PROPERTY_TYPE, SELECT_PROPERTY_TYPE, STATUS_PROPERTY_TYPE } from '@widgets/task-board/constants';
import { DokablyEditorProvider, useDokablyEditor } from '@features/editor/DokablyEditor.context';
import CommentView from '@widgets/comment-view';
import CommentsInput from '@features/comments/comments-input';
import { useGetComments } from '@app/queries/task/comment/useGetComments';
import { useCreateComment } from '@app/queries/task/comment/useCreateComment';
import { useDeleteComment } from '@app/queries/task/comment/useDeleteComment';
import DokablyEditor from '@features/editor/DokablyEditor.component';
import { Unit } from '@entities/models/unit';
import { CompositeDecorator, convertFromRaw, convertToRaw, EditorState, RawDraftContentState } from 'draft-js';
import { PropertyTitle } from '../shared/property-title/property-title';
import { LoaderIcon } from 'react-hot-toast';
import availableProperties from './availableProperties';
import useHandlePropertyCreation from './hooks/useHandlePropertyCreation';
import { TaskNameFiled } from './TaskNameField';

export type AvailablePropertiesProps = {
  type: string;
  title: string;
  icon: JSX.Element;
  component: (task: ITask, property: IProperty, refetch: () => void) => JSX.Element;
};

export interface TaskInformationProps {
  task: ITask;
  unit: Unit;
  refetchTask: () => void;
}

export const TaskInformation: FC<TaskInformationProps> = ({ task, unit, refetchTask }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubtask = searchParams.get('isSubtask') === 'true';
  // const { unitId } = useParams();
  // const { activeWorkspace } = useWorkspaceContext();

  // const unitQueryResult = useGetUnitQuery({ unitId, workspaceId: activeWorkspace?.id }, getUnit, {
  //   enabled: !_.isNil(unitId) && !_.isNil(activeWorkspace?.id),
  // });
  // const unit = unitQueryResult.data;

  const { setReadOnly } = useDokablyEditor();
  const decorator = useMemo(() => new CompositeDecorator([]), []);

  const _editorState = useMemo(() => {
    const rawState: RawDraftContentState = JSON.parse(task.description);
    const state = rawState
      ? EditorState.createWithContent(convertFromRaw(rawState))
      : EditorState.createEmpty(decorator);
    const currentContent = state.getCurrentContent();
    const firstBlock = currentContent.getBlockMap().first();
    return EditorState.forceSelection(
      state,
      state.getSelection().merge({
        focusKey: firstBlock.getKey(),
        anchorKey: firstBlock.getKey(),
        focusOffset: firstBlock.getText().length,
        anchorOffset: firstBlock.getText().length,
      }),
    );
  }, [task.description]);

  const [editorState, setEditorState] = useState<EditorState>(_editorState);

  const {
    deleteTask,
    renameTask,
    statusOptions,
    addSubTask,
    id,
    updateTaskDescription,
    taskboardConfig,
    editTaskboardConfig,
  } = useTaskBoard();
  const propertiesOrderKey = `kanban-task-${task.id}-propertiesOrder`;
  const taskConfigInfo = (taskboardConfig as any).find((item: any) => item.infoKey === propertiesOrderKey);
  const propertiesOrderValue = taskConfigInfo?.properties || [];

  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [subtaskIsLoading, setSubtaskIsLoading] = useState<boolean>(false);
  const [taskProperties, setTaskProperties] = useState<IProperty[] | ISelectProperty[]>(task.properties ?? []);
  const [taskPropertiesOrder, setTaskPropertiesOrder] = useState<IProperty[] | ISelectProperty[]>(propertiesOrderValue);

  const deletePropertyFromConfig = (id: string) => {
    editTaskboardConfig(
      taskboardConfig.map((c: any) =>
        c.infoKey === propertiesOrderKey
          ? {
              infoKey: c.infoKey,
              properties: c.properties.filter((p: IProperty) => p.id !== id),
            }
          : c,
      ),
    );
    setTaskPropertiesOrder((order) => order.filter((p: IProperty) => p.id !== id));
  };
  const handleCreateProperty = useHandlePropertyCreation(
    task,
    propertiesOrderKey,
    setTaskProperties,
    setTaskPropertiesOrder,
  );

  const { subtasks, refetch } = useGetSubTasks({
    taskBoardId: id,
    parentTaskId: task.id,
  });

  const { comments } = useGetComments({ taskId: task.id });
  const { createComment } = useCreateComment(task.id);
  const { deleteComment } = useDeleteComment(task.id);

  const handleChange = (newState: SetStateAction<EditorState>) => {
    setEditorState((prevState) => {
      const updatedState = typeof newState === 'function' ? newState(prevState) : newState;

      return EditorState.set(updatedState, {
        decorator: prevState.getDecorator(),
        selection: updatedState.getSelection(),
      });
    });
  };

  useEffect(() => {
    setTaskProperties(task?.properties);
  }, [task]);

  useEffect(() => {
    setReadOnly(true);
    return () => {
      const blockers = document.querySelectorAll('[data-dismissable]');
      blockers.forEach((blocker) => blocker.remove());
      setReadOnly(false);
    };
  }, []);

  useEffect(() => {
    if (!editorState.getCurrentContent().hasText()) {
      setEditorState(EditorState.createEmpty());
    }
  }, []);

  // useEffect(() => {
  //   if (_editorState) setEditorState(_editorState);
  // }, [_editorState]);

  useEffect(() => {
    updateTaskDescription(task, JSON.stringify(convertToRaw(editorState.getCurrentContent())));
  }, [editorState]);

  return (
    <>
      <div
        contentEditable={false}
        className='flex-1 flex flex-col overflow-y-auto'
      >
        <div className='h-6 px-4 flex items-center justify-between'>
          <div></div>
          <div className='flex items-center gap-2'>
            <DropdownMenu modal={true}>
              <DropdownMenuTrigger>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='border-border'>
                <DropdownMenuItem
                  className='hover:bg-backgroundHover/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDelete(true);
                  }}
                >
                  <DeleteIcon /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className='mt-1 flex flex-col justify-between flex-1'>
          <div>
            <TaskNameFiled
              initialValue={task.name}
              className='text-3xl font-medium focus-visible:outline-none focus:outline-none focus:ring-0 border-b border-none px-10 py-5 cursor-text'
              onChange={(value) => {
                renameTask(task.id, value.toString());
              }}
            />

            <div className='px-10 py-5 flex flex-col gap-0.5 border-b border-border'>
              {taskProperties
                .sort((a, b) => {
                  const orderNames = taskPropertiesOrder.map((item: IProperty) => item.name);
                  return orderNames.indexOf(a.name) - orderNames.indexOf(b.name);
                })
                .map((property) => {
                  const propertyInfo = availableProperties.find((x) => x.type === property.type);
                  if (!propertyInfo) return <></>;
                  return (
                    <React.Fragment key={property.id}>
                      <PropertyTitle
                        propertyInfo={propertyInfo}
                        task={task}
                        property={property}
                        refetchTask={refetchTask}
                        onDelete={deletePropertyFromConfig}
                      />
                    </React.Fragment>
                  );
                })}

              <div contentEditable={false}>
                <DropdownMenu modal={true}>
                  <DropdownMenuTrigger className='w-50 flex items-center text-[14px] text-[#69696B] h-[32px] p-[8px] gap-2 cursor-pointer rounded-md hover:bg-background'>
                    <Plus className='text-text60 stroke-text60 w-4 h-4' />
                    Add property
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='border-border'>
                    {availableProperties
                      .filter((property) => {
                        const existTypes = taskProperties.map((tp) => tp.type);
                        if (property.type === SELECT_PROPERTY_TYPE && existTypes.includes(SELECT_PROPERTY_TYPE)) {
                          return false;
                        }
                        if (property.type === STATUS_PROPERTY_TYPE && existTypes.includes(STATUS_PROPERTY_TYPE)) {
                          return false;
                        }
                        if (property.type === ASSIGNEE_PROPERTY_TYPE && existTypes.includes(ASSIGNEE_PROPERTY_TYPE)) {
                          return false;
                        }
                        return true;
                      })
                      .map((property) => (
                        <DropdownMenuItem
                          key={`new-property-${property.title}`}
                          onClick={() => {
                            handleCreateProperty(property.type);
                          }}
                          className='hover:bg-backgroundHover/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
                        >
                          {property.icon} {property.title}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {!isSubtask && (
              <>
                <div className='px-10 py-5 flex flex-col gap-2 border-b border-border'>
                  <div className='font-light text-[14px] text-[#69696B]'>Sub-tasks</div>
                  {subtasks.map((subtask) => (
                    <SubTask
                      key={subtask.id}
                      subtask={subtask}
                      refetch={refetch}
                    />
                  ))}
                  {subtaskIsLoading && (
                    <LoaderIcon
                      style={{ width: 20, height: 20 }}
                      className='animate-spin'
                    />
                  )}
                  {statusOptions.length > 0 && (
                    <CreateTask
                      className='w-full flex items-center text-[14px] text-[#69696B] mx-0 cursor-pointer rounded-md hover:bg-[#EDEDEE] hover:text-[#29282C] px-2 py-2'
                      title='Add sub-task'
                      statusId={statusOptions[0].id}
                      onCreateTask={(name) => {
                        setSubtaskIsLoading(true);
                        addSubTask(name, task.id).then(() => {
                          _.delay(() => refetch().then(() => setSubtaskIsLoading(false)), 100);
                        });
                      }}
                    />
                  )}
                </div>
              </>
            )}
            <div className='px-10 py-5'>
              <DokablyEditorProvider
                unit={unit}
                mode='task'
              >
                <DokablyEditor
                  editorState={editorState}
                  setEditorState={handleChange}
                  isInit
                  onFocus={() => {
                    setReadOnly(true);
                  }}
                  onBlur={() => {
                    setReadOnly(false);
                  }}
                  mode='task'
                />
              </DokablyEditorProvider>
            </div>
          </div>

          <div className='border-t border-border'>
            <div className='w-full min-h-10 flex flex-col gap-2'>
              {comments.map((comment) => {
                return (
                  <CommentView
                    key={comment.id}
                    comment={comment}
                    id={comment.id}
                    onDelete={(id) => {
                      deleteComment({ taskId: task.id, commentId: id });
                    }}
                    canReply={false}
                    autofocus={false}
                    type='task'
                  />
                );
              })}
            </div>
            <CommentsInput
              className='!w-full !rounded-none !mt-0 !shadow-none row'
              unit={unit}
              onComment={(comment) => {
                createComment({ taskId: task.id, text: comment.message });
              }}
              isLast
            />
          </div>
        </div>
      </div>
      <Dialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
      >
        <DialogContent
          className='w-[512px]'
          contentEditable={false}
        >
          <DialogHeader>
            <DialogTitle className='text-wrap break-all flex flex-wrap gap-1 items-center'>
              Delete task "{task.name}"
            </DialogTitle>
          </DialogHeader>

          <div>
            <div>Do you want to continue?</div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent border-none'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenDelete(false);
              }}
            >
              Cancel
            </Button>
            <Button
              icon={<DeleteIcon className='w-4 h-4 mr-2 [&>path]:stroke-destructive' />}
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent text-destructive border-none'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteTask(task.id);
                setOpenDelete(false);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('task');
                newParams.delete('board');
                setSearchParams(newParams);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
