import React from 'react';
import ReactModal from 'react-modal';
import cn from 'classnames';

import { ReactComponent as Close } from '../images/close.svg';

interface ModalProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
  closeButton?: boolean;
  title?: string;
  wrapChildren?: boolean;
  userClassName?: string;
  titleClassName?: string;
  closeBtnClassName?: string;
}

export default function Modal({
  modalIsOpen,
  closeModal,
  children,
  closeButton = true,
  title = '',
  wrapChildren = true,
  userClassName,
  titleClassName,
  closeBtnClassName,
}: ModalProps) {
  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className={`border-none outline-none p-5 rounded-2xl bottom-auto absolute bg-white ${userClassName}`}
      style={{
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(41, 40, 44, 0.4)',
        },
      }}
    >
      <div
        className={cn('flex  min-h-5', {
          'justify-end': !title,
          'justify-between': !!title,
        })}
        contentEditable={false}
      >
        {!!title && (
          <h2
            id='modal-title'
            className={cn('text-base font-bold', titleClassName)}
          >
            {title}
          </h2>
        )}
        {closeButton && (
          <Close
            className={cn('cursor-pointer', closeBtnClassName)}
            onClick={closeModal}
          />
        )}
      </div>
      {wrapChildren ? (
        <div id='modal-children-wrapper' className='px-5 pb-5 pt-1'>
          {children}
        </div>
      ) : (
        children
      )}
    </ReactModal>
  );
}
