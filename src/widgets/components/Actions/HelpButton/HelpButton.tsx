import ActiveButton from '@shared/uikit/active-button';
import { ReactComponent as Help } from '@images/help.svg';
import { track } from '@amplitude/analytics-browser';

type HelpBtnProps = {
  callback?: any;
};

const HelpButton = ({ callback }: HelpBtnProps) => {
  const handleClick = async () => {
    track('help_opened');
    Object(window).Intercom('show');

    callback && callback();
  };

  return (
    <ActiveButton
      leftSection={<Help />}
      onClick={handleClick}
    >
      Help
    </ActiveButton>
  );
};

export default HelpButton;
