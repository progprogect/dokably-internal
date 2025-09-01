import {
  getEmbedInfoByType,
  getHostNameType,
  getUrl,
  isValidHttpUrl,
} from '@app/services/embed.service';
import { useEffect, useState } from 'react';

import EmbedType from '@entities/enums/EmbedType';
import IEmbedConstant from '@entities/models/IEmbedConstant';
import { track } from '@amplitude/analytics-browser';

interface ISimpleEmbedBlock {
  url: string;
}

const BookmarkBlock: React.FC<ISimpleEmbedBlock> = ({ url }) => {
  const [title, setTitle] = useState<string>('');
  const [cleanURL, setCleanURL] = useState<string>();
  const [description, setDesription] = useState<string>('');
  const [info, setInfo] = useState<IEmbedConstant | null>(null);

  useEffect(() => {
    const type = getHostNameType(url);
    if (type === EmbedType.Unknow) {
      if (isValidHttpUrl(url)) {
        setTitle(new URL(url).hostname);
        setCleanURL(url);
        setDesription(url);
      } else {
        setTitle(type.toLocaleUpperCase());
        setDesription('Invalide link');
        track('document_edit_insert_failed', { reason: 'Invalide link' });
      }
    } else {
      const info = getEmbedInfoByType(type);
      if (info) {
        setInfo(info);
        setTitle(info.displayName);
        setCleanURL(url);
        setDesription(url);
      }
    }
  }, []);

  return (
    <a
      href={cleanURL}
      rel='noopener noreferrer'
      className='relative flex flex-col justify-between p-4.7 text-xs text-text90 rounded-md bg-background my-1.75 cursor-pointer select-none'
      style={{
        minHeight: '76px',
        minWidth: '100%',
        pointerEvents: cleanURL ? 'auto' : 'none',
      }}
      target='blank'
      contentEditable={false}
    >
      <span
        className='flex items-center w-full'
        style={{ marginBottom: '11px' }}
      >
        {info ? (
          <span style={{ marginRight: '8px' }}>
            <img src={info.icon} style={{ height: '16px', width: '16px' }} />
          </span>
        ) : null}
        <span className='font-medium text-12'>{title}</span>
      </span>
      <span
        style={{ paddingBottom: '1px' }}
        className='w-full truncate text-12'
      >
        {description}
      </span>
    </a>
  );
};

export default BookmarkBlock;
