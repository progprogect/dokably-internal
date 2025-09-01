import Editor, { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import createNumberedListPlugin from '@widgets/editor/plugins/blocks/NumberedList/NumberedListPlugin';
import createTextPlugin from '@widgets/editor/plugins/blocks/Text/TextPlugin';
import { createTitlePlugin } from '@widgets/editor/plugins/blocks/Title/TitlePlugin';
// import createTextDescriptionPlugin from '@widgets/editor/plugins/blocks/TextDescription/TextDescriptionPlugin';
import createToggleListPlugin from '@widgets/editor/plugins/blocks/ToggleList/ToggleListPlugin';
import createBulletedListPlugin from '@widgets/editor/plugins/blocks/BulletedList/BulletedListPlugin';
import createCheckListPlugin from '@widgets/editor/plugins/blocks/CheckList/CheckListPlugin';
import createEmbedPlugin from '@widgets/editor/plugins/blocks/Embed/EmbedPlugin';
import createHeadingPlugin from '@widgets/editor/plugins/blocks/Heading/HeadingPlugin';
import createTaskBoardPlugin from '@widgets/editor/plugins/blocks/TaskBoard/TaskBoardPlugin';
import createTableOfContentPlugin from '@widgets/editor/plugins/blocks/TableOfContent/TableOfContentPlugin';
import { TablePlugin } from '@widgets/editor/plugins/blocks/Table/TablePlugin';
import createBoldPlugin from '@widgets/editor/plugins/blocks/Bold/BoldPlugin';
import createUnderlinePlugin from '@widgets/editor/plugins/blocks/Underline/UnderlinePlugin';
import createItalicPlugin from '@widgets/editor/plugins/blocks/Italic/ItalicPlugin';
import createStrikethroughPlugin from '@widgets/editor/plugins/blocks/Strikethrough/StrikethroughPlugin';
import createSolidDividerPlugin from '@widgets/editor/plugins/blocks/SolidDivider/SolidDividerPlugin';
import createDashDividerPlugin from '@widgets/editor/plugins/blocks/DashDivider/DashDividerPlugin';
import { createFileUploaderPlugin, FileUploaderBlock } from '@widgets/editor/plugins/blocks/FileUploader';
import { createVideoUploaderPlugin, VideoUploaderBlock } from '@widgets/editor/plugins/blocks/VideoUploader';
import createBannerPlugin from '@widgets/editor/plugins/blocks/Banner/BannerPlugin';
import { composeDecorators } from '@widgets/editor/plugins/utils/composeDecorators';
import TextBlock from '@widgets/editor/plugins/blocks/Text/TextBlock';
import BulletedListBlock from '@widgets/editor/plugins/blocks/BulletedList/BulletedListBlock';
import TableOfContentBlock from '@widgets/editor/plugins/blocks/TableOfContent/TableOfContentBlock';
import NumberedListBlock from '@widgets/editor/plugins/blocks/NumberedList/NumberedListBlock';
import CheckListBlock from '@widgets/editor/plugins/blocks/CheckList/CheckListBlock';
import HeadingBlock from '@widgets/editor/plugins/blocks/Heading/HeadingBlock';
import BoldBlock from '@widgets/editor/plugins/blocks/Bold/BoldBlock';
import TaskBoardBlock from '@widgets/editor/plugins/blocks/TaskBoard/TaskBoardBlock';
import TableBlock from '@widgets/editor/plugins/blocks/Table/TableBlock';
import EmbedBlock from '@widgets/editor/plugins/blocks/Embed/EmbedBlock';
import ToggleListBlock from '@widgets/editor/plugins/blocks/ToggleList/ToggleListBlock';
import DashDividerBlock from '@widgets/editor/plugins/blocks/DashDivider/DashDividerBlock';
import SolidDividerBlock from '@widgets/editor/plugins/blocks/SolidDivider/SolidDividerBlock';
import StrikethroughBlock from '@widgets/editor/plugins/blocks/Strikethrough/StrikethroughBlock';
import ItalicBlock from '@widgets/editor/plugins/blocks/Italic/ItalicBlock';
import UnderlineBlock from '@widgets/editor/plugins/blocks/Underline/UnderlineBlock';
import TitleBlock from '@widgets/editor/plugins/blocks/Title/TitleBlock';
import TextDescription from '@widgets/editor/plugins/blocks/TextDescription/TextDescription';
import BannerBlock from '@widgets/editor/plugins/blocks/Banner/BannerBlock';
import { PluginBlockPropsToRender, PluginBlockToRender } from '@widgets/editor/plugins/types';
import { withComments } from '@widgets/editor/plugins/decorators/withComments';
import { withDnD } from '@widgets/editor/plugins/decorators/withDnD';
import { withTextStyle } from '@widgets/editor/plugins/decorators/withTextStyle';
import { withStaticReadonly } from '@widgets/editor/plugins/decorators/withStaticReadonly';
import { useMemo } from 'react';
import { withInsertTextBelow } from '@widgets/editor/plugins/decorators/withInsertTextBelow/withInsertTextBelow';

const withDecoratorsMap = new Map();
withDecoratorsMap.set(FileUploaderBlock, [withComments, withDnD(), withStaticReadonly]);
withDecoratorsMap.set(TextBlock, [withComments, withTextStyle, withDnD()]);
withDecoratorsMap.set(BulletedListBlock, [withComments, withDnD()]);
withDecoratorsMap.set(TitleBlock, [withStaticReadonly]);
withDecoratorsMap.set(TextDescription, []);
withDecoratorsMap.set(TableOfContentBlock, [withComments, withDnD()]);
withDecoratorsMap.set(NumberedListBlock, [withComments, withDnD()]);
withDecoratorsMap.set(CheckListBlock, [withComments, withDnD()]);
withDecoratorsMap.set(HeadingBlock, [withComments, withDnD()]);
withDecoratorsMap.set(BoldBlock, [withComments, withTextStyle, withDnD()]);
withDecoratorsMap.set(UnderlineBlock, [withComments, withTextStyle, withDnD()]);
withDecoratorsMap.set(ItalicBlock, [withComments, withTextStyle, withDnD()]);
withDecoratorsMap.set(StrikethroughBlock, [withComments, withTextStyle, withDnD()]);
withDecoratorsMap.set(SolidDividerBlock, [withComments, withDnD()]);
withDecoratorsMap.set(DashDividerBlock, [withComments, withDnD()]);
withDecoratorsMap.set(ToggleListBlock, [withComments, withDnD()]);
withDecoratorsMap.set(BannerBlock, [withComments, withInsertTextBelow]);
withDecoratorsMap.set(EmbedBlock, [withComments, withDnD(), withInsertTextBelow]);
withDecoratorsMap.set(TableBlock, [withComments, withInsertTextBelow]);
withDecoratorsMap.set(TaskBoardBlock, [
  withComments,
  withDnD({
    containerStyle: { left: -46 },
    contentStyle: { width: 760 },
  }),
  withInsertTextBelow,
]);
withDecoratorsMap.set(VideoUploaderBlock, [withComments, withDnD(), withInsertTextBelow]);

const proxiedWithDecoratorsMap = new Proxy(withDecoratorsMap, {
  get(target, prop, receiver) {
    if (prop === 'get') {
      return (key: PluginBlockToRender) => {
        const decorators = target.get(key);
        if (!decorators) return undefined;

        return composeDecorators(...decorators)(key);
      };
    }

    return Reflect.get(target, prop, receiver);
  },
});

const decorateBlock = <P extends PluginBlockPropsToRender>(block: PluginBlockToRender<P>) => {
  const decoratedBlock = proxiedWithDecoratorsMap.get(block);

  if (!decoratedBlock) {
    throw new Error(`Unexpected decorated block ${block.name}`);
  }

  return decoratedBlock;
};

const initializePlugins = (
  plugins: EditorPlugin[],
  { pluginFunctions }: { pluginFunctions: PluginFunctions },
): EditorPlugin[] => {
  plugins.forEach((plugin) => {
    plugin.initialize?.(pluginFunctions);
  });
  return plugins;
};

const documentPlugins = [
  TablePlugin(decorateBlock(TableBlock)),

  createTextPlugin(decorateBlock(TextBlock)),
  createFileUploaderPlugin(decorateBlock(FileUploaderBlock)),
  createVideoUploaderPlugin(decorateBlock(VideoUploaderBlock)),
  createBulletedListPlugin(decorateBlock(BulletedListBlock)),
  createTitlePlugin(decorateBlock(TitleBlock)),
  // createTextDescriptionPlugin(decorateBlock(TextDescription)),
  createTableOfContentPlugin(decorateBlock(TableOfContentBlock)),
  createNumberedListPlugin(decorateBlock(NumberedListBlock)),
  createCheckListPlugin(decorateBlock(CheckListBlock)),
  createHeadingPlugin(decorateBlock(HeadingBlock)),
  createBoldPlugin(decorateBlock(BoldBlock)),
  createUnderlinePlugin(decorateBlock(UnderlineBlock)),
  createItalicPlugin(decorateBlock(ItalicBlock)),
  createStrikethroughPlugin(decorateBlock(StrikethroughBlock)),
  createSolidDividerPlugin(decorateBlock(SolidDividerBlock)),
  createDashDividerPlugin(decorateBlock(DashDividerBlock)),
  createToggleListPlugin(decorateBlock(ToggleListBlock)),
  createEmbedPlugin(decorateBlock(EmbedBlock)),
  createBannerPlugin(decorateBlock(BannerBlock)),
  createTaskBoardPlugin(decorateBlock(TaskBoardBlock)),
];

const nonDocumentPlugins = [
  createBulletedListPlugin(decorateBlock(BulletedListBlock)),
  // createTextDescriptionPlugin(decorateBlock(TextDescription)),
  createTableOfContentPlugin(decorateBlock(TableOfContentBlock)),
  createNumberedListPlugin(decorateBlock(NumberedListBlock)),
  createCheckListPlugin(decorateBlock(CheckListBlock)),
  createHeadingPlugin(decorateBlock(HeadingBlock)),
  createToggleListPlugin(decorateBlock(ToggleListBlock)),
  createEmbedPlugin(decorateBlock(EmbedBlock)),
  TablePlugin(decorateBlock(TableBlock)),
  createBannerPlugin(decorateBlock(BannerBlock)),
];

const taskPlugins = [
  TablePlugin(decorateBlock(TableBlock)),
  createTextPlugin(decorateBlock(TextBlock)),
  createFileUploaderPlugin(decorateBlock(FileUploaderBlock)),
  createVideoUploaderPlugin(decorateBlock(VideoUploaderBlock)),
  createBulletedListPlugin(decorateBlock(BulletedListBlock)),
  createTableOfContentPlugin(decorateBlock(TableOfContentBlock)),
  createNumberedListPlugin(decorateBlock(NumberedListBlock)),
  createCheckListPlugin(decorateBlock(CheckListBlock)),
  createHeadingPlugin(decorateBlock(HeadingBlock)),
  createBoldPlugin(decorateBlock(BoldBlock)),
  createUnderlinePlugin(decorateBlock(UnderlineBlock)),
  createItalicPlugin(decorateBlock(ItalicBlock)),
  createStrikethroughPlugin(decorateBlock(StrikethroughBlock)),
  createSolidDividerPlugin(decorateBlock(SolidDividerBlock)),
  createDashDividerPlugin(decorateBlock(DashDividerBlock)),
  createToggleListPlugin(decorateBlock(ToggleListBlock)),
  createEmbedPlugin(decorateBlock(EmbedBlock)),
  createBannerPlugin(decorateBlock(BannerBlock)),
];

const useEditorPlugins = (type: string, options?: { showDeleteBoardConfirmation?: Function }) => {
  const getPlugins = useMemo(() => {
    return (editor: Editor | null) => {
      if (!editor) return [];
      const pluginFunctions = editor.getPluginMethods();

      const plugins =
        type === 'document'
          ? initializePlugins(documentPlugins, { pluginFunctions })
          : type === 'task'
            ? initializePlugins(taskPlugins, { pluginFunctions })
            : initializePlugins(nonDocumentPlugins, { pluginFunctions });

      // Set up TaskBoard delete confirmation callback if provided
      if (options?.showDeleteBoardConfirmation) {
        const taskBoardPlugin: any = plugins.find((plugin: any) => plugin.setDeleteBoardConfirmation);
        if (taskBoardPlugin && taskBoardPlugin.setDeleteBoardConfirmation) {
          taskBoardPlugin.setDeleteBoardConfirmation(options.showDeleteBoardConfirmation);
        }
      }

      return plugins;
    };
  }, [type, options?.showDeleteBoardConfirmation]);

  return { getPlugins };
};

export default useEditorPlugins;
