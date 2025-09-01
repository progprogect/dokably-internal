import cssStyles from './style.module.scss';
import ButtonPicker from '@shared/uikit/button-picker';
import { useEditor, useValue } from '@tldraw/editor';
import { Minus, Plus } from 'lucide-react';

const BottomPanel = () => {
  const editor = useEditor();

  const zoomlevel = useValue('zoomLevel', () => editor.getZoomLevel(), [editor]);

  return (
    <div className={cssStyles.bottomPanel}>
      <ButtonPicker
        icon={<Minus className={cssStyles.icon} />}
        onClick={() => {
          editor.zoomOut();
        }}
        title='Zoom Out'
      />
      <div className={cssStyles.zoomLevel}>{`${Math.floor(zoomlevel * 100)}%`}</div>
      <ButtonPicker
        icon={<Plus className={cssStyles.icon} />}
        onClick={() => {
          editor.zoomIn();
        }}
        title='Zoom In'
      />
    </div>
  );
};

export default BottomPanel;
