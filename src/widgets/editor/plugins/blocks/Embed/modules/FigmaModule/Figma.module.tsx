import { useEffect, useState } from 'react';

interface IFigmaEmbedBlock {
  url: string;
  setIsLoaded(state: boolean): void;
}

const FigmaEmbedBlock: React.FC<IFigmaEmbedBlock> = ({ url, setIsLoaded }) => {
  const [link, setLink] = useState('');
  const embedBaseLink = 'https://www.figma.com/embed?';

  useEffect(() => {
    if (url.indexOf(embedBaseLink) !== -1) {
      setLink(url);
    } else {
      setLink(`${embedBaseLink}embed_host=dokably&amp;url=${url}`);
    }
  }, []);

  return (
    <iframe
      src={link}
      sandbox='allow-scripts allow-popups allow-top-navigation-by-user-activation allow-forms allow-same-origin allow-storage-access-by-user-activation'
      allowFullScreen={false}
      height='454px'
      width='100%'
      onLoad={() => setIsLoaded(true)}
    ></iframe>
  );
};

export default FigmaEmbedBlock;
