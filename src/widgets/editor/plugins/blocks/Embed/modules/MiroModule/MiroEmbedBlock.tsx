import { useEffect, useState } from 'react';

interface IMiroEmbedBlock {
  url: string;
  setIsLoaded(state: boolean): void;
}

const MiroEmbedBlock: React.FC<IMiroEmbedBlock> = ({ url, setIsLoaded }) => {
  const [link, setLink] = useState('');
  const embedBaseLink = 'https://miro.com/app/live-embed/';
  const embedBaseAltLink = 'https://miro.com/app/embed/';

  useEffect(() => {
    if (
      url.indexOf(embedBaseLink) !== -1 ||
      url.indexOf(embedBaseAltLink) !== -1
    ) {
      setLink(url);
    } else if (url.indexOf('https://miro.com/app/board/') !== -1) {
      setLink(`${embedBaseLink}${url.split('https://miro.com/app/board/')[1]}`);
    }
  }, []);

  return (
    <iframe
      src={link}
      sandbox='allow-scripts allow-popups allow-top-navigation-by-user-activation allow-forms allow-same-origin allow-storage-access-by-user-activation'
      frameBorder={0}
      scrolling='no'
      allow='fullscreen; clipboard-read; clipboard-write'
      allowFullScreen={false}
      height='454px'
      width='100%'
      onLoad={() => setIsLoaded(true)}
    ></iframe>
  );
};

export default MiroEmbedBlock;
