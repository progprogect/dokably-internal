import { useEffect, useState } from 'react';

interface ITrelloEmbedBlock {
  url: string;
  setIsLoaded(state: boolean): void;
}

const TrelloEmbedBlock: React.FC<ITrelloEmbedBlock> = ({ url, setIsLoaded }) => {
  const [linkType, setLinkType] = useState<string | null>('card');
  const [id, setId] = useState<string>('id');

  useEffect(() => {
    let u = new URL(url);
    let urlType = u.pathname.split('/')[1];
    if (urlType === 'c') {
      setLinkType('card');
    } else if (urlType === 'b') {
      setLinkType('board');
    } else {
      setLinkType(null);
    }
    setId(u.pathname.split('/')[2]);
  }, []);

  return linkType ? (
    <iframe
      src={`https://trello.com/embed/${linkType}?id=${id}`}
      width='316'
      height='152'
      className='trello-card trello-card-rendered'
      style={{ border: 'none', overflow: 'hidden' }}
      onLoad={() => setIsLoaded(true)}
    />
  ) : null;
};

export default TrelloEmbedBlock;
