export interface UploadWidgetLocale {
  addAnotherFile: string;
  addAnotherImage: string;
  cancel: string;
  'cancelled!': string;
  continue: string;
  crop: string;
  done: string;
  'error!': string;
  finish: string;
  finishIcon: boolean;
  image: string;
  maxFilesReached: string;
  maxImagesReached: string;
  maxSize: string;
  next: string;
  of: string;
  orDragDropFile: string;
  orDragDropFiles: string;
  orDragDropImage: string;
  orDragDropImages: string;
  pleaseWait: string;
  remove: string;
  'removed!': string;
  skip: string;
  unsupportedFileType: string;
  uploadFile: string;
  uploadFiles: string;
  uploadImage: string;
  uploadImages: string;
}

export interface UploadWidgetConfig {
  layout: 'inline';
  locale?: UploadWidgetLocale;
  maxFileCount?: number;
  maxFileSizeBytes?: number;
  mimeTypes?: string[];
  multi?: boolean;
  showFinishButton?: boolean;
  showRemoveButton?: boolean;
  tags?: string[];
}

export interface IUploadedFileData {
  id: string;
  mimeType: string; // usually "image/jpeg"
  presignedObjectUrl: string;
  size: number;
}
