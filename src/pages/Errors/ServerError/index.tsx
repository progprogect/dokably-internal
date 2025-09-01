import './style.css';
import Button from '@shared/common/Button';
import { useNavigate } from 'react-router-dom';

const ServerError = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/home');
  };

  return (
    <div className='server-error'>
      <div className='server-error__container'>
        <div className='server-error__title'>
          Sorry, this page isn’t working
        </div>
        <div className='server-error__message'>
          Server Error 500. Try to reload this page or feel free to contact us
          if the problem persists.
        </div>
        <div className='server-error__button'>
          <Button styleType='small-black' label='Reload' onClick={goToHome} />
        </div>
      </div>
      <div className='absolute right-[265.64px] bottom-[0px]'>
        <svg
          width='453'
          height='377'
          viewBox='0 0 453 377'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            opacity='0.5'
            d='M80.4833 513.348C86.521 482.488 114.969 411.031 180.46 372.087C245.95 333.142 271.799 328.673 276.537 331.306C262.193 353.872 180.349 396.656 126.123 395.264C81.5877 394.121 96.5119 361.742 96.5119 361.742C96.5119 361.742 128.612 288.457 249.528 234.947C370.444 181.437 400.978 190.127 401.131 201.161C402.8 216.93 378.28 256.336 266.844 287.811C155.408 319.286 88.6743 318.295 69.2368 313.864C51.705 311.776 16.7849 302.034 70.6634 245.755C113.442 201.071 217.381 121.747 299.251 85.5165'
            stroke='#9FBFFF'
            strokeWidth='2'
          />
          <g opacity='0.5'>
            <path
              d='M346.366 27.0567L375.338 97.3176L349.453 107.992C330.051 115.992 307.837 106.749 299.836 87.3474C291.836 67.9454 301.078 45.7312 320.48 37.7307L346.366 27.0567Z'
              fill='white'
              stroke='#9FBFFF'
              strokeWidth='2'
            />
            <rect
              x='359.795'
              y='15.0293'
              width='88'
              height='18'
              rx='1'
              transform='rotate(67.591 359.795 15.0293)'
              fill='white'
              stroke='#9FBFFF'
              strokeWidth='2'
            />
            <rect
              x='404.456'
              y='23.6552'
              width='11'
              height='38'
              rx='3'
              transform='rotate(67.591 404.456 23.6552)'
              fill='white'
              stroke='#9FBFFF'
              strokeWidth='2'
            />
            <rect
              x='413.825'
              y='48.998'
              width='11'
              height='37'
              rx='3'
              transform='rotate(67.591 413.825 48.998)'
              fill='white'
              stroke='#9FBFFF'
              strokeWidth='2'
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ServerError;
