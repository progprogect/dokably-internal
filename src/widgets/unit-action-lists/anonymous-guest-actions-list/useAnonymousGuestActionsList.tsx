import HelpButton from '@widgets/components/Actions/HelpButton/HelpButton';
import SignUpOrLogInButton from '@widgets/components/Actions/SignUpOrLogInButton/SignUpOrLogInButton';
import WhatsButton from '@widgets/components/Actions/WhatsButton/WhatsButton';

type AnonymousGuestActionsListProps = {
  callback?: () => void;
};

export const useAnonymousGuestActionsList = ({
  callback,
}: AnonymousGuestActionsListProps) => {
  return (
    <>
      <SignUpOrLogInButton callback={callback} />
      <HelpButton callback={callback} />
      <WhatsButton callback={callback} />
    </>
  );
};
