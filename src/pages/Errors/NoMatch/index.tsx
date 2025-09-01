import './style.css';
import { ReactComponent as NoMatchImage } from '@images/404.svg';
import Button from '@shared/common/Button';
import { useNavigate } from 'react-router-dom';

const NoMatch = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/home');
  };

  return (
    <div className='no-match'>
      <div className='no-match__container'>
        <div className='no-match__image'>
          <NoMatchImage />
        </div>
        <div className='no-match__info'>
          <div className='no-match__info__message'>
            Sorry, the page you were looking for was not found.
          </div>
          <div className='no-match__info__button'>
            <Button styleType='small-black' label='Reload' onClick={goToHome} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoMatch;
