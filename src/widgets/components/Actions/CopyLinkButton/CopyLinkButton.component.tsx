import { ICopyLinkButton } from './CopyLinkButton.types';
import { track } from '@amplitude/analytics-browser';
import { AccessTypes, ParticipantType } from '@widgets/components/ShareDoc/types';
import { getInviteLink } from '@app/services/share.service';
import toast from 'react-hot-toast';
import { darkToastOptions } from '@shared/common/Toast';

import { ReactComponent as Copy } from '@images/copy.svg';
import ActiveButton from '@shared/uikit/active-button';

const CopyLinkButton = ({ unit, callback }: ICopyLinkButton) => {
  const handleCopy = () => {
    const fetch = async () => {
      const body = {
        role: 'member' as ParticipantType,
        access: 'full_access' as AccessTypes,
        subDocs: false,
      };
      const result = await getInviteLink(body, unit.id);

      if (result && result.link) {
        navigator.clipboard.writeText(result.link).then(
          () => {
            track('document_share_link_copied', { option: 'advanced' });
            toast('Link copied to clipboard', darkToastOptions);
            callback && callback();
          },
          (err) => {
            toast('Failed to copy link to clipboard', darkToastOptions);
          }
        );
      }
    };

    fetch();
  };

  return (
    <ActiveButton leftSection={<Copy />} onClick={handleCopy}>
      Copy link
    </ActiveButton>
  );
};

export default CopyLinkButton;
