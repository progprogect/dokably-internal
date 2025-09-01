import { useState } from 'react';
import Button from '@shared/common/Button';
import { ReactComponent as Image } from '@images/home-image.svg';
import './style.css';
import VideoModal from '@shared/common/VideoModal/videomodal.component';
import usePrivateSurvey from '@app/hooks/survey/usePrivateSurvey';
import { selectCurrentUser } from '@app/redux/features/userSlice';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';

const Home = () => {
  const [searchParams] = useSearchParams();
  const { units } = useUnitsContext();
  const navigate = useNavigate();
  const welcomeDoc = units.find((unit) => unit.name === 'Getting Started');
  const user = useSelector(selectCurrentUser).user;
  const [isVideoOpened, setVideoOpened] = useState<boolean>(false);

  usePrivateSurvey(60000);
  if (searchParams.get('new') === 'true' && welcomeDoc?.id) {
    navigate(`/workspace/${welcomeDoc?.id}`, { replace: true });
    return null;
  }

  return (
    <div className='home'>
      <div className='home__container'>
        <div className='home__title'>Welcome aboard, {user?.name ? ` ${user.name}` : ` ${user?.email}`}!</div>
        <div className='home__block'>
          <div className='home__block__title'>This is a beta version of Dokably MVP</div>
          <div className='home__block__description'>
            Thanks for signing up and trying Dokably! It is just the beginning for us and we are going to add most of
            the features later this year, after getting feedback from you :) Onboarding video below could help you get a
            better understanding of Dokably.
          </div>
          <Image className='home__block__image' />
          <Button
            styleType='small-black'
            className='home__block__button'
            label='Watch video'
            onClick={() => setVideoOpened(true)}
          />
          <VideoModal
            modalIsOpen={isVideoOpened}
            closeModal={() => setVideoOpened(false)}
            src='https://storage.googleapis.com/dokably-public/demo.mp4'
            type='video/mp4'
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
