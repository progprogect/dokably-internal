import Button from '@shared/uikit/button';
import './style.css';
import { ReactComponent as SuccessImg } from '@images/success.svg';

interface ISuccess {
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setPopUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const SuccessModal = ({ setSuccess, setPopUp }: ISuccess) => {
  return (
    <div className='popup-success'>
      <div className='popup__window-success'>
        <div className='popup__content-success'>
          <h2 className='popup__header-success'>Success!</h2>
          <p className='popup__txt-success'>Your plan was changed.</p>
          <SuccessImg className='popup__img-success' />
          <Button
            buttonType='gray'
            onClick={() => {
              setSuccess(false);
              setPopUp(false);
            }}
            className='popup__btn-success'
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
