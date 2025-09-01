import { MAX_ZOOM } from '@app/constants/whiteboard/constants';
import {
  DefaultFontStyle,
  TLShapeUtilCanvasSvgDef,
  useEditor,
} from '@tldraw/editor';
import { useEffect, useMemo, useRef, useState } from 'react';

export const HASH_PATTERN_ZOOM_NAMES: Record<string, string> = {};

for (let zoom = 1; zoom <= Math.ceil(MAX_ZOOM); zoom++) {
  HASH_PATTERN_ZOOM_NAMES[zoom + '_dark'] = `hash_pattern_zoom_${zoom}_dark`;
  HASH_PATTERN_ZOOM_NAMES[zoom + '_light'] = `hash_pattern_zoom_${zoom}_light`;
}

type PatternDef = { zoom: number; url: string; darkMode: boolean };

const canvasBlob = (
  size: [number, number],
  fn: (ctx: CanvasRenderingContext2D) => void
) => {
  const canvas = document.createElement('canvas');
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  fn(ctx);
  return canvas.toDataURL();
};

const getDefaultPatterns = () => {
  const defaultPatterns: PatternDef[] = [];
  for (let i = 1; i <= Math.ceil(MAX_ZOOM); i++) {
    const whitePixelBlob = canvasBlob([1, 1], (ctx) => {
      ctx.fillStyle = '#dce1f8';
      ctx.fillRect(0, 0, 1, 1);
    });
    const blackPixelBlob = canvasBlob([1, 1], (ctx) => {
      ctx.fillStyle = '#2c3036';
      ctx.fillRect(0, 0, 1, 1);
    });
    defaultPatterns.push({
      zoom: i,
      url: whitePixelBlob,
      darkMode: false,
    });
    defaultPatterns.push({
      zoom: i,
      url: blackPixelBlob,
      darkMode: true,
    });
  }
  return defaultPatterns;
};
const TILE_PATTERN_SIZE = 8;
const generateImage = (dpr: number, currentZoom: number, darkMode: boolean) => {
  return new Promise<Blob>((resolve, reject) => {
    const size = TILE_PATTERN_SIZE * currentZoom * dpr;

    const canvasEl = document.createElement('canvas');
    canvasEl.width = size;
    canvasEl.height = size;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = darkMode ? '#212529' : '#f8f9fa';
    ctx.fillRect(0, 0, size, size);

    // This essentially generates an inverse of the pattern we're drawing.
    ctx.globalCompositeOperation = 'destination-out';

    ctx.lineCap = 'round';
    ctx.lineWidth = 1.25 * currentZoom * dpr;

    const t = 8 / 12;
    const s = (v: number) => v * currentZoom * dpr;

    ctx.beginPath();
    ctx.moveTo(s(t * 1), s(t * 3));
    ctx.lineTo(s(t * 3), s(t * 1));

    ctx.moveTo(s(t * 5), s(t * 7));
    ctx.lineTo(s(t * 7), s(t * 5));

    ctx.moveTo(s(t * 9), s(t * 11));
    ctx.lineTo(s(t * 11), s(t * 9));
    ctx.stroke();

    canvasEl.toBlob((blob) => {
      if (!blob) {
        reject();
      } else {
        resolve(blob);
      }
    });
  });
};

function usePattern() {
  const editor = useEditor();
  const dpr = editor.getInstanceState().devicePixelRatio;
  const [isReady, setIsReady] = useState(false);
  const defaultPatterns = useMemo(() => getDefaultPatterns(), []);
  const [backgroundUrls, setBackgroundUrls] =
    useState<PatternDef[]>(defaultPatterns);

  useEffect(() => {
    const promises: Promise<{
      zoom: number;
      url: string;
      darkMode: boolean;
    }>[] = [];

    for (let i = 1; i <= Math.ceil(MAX_ZOOM); i++) {
      promises.push(
        generateImage(dpr, i, false).then((blob) => ({
          zoom: i,
          url: URL.createObjectURL(blob),
          darkMode: false,
        }))
      );
      promises.push(
        generateImage(dpr, i, true).then((blob) => ({
          zoom: i,
          url: URL.createObjectURL(blob),
          darkMode: true,
        }))
      );
    }

    let isCancelled = false;
    Promise.all(promises).then((urls) => {
      if (isCancelled) return;
      setBackgroundUrls(urls);
      setIsReady(true);
    });

    return () => {
      isCancelled = true;
      setIsReady(false);
    };
  }, [dpr]);

  const defs = (
    <>
      {backgroundUrls.map((item) => {
        const key = item.zoom + (item.darkMode ? '_dark' : '_light');
        return (
          <pattern
            key={key}
            id={HASH_PATTERN_ZOOM_NAMES[key]}
            width={TILE_PATTERN_SIZE}
            height={TILE_PATTERN_SIZE}
            patternUnits='userSpaceOnUse'
          >
            <image
              href={item.url}
              width={TILE_PATTERN_SIZE}
              height={TILE_PATTERN_SIZE}
            />
          </pattern>
        );
      })}
    </>
  );

  return { defs, isReady };
}

function findHtmlLayerParent(element: Element): HTMLElement | null {
  if (element.classList.contains('tl-html-layer'))
    return element as HTMLElement;
  if (element.parentElement) return findHtmlLayerParent(element.parentElement);
  return null;
}

function PatternFillDefForCanvas() {
  const editor = useEditor();
  const containerRef = useRef<SVGGElement>(null);
  const { defs, isReady } = usePattern();

  useEffect(() => {
    if (isReady && editor.environment.isSafari) {
      const htmlLayer = findHtmlLayerParent(containerRef.current!);
      if (htmlLayer) {
        // Wait for `patternContext` to be picked up
        requestAnimationFrame(() => {
          htmlLayer.style.display = 'none';

          // Wait for 'display = "none"' to take effect
          requestAnimationFrame(() => {
            htmlLayer.style.display = '';
          });
        });
      }
    }
  }, [editor, isReady]);

  return <g ref={containerRef}>{defs}</g>;
}

export function getFillDefForCanvas(): TLShapeUtilCanvasSvgDef {
  return {
    key: `${DefaultFontStyle.id}:pattern`,
    component: PatternFillDefForCanvas,
  };
}
