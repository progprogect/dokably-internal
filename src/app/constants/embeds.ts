import BlockType from '@entities/enums/BlockType';
import EmbedType from '@entities/enums/EmbedType';
import IEmbedConstant from '@entities/models/IEmbedConstant';

export const FigmaEmbedConfig: IEmbedConstant = {
  icon: 'https://static.figma.com/app/icon/1/favicon.svg',
  displayName: 'Figma',
  hostName: EmbedType.Figma,
};

export const TrelloEmbedConfig: IEmbedConstant = {
  icon: 'https://trello.com/favicon.ico',
  displayName: 'Trello',
  hostName: EmbedType.Trello,
};

export const LoomEmbedConfig: IEmbedConstant = {
  icon: 'https://cdn.loom.com/assets/favicons-loom/favicon.ico',
  displayName: 'Loom',
  hostName: EmbedType.Loom,
};

export const AsanaEmbedConfig: IEmbedConstant = {
  icon: 'https://d3ki9tyy5l5ruj.cloudfront.net/obj/df5bcec7e9873dddebdd1328901c287f0f069750/asana-logo-favicon@3x.png',
  displayName: 'Asana',
  hostName: EmbedType.Asana,
};

export const MiroEmbedConfig: IEmbedConstant = {
  icon: 'https://static-website.miro.com/miro-site-pages-assets/static/application-renderer/staging/favicons/favicon.ico',
  displayName: 'Miro',
  hostName: EmbedType.Miro,
};

export const JiraEmbedConfig: IEmbedConstant = {
  icon: 'https://dikan.atlassian.net/s/1jmxwi/b/8/b6b48b2829824b869586ac216d119363/_/favicon-software.ico',
  displayName: 'Jira',
  hostName: EmbedType.Jira,
};

export const WhiteboardEmbedConfig: IEmbedConstant = {
  icon: '/logo.svg',
  displayName: 'Dokably',
  hostName: EmbedType.Dokably,
};

export const GoogleDriveEmbedConfig: IEmbedConstant = {
  icon: '',
  displayName: 'Google Drive',
  hostName: EmbedType.GoogleDrive,
};

export const EMBEDS_BLOCK_TYPES = [
  BlockType.Embed,
  BlockType.EmbedFigma,
  BlockType.EmbedMiro,
  BlockType.EmbedPDF,
  BlockType.EmbedLoom,
  BlockType.EmbedTrello,
  BlockType.EmbedBookmark,
  BlockType.EmbedWhiteboard,
  BlockType.EmbedGoogleDrive,
];

export const IGNORED_BLOCKS_FOR_EDITING = [
  BlockType.Title,
  BlockType.Image,
  BlockType.TableOfContent,
  'atomic',
  ...EMBEDS_BLOCK_TYPES,
  BlockType.Kanban,
  BlockType.ListView,
  BlockType.Banner,
];
