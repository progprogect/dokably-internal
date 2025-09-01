import { ReactComponent as Logo } from '@images/logo.svg';
import { useState } from 'react';

interface IWhiteboardEmbedBlock {
  url: string;
  name: string;
  setIsLoaded(state: boolean): void;
}

const WhiteboardEmbedBlock: React.FC<IWhiteboardEmbedBlock> = ({ url, name, setIsLoaded }) => {
  const [displayBoard, setDisplayBoard] = useState(false);

  return (
    <div className='h-[454px] w-full border border-solid border-text20'>
      <div
        className={`h-[410px] flex flex-col items-center justify-center cursor-pointer gap-4 bg-text5  ${displayBoard ? 'hidden' : 'block'}`}
        onClick={() => setDisplayBoard(true)}
      >
        <span className='text-2xl'>{name}</span>
        <span className='rounded bg-fontBlue text-white text-sm px-4 py-3'>See the board</span>
      </div>
      <div className={`relative w-full h-[410px] overflow-hidden ${displayBoard ? 'block' : 'hidden'}`}>
        <iframe
          src={`${url}?embedded=true`}
          sandbox='allow-scripts allow-popups allow-top-navigation-by-user-activation allow-forms allow-same-origin allow-storage-access-by-user-activation'
          allow='fullscreen; clipboard-read; clipboard-write'
          allowFullScreen={false}
          height='410px'
          width='100%'
          onLoad={() => setIsLoaded(true)}
          className='absolute top-0 left-0 w-[133.333%] h-[133.333%] origin-top-left scale-75'
        />
      </div>
      <div className='h-11 flex items-center p-4 gap-2 border-t border-solid border-t-text20'>
        <Logo />

        <a
          href={url}
          target='_blank'
          className='text-15-16  text-text70 hover:text-fontDarkBlue'
        >
          {name}
        </a>
      </div>
    </div>
  );
};

export default WhiteboardEmbedBlock;
