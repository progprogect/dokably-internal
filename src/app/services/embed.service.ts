import {
  AsanaEmbedConfig,
  FigmaEmbedConfig,
  JiraEmbedConfig,
  LoomEmbedConfig,
  MiroEmbedConfig,
  TrelloEmbedConfig,
  WhiteboardEmbedConfig,
  GoogleDriveEmbedConfig,
} from '@app/constants/embeds';
import EmbedType from '@entities/enums/EmbedType';

export const getHostNameType = (data: string): EmbedType => {
  if (data.startsWith('/')) {
    return EmbedType.Dokably;
  }

  let url = getUrl(data);
  const hostname = getLocation(url);

  if ((<any>Object).values(EmbedType).includes(hostname)) {
    return hostname as EmbedType;
  } else {
    const extension = getExtension(url);
    if (extension?.toLocaleLowerCase() === 'pdf') {
      return EmbedType.PDF;
    }
    if (url.indexOf('jira') !== -1 || url.indexOf('.atlassian.net') !== -1) {
      return EmbedType.Jira;
    }
    return EmbedType.Unknow;
  }
};

const getExtension = (filename: string) => {
  return filename.split('.').pop();
};

export const htmlDecode = (str: string): string => {
  let e = document.createElement('div');
  e.innerHTML = str;
  return e.childNodes[0] ? e.childNodes[0].nodeValue || '' : '';
};

const createElementFromHTML = (htmlString: string): ChildNode | null => {
  let div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

const getLocation = (href: string): string => {
  let a = document.createElement('a');
  a.href = href;
  return a.hostname;
};

export const getUrl = (str: string): string => {
  const node = createElementFromHTML(str);
  if (node?.nodeName === 'IFRAME') {
    return (node as HTMLIFrameElement).src;
  }
  if (node?.nodeName === 'BLOCKQUOTE') {
    return (node.childNodes[0] as HTMLAnchorElement).href;
  }
  if (node && (node as HTMLElement).querySelectorAll) {
    const frameChilds = (node as HTMLElement).querySelectorAll('iframe');
    if (frameChilds && frameChilds.length > 0) {
      return frameChilds[0].src;
    }
  }
  if (str.indexOf('http:') !== 0 && str.indexOf('https:') !== 0) {
    str = `http://${str}`;
  }
  if (isValidHttpUrl(str)) {
    return str;
  }

  return '';
};

export const isValidHttpUrl = (str: string): boolean => {
  const urlRegex = /((https?:\/\/)|(www\.))[^\s]+\.[^A-Z]+/g;
  const matches = str?.match(urlRegex);
  return matches ? matches.length > 0 : false;
};

export const getEmbedInfoByType = (type: EmbedType) => {
  switch (type) {
    case EmbedType.Figma:
      return FigmaEmbedConfig;
    case EmbedType.Trello:
      return TrelloEmbedConfig;
    case EmbedType.Miro:
      return MiroEmbedConfig;
    case EmbedType.Asana:
      return AsanaEmbedConfig;
    case EmbedType.Loom:
      return LoomEmbedConfig;
    case EmbedType.Jira:
      return JiraEmbedConfig;
    case EmbedType.Dokably:
      return WhiteboardEmbedConfig;
    case EmbedType.GoogleDrive:
      return GoogleDriveEmbedConfig;
    case EmbedType.GoogleDocs:
      return GoogleDriveEmbedConfig;
    default:
      return null;
  }
};
