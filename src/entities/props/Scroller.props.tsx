import { RefObject } from 'react';
import { EditorProps } from './Editor.props';

export interface ScrollerProps extends EditorProps {
  editorContainerRef: RefObject<HTMLDivElement>;
  ImageScrollerButton: any;
  mode: 'default' | 'task';
  unitId: string;
}
