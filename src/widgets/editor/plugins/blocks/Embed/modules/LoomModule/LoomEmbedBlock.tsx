import { useEffect, useState } from 'react';

interface ILoomEmbedBlock {
  url: string;
  setIsLoaded(state: boolean): void;
}

const LoomEmbedBlock: React.FC<ILoomEmbedBlock> = ({ url, setIsLoaded }) => {
  const [link, setLink] = useState('');
  const embedBaseLink = 'https://www.loom.com/embed/';
  const shareBaseLink = 'https://www.loom.com/share/';

  useEffect(() => {
    if (url.indexOf(embedBaseLink) !== -1) {
      setLink(url);
    }
    if (url.indexOf(shareBaseLink) !== -1) {
      setLink(`${embedBaseLink}${url.split(shareBaseLink)[1]}`);
    } else {
      setLink(`${embedBaseLink}${url.split(embedBaseLink)[1]}`);
    }
  }, []);

  return (
    <iframe
      src={link}
      frameBorder={0}
      allowFullScreen={false}
      height='454px'
      width='100%'
      onLoad={() => setIsLoaded(true)}
    ></iframe>
  );
};

export default LoomEmbedBlock;
