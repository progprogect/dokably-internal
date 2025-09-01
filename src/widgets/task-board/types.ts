import BlockType from '@entities/enums/BlockType';

export interface IProperty {
  id: string;
  name: string;
  type: string;
  value?: any;
  options?: any;
  files?: { id: string; name: string, url: string }[];
  fileLink?: string;
  fileName?: string;
}

export interface ITask {
  id: string;
  name: string;
  subtasks?: ITask[];
  order: number;
  subtasksAmount: number;
  properties: IProperty[];
  description: string
}

export interface INameValue {
  name: string;
  value: any;
}

export interface ISelectOption {
  id: string;
  name: string;
  params: {
    color: string;
    index: number;
  };
}

export interface ISelectProperty extends IProperty {
  options: ISelectOption[];
}

export type TaskBoardView = BlockType.Kanban | BlockType.ListView | BlockType.TableView;
