import {Task as TaskModel} from './Task'

export class Board {
    name:string;
    isActive:boolean;
    columns:{
        name:string;
        tasks:TaskModel[];
        id:string;
    }[];
    parentId:string;

    constructor(
        name:string,
        isActive:boolean,
        columns:{
            name:string;
            tasks:TaskModel[];
            id:string;
        }[],
        parentId:string,
    ) {
        this.name = name;
        this.isActive = isActive;
        this.columns = columns;
        this.parentId = parentId;
    }
}