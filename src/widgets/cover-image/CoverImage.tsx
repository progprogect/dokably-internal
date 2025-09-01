import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import React, { useEffect, useState } from 'react';
import { ReactComponent as TrashIcon } from '@icons/trash-red.svg';
import { ReactComponent as PenIcon } from '@icons/pen-grey.svg';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import { EmojiPicker } from '@widgets/whiteboard/emoji-tool/EmojiPicker';
import { EMOJI_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { TLUiTranslationKey, useTools } from '@tldraw/tldraw';

enum Cover {
  Link = 'link',
  Emoji = 'emoji',
}

interface ICoverMenu {
  imgArr: string[];
  type: string;
  readonly: boolean;
  saveCover(key: Cover, value: string): void;
  editCover(key: Cover, value: string): void;
  setImgState: React.Dispatch<React.SetStateAction<string | undefined>>;
}

interface ICoverImage {
  imgArr: string[];
  saveCover(key: Cover, value: string): void;
  editCover(key: Cover, value: string): void;
  deleteCover(key: Cover): void;
  img: string;
  icon: string;
  readonly: boolean;
}

const CoverMenu = ({ setImgState, imgArr, saveCover, editCover, type, readonly }: ICoverMenu) => {
  return (
    <div className='w-[542px] h-[190px] overflow-y-auto absolute left-49 top-1 overflow-x-hidden bg-white shadow-sh2 rounded-md pl-[14px] pr-2.5 pb-2.5'>
      <h3 className='mt-4'>Gallery</h3>
      <div className='w-[514px] flex flex-wrap bg-white gap-[6px] z-20 mt-4'>
        {imgArr.map((img) => {
          return (
            <img
              key={img}
              loading='lazy'
              src={img}
              alt='cover'
              className={`w-[124px] h-16 rounded-md object-cover ${readonly ? '' : 'cursor-pointer'}`}
              onClick={() => {
                if (readonly) {
                  return;
                }
                setImgState(img);
                if (type === 'add') {
                  saveCover(Cover.Link, img);
                } else {
                  editCover(Cover.Link, img);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const CoverImage = ({ imgArr, saveCover, editCover, deleteCover, img, icon, readonly }: ICoverImage) => {
  const tools = useTools();
  const [imgState, setImgState] = useState<string | undefined>(img);
  const [iconState, setIconState] = useState<string | undefined>(icon);
  const { setReadOnly } = useDokablyEditor();
  useEffect(() => {
    if (imgState !== undefined || iconState !== undefined) setReadOnly(false);
  }, [imgState, iconState]);

  const createShape = (emoji: string, type: 'add' | 'edit') => {
    tools[EMOJI_SHAPE_ID] = {
      id: EMOJI_SHAPE_ID,
      icon: 'color',
      label: `tools.${EMOJI_SHAPE_ID}` as TLUiTranslationKey,
      kbd: 'n,r',
      readonlyOk: false,
      onSelect: () => {
        setIconState(emoji);
        if (type === 'add') {
          saveCover(Cover.Emoji, emoji);
        } else {
          editCover(Cover.Emoji, emoji);
        }
      },
    };
    tools[EMOJI_SHAPE_ID].onSelect('toolbar');
  };

  return (
    <div
      className='relative right-[212px]'
      contentEditable={false}
    >
      {imgState !== undefined && (
        <div className='w-[1140px] h-51 overflow-auto'>
          <Popover onOpenChange={() => setReadOnly(false)}>
            <PopoverTrigger disabled={readonly}>
              <img
                src={imgState}
                alt='cover'
                className='object-cover w-[1140px] h-50 rounded-md'
              />
            </PopoverTrigger>
            <PopoverContent className='w-[67px] flex items-start rounded-md  border-none py-[2px] px-[0] shadow-sh2'>
              <Popover onOpenChange={() => setReadOnly(false)}>
                <PopoverTrigger
                  asChild
                  disabled={readonly}
                >
                  <button
                    className='py-1 pr-1 pl-2.5 border-r border-text20'
                    aria-label='edit cover'
                  >
                    <PenIcon className='text-text70' />
                  </button>
                </PopoverTrigger>
                <PopoverContent className='border-none shadow-none bg-transparent relative right-[210px]'>
                  <CoverMenu
                    setImgState={setImgState}
                    imgArr={imgArr}
                    saveCover={saveCover}
                    type='edit'
                    editCover={editCover}
                    readonly={readonly}
                  />
                </PopoverContent>
              </Popover>
              <button
                onMouseDown={() => {
                  deleteCover(Cover.Link);
                  setImgState(undefined);
                }}
                className='py-1 px-1 ml-1'
                aria-label='delete cover'
              >
                <TrashIcon className='text-errorText' />
              </button>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {iconState !== undefined && (
        <Popover onOpenChange={() => setReadOnly(false)}>
          <PopoverTrigger>
            <div
              className={`cover-emoji absolute ${imgState ? 'bottom-[26px]' : 'bottom-[40px]'} text-[40px] leading-[40px] pl-[7px] ml-[206px]`}
            >
              {iconState}
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-[67px] ml-[246px] flex items-start rounded-md  border-none py-[2px] px-[0] shadow-sh2'>
            <Popover onOpenChange={() => setReadOnly(false)}>
              <PopoverTrigger
                asChild
                disabled={readonly}
              >
                <button
                  className='py-1 pr-1 pl-2.5 border-r border-text20'
                  aria-label='edit cover'
                >
                  <PenIcon className='text-text70' />
                </button>
              </PopoverTrigger>
              <PopoverContent className='border-none shadow-none bg-transparent relative left-[134px]'>
                <EmojiPicker callback={(emoji) => createShape(emoji, 'edit')} />
              </PopoverContent>
            </Popover>
            <button
              onMouseDown={() => {
                deleteCover(Cover.Emoji);
                setIconState(undefined);
              }}
              className='py-1 px-1 ml-1'
              aria-label='delete cover'
            >
              <TrashIcon className='text-errorText' />
            </button>
          </PopoverContent>
        </Popover>
      )}
      <div className='flex pb-4 cover-buttons'>
        {iconState === undefined && !readonly && (
          <Popover onOpenChange={() => setReadOnly(false)}>
            <PopoverTrigger>
              <div className='not-italic font-normal text-sm text-text opacity-50 cursor-pointer pl-[7px] ml-[206px] pt-[15px] hover:opacity-100'>
                Add icon
              </div>
            </PopoverTrigger>
            <PopoverContent className='border-none shadow-none bg-transparent relative left-[206px]'>
              <EmojiPicker callback={(emoji) => createShape(emoji, 'add')} />
            </PopoverContent>
          </Popover>
        )}
        {imgState === undefined && !readonly && (
          <Popover onOpenChange={() => setReadOnly(false)}>
            <PopoverTrigger>
              <div
                className={`not-italic font-normal text-sm text-text opacity-50 cursor-pointer pl-[7px] ${iconState ? 'ml-[206px]' : 'ml-[9px]'} pt-[15px] hover:opacity-100`}
              >
                Add cover
              </div>
            </PopoverTrigger>
            <PopoverContent className='border-none shadow-none bg-transparent relative right-[126px]'>
              <CoverMenu
                setImgState={setImgState}
                imgArr={imgArr}
                saveCover={saveCover}
                type='add'
                editCover={editCover}
                readonly={readonly}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default CoverImage;
