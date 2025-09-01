import { useEditor, useValue } from '@tldraw/tldraw';
import { useEffect, useState } from 'react';
import LinkContentPanel from './LinkContentPanel';

export const useLinkContentPanel = () => {
  const editor = useEditor();

  const onlySelectedShapeId = useValue(
    'onlySelectedShapeId',
    () => editor.getOnlySelectedShapeId(),
    [editor]
  );

  const hoveredShapeId = useValue(
    'hoveredShape',
    () => editor.getHoveredShapeId(),
    [editor]
  );

  const [link, setLink] = useState<string | null>(null);
  const [isLinkHovered, setIsLinkHovered] = useState(false);

  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!onlySelectedShapeId && !hoveredShapeId) return;

    const shapeId = onlySelectedShapeId ?? hoveredShapeId;

    const parentTagIdToSearchLinksWithin = shapeId
      ? `${shapeId}-quill`
      : 'dokably-whiteboard-editor';

    const quillTag = document.getElementById(parentTagIdToSearchLinksWithin);
    if (!quillTag) return;

    const links = quillTag?.getElementsByTagName('a');
    if (!links) return;

    for (let i = 0; i < links?.length; i++) {
      const linkTag = links[i];

      if (!linkTag.onmouseenter) {
        linkTag.onclick = () => {
          const rect = linkTag.getBoundingClientRect();

          setTop(rect.top + 18);
          setLeft(rect.left - 260);

          setLink(linkTag.href);
          setIsLinkHovered(true);
        };
        linkTag.onmouseenter = () => {
          const rect = linkTag.getBoundingClientRect();

          setTop(rect.top + 18);
          setLeft(rect.left - 260);

          setLink(linkTag.href);
          setIsLinkHovered(true);
        };
        linkTag.onmouseleave = () => {
          setTimeout(() => {
            setIsLinkHovered(false);
          }, 30);
        };
      }
    }
  });

  const showLinkPanelJsx = link ? (
    <LinkContentPanel
      link={link}
      top={top}
      left={left}
      isLinkHovered={isLinkHovered}
    />
  ) : null;

  return showLinkPanelJsx;
};
