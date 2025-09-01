export class Task {
  title: string;
  description: string;
  status: string;
  subtask?: [
    {
      title: string;
      isCompleted: boolean;
    }
  ];

  constructor(
    title: string,
    description: string,
    status: string,
    subtask?: [
      {
        title: string;
        isCompleted: boolean;
      }
    ]
  ) {
    this.title = title;
    this.description = description;
    this.status = status;
    this.subtask = subtask;
  }
}
