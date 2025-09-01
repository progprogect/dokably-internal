import { ReactComponent as Close } from '../../images/close-big.svg';
import { IVIdeoModal } from './videomodal.types';
import ReactModal from 'react-modal';
import cssStyles from './style.module.scss';

const VideoModal = ({ modalIsOpen, closeModal, src, type }: IVIdeoModal) => {
  return (
    <ReactModal
      className={cssStyles.reactModalComponent}
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
    >
      <div className={cssStyles.actions}>
        <Close onClick={closeModal} />
      </div>
      <video className={cssStyles.video} controls preload='auto'>
        <source src={src} type={type ?? 'video/mp4'} />
      </video>
    </ReactModal>
  );
};

export default VideoModal;
