import { memo, useCallback, useState } from 'react';
import cn from 'classnames';

type PropsType = {
  link: string;
  top: number;
  left: number;
  isLinkHovered: boolean;
};

const LinkContentPanel: React.FC<PropsType> = ({
  top,
  left,
  link,
  isLinkHovered,
}) => {
  const [isPanelHovered, setIsPanelHovered] = useState(false)

  const onPanelHover = useCallback(
    () => {
      setIsPanelHovered(true)
    },
    [],
  )
  const onPanelLeave = useCallback(
    () => {
      setIsPanelHovered(false)
    },
    [],
  )

  if (!isLinkHovered && !isPanelHovered) {
    return null;
  }

  return (
    <div
      style={{
        pointerEvents: 'all',
        position: 'absolute',
        zIndex: '1000',
        top: `${top}px`,
        left: `${left}px`,
      }}
      className='mt-px bg-white rounded shadow-menu flex items-center w-fit gap-2'
      onMouseEnter={onPanelHover}
      onMouseLeave={onPanelLeave}
    >
      <div className='w-80 relative z-0' contentEditable={false}>
        <a
          href={link}
          target='_blank'
          rel='noopener noreferrer'
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          className={cn(
            'rounded',
            'absolute z-10 bg-white',
            'border',
            'border-solid',
            'border-text10',
            'text-sm',
            'py-2.5',
            'px-4',
            'pt-3',
            'pr-4',
            'underline',
            'cursor-pointer',
            'text-fontBlue'
          )}
        >
          {link}
        </a>
      </div>
    </div>
  );
};

export default memo(LinkContentPanel);
