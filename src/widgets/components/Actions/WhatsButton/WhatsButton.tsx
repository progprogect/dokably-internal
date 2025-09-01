import ActiveButton from '@shared/uikit/active-button';
import { ReactComponent as Logo } from '@images/logo.svg';
import { ABOUT_PAGE_URL } from '@app/constants/endpoints';

type WhatsBtnProps = {
  callback?: any;
};

const WhatsButton = ({ callback }: WhatsBtnProps) => {
  const handleClick = async () => {
    window.open(ABOUT_PAGE_URL || '', '_blank');
    callback && callback();
  };

  return (
    <ActiveButton
      leftSection={
        <Logo />}
      onClick={handleClick}
    >
      What’s Dokably?
    </ActiveButton>
  );
};

export default WhatsButton;
