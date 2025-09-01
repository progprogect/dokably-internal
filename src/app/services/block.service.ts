import BlockType from '@entities/enums/BlockType';
import { ContentBlock } from 'draft-js';
import * as _ from 'lodash';

export const getNestedBlocks = (
  block: ContentBlock,
  blocks: ContentBlock[],
): ContentBlock[] => {
  const activeBlockIndex = blocks.findIndex(
    (el: ContentBlock) => el.getKey() === block.getKey(),
  );
  let isNested = true;
  return blocks.slice(activeBlockIndex + 1).filter((bl) => {
    if (isNested) {
      if (bl.getDepth() > block.getDepth()) {
        return bl;
      } else {
        isNested = false;
      }
    }
  });
};

export const getPrevNumberedBlocksWithSameLevel = (
  block: ContentBlock,
  blocks: ContentBlock[],
): ContentBlock[] | [] => {
  const activeBlockIndex = blocks.findIndex(
    (el: ContentBlock) => el.getKey() === block.getKey(),
  );

  let result = [];
  for (let i = activeBlockIndex; i >= 0; i--) {
    let bl = blocks[i];
    if (
      bl.getDepth() === block.getDepth() &&
      bl.getType() === BlockType.NumberedList
    ) {
      result.push(bl);
    }
    if (
      bl.getDepth() === block.getDepth() &&
      bl.getType() !== BlockType.NumberedList
    ) {
      break;
    }
    if (bl.getDepth() < block.getDepth()) {
      break;
    }
  }

  return result;
};

export const getBlocksBetween = (
  startBlock: ContentBlock,
  endBlock: ContentBlock,
  blocks: ContentBlock[],
): any[] => {
  if (startBlock.getKey() === endBlock.getKey()) {
    return [];
  }

  const startBlockIndex = blocks.findIndex(
    (el: ContentBlock) => el.getKey() === startBlock.getKey(),
  );
  const endBlockIndex = blocks.findIndex(
    (el: ContentBlock) => el.getKey() === endBlock.getKey(),
  );

  return blocks
    .slice(startBlockIndex + 1, endBlockIndex)
    .map((x) => [x.getKey(), x]);
};

export const getPlaceholder = (type: BlockType): string => {
  if (type === BlockType.NumberedList || type === BlockType.BulletList) {
    return 'List';
  } else if (type === BlockType.Toggle) {
    return 'Toggle';
  } else if (type === BlockType.CheckList) {
    return 'To-do';
  } else if (type === BlockType.Text) {
    return '<span>Type<span style="background: rgb(247, 247, 248); border-radius: 4px; margin: 0px 5px; padding: 0px 7px;" >/</span>to browse options </span>';
  } else if (type === BlockType.Heading1) {
    return 'Heading 1';
  } else if (type === BlockType.Heading2) {
    return 'Heading 2';
  } else if (type === BlockType.Heading3) {
    return 'Heading 3';
  } else if (type === BlockType.Embed) {
    return 'Paste link here';
  } else if (type === BlockType.EmbedBookmark) {
    return 'Paste link here';
  } else if (type === BlockType.EmbedFigma) {
    return 'Embed Figma';
  } else if (type === BlockType.EmbedMiro) {
    return 'Embed Miro';
  } else if (type === BlockType.EmbedLoom) {
    return 'Embed Loom';
  } else if (type === BlockType.EmbedTrello) {
    return 'Embed Trello';
  } else if (type === BlockType.EmbedPDF) {
    return 'Paste PDF link here';
  } else if (type === BlockType.EmbedGoogleDrive) {
    return 'Paste a link';
  } else if (type === BlockType.Bold) {
    return 'Bold';
  } else if (type === BlockType.Underline) {
    return 'Underline';
  } else if (type === BlockType.Italic) {
    return 'Italic';
  } else if (type === BlockType.Strikethrough) {
    return 'Strikethrough';
  } else if (type === BlockType.SolidDivider) {
    return 'Solid divider';
  } else {
    return '';
  }
};

export const getTab = (level: number) => {
  return level > 1 ? `${1.75 * (level - 1)}rem` : '';
};
