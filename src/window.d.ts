import { Quill } from '@app/utils/whiteboard/quill/Quill';

declare global {
  interface Window {
    QuillInstance: Record<string, Quill>;
  }
}
