import IsVisible from '@entities/models/IsVisible';
import { EditorProps } from './Editor.props';
import React from 'react';

export interface ToolbarProps extends EditorProps {
  toolbarPosition: IsVisible | null;
  activeElement: HTMLElement | null;
  LinkButton?: React.FC<EditorProps>;
  mode?: "default" | "task"
}
