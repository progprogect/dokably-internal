import { EditorProps } from '@entities/props/Editor.props';
import { MoreHorizontal } from 'lucide-react';
import { ReactComponent as NoColor } from '@images/noColor.svg';
import { useClickOutside } from '@app/hooks/useClickOutside';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { track } from '@amplitude/analytics-browser';

const MoreMenuModule = (props: EditorProps) => {
  const { ref, isVisible, setIsVisible } = useClickOutside<boolean>(null);
  const { resetBlock } = useBlockTypes();

  const handleShowToolPanel = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsVisible(!isVisible);
  };

  const handleClear = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    track('document_edit_style_selected', {
      path: 'floating',
      option: 'default',
    });
    props.setEditorState((editorState) => resetBlock(editorState));
    setIsVisible(false);
  };

  return (
    <div
      className='relative flex flex-col items-center justify-center'
      ref={ref}
    >
      <div
        className='flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background'
        onMouseDown={(event) => handleShowToolPanel(event)}
      >
        <MoreHorizontal />
      </div>
      {isVisible && (
        <div className='flex justify-end absolute top-[36px] select-none left-[-10px]'>
          <div className='p-2 bg-white rounded shadow-menu flex items-center w-fit gap-2 h-[36px]'>
            <div
              className='hover:stroke-text stroke-text60 flex items-center hover:bg-background hover:text-text rounded p-2 text-text70 text-sm3l cursor-pointer w-[132px]'
              onMouseDown={handleClear}
            >
              <NoColor className='mr-2' />
              Clear format
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreMenuModule;
