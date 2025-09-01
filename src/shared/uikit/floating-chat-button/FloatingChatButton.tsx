import React from 'react';
import cn from 'classnames';
import { ReactComponent as AiChatIcon } from '../../images/icons/ai-chat.svg';
import Tooltip from '../tooltip';
import './FloatingChatButton.scss';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  isOpen,
  onClick,
  className = ''
}) => {
  if (isOpen) {
    return null;
  }

  return (
    <Tooltip
      content="Ask Dokably AI"
      placement="left"
      variant="default"
    >
      <button
        className={cn(
          'floating-chat-button',
          className
        )}
        onClick={onClick}
        type="button"
      >
        <AiChatIcon className="floating-chat-button__icon" />
        {/* Removed pulse indicator as requested */}
      </button>
    </Tooltip>
  );
};

export default FloatingChatButton; 