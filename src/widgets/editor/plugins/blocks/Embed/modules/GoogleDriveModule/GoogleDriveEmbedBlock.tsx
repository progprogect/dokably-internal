import { useEffect, useMemo } from 'react';
import { ReactComponent as Docs } from '@images/google-docs.svg';
import { ReactComponent as Forms } from '@images/google-forms.svg';
import { ReactComponent as Drive } from '@images/google-drive.svg';
import { ReactComponent as Slides } from '@images/google-slides.svg';
import { ReactComponent as Sheets } from '@images/google-sheets.svg';

interface IGoogleDriveEmbedBlock {
  url: string;
  block: any;
  setIsLoaded(state: boolean): void;
}

const ImageByGoogleType = {
  ['document']: Docs,
  ['forms']: Forms,
  ['file']: Drive,
  ['presentation']: Slides,
  ['spreadsheets']: Sheets,
};

const extractGoogleType = (url: string) => {
  const match = url.match(/google\.com\/([^\/]+)\//);
  const type = match ? match[1] : null;

  return {
    title: `Google ${type}`,
    icon: ImageByGoogleType[type as keyof typeof ImageByGoogleType],
  };
};

const GoogleDriveEmbedBlock: React.FC<IGoogleDriveEmbedBlock> = ({
  url,
  setIsLoaded,
  block,
}) => {
  const { title, icon: Icon } = useMemo(() => extractGoogleType(url), [url]);
  const isExtended = useMemo(() => block.getData().get('isExtended'), [block]);
  const link = useMemo(() => {
    const link = new URL(url);
    link.searchParams.append('embedded', 'true');
    return link.toString();
  }, [url]);

  const handleBlockClick = () => {
    window.open(url, '_blank');
  }

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (isExtended) {
    return (
      <iframe
        src={link}
        height='454px'
        width='100%'
      ></iframe>
    );
  }

  return (
    <div
      rel='noopener noreferrer'
      className='relative flex p-4.7 text-xs text-text90 rounded-md bg-background my-1.75 cursor-pointer select-none items-center gap-2'
      style={{
        minHeight: '76px',
        minWidth: '100%',
      }}
      contentEditable={false}
      onClick={handleBlockClick}
    >
      <Icon />
      <span className='text-16-28 capitalize'>{title}</span>
    </div>
  );
};

export default GoogleDriveEmbedBlock;
